# SmartLeads Dashboard

A full-stack Lead Management Dashboard built with the MERN stack + TypeScript. Features JWT authentication, role-based access control, advanced filtering, debounced search, pagination, CSV export, and dark mode.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, TailwindCSS, Vite |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| DevOps | Docker + Docker Compose |

---

## Features

### Authentication
- User registration & login with JWT
- Password hashing with bcrypt (12 salt rounds)
- Protected routes via auth middleware
- Role-based access control: **Admin** and **Sales** roles

### Lead Management (CRUD)
- Create, read, update, delete leads
- Lead fields: Name, Email, Status, Source, Notes, Created At
- Statuses: `New` · `Contacted` · `Qualified` · `Lost`
- Sources: `Website` · `Instagram` · `Referral`

### Advanced Filtering & Search
- Filter by Status and/or Source
- Search by Name or Email (debounced, 400ms)
- Sort by Latest or Oldest
- All filters combinable and shown as removable pills

### Pagination
- Backend pagination (10 records/page)
- Pagination metadata in every response
- Proper `skip` + `limit` implementation

### Additional Features
- **Debounced Search** — avoids excessive API calls
- **CSV Export** — exports current filtered result set
- **Role-Based Access Control** — admins manage all leads; sales users manage their own
- **Docker Setup** — single `docker-compose up` spins everything up
- **Dark Mode** — persisted to localStorage, respects system preference

---

## Project Structure

```
smart-leads-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/         # Database connection
│   │   ├── controllers/    # authController, leadsController
│   │   ├── middleware/     # auth, errorHandler, validation
│   │   ├── models/         # User, Lead (Mongoose schemas)
│   │   ├── routes/         # auth, leads
│   │   ├── types/          # Shared TypeScript interfaces
│   │   └── utils/          # seed script
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/            # axios instance, auth & leads API calls
│   │   ├── components/
│   │   │   ├── auth/       # ProtectedRoute
│   │   │   ├── layout/     # DashboardLayout, Navbar
│   │   │   ├── leads/      # LeadCard, LeadForm, LeadFilters, Pagination
│   │   │   └── ui/         # Button, Input, Select, Badge, Modal, EmptyState
│   │   ├── contexts/       # AuthContext, ThemeContext
│   │   ├── hooks/          # useDebounce, useLeads
│   │   ├── pages/          # LoginPage, RegisterPage, DashboardPage, LeadsPage
│   │   ├── types/          # Shared TypeScript interfaces
│   │   └── utils/          # helpers (badge variants, date formatting)
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Docker & Docker Compose (optional)

---

### Option A — Local Development

**1. Clone the repo**
```bash
git clone <your-repo-url>
cd smart-leads-dashboard
```

**2. Set up the backend**
```bash
cd backend
cp .env.example .env
# Edit .env — set MONGODB_URI and JWT_SECRET
npm install
npm run dev        # Starts on http://localhost:5000
```

**3. Seed demo data (optional)**
```bash
# In the backend directory with .env set:
npm run seed
```

**4. Set up the frontend**
```bash
cd ../frontend
cp .env.example .env   # VITE_API_URL can stay blank for local dev
npm install
npm run dev            # Starts on http://localhost:5173
```

---

### Option B — Docker Compose

```bash
# From the repo root:
cp .env.example .env
# Edit .env if desired, then:
docker-compose up --build
```

Services started:
| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| MongoDB | mongodb://localhost:27017 |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: `5000`) |
| `MONGODB_URI` | **Yes** | MongoDB connection string |
| `JWT_SECRET` | **Yes** | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | No | Token expiry (default: `7d`) |
| `CLIENT_URL` | No | Frontend origin for CORS (default: `http://localhost:5173`) |
| `NODE_ENV` | No | `development` or `production` |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | API base URL. Leave blank in dev (Vite proxy handles it). Set for production builds. |

---

## API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require the header:
```
Authorization: Bearer <token>
```

---

### Auth

#### `POST /auth/register`
Register a new user.

**Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "role": "sales"          // "admin" | "sales" (default: "sales")
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "<jwt>",
    "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com", "role": "sales" }
  }
}
```

---

#### `POST /auth/login`
Authenticate and receive a token.

**Body:**
```json
{ "email": "jane@example.com", "password": "secret123" }
```

**Response `200`:**
```json
{
  "success": true,
  "data": { "token": "<jwt>", "user": { ... } }
}
```

---

#### `GET /auth/me` 🔒
Get current user profile.

**Response `200`:**
```json
{ "success": true, "data": { "user": { "id": "...", "name": "...", "email": "...", "role": "..." } } }
```

---

### Leads

#### `GET /leads` 🔒
List leads with filtering, search, sorting, and pagination.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | `New` \| `Contacted` \| `Qualified` \| `Lost` |
| `source` | string | `Website` \| `Instagram` \| `Referral` |
| `search` | string | Search by name or email (regex, case-insensitive) |
| `sort` | string | `latest` (default) \| `oldest` |
| `page` | number | Page number (default: `1`) |
| `limit` | number | Records per page (default: `10`, max: `50`) |

**Response `200`:**
```json
{
  "success": true,
  "data": [ { "_id": "...", "name": "...", "email": "...", "status": "New", "source": "Website", "createdBy": { ... }, "createdAt": "..." } ],
  "meta": {
    "currentPage": 1,
    "totalPages": 3,
    "totalRecords": 25,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

#### `GET /leads/:id` 🔒
Get a single lead by ID.

**Response `200`:**
```json
{ "success": true, "data": { ... } }
```

---

#### `POST /leads` 🔒
Create a new lead.

**Body:**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "status": "New",
  "source": "Instagram",
  "notes": "Interested in enterprise plan"
}
```

**Response `201`:**
```json
{ "success": true, "message": "Lead created successfully", "data": { ... } }
```

---

#### `PUT /leads/:id` 🔒
Update a lead. Sales users can only update their own leads.

**Body:** Any subset of lead fields.

**Response `200`:**
```json
{ "success": true, "message": "Lead updated successfully", "data": { ... } }
```

---

#### `DELETE /leads/:id` 🔒
Delete a lead. Sales users can only delete their own leads.

**Response `200`:**
```json
{ "success": true, "message": "Lead deleted successfully" }
```

---

#### `GET /leads/export/csv` 🔒
Export leads as a CSV file. Accepts the same filter query params as `GET /leads` (except `page`, `limit`, `sort`).

**Response:** `text/csv` file download.

---

### Error Responses

All errors follow this shape:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": ["Validation error detail 1", "..."]   // only on 400
}
```

| Status | Meaning |
|--------|---------|
| `400` | Validation error |
| `401` | Missing or invalid token |
| `403` | Insufficient permissions |
| `404` | Resource not found |
| `409` | Duplicate entry |
| `500` | Internal server error |

---

## Demo Credentials

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | password123 |
| Sales | sales@demo.com | password123 |

---

## Git Commit Style

This project follows conventional commits:

```
feat: add CSV export endpoint
fix: handle empty search query gracefully
chore: add Docker setup
refactor: extract pagination logic to helper
```
