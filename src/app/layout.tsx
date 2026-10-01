import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kasir API - Olsera Scraper & Public API Dashboard",
  description: "Platform otomatisasi penarikan data transaksi kasir Olsera dan manajemen Public API terfilter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-navy-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
