# VRM Frontend – React Application

## Overview

This is the frontend UI for the Vendor Risk Management (VRM) platform built using React.
It supports:

* User Login (Authentication)
* View Notifications
* Upload Evidence Files
* Dashboard Access

Frontend connects to backend APIs running on Django.

---

## Prerequisites

Make sure the following are installed:

* Node.js (v16 or above)
* npm (comes with Node.js)
* Backend server running on http://localhost:8000

---

## Project Setup Steps

### Step 1: Open project folder

```bash
cd vrm-frontend
```

---

### Step 2: Install dependencies

```bash
npm install
```

---

### Step 3: Create .env file

Create a file named `.env` in the root folder and add:

```
REACT_APP_API_URL=http://localhost:8000/api
```

---

### Step 4: Start the frontend server

```bash
npm start
```

Frontend will run at:

```
http://localhost:3000/login
```

---

## Backend Requirement

Make sure backend is running using:

```bash
python manage.py runserver
```

Backend URL:

```
http://localhost:8000
```

---

## Login Credentials

Use any of the following demo accounts:

Admin:

```
Email: admin@vrm.com
Password: password123
```

Vendor:

```
Email: vendor@vrm.com
Password: password123
```

Reviewer:

```
Email: reviewer@vrm.com
Password: password123
```

---

## Features Available

* Login and authentication
* Dashboard view
* Notifications list
* Mark notifications as read
* Upload evidence files
* View uploaded evidence list

---

## Important Notes

* Backend must be running before starting frontend
* API base URL must be correctly set in `.env`
* If login fails, clear browser localStorage and try again

---

## Run Summary (Quick Start)

Run backend:

```bash
python manage.py runserver
```

Run frontend:

```bash
npm install
npm start
```

Open in browser:

```
http://localhost:3000/login
```

---

## Status

Frontend is ready and connected with backend APIs.
