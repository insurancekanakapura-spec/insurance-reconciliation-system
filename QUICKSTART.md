# 🚀 Cloudnine Insurance Platform - Quick Start Guide

## 📦 What's Included

This is a **complete production-ready full-stack application** with:

### Frontend (React + Vite)
- Modern React 18 with hooks
- Vite for fast development and building
- Tailwind CSS for styling
- Zustand for state management
- React Query for API data fetching
- React Router for navigation

### Backend (Node.js + Express)
- Express.js REST API
- Prisma ORM with SQLite database
- JWT authentication
- File upload support
- Rate limiting and security headers

### Deployment Ready
- Docker & Docker Compose configuration
- PM2 process manager config
- Nginx reverse proxy setup

---

## ⚡ Quick Start (5 Minutes)

### Prerequisites
- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **npm** >= 9.0.0 (comes with Node.js)

### Step 1: Extract the ZIP
```bash
# Extract the downloaded file
unzip cloudnine-insurance-platform.zip
cd cloudnine-prod
```

### Step 2: Install Dependencies
```bash
# Install ALL dependencies (root, client, server)
npm run install:all
```

### Step 3: Setup Database
```bash
cd server

# Generate Prisma client
npx prisma generate

# Create database and run migrations
npx prisma migrate dev --name init

# Seed with demo data
npx prisma db seed

cd ..
```

### Step 4: Start Development Server
```bash
# Start both frontend and backend
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

## 🔑 Demo Login Credentials

| Role | Username | Password |
|------|----------|----------|
| **Branch (Jayanagar)** | `bng01` | `branch123` |
| **Branch (OAR)** | `bng02` | `branch123` |
| **Validation Team** | `validator1` | `validate123` |
| **Dispatch Team** | `dispatch1` | `dispatch123` |
| **Settlement Team** | `settlement1` | `settle123` |
| **Administrator** | `admin` | `admin123` |

---

## 🐳 Deploy with Docker (Production)

### Option 1: Docker Compose (Recommended)
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Access the app
# Frontend: http://localhost
# API: http://localhost:5000
```

### Option 2: PM2 (Server Deployment)
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start ecosystem.config.js

# Monitor
pm2 monit
```

---

## 📁 Project Structure

```
cloudnine-prod/
├── client/              # React Frontend
│   ├── src/
│   │   ├── components/  # UI Components
│   │   ├── pages/       # Page Components
│   │   ├── contexts/    # React Contexts
│   │   ├── store/       # Zustand Stores
│   │   └── utils/       # API & Utilities
│   └── package.json
├── server/              # Node.js Backend
│   ├── src/
│   │   ├── routes/      # API Routes
│   │   └── index.js     # Server Entry
│   ├── prisma/
│   │   ├── schema.prisma # Database Schema
│   │   └── seed.js      # Demo Data
│   └── package.json
├── docker/              # Docker Configs
├── docker-compose.yml   # Docker Compose
├── ecosystem.config.js  # PM2 Config
└── README.md            # Full Documentation
```

---

## 🛠️ Available Scripts

### Root Level
```bash
npm run install:all    # Install all dependencies
npm run dev            # Start dev mode (client + server)
npm run dev:client     # Start client only
npm run dev:server     # Start server only
npm run build          # Build for production
npm start              # Start production server
```

### Database
```bash
cd server
npx prisma generate    # Generate Prisma client
npx prisma migrate dev # Run migrations
npx prisma db seed     # Seed demo data
npx prisma studio      # Open database GUI
```

### Docker
```bash
docker-compose up -d   # Start all services
docker-compose down    # Stop all services
docker-compose logs -f # View logs
```

### PM2
```bash
pm2 start ecosystem.config.js    # Start with PM2
pm2 stop ecosystem.config.js     # Stop PM2
pm2 restart ecosystem.config.js  # Restart PM2
pm2 logs                         # View logs
pm2 monit                        # Monitor
```

---

## 🔧 Configuration

### Server (.env)
```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
ANTHROPIC_API_KEY=sk-ant-...  # Optional, for AI
```

### Client (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in server/.env
PORT=5001
```

### Database Issues
```bash
cd server
npx prisma migrate reset --force
npx prisma db seed
```

### Node Modules Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Features

- ✅ Multi-role authentication (Branch, Validation, Dispatch, Settlement, Admin)
- ✅ 4-Stage workflow (Pre-Auth → Final Bill → Approval → Documentation)
- ✅ Case management with document upload
- ✅ Dashboard with real-time metrics
- ✅ Branch and Insurance/TPA summaries
- ✅ Aging report
- ✅ Query management
- ✅ User management (Admin only)
- ✅ Reports with Excel export
- ✅ AI document validation (optional, with Anthropic API)

---

## 📞 Support

For detailed documentation, see `README.md` in the project folder.

**Made with ❤️ for Cloudnine Hospitals**
