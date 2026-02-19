# VRM Frontend - Complete Setup & Run Guide

## Overview

VRM (Vendor Risk Management) Frontend is a React 18 SPA (Single Page Application) that provides a user interface for vendor assessment, evidence management, and risk tracking. This guide provides step-by-step instructions for local development setup and testing.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation & Setup](#installation--setup)
3. [Running the Frontend](#running-the-frontend)
4. [Available Pages & Features](#available-pages--features)
5. [API Integration](#api-integration)
6. [Building for Production](#building-for-production)
7. [Troubleshooting](#troubleshooting)
8. [Project Structure](#project-structure)

---

## System Requirements

**Required:**

- Node.js 14.0 or higher
- npm 6.0 or higher (comes with Node.js)
- Git

**Optional:**

- Backend running on `127.0.0.1:8000` (or update `.env` file)

---

## Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/SnehaaG22/vrm-frontend.git
cd vrm-frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

**What gets installed:**

- React 18.2.0 - UI framework
- react-router-dom 6.14.0 - Client-side routing
- axios 1.4.0 - HTTP client
- react-scripts 5.0.1 - Build & development tools

This may take 1-2 minutes on first install.

### Step 3: Configure Backend URL

Create or update the `.env` file in the project root:

```env
REACT_APP_API_URL=http://127.0.0.1:8000/api
```

**Why this matters:**

- Frontend makes all API calls to `${REACT_APP_API_URL}/...`
- If backend is running elsewhere, update this URL
- Changes to `.env` require app restart

### Step 4: Verify Backend is Running

Before starting frontend, ensure backend is running:

```bash
# From backend directory:
python manage.py runserver 127.0.0.1:8000
```

You should see:

```
Starting development server at http://127.0.0.1:8000/
```

---

## Running the Frontend

### Start Development Server

```bash
npm start
```

**Expected output:**

```
Compiled successfully!

You can now view vrm-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000

Note that the development build is not optimized.
To create a production build, use npm run build.
```

### Browser will auto-open to: `http://localhost:3000`

---

## Available Pages & Features

### 1. **Login Page** (`/login`)

- **URL:** http://localhost:3000/login
- **Feature:** Email/password authentication
- **Test Credentials:**
  - Email: `admin@vrm.com`, Password: `password123`
  - Email: `vendor@vrm.com`, Password: `password123`
  - Email: `reviewer@vrm.com`, Password: `password123`
- **What happens:** Sends credentials to `/api/auth/login/` and receives `dev-token`
- **Output:** Redirects to Dashboard on success

### 2. **Dashboard Page** (`/dashboard`)

- **URL:** http://localhost:3000/dashboard
- **Features:**
  - Displays logged-in user profile
  - Quick action buttons to navigate to other pages
  - Shows user email, name, and role
- **Protected:** ✅ Requires valid token

### 3. **Notifications Page** (`/notifications`)

- **URL:** http://localhost:3000/notifications
- **Features:**
  - List of all notifications
  - Mark notifications as read
  - Displays notification date and status
- **API Endpoint:** GET `/api/notifications/`
- **Protected:** ✅ Requires valid token
- **Error Handling:** Shows meaningful error message if API fails

### 4. **Evidence Upload Page** (`/evidence`)

- **URL:** http://localhost:3000/evidence
- **Features:**
  - File upload form with metadata fields
  - Supports multiple file types
  - Question ID and expiry date required
- **API Endpoint:** POST `/api/evidence/upload/`
- **Protected:** ✅ Requires valid token
- **Note:** Requires MinIO or file storage backend

### 5. **Assessments Page** (`/assessments`)

- **URL:** http://localhost:3000/assessments
- **Features:**
  - List of vendor assessments
  - Shows assessment status, vendor name, creation date
  - Paginated display
- **API Endpoint:** GET `/api/assessments/`
- **Protected:** ✅ Requires valid token
- **Error Handling:** Shows meaningful error message if API fails

### 6. **Vendors Page** (`/vendors`)

- **URL:** http://localhost:3000/vendors
- **Features:**
  - List of all vendors
  - Shows vendor name, category, status, contact info
  - Paginated display
- **API Endpoint:** GET `/api/vendors/`
- **Protected:** ✅ Requires valid token
- **Error Handling:** Shows meaningful error message if API fails

---

## API Integration

### How Authentication Works

1. **Login Request:**

   ```javascript
   POST /api/auth/login/
   Body: { "email": "admin@vrm.com", "password": "password123" }
   ```

2. **Token Received:**

   ```json
   {
     "token": "dev-token-5",
     "user": {
       "id": 5,
       "email": "admin@vrm.com",
       "first_name": "",
       "last_name": "",
       "org_id": null,
       "is_staff": false
     }
   }
   ```

3. **Token Stored:**
   - Stored in browser localStorage as `auth_token`
   - Persists across page refreshes

4. **Token Used in Requests:**
   - Added to every API request header:
     ```
     Authorization: Bearer dev-token-5
     ```

### API Client Setup

Located in `src/services/index.js`:

```javascript
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api",
});

// Add auth token to all requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Service Functions Available

```javascript
// Auth
login(email, password); // POST /auth/login/
getUserProfile(); // GET /users/me/

// Assessments
getAssessments(); // GET /assessments/
createAssessment(data); // POST /assessments/
getAssessmentDetail(id); // GET /assessments/{id}/

// Vendors
getVendors(); // GET /vendors/
createVendor(data); // POST /vendors/
getVendorDetail(id); // GET /vendors/{id}/

// Notifications
getNotifications(); // GET /notifications/
markNotificationAsRead(id); // POST /notifications/{id}/mark_read/

// Evidence
uploadEvidence(formData); // POST /evidence/upload/
```

---

## QA Testing Credentials Matrix

| Role     | Email            | Password    | Page Access |
| -------- | ---------------- | ----------- | ----------- |
| Admin    | admin@vrm.com    | password123 | All pages   |
| Vendor   | vendor@vrm.com   | password123 | All pages   |
| Reviewer | reviewer@vrm.com | password123 | All pages   |

### Quick Test Flow:

1. Navigate to http://localhost:3000/login
2. Enter `admin@vrm.com` / `password123`
3. Click "Login"
4. You should land on Dashboard
5. Click "View Assessments" button
6. Should see assessment list (may be empty if no data seeded)
7. Click "View Notifications" button
8. Should see notification list
9. Click "Upload Evidence" button
10. Try uploading a file

---

## Building for Production

### Create Optimized Build

```bash
npm run build
```

**Output:** `build/` folder with optimized files

**What happens:**

- React code is minified
- Assets are bundled and cached
- JavaScript is optimized
- Takes 1-3 minutes

### Serve Production Build Locally

```bash
# Install serve globally
npm install -g serve

# Serve the build
serve -s build -l 3000
```

### Deploy to Production

```bash
# Option 1: Vercel (recommended for React)
npm install -g vercel
vercel

# Option 2: Netlify
netlify deploy --prod --dir=build

# Option 3: Traditional hosting
# Upload build/ folder to web server (Apache, Nginx, etc.)
```

---

## Environment Variables

All environment variables must start with `REACT_APP_` to be accessible in code.

### Supported Variables:

| Variable            | Default                     | Usage                |
| ------------------- | --------------------------- | -------------------- |
| `REACT_APP_API_URL` | `http://127.0.0.1:8000/api` | Backend API base URL |

### Example `.env` for Different Environments:

**Development:**

```env
REACT_APP_API_URL=http://localhost:8000/api
```

**Staging:**

```env
REACT_APP_API_URL=https://staging-api.vrm.com/api
```

**Production:**

```env
REACT_APP_API_URL=https://api.vrm.com/api
```

---

## Troubleshooting

### "npm: command not found"

**Solution:** Install Node.js from https://nodejs.org/

- Download LTS version
- Run installer
- Restart terminal/PowerShell

### "Port 3000 already in use"

**Solution:** Use different port or kill existing process

```bash
# Use port 3001 instead
PORT=3001 npm start

# Or kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### "CORS error when making API calls"

**Solution:** Ensure backend CORS is configured:

1. Backend must have `corsheaders` installed
2. `CORS_ALLOWED_ORIGINS` in settings.py must include frontend URL:
   ```python
   CORS_ALLOWED_ORIGINS = [
       "http://localhost:3000",
       "http://127.0.0.1:3000",
   ]
   ```
3. Restart backend: `python manage.py runserver`

### "Failed to load assessments/vendors"

**Solution:** Check console for specific error:

1. Open browser DevTools: F12
2. Click "Console" tab
3. Look for error message
4. Check that backend API endpoint is running:
   ```bash
   curl http://127.0.0.1:8000/api/assessments/ \
     -H "Authorization: Bearer dev-token-5"
   ```

### "Login doesn't work (invalid credentials)"

**Solution:** Verify QA users are seeded in backend:

```bash
# From backend directory:
python manage.py shell < apps/common/seeds.py
```

### "Cannot GET /assessments"

**Solution:** React Router issue - refresh page or clear cache

```bash
# Clear node_modules and reinstall
rm -r node_modules
npm install
npm start
```

### "Blank page when opening `http://localhost:3000`"

**Solution:** Check console for JavaScript errors

1. Open browser DevTools: F12
2. Click "Console" tab
3. Look for red error messages
4. Try hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

---

## Project Structure

```
vrm-frontend/
├── public/                      # Static files
│   └── index.html              # Main HTML entry point
├── src/
│   ├── index.js                # React entry point
│   ├── App.js                  # Main routing component
│   ├── services/
│   │   └── index.js            # API client & service functions
│   ├── pages/                  # Page components
│   │   ├── LoginPage.js        # Login form
│   │   ├── DashboardPage.js    # User dashboard
│   │   ├── NotificationsPage.js # Notifications list
│   │   ├── EvidenceUploadPage.js # File upload form
│   │   ├── AssessmentsPage.js  # Assessments list
│   │   └── VendorsPage.js      # Vendors list
│   └── App.css                 # Global styles
├── package.json                # Dependencies & scripts
├── .env                        # Environment variables
├── README_SETUP.md             # This file
└── build/                      # Production build (after npm run build)
```

---

## Component Hierarchy

```
App
├── LoginPage (Route: /login)
├── DashboardPage (Route: /dashboard)
├── NotificationsPage (Route: /notifications)
├── EvidenceUploadPage (Route: /evidence)
├── AssessmentsPage (Route: /assessments)
└── VendorsPage (Route: /vendors)
```

---

## Development Best Practices

### 1. **Always Start Backend First**

```bash
# Terminal 1 - Backend
cd vrm-backend
python manage.py runserver 127.0.0.1:8000

# Terminal 2 - Frontend
cd vrm-frontend
npm start
```

### 2. **Check Browser Console**

Always check DevTools console (F12) for errors before reporting issues.

### 3. **Use React DevTools**

Install React DevTools browser extension for better debugging:

- Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/

### 4. **Clear Cache When Needed**

```bash
# Clear localStorage in browser console
localStorage.clear()

# Or hard refresh
Ctrl+Shift+R (Windows)
Cmd+Shift+R (Mac)
```

### 5. **Test API Endpoints Directly**

Use Postman or curl to verify backend endpoints before testing in UI:

```bash
curl http://127.0.0.1:8000/api/assessments/ \
  -H "Authorization: Bearer dev-token-5"
```

---

## Git Workflow

### Push Changes

```bash
git add .
git commit -m "Describe your changes here"
git push origin main
```

### Pull Latest Changes

```bash
git pull origin main
npm install  # If dependencies changed
npm start
```

---

## Performance Tips

### 1. **Lazy Load Pages**

Use `React.lazy()` to code-split pages for faster initial load.

### 2. **Memoize Components**

Use `React.memo()` to prevent unnecessary re-renders.

### 3. **Optimize Images**

Compress images before adding to `public/` folder.

### 4. **Use Production Build**

Always use `npm run build` for production deployment.

---

## Common Error Messages & Solutions

| Error              | Cause                       | Solution                                    |
| ------------------ | --------------------------- | ------------------------------------------- |
| `Network Error`    | Backend not running         | Start backend: `python manage.py runserver` |
| `401 Unauthorized` | Invalid/missing token       | Login again to get new token                |
| `403 Forbidden`    | User lacks permissions      | Check user role in backend                  |
| `404 Not Found`    | API endpoint doesn't exist  | Verify backend has the endpoint             |
| `CORS error`       | Backend CORS not configured | Add frontend URL to `CORS_ALLOWED_ORIGINS`  |
| `Cannot GET /page` | React Router error          | Hard refresh page: Ctrl+Shift+R             |

---

## Next Steps

### For QA Testing:

1. Start backend server
2. Start frontend: `npm start`
3. Test using credentials in [QA Testing Credentials](#qa-testing-credentials-matrix)
4. Document any issues in tracker with screenshots

### For Developers:

1. Make code changes in `src/`
2. Changes auto-reload in browser (hot reload)
3. Test locally before committing
4. Create git branch for features: `git checkout -b feature/description`
5. Push to GitHub and create Pull Request

### For Production Deployment:

1. Create optimized build: `npm run build`
2. Set environment variables in hosting platform
3. Deploy `build/` folder to hosting service
4. Verify backend URL in production environment
5. Test all pages and API calls in production

---

## Support & Documentation

- **React Docs**: https://react.dev
- **React Router**: https://reactrouter.com/
- **Axios**: https://axios-http.com/
- **Backend README**: See [Backend Setup Guide](../vrm-backend/README_SETUP.md)

---

**Last Updated:** February 19, 2025  
**Status:** ✅ Ready for QA Testing  
**Tested With:** Node.js 16+, npm 8+, React 18.2
