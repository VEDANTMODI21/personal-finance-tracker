# Personal Finance & Budget Tracker

A full-stack personal finance management application: expenses, income, friend-loans with repayment tracking, a monthly analytics dashboard, and PDF/Excel/CSV report exports — built with React, Node.js/Express, PostgreSQL and Prisma.

Link to try the real website: https://personal-finance-tracker-umber-beta.vercel.app/

> Every user only ever sees their own data. Authorization is enforced entirely server-side from the JWT — the frontend never sends a trusted `userId`.

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Local Setup](#local-setup)
5. [Environment Variables](#environment-variables)
6. [Database & Prisma](#database--prisma)
7. [Running Tests](#running-tests)
8. [Docker](#docker)
9. [Deployment](#deployment)
10. [API Reference](#api-reference)
11. [Advanced Features Beyond the MVP](#advanced-features-beyond-the-mvp)
12. [Definition of Done](#definition-of-done)

---

## Feature Overview

**Authentication** — register, login, logout, get current user, change password, forgot/reset password, JWT access + refresh tokens (refresh token stored in an httpOnly cookie), protected routes.

**Expenses** — full CRUD, search by description, filter by category/payment method/date range/min-max amount, sorting, pagination.

**Income** — full CRUD by source (salary, freelance, bonus, etc).

**Loans** — track money lent to friends, multiple repayments per loan, automatically computed outstanding balance and status (`Outstanding`, `Partially Paid`, `Paid`, `Overdue`), repayments are rejected if they would exceed the outstanding balance.

**Dashboard** — monthly income/expenses/balance/loan cards, category donut chart, daily spending line chart, income-vs-expense bar chart, loan status chart, recent transactions, month/date-range filters.

**Reports** — a full monthly report (summary, category breakdown, payment method breakdown, daily spending, largest expenses, loan summary, transaction ledger), downloadable as a formatted **PDF** (PDFKit), a 6-sheet **Excel** workbook (ExcelJS), or a **CSV** transaction export.

**Categories** — 11 seeded defaults per user plus custom categories.

---

## Advanced Features Beyond the MVP

The project brief listed these as *optional future features*; they've been built into this version to make the app feel like a complete product rather than a bare CRUD demo:

- **Monthly budgets & alerts** — set an overall monthly spending limit (and per-category limits); the dashboard surfaces a warning banner once you cross your alert threshold.
- **Recurring expenses** — define a template (rent, subscriptions, etc.) with a frequency, and generate the due expenses for the period with one click.
- **CSV export** of the transaction ledger, alongside PDF/Excel.
- **Dark mode**, persisted per-user and toggleable from the navbar or Settings.
- **Refresh-token rotation** — short-lived access tokens with a long-lived httpOnly refresh cookie, so a page reload doesn't log you out, and changing your password revokes every other session.
- **Rate limiting** on authentication endpoints, Helmet security headers, gzip compression.
- Toast notifications, empty/loading states, responsive tables, and a collapsible mobile sidebar throughout the UI.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18, Vite, React Router, Tailwind CSS, Axios, Recharts, Lucide icons |
| Backend | Node.js, Express, JWT auth, bcrypt, Zod validation |
| Database | PostgreSQL via Prisma ORM |
| Reports | PDFKit (PDF), ExcelJS (Excel) |
| Testing | Jest + Supertest |
| Deployment | Vercel (frontend), Render (backend + managed PostgreSQL), Docker |

---

## Project Structure

```text
personal-finance-tracker/
├── frontend/            React + Vite app
│   └── src/
│       ├── components/  Layout, forms, charts, shared UI
│       ├── pages/       Login, Dashboard, Expenses, Income, Loans, Reports, Categories, Settings
│       ├── services/    Axios API clients
│       ├── context/     Auth + Toast providers
│       └── hooks/ utils/
├── backend/             Node/Express API
│   ├── src/
│   │   ├── controllers/ routes/ services/ validators/ middleware/ utils/
│   │   └── app.js server.js
│   ├── prisma/          schema.prisma + seed.js
│   ├── tests/           unit/ (pure logic) + integration/ (supertest + DB)
│   └── Dockerfile
├── docker-compose.yml    Postgres + backend for local dev
└── README.md
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- A PostgreSQL 14+ database (local install, Docker, or a managed provider)

### 1. Clone & install

```bash
git clone <your-repo-url> personal-finance-tracker
cd personal-finance-tracker

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

Copy the examples and fill in real values (see [Environment Variables](#environment-variables)):

```bash
cd backend && cp .env.example .env
cd ../frontend && cp .env.example .env
```

### 3. Set up the database

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed   # optional: creates demo@financetracker.app / Demo@1234
```

### 4. Run both apps

```bash
# terminal 1
cd backend && npm run dev      # http://localhost:5000

# terminal 2
cd frontend && npm run dev     # http://localhost:5173
```

---

## Environment Variables

**backend/.env**

```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/finance_tracker
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=replace_with_a_different_long_random_secret
JWT_REFRESH_EXPIRES_IN=30d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
BCRYPT_SALT_ROUNDS=10
```

**frontend/.env**

```env
VITE_API_URL=http://localhost:5000/api
```

> There's no transactional email provider wired up. `forgot-password` in non-production mode returns the reset token directly in the API response (and the frontend surfaces it) so the flow is fully testable end-to-end without SMTP. Wire in a provider (Postmark, SES, Resend, …) before shipping this to real users.

---

## Database & Prisma

The schema lives in `backend/prisma/schema.prisma`: `User`, `Category`, `Expense`, `Income`, `Loan`, `LoanPayment`, plus `RefreshToken`, `PasswordResetToken`, `Budget` and `RecurringExpense` for the advanced features.

```bash
npx prisma migrate dev       # create/apply a migration in development
npx prisma migrate deploy    # apply migrations in production (CI/CD)
npx prisma studio            # browse data in a GUI
```

---

## Running Tests

```bash
cd backend
npm run test:unit          # pure business-logic tests — no database needed
npm run test:integration   # full API tests against a real Postgres test database
npm test                   # both
```

`test:integration` needs `DATABASE_URL` in `.env.test` pointing at a real (throwaway) database, and `npx prisma generate` to have been run at least once. It covers: registration/login/invalid login, protected routes, expense CRUD, loan creation + repayment rules (including rejecting a repayment above the outstanding balance), monthly balance calculations, and cross-user data isolation.

---

## Docker

```bash
docker compose up --build
```

This starts Postgres and the backend API (see `docker-compose.yml`). Run the frontend separately with `npm run dev` in `frontend/`, or build it and serve the static output from any static host.

The backend also ships its own multi-stage `Dockerfile` for standalone deployment (used by Render).

---

## Deployment

**Frontend → Vercel**: import the repo, set the project root to `frontend/`, set `VITE_API_URL` to your deployed backend's `/api` URL.

**Backend → Render**: create a Web Service from `backend/` (Render will build the Dockerfile), and set `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL` in the dashboard. Point `DATABASE_URL` at a managed Postgres instance (Render Postgres or another provider) — don't run the production database inside the backend's own container.

**CORS**: `CLIENT_URL` must exactly match your deployed frontend origin (comma-separate multiple origins if needed) — the backend does not allow unrestricted CORS in production.

---

## API Reference

All endpoints are prefixed with `/api` and (except `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password`) require `Authorization: Bearer <accessToken>`.

```
POST   /auth/register              POST /auth/login             POST /auth/logout
POST   /auth/refresh                GET /auth/me                POST /auth/change-password
POST   /auth/forgot-password        POST /auth/reset-password

GET/POST   /expenses          GET/PUT/DELETE /expenses/:id
GET/POST   /income            GET/PUT/DELETE /income/:id
GET/POST   /categories        PUT/DELETE     /categories/:id
GET/POST   /loans             GET/PUT/DELETE /loans/:id
GET/POST   /loans/:id/payments               DELETE /loans/:id/payments/:paymentId
GET        /loans/dashboard

GET  /dashboard
GET  /transactions

GET  /reports/monthly
GET  /reports/monthly/pdf
GET  /reports/monthly/excel
GET  /reports/monthly/csv

GET/POST   /budgets           DELETE /budgets/:id
GET/POST   /recurring-expenses   PUT/DELETE /recurring-expenses/:id   POST /recurring-expenses/generate-due
PUT        /users/settings
```

Every response is shaped consistently:

```json
{ "success": true, "data": { } }
{ "success": false, "message": "Expense not found" }
```

---

## Definition of Done

- [x] Register / login / logout, JWT protected routes
- [x] Passwords hashed with bcrypt, never logged or returned
- [x] Per-user data isolation enforced server-side (never trusts a client-sent `userId`)
- [x] Expense/Income CRUD with search, filter, sort, pagination
- [x] Loans, repayments, automatic outstanding balance + status calculation
- [x] Dashboard with correct monthly aggregation and charts
- [x] Monthly PDF and Excel export (plus CSV)
- [x] Responsive UI (mobile sidebar, responsive tables/charts), dark mode
- [x] Centralized backend validation (Zod) and error handling
- [x] Dockerized backend, docker-compose for local dev
- [x] Unit tests for all loan/status/balance logic; integration test suite for auth, expenses, loans, dashboard, cross-user authorization
- [x] This README with setup and deployment instructions

Do not claim features in a resume/portfolio write-up that aren't actually wired up end-to-end (e.g. this app doesn't send real emails — see the note under Environment Variables).
