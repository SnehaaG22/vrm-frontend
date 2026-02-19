# VRM Frontend - React Application

## Overview

VRM Frontend is a React-based user interface for the Vendor Risk Management (VRM) platform. It provides:

- **Authentication**: Login and token-based session management
- **Notifications**: View and manage notifications
- **Evidence Upload**: Upload and track evidence files with metadata

## Project Structure

```
vrm-frontend/
├── public/
│   └── index.html                    # Root HTML
├── src/
│   ├── context/
│   │   └── AuthContext.js           # Auth state management
│   ├── pages/
│   │   ├── LoginPage.js             # 🔐 Login (email/password)
│   │   ├── DashboardPage.js         # Main dashboard
│   │   ├── NotificationsPage.js     # 📢 View & mark notifications
│   │   └── EvidenceUploadPage.js    # 📎 Upload evidence files
│   ├── services/
│   │   ├── apiClient.js             # Axios HTTP client with interceptors
│   │   └── index.js                 # API service functions
│   ├── styles/
│   │   └── pages.css                # Component-specific styles
│   ├── App.js                       # Main app with routing
│   ├── App.css                      # Global styles
│   ├── index.js                     # React DOM entry point
│   └── index.css                    # Global styles
├── package.json                     # Dependencies & scripts
└── .env                            # Environment variables
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd vrm-frontend
npm install
```

### 2. Configure Environment

Create a `.env` file in the project root:

```
REACT_APP_API_URL=http://localhost:8000/api
```

### 3. Start Development Server

```bash
npm start
```

Server runs on: **http://localhost:3000**

### 4. Build for Production

```bash
npm run build
```

## UI → API Call Sequences

### 🔐 LOGIN FLOW

```
User Input (email, password)
    ↓
POST /auth/login/
    ↓
Response: {token, user}
    ↓
Store in localStorage:
  - authToken
  - orgId (from user.org_id)
  - user JSON
    ↓
Set Authorization header:
  Authorization: Bearer <token>
  org-id: <orgId>
    ↓
Redirect to /dashboard
```

**File**: [src/pages/LoginPage.js](src/pages/LoginPage.js)

---

### 📢 NOTIFICATION LIST FLOW

```
Page Load: NotificationsPage Component
    ↓
GET /notifications/?page=1
    + Headers: Authorization, org-id
    ↓
Response:
{
  count: 127,
  next: "/notifications/?page=2",
  results: [
    {
      id: 1,
      type: "evidence_upload",
      message: "New evidence uploaded...",
      status: "unread",
      created_at: "2026-02-18T10:30:45Z"
    }
  ]
}
    ↓
Display list with:
  - Icon based on type
  - Message text
  - Relative time (2 hours ago)
  - Status indicator (unread = blue)
    ↓
GET /notifications/unread-count/
    ↓
Response: {unread_count: 5, total_count: 127}
    ↓
Display badge and "Mark All as Read" button
```

**File**: [src/pages/NotificationsPage.js](src/pages/NotificationsPage.js)

---

### ✓ MARK NOTIFICATION AS READ FLOW

```
User clicks notification
    ↓
PATCH /notifications/{id}/mark-read/
    + Headers: Authorization, org-id
    + Body: {}
    ↓
Response: {status: "ok"}
    ↓
Refresh notification list
    ↓
Update UI: item no longer "unread"
```

---

### 📎 EVIDENCE UPLOAD FLOW

```
User enters form data:
  - Assessment ID: 10
  - Question ID: 42
  - Expiry Date: 2026-12-31
  - File: document.pdf
    ↓
Frontend simulates MinIO upload:
  File URL: https://minio.../org_101/assessment_10/question_42/document.pdf
    ↓
POST /evidence/upload/
  Headers: Authorization, org-id, Content-Type: application/json
  Payload:
  {
    "assessment_id": 10,
    "question_id": 42,
    "file_url": "https://minio.../document.pdf",
    "expiry_date": "2026-12-31",
    "file_type": "pdf",
    "org_id": 101,
    "uploaded_by": 5
  }
    ↓
Response (201 Created):
{
  "detail": "Evidence uploaded",
  "id": 156,
  "file_url": "https://minio.../document.pdf",
  "expiry_date": "2026-12-31",
  "created_at": "2026-02-18T11:45:30Z"
}
    ↓
Show success toast: "Evidence uploaded! Notification sent to team."
    ↓
Clear form
    ↓
(Optional) Refresh evidence list:
  GET /evidence/list/?assessment_id=10
```

