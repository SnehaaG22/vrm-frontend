# VRM Frontend (Vendor Risk Management UI)

React-based frontend for the Vendor Risk Management (VRM) system.
This application connects with Django backend APIs to provide authentication, dashboard, notifications, and evidence management features.

---

## Features

* User Authentication (Login)
* Dashboard view
* Notifications list and mark as read
* Evidence upload and evidence list
* Secure API integration using JWT token
* Role-based system support (Admin, Vendor, Reviewer)

---

## Tech Stack

* React.js
* Axios (API integration)
* React Router
* Context API (Authentication state)
* Django REST Framework (Backend)

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

## Backend Requirement

Make sure Django backend is running:

```
http://localhost:8000
```

Run backend:

```
python manage.py runserver
```

---

## Frontend Setup Instructions

### 1. Install dependencies

```
npm install
```

### 2. Create .env file in project root

```
REACT_APP_API_URL=http://localhost:8000/api
```

### 3. Run frontend

```
npm start
```

Frontend will run on:

```
http://localhost:3000
```

---

## Authentication Flow

Login API:

```
POST /api/auth/login/
```

Example request:

```
{
  "email": "admin@vrm.com",
  "password": "password123"
}
```

After login:

* JWT token stored in localStorage
* orgId stored in localStorage
* Used for all authenticated API calls

Headers used:

```
Authorization: Bearer <token>
org-id: <orgId>
```

---

## Main API Integrations

### Login

```
POST /api/auth/login/
```

### Get Notifications

```
GET /api/notifications/
```

### Mark notification as read

```
PATCH /api/notifications/{id}/mark-read/
```

### Upload Evidence

```
POST /api/evidence/upload/
```

### Get Evidence List

```
GET /api/evidence/list/?assessment_id=<id>
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

## Troubleshooting

### Backend not running

Start backend:

```
python manage.py runserver
```

### API connection error

Check:

```
.env file
REACT_APP_API_URL=http://localhost:8000/api
```

### Port already in use

Run on different port:

```
npm start -- --port 3001
```

---

## Status

Frontend is fully integrated with backend APIs.
Ready for QA testing and production deployment.

---

## Maintained By

Sneha
VRM Backend & Frontend Team
