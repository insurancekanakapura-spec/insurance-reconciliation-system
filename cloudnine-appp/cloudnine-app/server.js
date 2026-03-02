/**
 * Cloudnine Insurance Platform - Server
 * 
 * This is a simple Express server that serves the Cloudnine Insurance
 * Workflow Platform. The application is a single-page React application
 * that runs entirely in the browser.
 * 
 * To start the server:
 *   npm install
 *   npm start
 * 
 * The server will run on http://localhost:3000 by default.
 * You can change the port by setting the PORT environment variable.
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Serve the main application
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Cloudnine Insurance Platform is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API endpoint to get application info
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Cloudnine Insurance Platform',
    version: '1.0.0',
    description: 'Insurance Workflow Platform with AI Document Validation',
    features: [
      'Multi-role authentication (Branch, Corporate)',
      '4-Stage workflow (Pre-Auth, Final Bill, Approval, Documentation)',
      'AI Document Validation with Claude API',
      'Bulk Excel Upload',
      'Settlement Tracking',
      'User Management',
      'Dashboard Analytics',
      'Query Management'
    ],
    defaultCredentials: {
      branch: {
        username: 'bng01 (or your branch code)',
        password: 'branch123'
      },
      validation_team: {
        username: 'validator1',
        password: 'validate123'
      },
      dispatch_team: {
        username: 'dispatch1',
        password: 'dispatch123'
      },
      settlement_team: {
        username: 'settlement1',
        password: 'settle123'
      },
      admin: {
        username: 'admin',
        password: 'admin123'
      }
    }
  });
});

// Catch-all handler: send back to index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    status: 'ERROR',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║     🏥  CLOUDNINE INSURANCE PLATFORM                           ║
║                                                                ║
║     Server is running!                                         ║
║                                                                ║
║     ➜  Local:    http://localhost:${PORT}                        ║
║     ➜  Network:  http://0.0.0.0:${PORT}                          ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

📖  Quick Start Guide:
    1. Open your browser and navigate to http://localhost:${PORT}
    2. Enter your Anthropic API key (or skip to use without AI)
    3. Select your role and login

🔑  Demo Credentials:
    ┌─────────────────────┬──────────────────┬──────────────┐
    │ Role                │ Username         │ Password     │
    ├─────────────────────┼──────────────────┼──────────────┤
    │ Branch (Jayanagar)  │ bng01            │ branch123    │
    │ Validation Team     │ validator1       │ validate123  │
    │ Dispatch Team       │ dispatch1        │ dispatch123  │
    │ Settlement Team     │ settlement1      │ settle123    │
    │ Admin               │ admin            │ admin123     │
    └─────────────────────┴──────────────────┴──────────────┘

⚙️   To stop the server, press Ctrl+C
  `);
});

module.exports = app;
