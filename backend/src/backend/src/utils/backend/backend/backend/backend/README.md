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

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Docker & Docker Compose (optional)

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
npm install
npm run dev
```

**3. Seed demo data (optional)**
```bash
npm run seed
```

**4. Set up the frontend**
```bash
cd ../frontend
npm install
npm run dev
```

### Option B — Docker Compose
```bash
cp .env.example .env
docker-compose up --build
```

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | password123 |
| Sales | sales@demo.com | password123 |
