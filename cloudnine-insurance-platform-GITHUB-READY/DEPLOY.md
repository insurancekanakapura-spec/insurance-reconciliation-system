# 🚀 Deployment Guide - Cloudnine Insurance Platform

## 📋 Quick Deploy Options

### Option 1: Render (Recommended - FREE)
**Easiest option with automatic deployment from GitHub**

1. **Fork/Push this repo to GitHub**
2. **Create free account at** [render.com](https://render.com)
3. **Click "New +" → "Blueprint"**
4. **Connect your GitHub repo**
5. **Done!** Render will auto-deploy

🔗 **Live URL**: `https://cloudnine-client.onrender.com`
🔗 **API URL**: `https://cloudnine-server.onrender.com`

---

### Option 2: Railway (FREE)
**Alternative free hosting with database included**

1. **Push code to GitHub**
2. **Create account at** [railway.app](https://railway.app)
3. **New Project → Deploy from GitHub repo**
4. **Add PostgreSQL database**
5. **Set environment variables**

---

### Option 3: Netlify + Heroku (FREE)
**Frontend on Netlify, Backend on Heroku**

#### Frontend (Netlify):
1. **Create account at** [netlify.com](https://netlify.com)
2. **Add new site → Import from GitHub**
3. **Build settings**: `client/` folder, build command: `npm run build`
4. **Set environment variable**: `VITE_API_URL`

#### Backend (Heroku):
1. **Create account at** [heroku.com](https://heroku.com)
2. **Create new app**
3. **Connect GitHub repo**
4. **Add PostgreSQL addon**
5. **Deploy**

---

## 🔧 Environment Variables

### Server (Backend)
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://...
JWT_SECRET=your-super-secret-key
CLIENT_URL=https://your-frontend-url.com
ANTHROPIC_API_KEY=sk-ant-... (optional)
```

### Client (Frontend)
```env
VITE_API_URL=https://your-backend-url.com/api
```

---

## 📁 Files for Deployment

| File | Purpose |
|------|---------|
| `render.yaml` | Render.com deployment config |
| `netlify.toml` | Netlify deployment config |
| `.github/workflows/deploy.yml` | GitHub Actions CI/CD |
| `docker-compose.yml` | Docker deployment |
| `ecosystem.config.js` | PM2 process manager |

---

## 🐳 Docker Deployment (Self-Hosted)

```bash
# Build and run with Docker Compose
docker-compose up -d

# Access:
# Frontend: http://localhost
# API: http://localhost:5000
```

---

## ☁️ AWS Deployment (Production)

### Using Elastic Beanstalk:
```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p node.js cloudnine-app

# Create environment
eb create production

# Deploy
eb deploy
```

---

## 🔑 Demo Credentials (After Deploy)

| Role | Username | Password |
|------|----------|----------|
| Branch | `bng01` | `branch123` |
| Validation | `validator1` | `validate123` |
| Dispatch | `dispatch1` | `dispatch123` |
| Settlement | `settlement1` | `settle123` |
| Admin | `admin` | `admin123` |

---

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Run migrations manually
cd server
npx prisma migrate deploy
```

### Build Failures
```bash
# Clear cache and rebuild
rm -rf node_modules
npm run install:all
npm run build
```

### CORS Errors
- Update `CLIENT_URL` in backend env vars
- Update `VITE_API_URL` in frontend env vars

---

## 📞 Support

For issues, check:
1. Render Dashboard logs
2. Database connection status
3. Environment variables are set correctly

---

**Your app will be live in ~5 minutes after deployment! 🎉**
