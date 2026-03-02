const express = require('express');
const { body, query, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('./auth');

const router = express.Router();

// Configure multer for POD uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/pod');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `pod-${req.params.caseId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Middleware to check dispatch role
const requireDispatchRole = (req, res, next) => {
  if (req.user.role !== 'dispatch' && req.user.role !== 'admin') {
    return res.status(403).json({ status: 'ERROR', message: 'Access denied. Dispatch role required.' });
  }
  next();
};

// Get pending dispatch cases
router.get('/pending', authenticate, requireDispatchRole, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], async (req, res) => {
  const prisma = req.app.locals.prisma;
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const where = {
      status: 'approved',
      currentStage: 'STAGE_4',
      dispatch: null,
    };

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where,
        include: {
          branch: true,
          insuranceTpa: true,
          createdBy: { select: { id: true, name: true, username: true } },
          documents: true,
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
    console.error('Get pending dispatch error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch pending cases' });
  }
});

// Get dispatch history
router.get('/history', authenticate, requireDispatchRole, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], async (req, res) => {
  const prisma = req.app.locals.prisma;
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const [dispatches, total] = await Promise.all([
      prisma.dispatch.findMany({
        include: {
          case: {
            include: {
              branch: true,
              insuranceTpa: true,
            },
          },
        },
        orderBy: { dispatchedAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.dispatch.count(),
    ]);

    res.json({
      status: 'SUCCESS',
      data: dispatches,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get dispatch history error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch dispatch history' });
  }
});

// Mark case as dispatched
router.post('/:caseId/dispatch', authenticate, requireDispatchRole, [
  body('dispatchMode').notEmpty().isIn(['courier', 'hand_delivery', 'email']),
  body('courierName').optional().trim(),
  body('trackingNumber').optional().trim(),
  body('recipientName').optional().trim(),
  body('recipientPhone').optional().trim(),
  body('notes').optional().trim(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'ERROR', errors: errors.array() });
  }

  const { caseId } = req.params;
  const { dispatchMode, courierName, trackingNumber, recipientName, recipientPhone, notes } = req.body;
  const prisma = req.app.locals.prisma;

  try {
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseData) {
      return res.status(404).json({ status: 'ERROR', message: 'Case not found' });
    }

    // Create dispatch record
    const dispatch = await prisma.dispatch.create({
      data: {
        caseId,
        dispatchedById: req.user.userId,
        dispatchMode,
        courierName,
        trackingNumber,
        recipientName,
        recipientPhone,
        notes,
      },
    });

    // Update case status
    await prisma.case.update({
      where: { id: caseId },
      data: { status: 'dispatched' },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        caseId,
        userId: req.user.userId,
        action: 'dispatched',
        description: `Case dispatched via ${dispatchMode}`,
        metadata: JSON.stringify({ trackingNumber, courierName }),
      },
    });

    res.json({
      status: 'SUCCESS',
      message: 'Case marked as dispatched',
      data: dispatch,
    });
  } catch (error) {
    console.error('Dispatch case error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to dispatch case' });
  }
});

// Upload POD
router.post('/:caseId/pod', authenticate, requireDispatchRole, upload.single('pod'), async (req, res) => {
  const { caseId } = req.params;
  const prisma = req.app.locals.prisma;

  try {
    if (!req.file) {
      return res.status(400).json({ status: 'ERROR', message: 'No POD file uploaded' });
    }

    const dispatch = await prisma.dispatch.findUnique({
      where: { caseId },
    });

    if (!dispatch) {
      return res.status(404).json({ status: 'ERROR', message: 'Dispatch record not found' });
    }

    // Update dispatch with POD
    await prisma.dispatch.update({
      where: { caseId },
      data: {
        podReceived: true,
        podFilePath: req.file.path,
        podReceivedAt: new Date(),
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        caseId,
        userId: req.user.userId,
        action: 'pod_received',
        description: 'POD uploaded and received',
      },
    });

    res.json({
      status: 'SUCCESS',
      message: 'POD uploaded successfully',
    });
  } catch (error) {
    console.error('Upload POD error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to upload POD' });
  }
});

// Get dispatch stats
router.get('/stats', authenticate, requireDispatchRole, async (req, res) => {
  const prisma = req.app.locals.prisma;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalDispatched,
      pendingPOD,
      dispatchedToday,
    ] = await Promise.all([
      prisma.dispatch.count(),
      prisma.dispatch.count({ where: { podReceived: false } }),
      prisma.dispatch.count({ where: { dispatchedAt: { gte: today } } }),
    ]);

    res.json({
      status: 'SUCCESS',
      data: {
        totalDispatched,
        pendingPOD,
        dispatchedToday,
        avgDispatchTime: 24, // Placeholder
      },
    });
  } catch (error) {
    console.error('Get dispatch stats error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch dispatch stats' });
  }
});

module.exports = router;
