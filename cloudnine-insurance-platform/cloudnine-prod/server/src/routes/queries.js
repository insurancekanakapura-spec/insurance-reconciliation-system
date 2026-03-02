const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { authenticate } = require('./auth');

const router = express.Router();

// Get all queries
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
], async (req, res) => {
  const prisma = req.app.locals.prisma;
  const { page = 1, limit = 20, status, priority } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    // Branch users only see queries for their branch
    if (req.user.role === 'branch') {
      where.case = { branchId: req.user.branchId };
    }

    const [queries, total] = await Promise.all([
      prisma.query.findMany({
        where,
        include: {
          case: {
            include: {
              branch: true,
            },
          },
          createdBy: { select: { id: true, name: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.query.count({ where }),
    ]);

    res.json({
      status: 'SUCCESS',
      data: queries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get queries error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch queries' });
  }
});

// Get queries by case
router.get('/case/:caseId', authenticate, async (req, res) => {
  const prisma = req.app.locals.prisma;

  try {
    const caseData = await prisma.case.findUnique({
      where: { id: req.params.caseId },
    });

    if (!caseData) {
      return res.status(404).json({ status: 'ERROR', message: 'Case not found' });
    }

    // Check permission for branch users
    if (req.user.role === 'branch' && caseData.branchId !== req.user.branchId) {
      return res.status(403).json({ status: 'ERROR', message: 'Access denied' });
    }

    const queries = await prisma.query.findMany({
      where: { caseId: req.params.caseId },
      include: {
        createdBy: { select: { id: true, name: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ status: 'SUCCESS', data: queries });
  } catch (error) {
    console.error('Get case queries error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch queries' });
  }
});

// Create query
router.post('/', authenticate, [
  body('caseId').notEmpty(),
  body('subject').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'ERROR', errors: errors.array() });
  }

  const { caseId, subject, description, priority = 'medium' } = req.body;
  const prisma = req.app.locals.prisma;

  try {
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseData) {
      return res.status(404).json({ status: 'ERROR', message: 'Case not found' });
    }

    // Check permission for branch users
    if (req.user.role === 'branch' && caseData.branchId !== req.user.branchId) {
      return res.status(403).json({ status: 'ERROR', message: 'Access denied' });
    }

    const query = await prisma.query.create({
      data: {
        caseId,
        type: 'general',
        subject,
        description,
        priority,
        createdById: req.user.userId,
        status: 'open',
      },
      include: {
        case: {
          include: {
            branch: true,
          },
        },
        createdBy: { select: { id: true, name: true, username: true } },
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

    res.status(201).json({
      status: 'SUCCESS',
      message: 'Query created successfully',
      data: query,
    });
  } catch (error) {
    console.error('Create query error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to create query' });
  }
});

// Update query
router.patch('/:id', authenticate, [
  body('subject').optional().trim(),
  body('description').optional().trim(),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'ERROR', errors: errors.array() });
  }

  const { subject, description, priority, status } = req.body;
  const prisma = req.app.locals.prisma;

  try {
    const query = await prisma.query.findUnique({
      where: { id: req.params.id },
      include: { case: true },
    });

    if (!query) {
      return res.status(404).json({ status: 'ERROR', message: 'Query not found' });
    }

    // Check permission
    if (req.user.role === 'branch' && query.case.branchId !== req.user.branchId) {
      return res.status(403).json({ status: 'ERROR', message: 'Access denied' });
    }

    const updatedQuery = await prisma.query.update({
      where: { id: req.params.id },
      data: {
        subject,
        description,
        priority,
        status,
      },
      include: {
        case: {
          include: {
            branch: true,
          },
        },
        createdBy: { select: { id: true, name: true, username: true } },
      },
    });

    res.json({
      status: 'SUCCESS',
      message: 'Query updated successfully',
      data: updatedQuery,
    });
  } catch (error) {
    console.error('Update query error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to update query' });
  }
});

// Resolve query
router.patch('/:id/resolve', authenticate, [
  body('resolution').trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'ERROR', errors: errors.array() });
  }

  const { resolution } = req.body;
  const prisma = req.app.locals.prisma;

  try {
    const query = await prisma.query.findUnique({
      where: { id: req.params.id },
      include: { case: true },
    });

    if (!query) {
      return res.status(404).json({ status: 'ERROR', message: 'Query not found' });
    }

    const updatedQuery = await prisma.query.update({
      where: { id: req.params.id },
      data: {
        status: 'resolved',
        resolution,
        resolvedAt: new Date(),
        resolvedById: req.user.userId,
      },
      include: {
        case: {
          include: {
            branch: true,
          },
        },
        createdBy: { select: { id: true, name: true, username: true } },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        caseId: query.caseId,
        userId: req.user.userId,
        action: 'query_resolved',
        description: `Query resolved: ${query.subject}`,
      },
    });

    res.json({
      status: 'SUCCESS',
      message: 'Query resolved successfully',
      data: updatedQuery,
    });
  } catch (error) {
    console.error('Resolve query error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to resolve query' });
  }
});

module.exports = router;
