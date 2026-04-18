# Running the Project

This guide explains how to run both the backend (Django) and the frontend (Next.js) servers.

## 🚀 Quick Start

### 1. Backend (Django API)
Open a new terminal and run:
```powershell
cd artifacts/django-api
# Activate virtual environment
.\.venv\Scripts\activate
# Start server
python manage.py runserver
```
*The backend will be available at http://127.0.0.1:8000*

### 2. Frontend (Next.js Portal)
Open another terminal and run:
```powershell
cd artifacts/exam-portal-next
# Start dev server
npx pnpm dev
```
*The frontend will be available at http://localhost:3000*

---

## 🛠️ Additional Commands

### Backend Setup (if needed)
```powershell
cd artifacts/django-api
python manage.py migrate
python manage.py seed_data.py
python manage.py seed_admin.py
```

### Frontend Dependencies (if needed)
```powershell
cd artifacts/exam-portal-next
npx pnpm install
```

## 📝 Notes
- Ensure you have your environment variables set up in `.env` files within both directories.
- The frontend is configured to proxy requests to the backend (check `src/proxy.ts` or `next.config.js`).
