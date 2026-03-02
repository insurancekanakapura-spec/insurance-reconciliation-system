# 🏥 Cloudnine Insurance Workflow Platform

A comprehensive, production-ready insurance document workflow platform with AI-powered validation, multi-role access control, and full audit trails across 5 Bangalore branches.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### 🔐 Multi-Role Access Control
- **Branch Staff** - Create cases and upload documents
- **Validation Team** - Review and approve Stages 1-3
- **Dispatch Team** - Handle Stage 4 documentation and POD
- **Settlement Team** - Track payments and reconciliation
- **Administrator** - Full system access and user management

### 🤖 AI Document Validation
- Powered by **Claude AI (Anthropic)**
- Automatic document reading and validation
- Real-time discrepancy detection
- Confidence scoring

### 📊 4-Stage Workflow
1. **Stage 1: Pre-Authorization** - Upload pre-auth documents
2. **Stage 2: Final Bill & DS** - Upload final bill and discharge summary
3. **Stage 3: Insurance Approval** - Upload approval letters
4. **Stage 4: Documentation** - Upload dispatch documents and POD

### 📈 Analytics & Reporting
- Dashboard with real-time metrics
- Branch-wise summaries
- Insurance/TPA-wise outstanding
- Aging analysis
- Excel export capabilities

### 📁 Bulk Operations
- Bulk Excel upload for Stage 4 case creation
- Bulk settlement updates
- Template downloads

---

## 🏗️ Architecture

```
cloudnine-prod/
├── client/                 # React Frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   ├── store/          # Zustand stores
│   │   └── utils/          # Utility functions
│   └── package.json
├── server/                 # Node.js Backend (Express + Prisma)
│   ├── src/
│   │   ├── routes/         # API routes
│   │   └── index.js        # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.js         # Database seeder
│   └── package.json
├── docker/                 # Docker configurations
├── docker-compose.yml      # Docker Compose setup
└── ecosystem.config.js     # PM2 configuration
```

### Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, Tailwind CSS, Zustand, React Query |
| **Backend** | Node.js, Express, Prisma ORM |
| **Database** | SQLite (can be upgraded to PostgreSQL) |
| **AI** | Claude API (Anthropic) |
| **Charts** | Recharts |
| **Excel** | SheetJS (XLSX) |
| **Deployment** | Docker, PM2, Nginx |

---

## 💻 Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | >= 18.0.0 |
| npm | >= 9.0.0 |
| Git | Any |
| Docker | (optional) >= 20.0 |

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/cloudnine-insurance.git
cd cloudnine-insurance
```

### Step 2: Install Dependencies

```bash
# Install all dependencies (root, client, and server)
npm run install:all
```

Or install manually:

```bash
# Root dependencies
npm install

# Client dependencies
cd client && npm install && cd ..

# Server dependencies
cd server && npm install && cd ..
```

### Step 3: Configure Environment Variables

```bash
# Copy environment files
cp server/.env.example server/.env
cp client/.env.example client/.env

# Edit the .env files with your configuration
```

### Step 4: Setup Database

```bash
# Generate Prisma client
cd server
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database with sample data
npx prisma db seed
```

---

## ⚙️ Configuration

### Server Environment Variables (server/.env)

```env
# Database
DATABASE_URL="file:./dev.db"

# Server
PORT=5000
NODE_ENV=development

# JWT Secret (change in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# Anthropic API Key (optional, for AI features)
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

### Client Environment Variables (client/.env)

```env
# API URL
VITE_API_URL=http://localhost:5000/api

# App Settings
VITE_APP_NAME=Cloudnine Insurance Platform
VITE_APP_VERSION=1.0.0
```

---

## ▶️ Running the Application

### Development Mode

```bash
# Run both client and server concurrently
npm run dev

# Or run separately
npm run dev:client  # Client only
npm run dev:server  # Server only
```

- **Client**: http://localhost:5173
- **Server**: http://localhost:5000
- **API Docs**: http://localhost:5000/api/health

### Production Mode

```bash
# Build the client
npm run build

# Start the server
npm start
```

---

## 🐳 Deployment with Docker

### Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Docker Build

```bash
# Build server image
docker build -f docker/Dockerfile.server -t cloudnine-server .

# Build client image
docker build -f docker/Dockerfile.client -t cloudnine-client .

# Run containers
docker run -d -p 5000:5000 --name cloudnine-server cloudnine-server
docker run -d -p 80:80 --name cloudnine-client cloudnine-client
```

---

## 📊 PM2 Deployment

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start ecosystem.config.js

# View logs
pm2 logs

# Monitor
pm2 monit

# Restart
pm2 restart cloudnine-server

# Stop
pm2 stop cloudnine-server
```

---

## 🔑 Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| **Branch (Jayanagar)** | `bng01` | `branch123` |
| **Branch (OAR)** | `bng02` | `branch123` |
| **Branch (Malleswaram)** | `bng03` | `branch123` |
| **Branch (Bellandur)** | `bng04` | `branch123` |
| **Branch (Indiranagar)** | `bng05` | `branch123` |
| **Validation Team** | `validator1` | `validate123` |
| **Dispatch Team** | `dispatch1` | `dispatch123` |
| **Settlement Team** | `settlement1` | `settle123` |
| **Administrator** | `admin` | `admin123` |

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |
| PATCH | `/api/auth/profile` | Update profile |
| PATCH | `/api/auth/password` | Change password |

### Cases Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cases` | List all cases |
| POST | `/api/cases` | Create new case |
| GET | `/api/cases/:id` | Get case details |
| PATCH | `/api/cases/:id` | Update case |
| DELETE | `/api/cases/:id` | Delete case |
| POST | `/api/cases/:id/documents/:stage` | Upload document |
| POST | `/api/cases/bulk` | Bulk upload from Excel |

### Dashboard Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics |
| GET | `/api/dashboard/branch-summary` | Get branch summary |
| GET | `/api/dashboard/insurance-summary` | Get insurance/TPA summary |
| GET | `/api/dashboard/recent-activity` | Get recent activity |
| GET | `/api/dashboard/aging-report` | Get aging report |

---

## 🔧 Troubleshooting

### Database Issues

```bash
# Reset database
cd server
npx prisma migrate reset --force

# Regenerate client
npx prisma generate
```

### Port Already in Use

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in .env
PORT=5001
```

### Node Modules Issues

```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Credits

- **Cloudnine Hospitals** - Healthcare Excellence
- **React** - Facebook
- **Express** - Node.js Framework
- **Prisma** - Database ORM
- **Claude AI** - Anthropic

---

**Made with ❤️ for Cloudnine Hospitals**
