const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { authenticate } = require('./auth');

const router = express.Router();

// Middleware to check settlement role
const requireSettlementRole = (req, res, next) => {
  if (req.user.role !== 'settlement' && req.user.role !== 'admin') {
    return res.status(403).json({ status: 'ERROR', message: 'Access denied. Settlement role required.' });
  }
  next();
};

// Get pending settlement cases
router.get('/pending', authenticate, requireSettlementRole, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], async (req, res) => {
  const prisma = req.app.locals.prisma;
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const where = {
      status: 'dispatched',
      settlement: null,
    };

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where,
        include: {
          branch: true,
          insuranceTpa: true,
          createdBy: { select: { id: true, name: true, username: true } },
          dispatch: true,
        },
        orderBy: { updatedAt: 'asc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.case.count({ where }),
    ]);

    res.json({
      status: 'SUCCESS',
      data: cases,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get pending settlement error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch pending cases' });
  }
});

// Get settlement history
router.get('/history', authenticate, requireSettlementRole, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], async (req, res) => {
  const prisma = req.app.locals.prisma;
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const [settlements, total] = await Promise.all([
      prisma.settlement.findMany({
        include: {
          case: {
            include: {
              branch: true,
              insuranceTpa: true,
            },
          },
          settledBy: { select: { id: true, name: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.settlement.count(),
    ]);

    res.json({
      status: 'SUCCESS',
      data: settlements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get settlement history error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch settlement history' });
  }
});

// Update settlement payment
router.patch('/:caseId/payment', authenticate, requireSettlementRole, [
  body('paymentDate').notEmpty().isISO8601(),
  body('paymentMode').notEmpty().isIn(['neft', 'rtgs', 'cheque', 'cash']),
  body('paymentReference').optional().trim(),
  body('settledAmount').notEmpty().isFloat({ min: 0 }),
  body('isShortPaid').optional().isBoolean(),
  body('shortPaidReason').optional().trim(),
  body('notes').optional().trim(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'ERROR', errors: errors.array() });
  }

  const { caseId } = req.params;
  const {
    paymentDate,
    paymentMode,
    paymentReference,
    settledAmount,
    isShortPaid = false,
    shortPaidReason,
    notes,
  } = req.body;
  const prisma = req.app.locals.prisma;

  try {
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseData) {
      return res.status(404).json({ status: 'ERROR', message: 'Case not found' });
    }

    const shortPaidAmount = isShortPaid ? caseData.approvedAmount - settledAmount : 0;
    const status = isShortPaid ? 'short_paid' : 'settled';

    // Create or update settlement
    const settlement = await prisma.settlement.upsert({
      where: { caseId },
      update: {
        paymentDate: new Date(paymentDate),
        paymentMode,
        paymentReference,
        settledAmount: parseFloat(settledAmount),
        isShortPaid,
        shortPaidReason: isShortPaid ? shortPaidReason : null,
        shortPaidAmount,
        status,
        notes,
      },
      create: {
        caseId,
        settledById: req.user.userId,
        paymentDate: new Date(paymentDate),
        paymentMode,
        paymentReference,
        settledAmount: parseFloat(settledAmount),
        isShortPaid,
        shortPaidReason: isShortPaid ? shortPaidReason : null,
        shortPaidAmount,
        status,
        notes,
      },
    });

    // Update case
    await prisma.case.update({
      where: { id: caseId },
      data: {
        status,
        settledAmount: parseFloat(settledAmount),
        completedAt: new Date(),
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        caseId,
        userId: req.user.userId,
        action: 'settled',
        description: `Payment of ₹${settledAmount} recorded`,
        metadata: JSON.stringify({ paymentMode, isShortPaid }),
      },
    });

    res.json({
      status: 'SUCCESS',
      message: 'Payment recorded successfully',
      data: settlement,
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to record payment' });
  }
});

// Bulk update settlements
router.post('/bulk', authenticate, requireSettlementRole, [
  body('cases').isArray({ min: 1 }),
  body('cases.*.caseId').notEmpty(),
  body('cases.*.paymentDate').notEmpty().isISO8601(),
  body('cases.*.settledAmount').notEmpty().isFloat({ min: 0 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'ERROR', errors: errors.array() });
  }

  const { cases } = req.body;
  const prisma = req.app.locals.prisma;

  const results = {
    updated: 0,
    errors: [],
  };

  for (const caseData of cases) {
    try {
      const { caseId, paymentDate, settledAmount, paymentMode = 'neft', paymentReference } = caseData;

      await prisma.settlement.create({
        data: {
          caseId,
          settledById: req.user.userId,
          paymentDate: new Date(paymentDate),
          paymentMode,
          paymentReference,
          settledAmount: parseFloat(settledAmount),
          status: 'settled',
        },
      });

      await prisma.case.update({
        where: { id: caseId },
        data: {
          status: 'settled',
          settledAmount: parseFloat(settledAmount),
          completedAt: new Date(),
        },
      });

      results.updated++;
    } catch (error) {
      results.errors.push({ caseId: caseData.caseId, error: error.message });
    }
  }

  res.json({
    status: 'SUCCESS',
    message: `Bulk update completed. ${results.updated} cases updated.`,
    data: results,
  });
});

// Export settlements to Excel
router.get('/export', authenticate, requireSettlementRole, async (req, res) => {
  const XLSX = require('xlsx');
  const prisma = req.app.locals.prisma;

  try {
    const settlements = await prisma.settlement.findMany({
      include: {
        case: {
          include: {
            branch: true,
            insuranceTpa: true,
          },
        },
        settledBy: { select: { name: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = settlements.map((s) => ({
      'MRN': s.case.mrn,
      'Patient Name': s.case.patientName,
      'Branch': s.case.branch.name,
      'Insurance/TPA': s.case.insuranceTpa?.name || '',
      'Bill Amount': s.case.billAmount,
      'Approved Amount': s.case.approvedAmount,
      'Settled Amount': s.settledAmount,
      'Payment Date': s.paymentDate?.toISOString().split('T')[0] || '',
      'Payment Mode': s.paymentMode,
      'Payment Reference': s.paymentReference || '',
      'Status': s.status,
      'Short Paid': s.isShortPaid ? 'Yes' : 'No',
      'Short Paid Reason': s.shortPaidReason || '',
      'Settled By': s.settledBy?.name || s.settledBy?.username,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Settlements');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=settlements.xlsx');
    res.send(buffer);
  } catch (error) {
    console.error('Export settlements error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to export settlements' });
  }
});

// Get settlement stats
router.get('/stats', authenticate, requireSettlementRole, async (req, res) => {
  const prisma = req.app.locals.prisma;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalSettled,
      totalOutstanding,
      shortPaidAmount,
      settledToday,
    ] = await Promise.all([
      prisma.settlement.count(),
      prisma.case.aggregate({
        where: { status: { not: 'settled' } },
        _sum: { billAmount: true },
      }),
      prisma.settlement.aggregate({
        where: { isShortPaid: true },
        _sum: { shortPaidAmount: true },
      }),
      prisma.settlement.count({ where: { createdAt: { gte: today } } }),
    ]);

    res.json({
      status: 'SUCCESS',
      data: {
        totalSettled,
        totalOutstanding: totalOutstanding._sum.billAmount || 0,
        shortPaidAmount: shortPaidAmount._sum.shortPaidAmount || 0,
        settledToday,
        avgSettlementTime: 15, // Placeholder
      },
    });
  } catch (error) {
    console.error('Get settlement stats error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch settlement stats' });
  }
});

module.exports = router;
