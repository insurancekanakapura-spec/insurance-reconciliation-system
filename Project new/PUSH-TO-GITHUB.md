# 📤 Push to GitHub & Deploy Guide

## 🎯 Your GitHub Repository
**URL**: `https://github.com/insurancekanakapura-spec/insurance-reconciliation-system.git`

---

## Step 1: Download & Extract

1. **Download the ZIP file**: `cloudnine-insurance-platform-GITHUB-READY.zip`
2. **Extract it** to your computer
3. **Open terminal/command prompt** in the extracted folder

---

## Step 2: Push to GitHub

### Option A: Using Git Command Line

```bash
# Navigate to the extracted folder
cd cloudnine-prod

# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Cloudnine Insurance Platform"

# Add your GitHub repository as remote
git remote add origin https://github.com/insurancekanakapura-spec/insurance-reconciliation-system.git

# Push to GitHub
git push -u origin main
```

### Option B: Using GitHub Desktop

1. **Open GitHub Desktop**
2. **File → Add local repository**
3. **Select the `cloudnine-prod` folder**
4. **Enter commit message**: "Initial commit"
5. **Click "Commit to main"**
6. **Click "Publish repository"**
7. **Select your repository**: `insurancekanakapura-spec/insurance-reconciliation-system`

### Option C: Direct Upload to GitHub

1. **Go to**: https://github.com/insurancekanakapura-spec/insurance-reconciliation-system
2. **Click "Add file" → "Upload files"**
3. **Drag & drop all files** from the extracted folder
4. **Enter commit message**: "Initial commit"
5. **Click "Commit changes"**

---

## Step 3: Deploy (Choose One)

### 🚀 Option 1: Render (Recommended - FREE)

**Easiest deployment with automatic updates!**

1. **Create free account**: https://render.com
2. **Click "New +" → "Blueprint"**
3. **Connect your GitHub account**
4. **Select repository**: `insurance-reconciliation-system`
5. **Click "Apply"** - Render will read `render.yaml` and deploy everything!

**What gets deployed:**
- ✅ Frontend: `https://cloudnine-client.onrender.com`
- ✅ Backend API: `https://cloudnine-server.onrender.com`
- ✅ PostgreSQL Database (free)
- ✅ Automatic HTTPS
- ✅ Auto-deploy on every git push

---

### 🚀 Option 2: Railway (FREE)

1. **Create account**: https://railway.app
2. **New Project → Deploy from GitHub repo**
3. **Select**: `insurance-reconciliation-system`
4. **Add PostgreSQL** (New → Database → Add PostgreSQL)
5. **Set environment variables** in Railway dashboard

---

### 🚀 Option 3: Netlify + Heroku (FREE)

#### Frontend (Netlify):
1. **Create account**: https://netlify.com
2. **"Add new site" → "Import an existing project"**
3. **Connect GitHub**
4. **Select**: `insurance-reconciliation-system`
5. **Build settings**:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `dist`
6. **Add environment variable**: `VITE_API_URL`

#### Backend (Heroku):
1. **Create account**: https://heroku.com
2. **Create new app**
3. **Deploy tab → GitHub → Connect**
4. **Select**: `insurance-reconciliation-system`
5. **Add PostgreSQL addon** (Resources → Add-ons → Heroku Postgres)
6. **Set environment variables** in Settings → Config Vars

---

## Step 4: Set Environment Variables

### Required Variables (Backend)

| Variable | Value | Where to Set |
|----------|-------|--------------|
| `NODE_ENV` | `production` | Render/Railway/Heroku |
| `DATABASE_URL` | Auto-generated | Render/Railway/Heroku |
| `JWT_SECRET` | Random string | Render/Railway/Heroku |
| `CLIENT_URL` | Frontend URL | Render/Railway/Heroku |

### Required Variables (Frontend)

| Variable | Value | Where to Set |
|----------|-------|--------------|
| `VITE_API_URL` | Backend URL + `/api` | Netlify/Railway |

---

## Step 5: Initialize Database

### On Render:
```bash
# Go to Render Dashboard → Shell tab for your service
cd server
npx prisma migrate deploy
npx prisma db seed
```

### On Railway:
```bash
# Go to Railway → your service → Shell
npx prisma migrate deploy
npx prisma db seed
```

---

## ✅ Verify Deployment

1. **Open your frontend URL**
2. **Login with demo credentials**:
   - Username: `admin`
   - Password: `admin123`
3. **Check Dashboard** loads correctly
4. **Test creating a case**

---

## 🔧 Files Included for Deployment

| File | Purpose |
|------|---------|
| `render.yaml` | Render.com deployment config |
| `netlify.toml` | Netlify deployment config |
| `docker-compose.yml` | Docker deployment |
| `ecosystem.config.js` | PM2 process manager |
| `DEPLOY.md` | Detailed deployment guide |

---

## 🆘 Troubleshooting

### "Repository not found" error
```bash
# Make sure repository exists and is public
git remote set-url origin https://github.com/insurancekanakapura-spec/insurance-reconciliation-system.git
git push -u origin main
```

### "Permission denied" error
```bash
# Use GitHub token instead of password
git remote set-url origin https://YOUR_GITHUB_TOKEN@github.com/insurancekanakapura-spec/insurance-reconciliation-system.git
```

### Database connection errors
- Check `DATABASE_URL` is set correctly
- Run `npx prisma migrate deploy`

---

## 📞 Need Help?

1. **Check Render Dashboard logs**
2. **Verify environment variables**
3. **Check GitHub repository is public**

---

**Your app will be live in ~5 minutes! 🎉**
