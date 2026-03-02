# 🚀 Cloudnine Insurance Platform - Deployment Package

## 📦 What's Included

This ZIP contains a **complete production-ready full-stack application**:

### Frontend (React + Vite)
- ✅ React 18 with modern hooks
- ✅ Vite build tool
- ✅ Tailwind CSS styling
- ✅ 12 complete page components
- ✅ Authentication & role-based access
- ✅ Dashboard with charts

### Backend (Node.js + Express)
- ✅ REST API with Express
- ✅ Prisma ORM with SQLite
- ✅ JWT authentication
- ✅ File upload support
- ✅ 9 API route modules

### Deployment Ready
- ✅ `render.yaml` - Render.com config
- ✅ `netlify.toml` - Netlify config
- ✅ `docker-compose.yml` - Docker config
- ✅ `ecosystem.config.js` - PM2 config

---

## 🎯 Your GitHub Repository

**URL**: `https://github.com/insurancekanakapura-spec/insurance-reconciliation-system.git`

---

## ⚡ Quick Deploy (3 Steps)

### Step 1: Push to GitHub

**Extract the ZIP file**, then:

```bash
cd cloudnine-prod
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/insurancekanakapura-spec/insurance-reconciliation-system.git
git push -u origin main
```

### Step 2: Deploy on Render (FREE)

1. Go to https://render.com
2. Sign up with GitHub
3. Click **"New +" → "Blueprint"**
4. Select your repository
5. Click **"Apply"**
6. Done! 🎉

**Live URLs:**
- Frontend: `https://cloudnine-client.onrender.com`
- Backend: `https://cloudnine-server.onrender.com`

### Step 3: Login & Test

**Demo Credentials:**
| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Branch | `bng01` | `branch123` |
| Validation | `validator1` | `validate123` |

---

## 📁 Project Structure

```
cloudnine-prod/
├── client/              # React Frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # 12 pages (Login, Dashboard, Cases, etc.)
│   │   ├── contexts/    # Auth context
│   │   ├── store/       # State management
│   │   └── utils/       # API utilities
│   └── package.json
├── server/              # Node.js Backend
│   ├── src/
│   │   ├── routes/      # API routes
│   │   │   ├── auth.js
│   │   │   ├── cases.js
│   │   │   ├── dashboard.js
│   │   │   ├── validation.js
│   │   │   ├── dispatch.js
│   │   │   ├── settlement.js
│   │   │   ├── users.js
│   │   │   ├── queries.js
│   │   │   └── reports.js
│   │   └── index.js     # Server entry
│   ├── prisma/
│   │   ├── schema.prisma # Database schema
│   │   └── seed.js       # Demo data
│   └── package.json
├── render.yaml          # Render deployment
├── netlify.toml         # Netlify deployment
├── docker-compose.yml   # Docker deployment
├── ecosystem.config.js  # PM2 config
├── README.md            # Full documentation
├── DEPLOY.md            # Deployment guide
└── PUSH-TO-GITHUB.md    # GitHub push guide
```

---

## 🌐 Alternative Deployment Options

### Option A: Railway (FREE)
1. https://railway.app
2. New Project → Deploy from GitHub
3. Add PostgreSQL database

### Option B: Netlify + Heroku (FREE)
- **Frontend**: Netlify (client folder)
- **Backend**: Heroku (server folder)

### Option C: VPS/Dedicated Server
- DigitalOcean, AWS, Linode
- Use Docker or PM2

---

## 🔑 Features Included

- ✅ Multi-role authentication (5 roles)
- ✅ 4-stage workflow (Pre-Auth → Final Bill → Approval → Documentation)
- ✅ Case management with document upload
- ✅ Dashboard with real-time metrics
- ✅ Branch & Insurance summaries
- ✅ Aging report
- ✅ Query management
- ✅ User management (admin)
- ✅ Reports with Excel export
- ✅ AI document validation (optional)

---

## 🛠️ Local Development

```bash
# Install dependencies
npm run install:all

# Setup database
cd server
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Start development
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## 📞 Support Files

| File | Description |
|------|-------------|
| `README.md` | Complete documentation |
| `DEPLOY.md` | Deployment options |
| `PUSH-TO-GITHUB.md` | GitHub push instructions |
| `QUICKSTART.md` | Quick start guide |

---

## ⚠️ Important Notes

1. **Database**: SQLite (dev) / PostgreSQL (production)
2. **File uploads**: Stored in `server/uploads/`
3. **AI features**: Optional (requires Anthropic API key)
4. **HTTPS**: Automatically enabled on Render/Netlify

---

## 🎉 After Deployment

Your app will be live with:
- ✅ Automatic HTTPS
- ✅ Database included
- ✅ Auto-deploy on git push
- ✅ Free hosting (with limits)

**Enjoy your Cloudnine Insurance Platform! 🏥**
