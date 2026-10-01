# Kasir API - Olsera Scraper & Public API Dashboard

Aplikasi Dashboard Full-Stack modern bertema *dark slate* untuk integrasi otomatis data transaksi dari **[Olsera Backoffice](https://dashboard.olsera.co.id/login)**, penyimpanan ke database, manajemen Public API Key dengan **filter persentase data (deterministic sampling)**, dan halaman preview interaktif hasil filter sebelum data disajikan ke pihak eksternal.

---

## 🌟 Fitur Utama

1. **Dashboard Metrik & Visualisasi Real-Time (Kasir API)**:
   - Metrik Transaksi Hari Ini, Jumlah Data API Terkirim, Total Akses Kasir, dan Uptime API.
   - Grafik Tren Transaksi vs Permintaan API.
   - Donut Chart persebaran metode pembayaran (QRIS, Tunai, dll.).
2. **Olsera Ingestion Engine (Cepat, Andal & Bebas Timeout)**:
   - Terintegrasi langsung dengan endpoint OAuth2 & Laporan Perpajakan Olsera Backoffice (`https://api-dash.olsera.co.id/`).
   - Dapat dipicu manual kapan saja melalui tombol **"Tarik Data Olsera"** di header atau halaman Pengaturan.
   - Otomatis berjalan terjadwal melalui **Vercel Cron** (`/api/cron/sync`).
3. **Public API Engine (`/api/v1/public/transactions`)**:
   - Otorisasi aman menggunakan header `x-api-key: sk_live_...`.
   - **Filter Persentase Deterministik**: Memungkinkan penyajian sampel data transaksi (misal 50%, 70%, 100%) secara konsisten dan representatif menggunakan algoritma hashing pada nomor order.
   - Filter rentang tanggal, jenis pembayaran, dan limitasi kuota per request.
4. **Halaman Khusus Preview Data Hasil Filter (`/data-api/preview`)**:
   - Halaman interaktif untuk memeriksa tabel data sebelum ditarik oleh pihak luar.
   - Slider persentase langsung (10% - 100%) dengan perhitungan otomatis: total data raw, total data terfilter, total omset terfilter, dan total pajak PB1 terfilter.
   - Salin langsung cuplikan cURL / fetch request.
5. **Monitoring & Riwayat Log**:
   - Pemantauan real-time: Total Request, Data Terkirim, Status Sukses / Gagal (200, 429, 500).
   - Log audit lengkap untuk setiap request penarikan data publik.

---

## ⚙️ Arsitektur & Teknologi

- **Frontend & Backend**: Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS.
- **ORM & Database**: Prisma ORM (SQLite untuk pengembangan lokal, PostgreSQL / Neon / Supabase untuk production Vercel).
- **Icons & Visuals**: Lucide Icons & Responsive SVG Charts.
- **Cron Jobs**: Vercel Cron (`vercel.json`).

---

## 🚀 Skenario Penggunaan & Menjalankan Sistem

### 1. Kredensial Akses Olsera
Akun default yang telah terverifikasi:
- **Email**: `bapendapedua@gmail.com`
- **Password**: `bapenda123`
- **Role**: Perpajakan (`PJ`)
- **Outlet**: Naiki Cafe (Store ID: `175605`, Station: `635C`)

### 2. Menjalankan di Lokal (Development)
```bash
# 1. Install dependencies
npm install

# 2. Setup database
npx prisma db push
npx -y tsx prisma/seed.ts

# 3. Jalankan development server
npm run dev
```
Buka browser di `http://localhost:3000`.

### 3. Contoh Penarikan Data via Public API

Gunakan API Key yang terdaftar (misal: `Kasir 3 - Filter 50%`):
```bash
curl -X GET "https://<DOMAIN_VERCEL>/api/v1/public/transactions" \
  -H "x-api-key: sk_live_4c1e...8p2m"
```

Contoh Response:
```json
{
  "status": "success",
  "meta": {
    "access_name": "Kasir 3 (Filter 50%)",
    "api_key": "sk_live_4c...8p2m",
    "filter_percentage": "50%",
    "total_data_raw": 300,
    "total_data_filtered": 150,
    "total_data_returned": 50,
    "limit": 50,
    "response_time_ms": 18
  },
  "data": [
    {
      "orderNo": "635C26090100108393",
      "orderTime": "2026-09-01T08:20:21.000Z",
      "orderDate": "2026-09-01",
      "paymentModeName": "Qris BCA",
      "subtotal": 20000,
      "tax": 2000,
      "paidAmount": 22000,
      "station": "635C"
    }
  ]
}
```

---

## ☁️ Deployment ke Vercel

1. **Push ke GitHub**:
   ```bash
   git push -u origin main
   ```
2. **Deploy via Vercel CLI**:
   ```bash
   vercel --prod
   ```
3. **Environment Variables di Vercel**:
   - `DATABASE_URL`: URL PostgreSQL (Neon / Supabase / Vercel Postgres) atau file SQLite.
   - `OLSERA_EMAIL`: `bapendapedua@gmail.com`
   - `OLSERA_PASSWORD`: `bapenda123`
   - `OLSERA_STORE_URL_ID`: `naikicafe`
   - `CRON_SECRET`: Secret token untuk Vercel Cron.
