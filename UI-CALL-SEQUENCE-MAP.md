# UI → Backend API Call Sequence Map

**Prepared by:** Sneha  
**Date:** Feb 18, 2026  
**Status:** UI Skeleton Complete - Ready for QA  
**Repository:** https://github.com/yourorg/vrm-frontend (see branch below)

---

## 📋 Table of Contents

1. [Project Structure](#project-structure)
2. [API Call Sequences per Page](#api-call-sequences-per-page)
3. [Shared Infrastructure](#shared-infrastructure)
4. [Error Handling Patterns](#error-handling-patterns)
5. [QA Testing Matrix](#qa-testing-matrix)
6. [Pages List](#pages-list)

---

## Project Structure

```
vrm-frontend/
├── src/
│   ├── context/
│   │   └── AuthContext.js              # ← Auth state + token management
│   ├── pages/
│   │   ├── LoginPage.js                # ← 🔐 SCREEN 1: Login
│   │   ├── DashboardPage.js            # ← SCREEN 2: Main dashboard
│   │   ├── NotificationsPage.js        # ← 🔐 SCREEN 3: Notifications (list + read)
│   │   └── EvidenceUploadPage.js       # ← 🔐 SCREEN 4: Evidence upload
│   ├── services/
│   │   ├── apiClient.js                # ← Axios config + interceptors
│   │   └── index.js                    # ← API service functions
│   └── (styling, routing, utilities)
```

**3 Core Screens Implemented:**
1. ✅ Login (email/password)
2. ✅ Notifications (list with pagination, mark as read)
3. ✅ Evidence Upload (file + metadata)

---

## API Call Sequences per Page

### SCREEN 1 🔐 LOGIN PAGE

**File:** `src/pages/LoginPage.js`  
**Route:** `/login`  
**Access:** Public (no auth required)

#### Flow Diagram

```
┌─────────────────────────────────────────┐
│ USER ENTERS EMAIL & PASSWORD            │
└──────────────────┬──────────────────────┘
                   │ form.submit()
                   ↓
        ┌──────────────────────┐
        │ POST /auth/login/   │
        │ {email, password}   │
        └──────────┬───────────┘
                   │
        ┌──────────┴───────────┐
        │ Response             │
        │ {token, user}        │
        └──────────┬───────────┘
                   │
        ┌──────────┴───────────────────────┐
        │ Store in localStorage:          │
        │ - authToken = "eyJ0..."         │
        │ - orgId = user.org_id           │
        │ - user = {...}                  │
        └──────────┬───────────────────────┘
                   │
        ┌──────────┴─────────────────────┐
        │ Set API Headers (global):     │
        │ Authorization: Bearer <token> │
        │ org-id: <orgId>              │
        └──────────┬─────────────────────┘
                   │
        ┌──────────┴──────────┐
        │ navigate("/dashboard")
        └──────────────────────┘
```

#### API Calls

| Endpoint | Method | Headers | Payload | Response | Status |
|----------|--------|---------|---------|----------|--------|
| `/auth/login/` | POST | `Content-Type: application/json` | `{email, password}` | `{token, user}` | ✅ Implemented |

#### Code Example

```javascript
// LoginPage.js
const handleSubmit = async (e) => {
  e.preventDefault();
  const result = await authService.login(email, password);
  if (result.success) {
    navigate('/dashboard');
  }
};

// authService.login() → POST /auth/login/
```

#### Validation Rules

```javascript
✅ Email format validation (HTML5 input type="email")
✅ Password required (non-empty)
❌ No password complexity rules on frontend
✅ Show spinner while loading
✅ Display error message if login fails
```

#### Demo Credentials for Testing

```
Admin:    admin@vrm.com     / password123
Vendor:   vendor@vrm.com    / password123
Reviewer: reviewer@vrm.com  / password123
```

---

### SCREEN 2 📊 DASHBOARD PAGE

**File:** `src/pages/DashboardPage.js`  
**Route:** `/dashboard`  
**Access:** Protected (requires auth token)

#### Flow Diagram

```
┌──────────────────────────┐
│ USER LOGIN COMPLETE      │
│ Token in localStorage    │
└──────────────┬───────────┘
               │ navigate("/dashboard")
               ↓
    ┌─────────────────────────────┐
    │ DashboardPage renders       │
    │ - Show user profile         │
    │ - Show quick action cards   │
    │ - Show API reference        │
    └──────────────┬──────────────┘
               (no API calls)
               │
               ↓
    ┌──────────────────────────────┐
    │ User clicks "Notifications"  │
    │ OR "Upload Evidence"         │
    └──────────────┬───────────────┘
                   │
        ┌──────────┴──────────┐
        │ navigate() to page  │
        └─────────────────────┘
```

#### Components Used

- User profile card (from context)
- Quick action cards (buttons)
- API reference guide

#### No API Calls on This Page

This is a dashboard/hub page that shows:
- Current user info (from context, not fresh API call)
- Links to other features
- Quick reference guide

---

### SCREEN 3 🔐 NOTIFICATIONS PAGE

**File:** `src/pages/NotificationsPage.js`  
**Route:** `/notifications`  
**Access:** Protected (requires auth token)

#### Flow Diagram

```
Page Load Event
    │
    ├──> GET /notifications/?page=1
    │    Headers: Authorization, org-id
    │    ↓
    │    Response: {count, next, results: [...]}
    │    ↓
    │    Store in state + render list
    │
    └──> GET /notifications/unread-count/
         Headers: Authorization, org-id
         ↓
         Response: {unread_count: X, total_count: Y}
         ↓
         Display badge


User Interaction: Mark as Read
    │
    ├──> PATCH /notifications/{id}/mark-read/
    │    Headers: Authorization, org-id
    │    Body: {}
    │    ↓
    │    Response: {status: "ok"}
    │    ↓
    │    Refresh notification list


User Interaction: Mark All as Read
    │
    └──> POST /notifications/read-all/
         Headers: Authorization, org-id
         Body: {}
         ↓
         Response: {status: "ok"}
         ↓
         Refresh notification list
```

#### API Calls

| Endpoint | Method | Headers | Query | Response | Status | UI Impact |
|----------|--------|---------|-------|----------|--------|-----------|
| `/notifications/` | GET | Auth, org-id | `?page=1&page_size=20` | `{count, results, next}` | ✅ Impl | List render |
| `/notifications/unread-count/` | GET | Auth, org-id | - | `{unread_count, total_count}` | ✅ Impl | Badge count |
| `/notifications/{id}/mark-read/` | PATCH | Auth, org-id | - | `{status: "ok"}` | ✅ Impl | Item → read state |
| `/notifications/read-all/` | POST | Auth, org-id | - | `{status: "ok"}` | ✅ Impl | All → read state |

#### Response Format Example

```javascript
GET /notifications/?page=1

{
  "count": 127,
  "next": "/notifications/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "org_id": 101,
      "user_id": 5,
      "type": "evidence_upload",
      "message": "New evidence uploaded for question 42",
      "status": "unread",
      "created_at": "2026-02-18T10:30:45Z"
    },
    {
      "id": 2,
      "org_id": 101,
      "user_id": 5,
      "type": "assessment_assigned",
      "message": "New assessment assigned",
      "status": "read",
      "created_at": "2026-02-18T09:15:22Z"
    }
  ]
}
```

#### Code Example

```javascript
// NotificationsPage.js
useEffect(() => {
  fetchNotifications();
}, [currentPage]);

const fetchNotifications = async () => {
  const response = await notificationsService.getNotifications(currentPage);
  setNotifications(response.data.results);
  
  const countResponse = await notificationsService.getUnreadCount();
  setUnreadCount(countResponse.data.unread_count);
};

const handleMarkAsRead = async (notificationId) => {
  await notificationsService.markAsRead(notificationId);
  fetchNotifications(); // Refresh
};
```

#### UI Display Rules

```javascript
// Type → Icon mapping
type "evidence_upload"        → 📎
type "assessment_assigned"    → 📋
type "approval_needed"        → ⚠️
type "renewal_reminder"       → 🔄
default                       → 📢

// Status → Visual
status "unread"  → Blue background, bold text
status "read"    → Gray text, normal weight

// created_at → Display
< 1 hour → "2 minutes ago"
< 1 day  → "2 hours ago"
< 7 days → "2 days ago"
else     → "Feb 18, 2026"
```

#### Pagination

- 20 notifications per page (configurable)
- Next/Prev buttons
- Page indicator: "Page 2 of 6"
- Disabled when at boundary

---

### SCREEN 4 🔐 EVIDENCE UPLOAD PAGE

**File:** `src/pages/EvidenceUploadPage.js`  
**Route:** `/evidence`  
**Access:** Protected (requires auth token)

#### Flow Diagram

```
Form Input:
  - Assessment ID (required)
  - Question ID (required)
  - Expiry Date (required, future)
  - File (required)
    │
    ├──> Validation
    │    - Assessment ID: integer
    │    - Question ID: integer
    │    - Expiry Date: YYYY-MM-DD, >= today
    │    - File: not empty
    │
    └──> POST /evidence/upload/
         Headers: Authorization, org-id
         Payload:
         {
           "assessment_id": 10,
           "question_id": 42,
           "file_url": "https://minio.../file.pdf",
           "expiry_date": "2026-12-31",
           "file_type": "pdf",
           "org_id": 101,
           "uploaded_by": 5
         }
         ↓
         Response (201): {detail, id, created_at}
         ↓
         Show success toast
         Clear form


User Action: View Evidence List
    │
    └──> GET /evidence/list/?assessment_id=10
         Headers: Authorization, org-id
         ↓
         Response: {count, results: [...]}
         ↓
         Show list with expiry warnings
```

#### API Calls

| Endpoint | Method | Headers | Payload/Query | Response | Status | UI Impact |
|----------|--------|---------|---------------|----------|--------|-----------|
| `/evidence/upload/` | POST | Auth, org-id | `{assessment_id, question_id, file_url, expiry_date, ...}` | `{detail, id, created_at}` | ✅ Impl | Success toast |
| `/evidence/list/` | GET | Auth, org-id | `?assessment_id=10&page=1` | `{count, results}` | ✅ Impl | List render |

#### Validation Rules

**Frontend Validation:**
```javascript
✅ assessment_id: required, must be integer > 0
✅ question_id: required, must be integer > 0
✅ expiry_date: required, must be date, must be >= today
✅ file: required, accept: .pdf, .xlsx, .jpg, .png, .docx

❌ No frontend expiry_date POST validation
   (Will be checked by backend)
```

**Backend Validation (expected 400 errors):**
```json
{
  "error": "expiry_date and question_id required"
}

{
  "error": "expiry_date cannot be in the past"
}

{
  "error": "Invalid expiry_date format. Use YYYY-MM-DD"
}
```

#### Response Format Example

```javascript
POST /evidence/upload/

Request Body:
{
  "assessment_id": 10,
  "question_id": 42,
  "file_url": "https://minio.example.com/org_101/evidence.pdf",
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
  "file_url": "https://minio.example.com/org_101/evidence.pdf",
  "expiry_date": "2026-12-31",
  "created_at": "2026-02-18T11:45:30.123Z"
}


GET /evidence/list/?assessment_id=10

Response (200):
{
  "count": 45,
  "results": [
    {
      "id": 156,
      "assessment_id": 10,
      "question_id": 42,
      "file_url": "...",
      "expiry_date": "2026-12-31",
      "expires_in_days": 318,
      "file_type": "pdf",
      "uploaded_by": 5,
      "created_at": "2026-02-18T11:45:30Z"
    }
  ]
}
```

#### Code Example

```javascript
// EvidenceUploadPage.js
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validation
  if (selectedDate < today) {
    setError('Expiry date cannot be in the past');
    return;
  }
  
  const payload = {
    assessment_id: parseInt(assessmentId),
    question_id: parseInt(questionId),
    file_url: fileUrl,
    expiry_date: expiryDate,
    file_type: file?.name?.split('.')?.pop(),
    org_id: parseInt(orgId),
    uploaded_by: user?.id,
  };

  await evidenceService.uploadEvidence(payload);
  setSuccess('Evidence uploaded successfully!');
};

const fetchEvidenceList = async () => {
  const response = await evidenceService.getEvidenceByAssessment(assessmentId);
  setEvidenceList(response.data.results);
};
```

#### Expiry Day Calculation & Warning

**Backend provides:** `expires_in_days` field

**Frontend logic:**
```javascript
const warning = evidenceService.getExpiryWarning(expiresInDays);

// Returns: {level, message}
{level: 'expired', message: 'Expired'}        // if < 0
{level: 'critical', message: 'Expires in X days'} // if < 7
{level: 'warning', message: 'Expires in X days'}  // if < 30
{level: 'ok', message: 'Valid for X days'}    // if >= 30
```

**UI Colors:**
- `level: 'ok'`       → GREEN (✅ valid)
- `level: 'warning'`  → ORANGE (⚠️ expiring soon)
- `level: 'critical'` → RED (🔴 expiring very soon < 7 days)
- `level: 'expired'`  → GRAY (❌ expired)

---

## Shared Infrastructure

### API Client (`src/services/apiClient.js`)

**Axios Instance with Interceptors**

```javascript
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api'
});

// Request Interceptor
- Adds Authorization header (from localStorage)
- Adds org-id header (from localStorage)

// Response Interceptor
- On 401: Clear auth, redirect to /login
- On 4xx/5xx: Return error (caught by caller)
```

### Auth Context (`src/context/AuthContext.js`)

**State Management**
```javascript
{
  user: {id, email, first_name, last_name, org_id, is_staff},
  token: "eyJ0eXAi...",
  orgId: "101",
  loading: false,
  error: null,
  isAuthenticated: true
}

Methods:
- login(email, password) → stores token + org_id
- logout() → clears localStorage
- fetchCurrentUser() → GET /users/me/
```

### Service Functions (`src/services/index.js`)

**Three Service Objects:**

```javascript
authService
├── login(email, password)
├── getCurrentUser()
├── setAuthToken(token, orgId)
├── clearAuth()
├── getAuthToken()
└── isAuthenticated()

notificationsService
├── getNotifications(page, pageSize)
├── getUnreadCount()
├── markAsRead(notificationId)
└── markAllAsRead()

evidenceService
├── uploadEvidence(payload)
├── listEvidence(filters, page, pageSize)
├── getEvidenceByAssessment(assessmentId, page)
└── getExpiryWarning(expiresInDays)
```

---

## Error Handling Patterns

### All API Calls Use Try/Catch

```javascript
try {
  const response = await apiService.someMethod();
  // Success logic
} catch (error) {
  // Handle error
  const errorMsg = error.response?.data?.error ||
                   error.response?.data?.detail ||
                   error.message ||
                   'Request failed';
  setError(errorMsg);
}
```

### Global 401 Handling

**In apiClient.js:**
```javascript
if (error.response?.status === 401) {
  // Token expired
  localStorage.removeItem('authToken');
  localStorage.removeItem('orgId');
  window.location.href = '/login';
}
```

### Display Rules

```javascript
// Backend responds with
{error: "Human friendly message"}  OR  {detail: "..."}

// Frontend displays to user
error.error || error.detail || "Something went wrong"

// Never show stack traces or HTTP codes to user
```

---

## QA Testing Matrix

### Pre-Requisites

- [ ] Backend running on `http://localhost:8000`
- [ ] Frontend running on `http://localhost:3000`
- [ ] Backend DB seeded with 3 demo users
- [ ] CORS enabled on backend for `localhost:3000`

### Test Cases

#### Login

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| Valid credentials | Enter admin@vrm.com / password123 → Submit | Redirect to /dashboard, token in localStorage | ⏳ TBD |
| Invalid email | Enter wrong@test.com / password123 → Submit | Error message displayed | ⏳ TBD |
| Invalid password | Enter admin@vrm.com / wrong → Submit | Error message displayed | ⏳ TBD |
| Empty fields | Leave empty → Try submit | HTML5 required validation | ⏳ TBD |
| Token expired | Session > 1 hour → Next API call | Redirect to login | ⏳ TBD |

#### Notifications

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| Load list | Navigate to /notifications | GET /notifications/?page=1 → Display results | ⏳ TBD |
| Unread count | View unread badge | GET /notifications/unread-count/ → Badge updates | ⏳ TBD |
| Mark single | Click ✓ on unread item | PATCH /notifications/{id}/mark-read/ → Item → read | ⏳ TBD |
| Mark all | Click "Mark All" when unread > 0 | POST /notifications/read-all/ → All → read, badge = 0 | ⏳ TBD |
| Pagination | Click "Next" when page 2 available | GET /notifications/?page=2 → Show page 2 | ⏳ TBD |

#### Evidence Upload

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| Valid upload | Enter all fields + submit | POST /evidence/upload/ → 201 success, toast shown | ⏳ TBD |
| Past expiry | Enter past date → Submit | Error: "cannot be in past" | ⏳ TBD |
| Missing field | Leave Assessment ID empty → Submit | Error: "required" | ⏳ TBD |
| List evidence | Show list for assessment | GET /evidence/list/?assessment_id=10 → Display | ⏳ TBD |
| Expiry warning | View evidence with < 30 days | Color = ORANGE, message shows days left | ⏳ TBD |
| Critical expiry | View evidence with < 7 days | Color = RED, message shows urgent | ⏳ TBD |

---

## Pages List

### 4 Core Pages Implemented

| Page | Route | Auth Required | Purpose | Status |
|------|-------|---------------|---------|--------|
| Login | `/login` | No | Email/password authentication | ✅ Done |
| Dashboard | `/dashboard` | Yes | Main hub, user info, quick links | ✅ Done |
| Notifications | `/notifications` | Yes | List & mark notifications as read | ✅ Done |
| Evidence Upload | `/evidence` | Yes | Upload evidence files with metadata | ✅ Done |

### Proposed Future Pages (Not in Scope)

```
/assessments      - View assigned assessments
/assessments/:id  - Single assessment detail
/vendors          - List vendors
/vendors/:id      - Vendor detail + evidence
/admin/dashboard  - Admin-only settings
/profile          - User settings
```

---

## Integration Checklist

### For Backend Team (Renuka)

After this UI skeleton, backend must have:

- [x] `/auth/login/` endpoint (POST)
- [ ] `/users/me/` endpoint (GET) — **BLOCKING**
- [x] `/notifications/` endpoint (GET, paginated)
- [x] `/notifications/unread-count/` endpoint (GET)
- [x] `/notifications/{id}/mark-read/` endpoint (PATCH)
- [x] `/notifications/read-all/` endpoint (POST)
- [x] `/evidence/upload/` endpoint (POST)
- [ ] `/evidence/list/` endpoint (GET, filterable) — **BLOCKING**
- [ ] Database: `created_at` timestamp on evidence — **BLOCKING**

### For QA Team (Pranjali)

1. Review this document
2. Follow QA Testing Matrix above
3. Update tracker with Pass/Fail for each test case
4. Screenshot successful flows
5. Document any bugs found

### For UI Lead (Next Phase)

After approval:
1. `npm install` to load dependencies
2. `npm start` to launch dev server
3. Test against live backend
4. Iterate on styling/UX based on feedback
5. Add additional pages as needed
6. Deploy to staging/production

---

## Git Repository

**Frontend Repo:** `vrm-frontend/`  
**Current Commit:** `c85b877` - "Initial UI skeleton: Login, Notifications, Evidence pages with API integration"  
**Branch:** `master`

### Setup Instructions

```bash
# Clone
git clone <repo-url> vrm-frontend
cd vrm-frontend

# Install
npm install

# Configure
cp .env.example .env
# Edit .env: REACT_APP_API_URL=...

# Run
npm start
# Opens http://localhost:3000
```

---

## Approvers Sign-Off

| Person | Role | Approval | Date | Notes |
|--------|------|----------|------|-------|
| Renuka | Backend Lead | ⏳ Pending | - | Verify endpoints implemented |
| Pranjali | QA Lead | ⏳ Pending | - | Run test matrix |
| Anuja | Tracker | ⏳ Pending | - | Update tracker status |
| Ishan | PM | ⏳ Pending | - | Gate approval |

---

**Document Version:** 1.0  
**Last Updated:** Feb 18, 2026  
**Status:** ✅ Ready for QA (UI skeleton complete)  
**Maintained By:** Sneha (Sneha.Backend@vrm.com)
