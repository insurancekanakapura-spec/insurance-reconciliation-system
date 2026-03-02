const express = require('express');
const { query, validationResult } = require('express-validator');
const { authenticate } = require('./auth');

const router = express.Router();

// Get cases report
router.get('/cases', authenticate, [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('branch').optional(),
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'dispatched', 'settled', 'completed']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'ERROR', errors: errors.array() });
  }

  const { startDate, endDate, branch, status } = req.query;
  const prisma = req.app.locals.prisma;

  try {
    const where = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    
    if (branch) where.branchId = branch;
    if (status) where.status = status;

    // Branch users only see their branch data
    if (req.user.role === 'branch') {
      where.branchId = req.user.branchId;
    }

    const cases = await prisma.case.findMany({
      where,
      include: {
        branch: true,
        insuranceTpa: true,
        createdBy: { select: { name: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate summary
    const summary = {
      totalCases: cases.length,
      totalAmount: cases.reduce((sum, c) => sum + c.billAmount, 0),
      totalApproved: cases.reduce((sum, c) => sum + c.approvedAmount, 0),
      totalSettled: cases.reduce((sum, c) => sum + c.settledAmount, 0),
      byStatus: {},
      byBranch: {},
    };

    cases.forEach((c) => {
      summary.byStatus[c.status] = (summary.byStatus[c.status] || 0) + 1;
      summary.byBranch[c.branch.name] = (summary.byBranch[c.branch.name] || 0) + 1;
    });

    res.json({
      status: 'SUCCESS',
      data: { cases, summary },
    });
  } catch (error) {
    console.error('Get cases report error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to generate report' });
  }
});

// Get validation report
router.get('/validation', authenticate, async (req, res) => {
  const prisma = req.app.locals.prisma;

  try {
    const validations = await prisma.validation.findMany({
      include: {
        case: {
          include: {
            branch: true,
          },
        },
        reviewedBy: { select: { name: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const summary = {
      total: validations.length,
      approved: validations.filter((v) => v.decision === 'approved').length,
      rejected: validations.filter((v) => v.decision === 'rejected').length,
      query: validations.filter((v) => v.decision === 'query').length,
    };

    res.json({
      status: 'SUCCESS',
      data: { validations, summary },
    });
  } catch (error) {
    console.error('Get validation report error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to generate report' });
  }
});

// Get settlement report
router.get('/settlement', authenticate, async (req, res) => {
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

    const summary = {
      total: settlements.length,
      totalSettled: settlements.reduce((sum, s) => sum + s.settledAmount, 0),
      totalShortPaid: settlements.filter((s) => s.isShortPaid).length,
      shortPaidAmount: settlements.reduce((sum, s) => sum + (s.shortPaidAmount || 0), 0),
    };

    res.json({
      status: 'SUCCESS',
      data: { settlements, summary },
    });
  } catch (error) {
    console.error('Get settlement report error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to generate report' });
  }
});

// Export report
router.get('/export/:type', authenticate, async (req, res) => {
  const XLSX = require('xlsx');
  const { type } = req.params;
  const prisma = req.app.locals.prisma;

  try {
    let data = [];
    let sheetName = 'Report';

    if (type === 'cases') {
      const cases = await prisma.case.findMany({
        include: {
          branch: true,
          insuranceTpa: true,
          createdBy: { select: { name: true, username: true } },
        },
      });

      data = cases.map((c) => ({
        'MRN': c.mrn,
        'Patient Name': c.patientName,
        'Age': c.patientAge,
        'Gender': c.patientGender,
        'Admission Date': c.admissionDate?.toISOString().split('T')[0],
        'Discharge Date': c.dischargeDate?.toISOString().split('T')[0],
        'Branch': c.branch.name,
        'Insurance/TPA': c.insuranceTpa?.name || '',
        'Bill Amount': c.billAmount,
        'Approved Amount': c.approvedAmount,
        'Settled Amount': c.settledAmount,
        'Stage': c.currentStage,
        'Status': c.status,
        'Created By': c.createdBy?.name || c.createdBy?.username,
      }));
      sheetName = 'Cases';
    } else if (type === 'settlements') {
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
      });

      data = settlements.map((s) => ({
        'MRN': s.case.mrn,
        'Patient Name': s.case.patientName,
        'Branch': s.case.branch.name,
        'Insurance/TPA': s.case.insuranceTpa?.name || '',
        'Bill Amount': s.case.billAmount,
        'Approved Amount': s.case.approvedAmount,
        'Settled Amount': s.settledAmount,
        'Payment Date': s.paymentDate?.toISOString().split('T')[0],
        'Payment Mode': s.paymentMode,
        'Payment Reference': s.paymentReference,
        'Status': s.status,
        'Short Paid': s.isShortPaid ? 'Yes' : 'No',
        'Short Paid Reason': s.shortPaidReason || '',
        'Settled By': s.settledBy?.name || s.settledBy?.username,
      }));
      sheetName = 'Settlements';
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-report.xlsx`);
    res.send(buffer);
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to export report' });
  }
});

module.exports = router;
