const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'cloudnine-secret-key-change-in-production';

// Middleware to verify JWT
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ status: 'ERROR', message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ status: 'ERROR', message: 'Invalid token' });
  }
};

// Login route
router.post('/login', [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('role').optional().isIn(['branch', 'validation', 'dispatch', 'settlement', 'admin']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'ERROR', errors: errors.array() });
  }

  const { username, password, role } = req.body;
  const prisma = req.app.locals.prisma;

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
      include: { branch: true },
    });

    if (!user) {
      return res.status(401).json({ status: 'ERROR', message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ status: 'ERROR', message: 'Account is disabled' });
    }

    // Verify password (in production, use bcrypt.compare)
    // For demo, we'll check against known passwords
    const validPasswords = {
      'branch123': 'branch',
      'validate123': 'validation',
      'dispatch123': 'dispatch',
      'settle123': 'settlement',
      'admin123': 'admin',
    };

    const expectedRole = validPasswords[password];
    
    if (!expectedRole || user.role !== expectedRole) {
      // For demo, also allow matching username patterns
      const isDemoLogin = (
        (username.startsWith('bng') && password === 'branch123' && user.role === 'branch') ||
        (username.startsWith('validator') && password === 'validate123' && user.role === 'validation') ||
        (username.startsWith('dispatch') && password === 'dispatch123' && user.role === 'dispatch') ||
        (username.startsWith('settlement') && password === 'settle123' && user.role === 'settlement') ||
        (username === 'admin' && password === 'admin123' && user.role === 'admin')
      );
      
      if (!isDemoLogin) {
        return res.status(401).json({ status: 'ERROR', message: 'Invalid credentials' });
      }
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role,
        branchId: user.branchId,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        action: 'login',
        description: `User ${user.username} logged in`,
      },
    });

    res.json({
      status: 'SUCCESS',
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Login failed' });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  const prisma = req.app.locals.prisma;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
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
        branch: true,
      },
    });

    if (!user) {
      return res.status(404).json({ status: 'ERROR', message: 'User not found' });
    }

    res.json({ status: 'SUCCESS', user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to get user' });
  }
});

// Update profile
router.patch('/profile', authenticate, [
  body('name').optional().trim().notEmpty(),
  body('email').optional().isEmail(),
  body('phone').optional().trim(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'ERROR', errors: errors.array() });
  }

  const { name, email, phone } = req.body;
  const prisma = req.app.locals.prisma;

  try {
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { name, email, phone },
      include: { branch: true },
    });

    res.json({
      status: 'SUCCESS',
      message: 'Profile updated',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        branch: user.branch,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to update profile' });
  }
});

// Change password
router.patch('/password', authenticate, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'ERROR', errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;
  const prisma = req.app.locals.prisma;

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    // Verify current password (simplified for demo)
    const validPasswords = {
      'branch123': 'branch',
      'validate123': 'validation',
      'dispatch123': 'dispatch',
      'settle123': 'settlement',
      'admin123': 'admin',
    };

    if (validPasswords[currentPassword] !== user.role) {
      return res.status(401).json({ status: 'ERROR', message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { password: hashedPassword },
    });

    res.json({ status: 'SUCCESS', message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to change password' });
  }
});

// Logout (client-side token removal, but we can log the activity)
router.post('/logout', authenticate, async (req, res) => {
  const prisma = req.app.locals.prisma;
  
  try {
    await prisma.activity.create({
      data: {
        userId: req.user.userId,
        action: 'logout',
        description: `User ${req.user.username} logged out`,
      },
    });

    res.json({ status: 'SUCCESS', message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Logout failed' });
  }
});

module.exports = router;
module.exports.authenticate = authenticate;
