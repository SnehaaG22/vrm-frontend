# UI → Backend API Call Sequence Map

**Prepared by:** Sneha
**Date:** Feb 19, 2026
**Status:** UI Ready for QA

---

## Overview

This document explains how the React frontend connects with Django backend APIs.

Frontend provides following features:

* User Login
* Dashboard
* Notifications list and mark as read
* Evidence upload and evidence list

Backend base URL:

```
http://localhost:8000/api
```

Frontend URL:

```
http://localhost:3000
```

---

## Project Structure

```
vrm-frontend/
├── src/
│   ├── context/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── LoginPage.js
│   │   ├── DashboardPage.js
│   │   ├── NotificationsPage.js
│   │   └── EvidenceUploadPage.js
│   ├── services/
│   │   ├── apiClient.js
│   │   └── index.js
│   └── App.js
```

---

## Screen 1: Login Page

**Route:** `/login`
**File:** `LoginPage.js`
**Access:** Public

### API Call

```
POST /auth/login/
```

### Request

```
{
  "email": "admin@vrm.com",
  "password": "password123"
}
```

### Response

```
{
  "token": "...",
  "user": {
    "id": 1,
    "email": "admin@vrm.com",
    "org_id": 101
  }
}
```

### Frontend Action

* Store token in localStorage
* Store org_id
* Redirect to `/dashboard`

---

## Screen 2: Dashboard Page

**Route:** `/dashboard`
**File:** `DashboardPage.js`
**Access:** Protected

### Purpose

* Show logged-in user info
* Provide links to Notifications and Evidence pages

No API call required.

---

## Screen 3: Notifications Page

**Route:** `/notifications`
**File:** `NotificationsPage.js`
**Access:** Protected

### Get Notifications

```
GET /notifications/
```

### Response

```
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "message": "New evidence uploaded",
      "status": "unread",
      "created_at": "2026-02-18T10:30:45Z"
    }
  ]
}
```

### Get Unread Count

```
GET /notifications/unread-count/
```

### Mark Notification as Read

```
PATCH /notifications/{id}/mark-read/
```

### Mark All Notifications as Read

```
POST /notifications/read-all/
```

---

## Screen 4: Evidence Upload Page

**Route:** `/evidence`
**File:** `EvidenceUploadPage.js`
**Access:** Protected

### Upload Evidence

```
POST /evidence/upload/
```

### Request

```
{
  "assessment_id": 10,
  "question_id": 42,
  "file_url": "https://example.com/file.pdf",
  "expiry_date": "2026-12-31"
}
```

### Response

```
{
  "detail": "Evidence uploaded",
  "id": 156
}
```

---

### Get Evidence List

```
GET /evidence/list/?assessment_id=10
```

### Response

```
{
  "count": 5,
  "results": [
    {
      "id": 156,
      "assessment_id": 10,
      "question_id": 42,
      "expiry_date": "2026-12-31"
    }
  ]
}
```

---

## Authentication

After login, frontend stores:

```
authToken → JWT token
orgId → Organization ID
```

All API calls include headers:

```
Authorization: Bearer <token>
org-id: <orgId>
```

---

## Setup Instructions

### Step 1: Install dependencies

```
npm install
```

### Step 2: Create .env file

```
REACT_APP_API_URL=http://localhost:8000/api
```

### Step 3: Start frontend

```
npm start
```

Frontend runs on:

```
http://localhost:3000
```

---

## Backend Requirement

Start Django backend:

```
python manage.py runserver
```

Backend runs on:

```
http://localhost:8000
```

---

## Test Credentials

Admin
Email: [admin@vrm.com](mailto:admin@vrm.com)
Password: password123

Vendor
Email: [vendor@vrm.com](mailto:vendor@vrm.com)
Password: password123

Reviewer
Email: [reviewer@vrm.com](mailto:reviewer@vrm.com)
Password: password123

---

## Pages Implemented

| Page            | Route          | Status |
| --------------- | -------------- | ------ |
| Login           | /login         |   Done |
| Dashboard       | /dashboard     |   Done |
| Notifications   | /notifications |   Done |
| Evidence Upload | /evidence      |   Done |

---

## Status

Frontend successfully integrated with backend APIs.
Ready for QA testing.

---

**Maintained By:** Sneha
**Team:** Backend Team
