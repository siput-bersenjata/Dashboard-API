# Kasir API & Olsera Ingestion Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready Next.js 14+ full-stack Kasir API application with Olsera Backoffice transaction ingestion, deterministic percentage-based Public API filtering, a dedicated Filtered Data Preview page, exact dark UI matching the provided mockups, GitHub repository push, and live Vercel deployment.

**Architecture:** Next.js App Router with TypeScript and Tailwind CSS. A server-side Olsera Ingestion Engine authenticates and fetches live transactions from Olsera REST API (`https://api-dash.olsera.co.id/`), storing them via Prisma ORM (SQLite locally, PostgreSQL on Vercel). A Public API engine exposes `/api/v1/public/transactions` with deterministic hashing filter logic and full request audit logging.

**Tech Stack:** Next.js 14/15, TypeScript, Tailwind CSS, Prisma ORM, Lucide Icons, GitHub CLI, Vercel CLI.

**Spec:** `docs/superpowers/specs/2026-10-01-dashboard-api-olsera-design.md`

## Global Constraints
- Target Node version: 20+
- Database: Prisma schema supporting both local dev and production PostgreSQL (DATABASE_URL)
- UI: Dark theme navy/slate `#0f172a`, `#1e293b`, vibrant blue `#2563eb` matching provided mockups
- Deployment: Must deploy directly to Vercel and push to GitHub `https://github.com/siput-bersenjata/Dashboard-API.git`

---

### Task 1: Initialize Next.js Project with Tailwind CSS & TypeScript
**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `next.config.mjs`, `src/app/globals.css`, `src/app/layout.tsx`
- Test: Verify local build with `npm run build`

- [ ] **Step 1: Scaffold Next.js application files and install dependencies**
- [ ] **Step 2: Setup Tailwind configuration and custom design tokens**
- [ ] **Step 3: Setup base root layout and test build**
- [ ] **Step 4: Commit changes**

---

### Task 2: Database Layer with Prisma ORM
**Files:**
- Create: `prisma/schema.prisma`, `src/lib/prisma.ts`
- Models: `Transaction`, `ApiKey`, `ApiLog`, `SyncLog`, `Setting`
- Test: `npx prisma generate` and verify schema validation

- [ ] **Step 1: Write Prisma schema with Transaction, ApiKey, ApiLog, SyncLog, Setting models**
- [ ] **Step 2: Create Prisma singleton client in `src/lib/prisma.ts`**
- [ ] **Step 3: Generate Prisma client and run initial migration/db push**
- [ ] **Step 4: Commit database layer**

---

### Task 3: Olsera Ingestion Engine
**Files:**
- Create: `src/lib/olsera.ts`, `src/app/api/olsera/sync/route.ts`, `src/app/api/cron/sync/route.ts`
- Functions: `loginOlsera()`, `fetchOlseraStores()`, `fetchOlseraTransactions()`, `syncOlseraData()`
- Test: Run sync unit test against confirmed Olsera endpoints with `bapendapedua@gmail.com`

- [ ] **Step 1: Implement Olsera OAuth token manager and client in `src/lib/olsera.ts`**
- [ ] **Step 2: Implement batch transaction ingestion and upsert into database**
- [ ] **Step 3: Create manual sync API endpoint `/api/olsera/sync` and cron endpoint `/api/cron/sync`**
- [ ] **Step 4: Verify sync writes real records into database and commit**

---

### Task 4: Public API & Deterministic Percentage Filter Engine
**Files:**
- Create: `src/lib/filter-engine.ts`, `src/app/api/v1/public/transactions/route.ts`, `src/app/api/v1/keys/route.ts`
- Functions: `applyDeterministicPercentageFilter(transactions, percentage)` using Murmur/SHA256 hash of `order_no`
- Test: Verify test that 50% filter yields exactly 50% deterministic results across multiple runs

- [ ] **Step 1: Write deterministic percentage filter algorithm in `src/lib/filter-engine.ts`**
- [ ] **Step 2: Implement Public API endpoint `/api/v1/public/transactions` with `x-api-key` validation**
- [ ] **Step 3: Implement request logging (`ApiLog`) for response size, status, and IP**
- [ ] **Step 4: Commit Public API engine**

---

### Task 5: UI Components & Kasir API Dashboard Shell
**Files:**
- Create: `src/components/Sidebar.tsx`, `src/components/Header.tsx`, `src/components/MetricCard.tsx`, `src/components/Charts.tsx`
- Pages: `src/app/page.tsx` (Dashboard), `src/app/data-api/page.tsx`, `src/app/data-api/preview/page.tsx`, `src/app/monitoring/page.tsx`, `src/app/kasir/page.tsx`, `src/app/riwayat/page.tsx`, `src/app/pengaturan/page.tsx`
- Test: Verify rendering of all pages in browser

- [ ] **Step 1: Build Sidebar navigation with "Sistem Aktif - API siap digunakan" badge and Header user profile**
- [ ] **Step 2: Build Dashboard overview with metrics cards, trend chart, and transaction type breakdown**
- [ ] **Step 3: Build Data API management table with "+ Buat API Key" modal (form with percentage slider & filters)**
- [ ] **Step 4: Build dedicated "Preview Data Hasil Filter" page showing live table of data output and total count**
- [ ] **Step 5: Build Monitoring API, Akses Kasir, Riwayat & Log, and Pengaturan pages**
- [ ] **Step 6: Commit all UI components and pages**

---

### Task 6: GitHub Push & Vercel Production Deployment
**Files:**
- Create: `README.md`, `vercel.json`
- Test: Push to `origin main` and deploy via `vercel --prod`

- [ ] **Step 1: Create comprehensive README with architecture, API docs, and deployment guide**
- [ ] **Step 2: Add `vercel.json` with cron jobs configuration**
- [ ] **Step 3: Push commit history to `https://github.com/siput-bersenjata/Dashboard-API.git`**
- [ ] **Step 4: Deploy application directly to Vercel production using Vercel CLI**
- [ ] **Step 5: Verify live production deployment URL and API health**
