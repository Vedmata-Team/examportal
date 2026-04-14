# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: Clerk when keys are configured; local email/password fallback in development when Clerk keys are absent

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Current ExamPlatform Notes

- API runs on port 8080 and the web artifact proxies `/api` requests to it during development.
- Local auth endpoints are available at `/api/auth/register`, `/api/auth/login`, and `/api/auth/logout`; the first locally registered user becomes `CENTRAL`.
- A development admin account was created during validation: `central@example.com` / `TempPass123!`.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