**File**: [src/pages/EvidenceUploadPage.js](src/pages/EvidenceUploadPage.js)

---

### 📋 EVIDENCE LIST FLOW

```
User enters Assessment ID or clicks "Show List"
    ↓
GET /evidence/list/?assessment_id=10
    + Headers: Authorization, org-id
    + Query params: page=1, page_size=20
    ↓
Response:
{
  "count": 45,
  "results": [
    {
      "id": 156,
      "assessment_id": 10,
      "question_id": 42,
      "file_url": "https://...",
      "expiry_date": "2026-12-31",
      "expires_in_days": 318,
      "created_at": "2026-02-18T11:45:30Z"
    }
  ]
}
    ↓
Display list with:
  - Question number
  - File name
  - Expiry status:
    • expires_in_days < 0 → RED "Expired"
    • expires_in_days < 7 → RED "Expires in X days"
    • expires_in_days < 30 → ORANGE "Expires in X days"
    • expires_in_days >= 30 → GREEN "Valid for X days"
  - Upload date
```

---

## API Service Reference

All API calls use the `services/index.js` library:

```javascript
import {
  authService,
  notificationsService,
  evidenceService,
} from "../services";

// Example: Login
const result = await authService.login(email, password);

// Example: Get notifications
const response = await notificationsService.getNotifications(page);

// Example: Upload evidence
const response = await evidenceService.uploadEvidence(payload);
```

### Auto-Configured Headers

All API requests automatically include:

```
Authorization: Bearer <token>             // From localStorage
org-id: <org_id>                         // From localStorage
Content-Type: application/json
```

### Error Handling

- **401 Unauthorized**: Token expired → Clear localStorage, redirect to login
- **4xx/5xx Errors**: Display `error.detail` or `error.error` to user

---

## QA-Ready Credentials

### Demo Users (from Backend)

| Username | Email            | Password    | Role     | Access Level          |
| -------- | ---------------- | ----------- | -------- | --------------------- |
| admin    | admin@vrm.com    | password123 | Admin    | All endpoints         |
| vendor   | vendor@vrm.com   | password123 | Vendor   | Evidence upload, view |
| reviewer | reviewer@vrm.com | password123 | Reviewer | Evidence review       |

### Features Unlocked Per Role

| Feature            | Admin | Vendor | Reviewer |
| ------------------ | ----- | ------ | -------- |
| View Notifications | ✅    | ✅     | ✅       |
| Mark Read          | ✅    | ✅     | ✅       |
| Upload Evidence    | ✅    | ✅     | ❌       |
| List Evidence      | ✅    | ✅     | ✅       |
| Approve Evidence   | ✅    | ❌     | ✅       |

---

## Testing Checklist

### ✅ Manual Testing (Postman / Frontend)

- [ ] **Login**: Test all 3 user roles
- [ ] **Notifications**:
  - [ ] List notifications (paginated)
  - [ ] Mark single as read
  - [ ] Mark all as read
  - [ ] See unread count badge
- [ ] **Evidence**:
  - [ ] Upload with valid expiry date
  - [ ] Try invalid date (past) → 400 error
  - [ ] List evidence by assessment
  - [ ] See expiry warnings (< 30, < 7 days)
- [ ] **Error Handling**:
  - [ ] 401 on expired token → redirect to login
  - [ ] 403 if wrong role → show error
  - [ ] Network error → show user-friendly message

---

## Troubleshooting

### frontend:3000 won't connect to backend:8000

**Solution**: Ensure backend has CORS enabled in `settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]
```

### Token expired - stuck on login loop

**Solution**: Clear browser localStorage and login again:

```javascript
localStorage.clear();
```

### API returns 403 Forbidden

**Solution**: Check that `org-id` header is being sent:

```javascript
// In apiClient.js - verify interceptor is working
console.log(config.headers["org-id"]);
```

---

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Create `.env` file with backend URL
3. ✅ `npm start` to launch dev server
4. 🧪 Test all 3 pages with demo credentials
5. 📸 Take screenshots for QA sign-off
6. 🚀 Deploy to production

---

**Last Updated**: Feb 18, 2026  
**Status**: ✅ Ready for QA  
**Maintained By**: Sneha (Backend Team)
