# Setup and Run Guide

Welcome to the Exam Portal project. This monorepo contains a modern full-stack application built with React (Vite) and Express, powered by Drizzle ORM and Clerk Authentication.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: v18 or higher
- **pnpm**: Fast, disk space efficient package manager
- **PostgreSQL**: A running instance (local or hosted like Supabase/Aiven)
- **Clerk Account**: For authentication management

---

## 🛠️ Initial Setup

### 1. Install Dependencies
Run this command from the root of the project:
```bash
npx pnpm install
```

### 2. Environment Variables
You need to configure `.env` files for the core services. Templates đã được tạo sẵn.

#### API Server (`artifacts/api-server/.env`)
Template already created. Please update the following values:
```env
PORT=8080
DATABASE_URL=postgres://user:password@localhost:5432/examportal
CLERK_SECRET_KEY=sk_test_...
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

#### Exam Platform (`artifacts/exam-platform/.env`)
Template already created. Please update the following values:
```env
PORT=3000
BASE_PATH=/
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## 🗄️ Database Configuration

Initialize and sync your database schema using Drizzle (requires valid `DATABASE_URL`):

```bash
# From the root directory
npx pnpm run -F @workspace/db push
```

---

## 🚀 Running the Application

For local development, use `npx pnpm` if your global pnpm is not configured correctly for Windows:

### Start the API Server (Backend)
```bash
npx pnpm run -F @workspace/api-server dev
```
*The server will start on http://localhost:8080*

### Start the Exam Platform (Frontend)
```bash
npx pnpm run -F @workspace/exam-platform dev
```
*The application will be available on http://localhost:3000*

---

## 💡 Troubleshooting
- **Missing Rollup/LightningCSS Binary**: On Windows, you might see errors about missing `.node` files. Run `npx pnpm install --force` to fix optional dependencies.
- **Database Connection Error**: Ensure your `DATABASE_URL` is correct and the Postgres server is accepting connections.
- **Auth Errors**: Verify that your `CLERK_SECRET_KEY` and `VITE_CLERK_PUBLISHABLE_KEY` match your Clerk dashboard settings.
- **Port Conflicts**: If port 8080 or 3000 is occupied, update the respective `.env` files.
