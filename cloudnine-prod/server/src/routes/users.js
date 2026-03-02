const express = require('express');
const { body, query, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { authenticate } = require('./auth');

const router = express.Router();

// Middleware to check admin role
const requireAdminRole = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ status: 'ERROR', message: 'Access denied. Admin role required.' });
  }
  next();
};

// Get all users
router.get('/', authenticate, requireAdminRole, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim(),
  query('role').optional().isIn(['branch', 'validation', 'dispatch', 'settlement', 'admin']),
], async (req, res) => {
  const prisma = req.app.locals.prisma;
  const { page = 1, limit = 20, search, role } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { branch: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          branch: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      status: 'SUCCESS',
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', authenticate, requireAdminRole, async (req, res) => {
  const prisma = req.app.locals.prisma;

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { branch: true },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        branch: true,
      },
    });

    if (!user) {
      return res.status(404).json({ status: 'ERROR', message: 'User not found' });
    }

    res.json({ status: 'SUCCESS', data: user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch user' });
  }
});

// Create user
router.post('/', authenticate, requireAdminRole, [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').optional().trim(),
  body('email').optional().isEmail(),
  body('phone').optional().trim(),
  body('role').notEmpty().isIn(['branch', 'validation', 'dispatch', 'settlement', 'admin']),
  body('branchId').optional(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'ERROR', errors: errors.array() });
  }

  const { username, password, name, email, phone, role, branchId } = req.body;
  const prisma = req.app.locals.prisma;

  try {
    // Check if username exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(409).json({ status: 'ERROR', message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        email,
        phone,
        role,
        branchId: role === 'branch' ? branchId : null,
      },
      include: { branch: true },
    });

    res.status(201).json({
      status: 'SUCCESS',
      message: 'User created successfully',
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        branch: user.branch,
      },
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to create user' });
  }
});

// Update user
router.patch('/:id', authenticate, requireAdminRole, [
  body('name').optional().trim(),
  body('email').optional().isEmail(),
  body('phone').optional().trim(),
  body('role').optional().isIn(['branch', 'validation', 'dispatch', 'settlement', 'admin']),
  body('branchId').optional(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'ERROR', errors: errors.array() });
  }

  const { name, email, phone, role, branchId } = req.body;
  const prisma = req.app.locals.prisma;

  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        name,
        email,
        phone,
        role,
        branchId: role === 'branch' ? branchId : null,
      },
      include: { branch: true },
    });

    res.json({
      status: 'SUCCESS',
      message: 'User updated successfully',
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        branch: user.branch,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to update user' });
  }
});

// Toggle user status
router.patch('/:id/toggle-status', authenticate, requireAdminRole, async (req, res) => {
  const prisma = req.app.locals.prisma;

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!user) {
      return res.status(404).json({ status: 'ERROR', message: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !user.isActive },
      include: { branch: true },
    });

    res.json({
      status: 'SUCCESS',
      message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        name: updatedUser.name,
        isActive: updatedUser.isActive,
      },
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to toggle user status' });
  }
});

// Delete user
router.delete('/:id', authenticate, requireAdminRole, async (req, res) => {
  const prisma = req.app.locals.prisma;

  try {
    await prisma.user.delete({
      where: { id: req.params.id },
    });

    res.json({ status: 'SUCCESS', message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to delete user' });
  }
});

module.exports = router;
