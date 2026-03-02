const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { authenticate } = require('./auth');

const router = express.Router();

// Middleware to check validation role
const requireValidationRole = (req, res, next) => {
  if (req.user.role !== 'validation' && req.user.role !== 'admin') {
    return res.status(403).json({ status: 'ERROR', message: 'Access denied. Validation role required.' });
  }
  next();
};

// Get pending validation cases
router.get('/pending', authenticate, requireValidationRole, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('stage').optional().isIn(['STAGE_1', 'STAGE_2', 'STAGE_3']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'ERROR', errors: errors.array() });
  }

  const prisma = req.app.locals.prisma;
  const { page = 1, limit = 20, stage } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const where = {
      status: 'pending',
      currentStage: stage || { in: ['STAGE_1', 'STAGE_2', 'STAGE_3'] },
    };

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where,
        include: {
          branch: true,
          insuranceTpa: true,
          createdBy: { select: { id: true, name: true, username: true } },
          documents: true,
          _count: { select: { queries: true } },
        },
        orderBy: { createdAt: 'asc' },
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
    console.error('Get pending validation error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch pending cases' });
  }
});

// Get validation history
router.get('/history', authenticate, requireValidationRole, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], async (req, res) => {
  const prisma = req.app.locals.prisma;
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const [validations, total] = await Promise.all([
      prisma.validation.findMany({
        where: { reviewedById: req.user.userId },
        include: {
          case: {
            include: {
              branch: true,
              insuranceTpa: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.validation.count({ where: { reviewedById: req.user.userId } }),
    ]);

    res.json({
      status: 'SUCCESS',
      data: validations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get validation history error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch validation history' });
  }
});

// Approve case stage
router.post('/:caseId/approve/:stage', authenticate, requireValidationRole, [
  body('notes').optional().trim(),
  body('approvedAmount').optional().isFloat({ min: 0 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'ERROR', errors: errors.array() });
  }

  const { caseId, stage } = req.params;
  const { notes, approvedAmount } = req.body;
  const prisma = req.app.locals.prisma;

  try {
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseData) {
      return res.status(404).json({ status: 'ERROR', message: 'Case not found' });
    }

    if (caseData.currentStage !== stage) {
      return res.status(400).json({ status: 'ERROR', message: 'Invalid stage for approval' });
    }

    // Create validation record
    await prisma.validation.create({
      data: {
        caseId,
        stage,
        reviewedById: req.user.userId,
        decision: 'approved',
        notes,
      },
    });

    // Update case
    const stageMap = {
      'STAGE_1': { nextStage: 'STAGE_2', status: 'pending' },
      'STAGE_2': { nextStage: 'STAGE_3', status: 'pending' },
      'STAGE_3': { nextStage: 'STAGE_4', status: 'approved' },
    };

    const nextState = stageMap[stage];

    await prisma.case.update({
      where: { id: caseId },
      data: {
        currentStage: nextState.nextStage,
        status: nextState.status,
        ...(approvedAmount && { approvedAmount }),
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        caseId,
        userId: req.user.userId,
        action: 'validated',
        description: `Stage ${stage} approved`,
      },
    });

    res.json({
      status: 'SUCCESS',
      message: `Stage ${stage} approved successfully`,
    });
  } catch (error) {
    console.error('Approve stage error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to approve stage' });
  }
});

// Reject case stage
router.post('/:caseId/reject/:stage', authenticate, requireValidationRole, [
  body('reason').notEmpty().withMessage('Rejection reason is required'),
  body('notes').optional().trim(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'ERROR', errors: errors.array() });
  }

  const { caseId, stage } = req.params;
  const { reason, notes } = req.body;
  const prisma = req.app.locals.prisma;

  try {
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseData) {
      return res.status(404).json({ status: 'ERROR', message: 'Case not found' });
    }

    // Create validation record
    await prisma.validation.create({
      data: {
        caseId,
        stage,
        reviewedById: req.user.userId,
        decision: 'rejected',
        notes: `${reason}. ${notes || ''}`,
      },
    });

    // Update case
    await prisma.case.update({
      where: { id: caseId },
      data: {
        status: 'rejected',
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        caseId,
        userId: req.user.userId,
        action: 'rejected',
        description: `Stage ${stage} rejected: ${reason}`,
      },
    });

    res.json({
      status: 'SUCCESS',
      message: `Stage ${stage} rejected successfully`,
    });
  } catch (error) {
    console.error('Reject stage error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to reject stage' });
  }
});

// Create query for case
router.post('/:caseId/query/:stage', authenticate, requireValidationRole, [
  body('subject').notEmpty().withMessage('Subject is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'ERROR', errors: errors.array() });
  }

  const { caseId, stage } = req.params;
  const { subject, description, priority = 'medium' } = req.body;
  const prisma = req.app.locals.prisma;

  try {
    const query = await prisma.query.create({
      data: {
        caseId,
        type: 'document',
        subject,
        description,
        priority,
        createdById: req.user.userId,
        status: 'open',
      },
    });

    // Create validation record
    await prisma.validation.create({
      data: {
        caseId,
        stage,
        reviewedById: req.user.userId,
        decision: 'query',
        notes: subject,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        caseId,
        userId: req.user.userId,
        action: 'query_created',
        description: `Query created: ${subject}`,
      },
    });

    res.json({
      status: 'SUCCESS',
      message: 'Query created successfully',
      data: query,
    });
  } catch (error) {
    console.error('Create query error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to create query' });
  }
});

// Get validation stats
router.get('/stats', authenticate, requireValidationRole, async (req, res) => {
  const prisma = req.app.locals.prisma;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalReviewed,
      approvedToday,
      rejectedToday,
      avgReviewTime,
    ] = await Promise.all([
      prisma.validation.count({ where: { reviewedById: req.user.userId } }),
      prisma.validation.count({
        where: {
          reviewedById: req.user.userId,
          decision: 'approved',
          createdAt: { gte: today },
        },
      }),
      prisma.validation.count({
        where: {
          reviewedById: req.user.userId,
          decision: 'rejected',
          createdAt: { gte: today },
        },
      }),
      // Placeholder for average review time
      Promise.resolve(15),
    ]);

    res.json({
      status: 'SUCCESS',
      data: {
        totalReviewed,
        approvedToday,
        rejectedToday,
        avgReviewTime,
      },
    });
  } catch (error) {
    console.error('Get validation stats error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch validation stats' });
  }
});

module.exports = router;
