/**
 * Cloudnine Insurance Platform - Backend Server
 * 
 * Express.js API server with:
 * - JWT Authentication
 * - Prisma ORM with SQLite
 * - File upload with Multer
 * - Rate limiting
 * - Security headers with Helmet
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { PrismaClient } = require('@prisma/client');

// Import routes
const authRoutes = require('./routes/auth');
const caseRoutes = require('./routes/cases');
const validationRoutes = require('./routes/validation');
const dispatchRoutes = require('./routes/dispatch');
const settlementRoutes = require('./routes/settlement');
const userRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');
const queryRoutes = require('./routes/queries');
const reportRoutes = require('./routes/reports');
const settingsRoutes = require('./routes/settings');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Prisma
const prisma = new PrismaClient();

// Make prisma available to routes
app.locals.prisma = prisma;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for development
}));

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Cloudnine Insurance Platform API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/validation', validationRoutes);
app.use('/api/dispatch', dispatchRoutes);
app.use('/api/settlement', settlementRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/queries', queryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'ERROR',
    message: 'Endpoint not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      status: 'ERROR',
      message: 'Unique constraint violation',
      field: err.meta?.target,
    });
  }
  
  if (err.code === 'P2025') {
    return res.status(404).json({
      status: 'ERROR',
      message: 'Record not found',
    });
  }

  res.status(err.status || 500).json({
    status: 'ERROR',
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║     🏥  CLOUDNINE INSURANCE PLATFORM - BACKEND                 ║
║                                                                ║
║     Server is running!                                         ║
║                                                                ║
║     ➜  API URL:    http://localhost:${PORT}/api                 ║
║     ➜  Health:     http://localhost:${PORT}/api/health          ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
