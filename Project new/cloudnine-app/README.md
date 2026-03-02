# 🏥 Cloudnine Insurance Workflow Platform

A comprehensive insurance document workflow platform with AI-powered validation, multi-role access control, and full audit trails across 5 Bangalore branches.

![Cloudnine Platform](https://img.shields.io/badge/Cloudnine-Insurance%20Platform-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

---

## 📋 Table of Contents

- [Features](#-features)
- [System Requirements](#-system-requirements)
- [Installation](#-installation)
  - [Windows](#windows)
  - [Mac](#mac)
  - [Linux](#linux)
- [Getting Started](#-getting-started)
- [User Roles & Credentials](#-user-roles--credentials)
- [Application Structure](#-application-structure)
- [Troubleshooting](#-troubleshooting)
- [Support](#-support)

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

## 💻 System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Node.js | v14.0.0 | v18+ |
| RAM | 2 GB | 4 GB |
| Disk Space | 100 MB | 500 MB |
| Browser | Chrome 90+ | Latest Chrome/Firefox/Edge |
| Internet | Required for AI features | Stable connection |

---

## 🚀 Installation

### Step 1: Download and Extract

1. Download the `cloudnine-app.zip` file
2. Extract it to a folder on your computer (e.g., `C:\cloudnine-app` on Windows or `~/cloudnine-app` on Mac/Linux)

### Step 2: Install Node.js

**If you already have Node.js installed (v14+), skip to Step 3.**

#### Windows
1. Go to https://nodejs.org/
2. Download the **LTS** version (recommended)
3. Run the installer and follow the prompts
4. Open Command Prompt and verify: `node --version`

#### Mac
**Option 1 - Using Installer:**
1. Go to https://nodejs.org/
2. Download the macOS installer
3. Run the installer

**Option 2 - Using Homebrew:**
```bash
brew install node
```

Verify installation:
```bash
node --version
```

#### Linux (Ubuntu/Debian)
```bash
# Update package list
sudo apt update

# Install Node.js
sudo apt install nodejs npm

# Verify installation
node --version
npm --version
```

### Step 3: Install Dependencies

Open a terminal/command prompt and navigate to the extracted folder:

```bash
# Windows
cd C:\cloudnine-app

# Mac/Linux
cd ~/cloudnine-app
```

Install the required packages:

```bash
npm install
```

This will install:
- Express (web server)
- CORS (cross-origin support)
- Morgan (logging)

---

## 🎯 Getting Started

### Start the Server

```bash
npm start
```

You should see output like:
```
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║     🏥  CLOUDNINE INSURANCE PLATFORM                           ║
║                                                                ║
║     Server is running!                                         ║
║                                                                ║
║     ➜  Local:    http://localhost:3000                         ║
║     ➜  Network:  http://0.0.0.0:3000                           ║
╚════════════════════════════════════════════════════════════════╝
```

### Access the Application

1. Open your web browser
2. Navigate to: **http://localhost:3000**
3. The login screen will appear

### Configure AI (Optional but Recommended)

1. On first launch, you'll be prompted to enter your **Anthropic API Key**
2. Get your API key from: https://console.anthropic.com/
3. The key should start with `sk-ant-`
4. Your key is stored only in your browser session (never on any server)

**Note:** You can skip this step and use the platform without AI validation.

---

## 👥 User Roles & Credentials

### Demo Login Credentials

| Role | Username | Password | Access |
|------|----------|----------|--------|
| **Branch (Jayanagar)** | `bng01` | `branch123` | Create cases, upload docs |
| **Branch (OAR)** | `bng02` | `branch123` | Create cases, upload docs |
| **Branch (Malleswaram)** | `bng03` | `branch123` | Create cases, upload docs |
| **Branch (Bellandur)** | `bng04` | `branch123` | Create cases, upload docs |
| **Branch (Indiranagar)** | `bng05` | `branch123` | Create cases, upload docs |
| **Validation Team** | `validator1` | `validate123` | Review Stages 1-3 |
| **Validation Team** | `validator2` | `validate123` | Review Stages 1-3 |
| **Dispatch Team** | `dispatch1` | `dispatch123` | Stage 4 & POD |
| **Settlement Team** | `settlement1` | `settle123` | Payments & reconciliation |
| **Administrator** | `admin` | `admin123` | Full access |

### Role Permissions

| Feature | Branch | Validation | Dispatch | Settlement | Admin |
|---------|--------|------------|----------|------------|-------|
| Create Cases | ✅ | ❌ | ❌ | ❌ | ✅ |
| Upload Documents | ✅ | ❌ | ✅ | ❌ | ✅ |
| Review Stage 1-3 | ❌ | ✅ | ❌ | ❌ | ✅ |
| Review Stage 4 | ❌ | ❌ | ✅ | ❌ | ✅ |
| Manage POD | ❌ | ❌ | ✅ | ❌ | ✅ |
| Settlement Tracking | ❌ | ❌ | ❌ | ✅ | ✅ |
| User Management | ❌ | ❌ | ❌ | ❌ | ✅ |
| View All Branches | ❌ | ✅ | ✅ | ✅ | ✅ |

---

## 🏗️ Application Structure

```
cloudnine-app/
├── index.html          # Main application (React + all components)
├── server.js           # Express server
├── package.json        # Dependencies and scripts
├── README.md           # This file
└── node_modules/       # Installed packages (after npm install)
```

### Technology Stack

- **Frontend:** React 18 (via CDN), Vanilla CSS
- **Backend:** Node.js, Express
- **AI:** Claude API (Anthropic)
- **Charts:** Custom SVG components
- **Excel:** SheetJS (XLSX)

---

## 🔧 Troubleshooting

### Issue: "Cannot find module 'express'"

**Solution:** Run `npm install` again in the project folder.

### Issue: Port 3000 is already in use

**Solution:** Change the port by setting an environment variable:

**Windows:**
```cmd
set PORT=8080
npm start
```

**Mac/Linux:**
```bash
PORT=8080 npm start
```

Then access: http://localhost:8080

### Issue: AI validation not working

**Solutions:**
1. Check your API key at https://console.anthropic.com/
2. Ensure the key starts with `sk-ant-`
3. Check your internet connection
4. The API key is only stored in browser sessionStorage - you'll need to re-enter it if you close the browser

### Issue: Page not loading

**Solutions:**
1. Check that the server is running (you see the startup message)
2. Try http://127.0.0.1:3000 instead of localhost
3. Clear browser cache and reload
4. Check firewall settings

### Issue: Excel upload not working

**Solutions:**
1. Ensure file is .xlsx, .xls, or .csv format
2. Check that the file isn't open in another program
3. Verify column headers match the expected format
4. Try downloading and using the provided template

---

## 📊 Data Storage

⚠️ **Important:** This application stores all data **in-memory** (in the browser). 

- Data will be lost when you refresh the page
- For production use, you should connect to a database
- Sample data is generated automatically on each load

---

## 🔒 Security Notes

1. **API Keys:** Your Anthropic API key is stored only in browser sessionStorage and is never sent to any server other than Anthropic's API.

2. **Authentication:** The current authentication is demo-mode. For production:
   - Implement proper password hashing
   - Use JWT tokens or session-based auth
   - Enable HTTPS

3. **Data:** No patient data is persisted to disk in this demo version.

---

## 🆘 Support

### Getting Help

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review the application logs in the terminal
3. Check browser console for JavaScript errors (F12 → Console)

### Useful Commands

```bash
# Start the server
npm start

# Start with auto-reload (development)
npm run dev

# Check Node.js version
node --version

# Check installed packages
npm list
```

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Credits

- **Cloudnine Hospitals** - Healthcare Excellence
- **React** - Facebook
- **Express** - Node.js Framework
- **Claude AI** - Anthropic

---

**Made with ❤️ for Cloudnine Hospitals**
