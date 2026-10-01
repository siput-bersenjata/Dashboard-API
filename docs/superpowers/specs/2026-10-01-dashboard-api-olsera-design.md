# Kasir API & Olsera Scraper / Ingestion Dashboard Specification

## 1. Overview
A modern, dark-themed Dashboard and Public API service named **Kasir API**. It connects directly to Olsera Backoffice (`dashboard.olsera.co.id`), securely ingests transaction reports using direct OAuth2 REST calls (avoiding fragile browser scraping), stores the data, provides a Public API management interface with deterministic percentage filtering, provides a dedicated Filtered Data Preview page, and provides an end-to-end deployment setup for GitHub and Vercel.

## 2. Problem & Background
- **Source**: Olsera Backoffice (`https://dashboard.olsera.co.id/login`).
- **Initial Credentials**:
  - Email: `bapendapedua@gmail.com`
  - Password: `bapenda123`
- **Role**: `PJ` ("Perpajakan" / Tax Agency auditing Naiki Cafe, Store ID `175605`, Station `635C`).
- **API Endpoint Confirmed**:
  - OAuth: `POST https://api-dash.olsera.co.id/oauth/token`
  - Stores: `GET https://api-dash.olsera.co.id/api/store`
  - Transaction Details: `GET https://api-dash.olsera.co.id/api/{store_url_id}/admin/v1/{lang}/salesreports/taxation/salesdetails?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&per_page=100&page=N` (Max 31 days per request, paginated).

## 3. Core System Requirements
1. **Automated & Manual Data Ingestion**:
   - Ingests all historical and daily sales transactions from Olsera into the database.
   - Manual "Sinkronkan Data Sekarang" button on UI.
   - Automated Vercel Cron endpoint (`/api/cron/sync`) running daily/hourly.
2. **Public API Engine**:
   - Dynamic API Key generator (`sk_live_...`).
   - Rate limiting, IP logging, and response volume tracking.
   - **Deterministic Percentage Filter**: For example, when configured at 50%, it returns a consistent, reproducible 50% sample of all transactions (using Murmur/SHA256 hash modulo of `order_no`), ensuring repeated calls return the same representative dataset.
   - Additional filters: Date range, payment mode, station/outlet, max records per request.
3. **Dedicated Filtered Data Preview Page**:
   - Visual inspection page where admins select any API Key / Filter configuration and immediately view:
     - Total raw data available vs. total filtered data count (e.g. 5,597 raw -> 2,798 filtered at 50%).
     - Full data preview table showing the exact payload that the public API consumer will receive.
     - Live curl / fetch code snippets for external consumers.
4. **Kasir API Dashboard UI** (Exact styling matching the provided mockups):
   - **Dashboard**: Metrics cards (Total Transaksi Hari Ini, Jumlah Data API Hari Ini, Total Akses Kasir, Uptime API), Line chart for transaction & API trends, Donut chart for payment types.
   - **Data API**: Table of active API keys with copy key, edit, delete, status toggle. Modal / form for creating API keys with percentage slider and criteria checkboxes.
   - **Monitoring API**: Real-time traffic, bandwidth, status codes (200, 401, 429, 500), latency charts, detailed request log table.
   - **Akses Kasir**: Outlets and cashier stations list with status indicators.
   - **Riwayat & Log**: Complete audit log for scraping sync jobs and API consumption.
   - **Pengaturan**: Olsera credentials configuration, database sync status.
5. **Database & Vercel Deployment**:
   - Built on **Next.js 14+ (App Router)** with TypeScript, Tailwind CSS, Lucide icons, and Prisma ORM.
   - Dual-mode database compatibility: SQLite locally and PostgreSQL (Neon/Supabase/Vercel Postgres) for Vercel production.
   - Auto-deployable to GitHub (`siput-bersenjata/Dashboard-API`) and Vercel.

## 4. Architecture & Data Flow

```mermaid
graph TD
    Olsera[Olsera Backoffice API api-dash.olsera.co.id] -->|OAuth Token & Sales Details| SyncEngine[Ingestion & Sync Engine]
    SyncEngine -->|Store Transactions| DB[(Database: PostgreSQL / Prisma)]
    DB --> DashboardUI[Kasir API Dashboard]
    DashboardUI --> FilterPreview[Halaman Preview Data Terfilter]
    DashboardUI --> KeyManager[API Key Management]
    
    Client[External Public API Consumer] -->|x-api-key| PublicAPI[/api/v1/public/transactions]
    PublicAPI --> AuthValidator[API Key & Quota Validator]
    AuthValidator --> DB
    PublicAPI --> FilterEngine[Deterministic Percentage & Criteria Filter]
    FilterEngine -->|Filtered JSON Output| Client
    PublicAPI --> RequestLogger[Monitoring & Request Logger]
    RequestLogger --> DB
```

## 5. Security & Error Handling
- Never expose Olsera master credentials to public API consumers.
- API keys hashed or masked in public views (`sk_live_...3b7c`).
- Rate limiting on public API endpoints (default 60 requests/minute per key).
- Ingestion retries with exponential backoff on Olsera rate limits.
