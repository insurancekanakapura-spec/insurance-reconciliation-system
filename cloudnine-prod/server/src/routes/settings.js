const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('./auth');

const router = express.Router();

// Get all settings
router.get('/', authenticate, async (req, res) => {
  const prisma = req.app.locals.prisma;

  try {
    const [branches, insuranceTPAs] = await Promise.all([
      prisma.branch.findMany({ orderBy: { name: 'asc' } }),
      prisma.insuranceTPA.findMany({ orderBy: { name: 'asc' } }),
    ]);

    res.json({
      status: 'SUCCESS',
      data: {
        branches,
        insuranceTPAs,
      },
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch settings' });
  }
});

// Get branches
router.get('/branches', authenticate, async (req, res) => {
  const prisma = req.app.locals.prisma;

  try {
    const branches = await prisma.branch.findMany({
      orderBy: { name: 'asc' },
    });

    res.json({ status: 'SUCCESS', data: branches });
  } catch (error) {
    console.error('Get branches error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch branches' });
  }
});

// Create branch (admin only)
router.post('/branches', authenticate, [
  body('code').trim().notEmpty(),
  body('name').trim().notEmpty(),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('pincode').optional().trim(),
  body('phone').optional().trim(),
  body('email').optional().isEmail(),
], async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ status: 'ERROR', message: 'Admin access required' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'ERROR', errors: errors.array() });
  }

  const prisma = req.app.locals.prisma;
  const { code, name, address, city, state, pincode, phone, email } = req.body;

  try {
    const branch = await prisma.branch.create({
      data: {
        code,
        name,
        address,
        city,
        state,
        pincode,
        phone,
        email,
      },
    });

    res.status(201).json({
      status: 'SUCCESS',
      message: 'Branch created successfully',
      data: branch,
    });
  } catch (error) {
    console.error('Create branch error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to create branch' });
  }
});

// Update branch (admin only)
router.patch('/branches/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ status: 'ERROR', message: 'Admin access required' });
  }

  const prisma = req.app.locals.prisma;

  try {
    const branch = await prisma.branch.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json({
      status: 'SUCCESS',
      message: 'Branch updated successfully',
      data: branch,
    });
  } catch (error) {
    console.error('Update branch error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to update branch' });
  }
});

// Get insurance/TPAs
router.get('/insurance-tpas', authenticate, async (req, res) => {
  const prisma = req.app.locals.prisma;

  try {
    const insuranceTPAs = await prisma.insuranceTPA.findMany({
      orderBy: { name: 'asc' },
    });

    res.json({ status: 'SUCCESS', data: insuranceTPAs });
  } catch (error) {
    console.error('Get insurance TPAs error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch insurance/TPAs' });
  }
});

// Create insurance/TPA (admin only)
router.post('/insurance-tpas', authenticate, [
  body('name').trim().notEmpty(),
  body('type').notEmpty().isIn(['Insurance', 'TPA']),
  body('contactPerson').optional().trim(),
  body('phone').optional().trim(),
  body('email').optional().isEmail(),
  body('address').optional().trim(),
], async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ status: 'ERROR', message: 'Admin access required' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'ERROR', errors: errors.array() });
  }

  const prisma = req.app.locals.prisma;
  const { name, type, contactPerson, phone, email, address } = req.body;

  try {
    const insuranceTPA = await prisma.insuranceTPA.create({
      data: {
        name,
        type,
        contactPerson,
        phone,
        email,
        address,
      },
    });

    res.status(201).json({
      status: 'SUCCESS',
      message: 'Insurance/TPA created successfully',
      data: insuranceTPA,
    });
  } catch (error) {
    console.error('Create insurance/TPA error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to create insurance/TPA' });
  }
});

// Update insurance/TPA (admin only)
router.patch('/insurance-tpas/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ status: 'ERROR', message: 'Admin access required' });
  }

  const prisma = req.app.locals.prisma;

  try {
    const insuranceTPA = await prisma.insuranceTPA.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json({
      status: 'SUCCESS',
      message: 'Insurance/TPA updated successfully',
      data: insuranceTPA,
    });
  } catch (error) {
    console.error('Update insurance/TPA error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to update insurance/TPA' });
  }
});

module.exports = router;
