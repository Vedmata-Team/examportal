# Workspace

## Overview

pnpm workspace monorepo (TypeScript frontend) + Django backend.

## Architecture

```
Next.js Frontend (port 5000)
    └── /api/* → proxies all API calls to Django (port 8000)

Django Backend (port 8000)
    ├── /admin/  → Django Admin panel (all admin operations)
    └── /api/*   → REST API consumed by Next.js
```

## Stack

### Frontend
- **Framework**: Next.js 16 (App Router) — `artifacts/exam-portal-next`
- **Package manager**: pnpm workspaces
- **Auth**: Cookie-based session (`exam_session`) — set by Django
- **API calls**: All proxied through `src/app/api/[...proxy]/route.ts` → Django

### Backend (Django)
- **Framework**: Django 5.2 + Django REST Framework — `artifacts/django-api`
- **Database**: PostgreSQL (same DB as Drizzle schema, tables `managed=False`)
- **Auth**: HMAC-signed session cookie (`exam_session`)
- **Admin**: Django Admin at `/admin/` (use Django superuser credentials)
- **Port**: 8000

## Django Admin

URL: `http://localhost:8000/admin/`
Default superuser: `admin` / `admin123`

All admin operations (managing users, quizzes, chapters, classes, states, districts, institutions, exam attempts) are done through Django Admin.

## Django Apps

- `apps.authentication` — Login, Register, Logout, Health check
- `apps.users` — User management API (`/api/me`, `/api/users`)
- `apps.geo` — States, Districts, Institutions
- `apps.academics` — Classes, Chapters, Content
- `apps.quizzes` — Quizzes, QuizSections, Questions
- `apps.exams` — Exam attempts, Submit, Results
- `apps.dashboard` — Admin & Student dashboard analytics

## Key Commands

### Django
```bash
cd artifacts/django-api
python3 manage.py migrate         # run migrations
python3 manage.py createsuperuser # create admin user
python3 manage.py runserver 0.0.0.0:8000
```

### Next.js
```bash
pnpm install
cd artifacts/exam-portal-next && pnpm dev --port 5000
```

## Database

Tables are managed by existing Drizzle migrations (in `lib/db`). Django models use `managed = False` so they read/write the existing tables without modifying schema. Django's own tables (auth, sessions, admin) are separate and created via Django migrations.

## Workflows
- `Django API` — Django dev server on port 8000
- `Start application` — Next.js frontend on port 5000
