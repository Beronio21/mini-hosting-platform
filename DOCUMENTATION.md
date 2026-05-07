# Mini Hosting Platform - Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Setup Instructions](#setup-instructions)
4. [Running the Platform](#running-the-platform)
5. [Two-Step Registration Flow](#two-step-registration-flow)
6. [API Endpoints](#api-endpoints)
7. [User Roles & Permissions](#user-roles--permissions)
8. [Environment Configuration](#environment-configuration)
9. [Database](#database)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Mini Hosting Platform** is a multi-tenant cloud hosting service that allows users to create, manage, and deploy containerized services (n8n, bots, APIs). The platform includes:

- **Backend**: Express.js + TypeScript (Node.js)
- **Frontend Dashboard**: Next.js 16 with React
- **Landing Page**: Next.js marketing site
- **Database**: SQLite (local), Supabase PostgreSQL (production-ready)
- **Container Management**: Docker Desktop integration with Caddy proxy
- **Authentication**: JWT-based login/registration

---

## Architecture

```
┌─────────────────────────────────────────────┐
│         Landing Page (localhost:3002)        │
│            (Marketing / Public)              │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────┴──────────────────────────┐
│    Dashboard (localhost:3000)                │
│   (User Management & Service Control)       │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────┴──────────────────────────┐
│    Backend API (localhost:4000)              │
│  (Authentication, Services, Admin)          │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
    ┌───▼────┐          ┌────▼────┐
    │ SQLite │          │  Docker  │
    │  (Dev) │          │ Desktop  │
    └────────┘          └──────────┘
```

---

## Setup Instructions

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- Docker Desktop (for service deployment)
- Git

### 1. Clone the Repository

```bash
cd d:\mini-hosting-platform
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Dashboard Dependencies

```bash
cd apps/dashboard/free-nextjs-admin-dashboard-main
npm install
```

### 4. Install Landing Page Dependencies

```bash
cd apps/landing/pixel-io-nextjs/nextjs
npm install
```

### 5. Create Environment Files

**Backend** - `backend/.env`:

```env
PORT=4000
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=development
```

**Dashboard** - `apps/dashboard/free-nextjs-admin-dashboard-main/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## Running the Platform

### Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on: **http://localhost:4000**

### Start Dashboard Dev Server

```bash
cd apps/dashboard/free-nextjs-admin-dashboard-main
npm run dev
```

Dashboard will run on: **http://localhost:3000**

### Start Landing Page

```bash
cd apps/landing/pixel-io-nextjs/nextjs
npm run dev
```

Landing page will run on: **http://localhost:3002**

### Keep Docker Desktop Running

- Docker Desktop must be running on the same machine
- Used for container deployment and service management

---

## Two-Step Registration Flow

### Overview

Users must complete a **two-step registration process** to create an account with proper profile information.

### Step 1: Email & Password (http://localhost:3000/signup)

**What User Sees:**

- Heading: "Create Account - Step 1 of 2"
- Fields: Email, Password
- Button: "Next"
- Checkbox: Terms and Conditions

**What Happens:**

1. User enters email (e.g., `julian@gmail.com`) and password
2. Clicks "Next" button
3. Frontend validates:
   - Email is valid format
   - Password is at least 6 characters
   - Terms checkbox is checked
4. Frontend stores credentials in `sessionStorage`:
   - `tempEmail`: user's email
   - `tempPassword`: user's password
5. Frontend redirects to Step 2

**No API Call Made** ✅ (purely client-side validation)

### Step 2: Profile Information (http://localhost:3000/full-width-pages/auth/complete-profile)

**What User Sees:**

- Heading: "Complete Your Profile - Step 2 of 2"
- Fields:
  - First Name (required)
  - Last Name (required)
  - Phone (required)
  - Bio (optional)
  - Address (required)
  - Country (required)
  - City/State (required)
  - Postal Code (required)
  - TAX ID (required)
- Button: "Complete Registration"

**What Happens:**

1. Frontend loads stored credentials from `sessionStorage`
2. User fills in all profile fields
3. Clicks "Complete Registration"
4. Frontend calls `/api/auth/register` with complete data:
   ```json
   {
     "email": "julian@gmail.com",
     "password": "password123",
     "firstName": "Julian",
     "lastName": "Smith",
     "phone": "+1 (555) 123-4567",
     "bio": "Optional bio text",
     "address": "123 Main St",
     "country": "United States",
     "cityState": "New York, NY",
     "postalCode": "10001",
     "taxId": "12-3456789"
   }
   ```
5. Backend validates all fields are present (required check)
6. Backend creates account in database with role: `user`
7. Backend returns JWT token
8. Frontend stores token in `localStorage`
9. Frontend redirects to `/dashboard/services`

**Account Successfully Created** ✅

---

## API Endpoints

### Authentication APIs

#### Register User

**Endpoint:** `POST /api/auth/register`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1 (555) 123-4567",
  "bio": "Optional bio",
  "address": "123 Main St",
  "country": "United States",
  "cityState": "New York, NY",
  "postalCode": "10001",
  "taxId": "12-3456789"
}
```

**Response (201 Created):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "role": "user"
}
```

**Validation:**

- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters
- `firstName`: Required, minimum 1 character
- `lastName`: Required, minimum 1 character
- `phone`: Required, minimum 1 character
- `bio`: Optional
- `address`: Required, minimum 1 character
- `country`: Required, minimum 1 character
- `cityState`: Required, minimum 1 character
- `postalCode`: Required, minimum 1 character
- `taxId`: Required, minimum 1 character

---

#### Login User

**Endpoint:** `POST /api/auth/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "role": "user"
}
```

---

#### Get User Profile

**Endpoint:** `GET /api/auth/profile`

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**

```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1 (555) 123-4567",
  "bio": "User bio",
  "address": "123 Main St",
  "country": "United States",
  "cityState": "New York, NY",
  "postalCode": "10001",
  "taxId": "12-3456789",
  "role": "user"
}
```

---

### Service APIs

#### List User's Services

**Endpoint:** `GET /api/services`

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "name": "My n8n Workflow",
    "type": "n8n",
    "status": "running",
    "port": 8001,
    "subdomain": "my-service",
    "containerID": "abc123def456",
    "createdAt": "2026-05-07T10:30:00Z"
  }
]
```

---

#### Create New Service

**Endpoint:** `POST /api/services`

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**

```json
{
  "name": "My n8n Workflow",
  "type": "n8n"
}
```

**Response (201 Created):**

```json
{
  "id": 1,
  "name": "My n8n Workflow",
  "type": "n8n",
  "status": "stopped",
  "port": 8001,
  "subdomain": "my-service-xyz",
  "containerID": "abc123def456"
}
```

---

#### Start Service

**Endpoint:** `POST /api/services/:id/start`

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**

```json
{
  "message": "Service started",
  "status": "running",
  "url": "http://my-service-xyz.localhost:8001"
}
```

---

#### Stop Service

**Endpoint:** `POST /api/services/:id/stop`

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**

```json
{
  "message": "Service stopped",
  "status": "stopped"
}
```

---

#### Delete Service

**Endpoint:** `DELETE /api/services/:id`

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**

```json
{
  "message": "Service deleted"
}
```

---

### Admin APIs

#### List All Users (Admin Only)

**Endpoint:** `GET /api/admin/users`

**Headers:**

```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "createdAt": "2026-05-07T10:30:00Z"
  }
]
```

---

#### Get Admin Earnings

**Endpoint:** `GET /api/admin/earnings`

**Headers:**

```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Response (200 OK):**

```json
{
  "totalEarnings": 5000.0,
  "monthlyEarnings": 500.0,
  "activeSubscriptions": 25,
  "currency": "USD"
}
```

---

#### Get System Metrics

**Endpoint:** `GET /api/admin/metrics`

**Headers:**

```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Response (200 OK):**

```json
{
  "totalUsers": 50,
  "activeServices": 75,
  "totalContainers": 75,
  "systemUptime": "45 days",
  "averageServiceRuntime": "12 hours"
}
```

---

## User Roles & Permissions

### Admin User

**Default Admin:**

- Email: `admin@example.com`
- Password: `admin123`

**Permissions:**

- View all users
- View all services across platform
- View earnings and metrics
- Suspend/manage user accounts
- Access: `/admin/*` pages

**API Access:**

- `GET /api/admin/users`
- `GET /api/admin/users/:id`
- `POST /api/admin/users/:id/suspend`
- `GET /api/admin/earnings`
- `GET /api/admin/metrics`
- `GET /api/admin/services`

---

### Regular User

**Created via Registration**

**Permissions:**

- Create their own services
- Manage only their services (start/stop/delete)
- View their own profile
- Access: `/dashboard/*` pages

**API Access:**

- `GET /api/services` (own services only)
- `POST /api/services` (create own)
- `POST /api/services/:id/start` (own only)
- `POST /api/services/:id/stop` (own only)
- `DELETE /api/services/:id` (own only)
- `GET /api/auth/profile` (own only)

---

## Environment Configuration

### Backend (.env)

```env
# Server
PORT=4000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key-here-change-in-production

# Database (SQLite)
DB_PATH=./mini-hosting.db
```

### Frontend (.env.local)

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000

# Feature Flags
NEXT_PUBLIC_ENABLE_ADMIN=true
```

### Supabase Configuration (Optional - for production)

```bash
# Start Supabase locally
cd supabase
supabase start

# Connection string
postgresql://postgres:postgres@localhost:54322/postgres
```

---

## Database

### Schema Overview

**Users Table:**

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  bio TEXT,
  address TEXT,
  country TEXT,
  city_state TEXT,
  postal_code TEXT,
  tax_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Services Table:**

```sql
CREATE TABLE services (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  container_id TEXT,
  port INTEGER UNIQUE,
  subdomain TEXT UNIQUE,
  status TEXT DEFAULT 'stopped',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Payments Table:**

```sql
CREATE TABLE payments (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Service Usage Table:**

```sql
CREATE TABLE service_usage (
  id INTEGER PRIMARY KEY,
  service_id INTEGER NOT NULL,
  cpu_hours DECIMAL(10,4) DEFAULT 0,
  memory_gb_hours DECIMAL(10,4) DEFAULT 0,
  cost DECIMAL(10,4) DEFAULT 0,
  FOREIGN KEY (service_id) REFERENCES services(id)
);
```

---

## Troubleshooting

### Issue: "Profile fields validation error on Step 1"

**Cause:** Browser cache is loading old form code

**Solution:**

1. Hard refresh browser: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Clear browser cache and cookies
3. Restart dev servers:

   ```bash
   # Backend
   Ctrl+C
   npm run dev

   # Dashboard
   Ctrl+C
   npm run dev
   ```

---

### Issue: "Backend connection refused"

**Cause:** Backend server not running

**Solution:**

```bash
cd backend
npm run dev
```

Verify output shows: `Server running on http://localhost:4000`

---

### Issue: "JWT token invalid or expired"

**Cause:** Token stored in localStorage is corrupted or expired

**Solution:**

1. Clear browser localStorage: Open DevTools (F12) → Application → Storage → Clear All
2. Log out and log back in
3. New token will be issued

---

### Issue: "Docker containers not starting"

**Cause:** Docker Desktop not running

**Solution:**

1. Open Docker Desktop application
2. Wait for it to fully initialize (check system tray)
3. Retry service creation from dashboard

---

### Issue: "CORS errors when calling API"

**Cause:** Frontend and backend URLs don't match, or backend not accepting requests

**Solution:**

1. Verify `NEXT_PUBLIC_API_URL` in dashboard `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```
2. Check backend is running on port 4000
3. Restart both servers

---

### Issue: "Database locked or corrupted"

**Cause:** SQLite database file is locked or corrupted

**Solution:**

```bash
# Delete and recreate database
rm backend/mini-hosting.db

# Restart backend (will recreate schema)
cd backend
npm run dev
```

---

## Common Tasks

### Create a Test User

1. Go to: http://localhost:3000/signup
2. Step 1: Enter email and password, click "Next"
3. Step 2: Fill in profile fields, click "Complete Registration"
4. Redirected to dashboard automatically

---

### Login as Admin

1. Go to: http://localhost:3000/login
2. Email: `admin@example.com`
3. Password: `admin123`
4. Access admin dashboard at: http://localhost:3000/admin

---

### Create a Service

1. Login to dashboard (http://localhost:3000)
2. Go to: `/dashboard/services`
3. Click "Create New Service"
4. Enter service name and type (n8n, bot, or API)
5. Click "Create"
6. Service will be deployed in Docker container

---

### View User Profile

1. Login to dashboard
2. Go to: `/dashboard/profile` or click profile icon
3. Shows all profile information
4. Can edit profile if needed

---

## Production Deployment

### Before Going Live

1. ✅ Change JWT_SECRET to a strong random value
2. ✅ Set NODE_ENV=production
3. ✅ Configure database to PostgreSQL (Supabase or self-hosted)
4. ✅ Set up SSL certificates for HTTPS
5. ✅ Configure DNS records for subdomain wildcard
6. ✅ Set up Stripe integration for payments
7. ✅ Test full registration flow end-to-end
8. ✅ Set up monitoring and error logging

---

## Support & Contact

For issues or questions, please check:

1. MINI_HOSTING_STATUS.txt - Current project status
2. README.md files in each folder
3. Error logs in console output

---

**Last Updated:** 2026-05-07
**Version:** 1.0
