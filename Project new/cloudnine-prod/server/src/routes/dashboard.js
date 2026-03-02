const express = require('express');
const { authenticate } = require('./auth');

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authenticate, async (req, res) => {
  const prisma = req.app.locals.prisma;

  try {
    const where = req.user.role === 'branch' ? { branchId: req.user.branchId } : {};

    const [
      totalCases,
      pendingValidation,
      pendingDispatch,
      pendingSettlement,
      totalOutstanding,
      avgTAT,
    ] = await Promise.all([
      prisma.case.count({ where }),
      prisma.case.count({ where: { ...where, currentStage: 'STAGE_1', status: 'pending' } }),
      prisma.case.count({ where: { ...where, currentStage: 'STAGE_4', status: 'approved', dispatch: null } }),
      prisma.case.count({ where: { ...where, status: 'dispatched', settlement: null } }),
      prisma.case.aggregate({
        where: { ...where, status: { not: 'settled' } },
        _sum: { billAmount: true },
      }),
      prisma.case.aggregate({
        where: { ...where, completedAt: { not: null } },
        _avg: {
          // Calculate average time between createdAt and completedAt
          // This is a simplified calculation
        },
      }),
    ]);

    res.json({
      status: 'SUCCESS',
      data: {
        totalCases,
        pendingValidation,
        pendingDispatch,
        pendingSettlement,
        totalOutstanding: totalOutstanding._sum.billAmount || 0,
        avgTAT: avgTAT ? 12 : 0, // Placeholder
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch dashboard stats' });
  }
});

// Get branch summary
router.get('/branch-summary', authenticate, async (req, res) => {
  const prisma = req.app.locals.prisma;

  try {
    const branches = await prisma.branch.findMany({
      include: {
        cases: {
          where: { status: { not: 'settled' } },
          select: { billAmount: true },
        },
        _count: {
          select: { cases: true },
        },
      },
    });

    const summary = branches.map((branch) => ({
      id: branch.id,
      name: branch.name,
      code: branch.code,
      cases: branch._count.cases,
      outstanding: branch.cases.reduce((sum, c) => sum + c.billAmount, 0),
      trend: Math.floor(Math.random() * 20) - 10, // Placeholder
    }));

    res.json({ status: 'SUCCESS', data: summary });
  } catch (error) {
    console.error('Get branch summary error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch branch summary' });
  }
});

// Get insurance/TPA summary
router.get('/insurance-summary', authenticate, async (req, res) => {
  const prisma = req.app.locals.prisma;

  try {
    const insuranceTPAs = await prisma.insuranceTPA.findMany({
      include: {
        cases: {
          where: { status: { not: 'settled' } },
          select: { billAmount: true },
        },
        _count: {
          select: { cases: true },
        },
      },
    });

    const totalOutstanding = insuranceTPAs.reduce(
      (sum, it) => sum + it.cases.reduce((s, c) => s + c.billAmount, 0),
      0
    );

    const summary = insuranceTPAs.map((it) => {
      const outstanding = it.cases.reduce((sum, c) => sum + c.billAmount, 0);
      return {
        id: it.id,
        name: it.name,
        type: it.type,
        cases: it._count.cases,
        outstanding,
        percentage: totalOutstanding > 0 ? (outstanding / totalOutstanding) * 100 : 0,
      };
    });

    res.json({ status: 'SUCCESS', data: summary });
  } catch (error) {
    console.error('Get insurance summary error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch insurance summary' });
  }
});

// Get recent activity
router.get('/recent-activity', authenticate, async (req, res) => {
  const prisma = req.app.locals.prisma;

  try {
    const where = req.user.role === 'branch' ? { case: { branchId: req.user.branchId } } : {};

    const activities = await prisma.activity.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, username: true } },
        case: { select: { id: true, mrn: true, patientName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const formatted = activities.map((a) => ({
      id: a.id,
      action: a.action,
      description: a.description,
      user: a.user.name || a.user.username,
      caseMrn: a.case?.mrn,
      status: getStatusFromAction(a.action),
      timestamp: a.createdAt,
    }));

    res.json({ status: 'SUCCESS', data: formatted });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch recent activity' });
  }
});

// Get aging report
router.get('/aging-report', authenticate, async (req, res) => {
  const prisma = req.app.locals.prisma;

  try {
    const where = req.user.role === 'branch' ? { branchId: req.user.branchId } : {};
    const now = new Date();

    const [
      days0to30,
      days31to60,
      days61to90,
      days91to120,
      days121to180,
      days180plus,
    ] = await Promise.all([
      getAgingBucket(prisma, where, 0, 30, now),
      getAgingBucket(prisma, where, 31, 60, now),
      getAgingBucket(prisma, where, 61, 90, now),
      getAgingBucket(prisma, where, 91, 120, now),
      getAgingBucket(prisma, where, 121, 180, now),
      getAgingBucket(prisma, where, 181, null, now),
    ]);

    res.json({
      status: 'SUCCESS',
      data: [
        { range: '0-30 Days', count: days0to30.count, amount: days0to30.amount },
        { range: '31-60 Days', count: days31to60.count, amount: days31to60.amount },
        { range: '61-90 Days', count: days61to90.count, amount: days61to90.amount },
        { range: '91-120 Days', count: days91to120.count, amount: days91to120.amount },
        { range: '121-180 Days', count: days121to180.count, amount: days121to180.amount },
        { range: '180+ Days', count: days180plus.count, amount: days180plus.amount },
      ],
    });
  } catch (error) {
    console.error('Get aging report error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch aging report' });
  }
});

// Helper function for aging buckets
async function getAgingBucket(prisma, where, minDays, maxDays, now) {
  const minDate = new Date(now);
  minDate.setDate(minDate.getDate() - (maxDays || 9999));
  
  const maxDate = new Date(now);
  maxDate.setDate(maxDate.getDate() - minDays);

  const result = await prisma.case.aggregate({
    where: {
      ...where,
      status: { not: 'settled' },
      createdAt: {
        gte: minDate,
        lte: maxDate,
      },
    },
    _count: true,
    _sum: { billAmount: true },
  });

  return {
    count: result._count,
    amount: result._sum.billAmount || 0,
  };
}

// Helper function to get status from action
function getStatusFromAction(action) {
  const statusMap = {
    created: 'pending',
    updated: 'pending',
    validated: 'approved',
    rejected: 'rejected',
    dispatched: 'dispatched',
    settled: 'settled',
    document_uploaded: 'pending',
    query_created: 'pending',
    query_resolved: 'pending',
  };
  return statusMap[action] || 'pending';
}

module.exports = router;
