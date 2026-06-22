# SUPABASE INTEGRATION SETUP GUIDE

## Overview

Aplikasi SPP MI Nurul Iman sudah diintegrasikan dengan Supabase. Data siswa, kelas, dan tagihan sekarang disimpan di database Supabase bukan lagi data dummy.

## Prerequisites

- Node.js 18+ dan npm
- Akun Supabase (gratis di https://supabase.com)

## Step 1: Setup Supabase Project

1. Buka https://supabase.com dan login/register
2. Klik "New Project"
3. Isi nama project: spp-mi-nurul-iman
4. Pilih region terdekat (misal: Singapore)
5. Buat password untuk database
6. Tunggu project selesai dibuat (5-10 menit)

## Step 2: Jalankan SQL Schema

1. Di dashboard Supabase, pergi ke "SQL Editor"
2. Klik "New Query"
3. Copy semua isi dari file supabase-schema.sql
4. Paste ke SQL Editor
5. Klik "Run"
6. Tunggu sampai semua query berhasil dijalankan

## Step 3: Dapatkan Credentials

1. Di dashboard Supabase, pergi ke "Project Settings"
2. Klik tab "API"
3. Copy:
   - Project URL → NEXT_PUBLIC_SUPABASE_URL
   - non public key → NEXT_PUBLIC_SUPABASE_ANON_KEY

## Step 4: Setup Environment Variables

1. Di root project, buat file .env.local
2. Copy isi dari .env.local.example
3. Isi dengan credentials dari Step 3:

\\\
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\\\

## Step 5: Install Dependencies

\\\ash
npm install
\\\

Ini akan install @supabase/supabase-js dan dependency lainnya.

## Step 6: Run Development Server

\\\ash
npm run dev
\\\

Akses di http://localhost:3000

## Fitur yang Sudah Terintegrasi

### 1. Halaman Beranda (/page.tsx)
- ✅ Ambil daftar kelas dari Supabase
- ✅ Loading state saat fetch data
- ✅ Dropdown kelas dinamis

### 2. Halaman Daftar Siswa (/siswa/page.tsx)
- ✅ Ambil siswa berdasarkan kelas
- ✅ Search dan filter berdasarkan Supabase data
- ✅ Statistik kelas (lunas/belum/menunggu)
- ✅ Loading state

### 3. Halaman Detail Siswa (/siswa/[id]/page.tsx)
- ✅ Ambil data siswa dari ID
- ✅ Tampilkan tagihan aktif
- ✅ Riwayat pembayaran lengkap
- ✅ Status pembayaran dinamis

## File Structure

\\\
src/
├── app/
│   ├── page.tsx              (Beranda - ambil kelas)
│   ├── siswa/
│   │   ├── page.tsx          (Daftar siswa)
│   │   └── [id]/page.tsx     (Detail siswa)
│   └── globals.css           (CSS styling)
├── lib/
│   ├── supabase.ts           (Supabase client initialization)
│   ├── db.ts                 (Database queries & types)
│   └── utils.ts              (Utility functions)
└── data/
    └── siswa.ts              (DEPRECATED - bisa dihapus nanti)

supabase-schema.sql           (SQL schema untuk Supabase)
.env.local.example            (Template env variables)
\\\

## Database Schema

### Tables

- **academic_years**: Tahun ajaran (misal: 2025/2026)
- **classes**: Kelas (1A, 1B, 2A, ..., 6B)
- **students**: Data siswa dengan NISN dan kelas
- **bill_types**: Jenis tagihan (SPP, Seragam, dll)
- **bills**: Tagihan individual siswa dengan status pembayaran

### Data Types

\\\	ypescript
type StatusBayar = 'lunas' | 'belum' | 'menunggu'

interface Siswa {
  id: string
  nisn: string
  nama: string
  kelas: string
  status: StatusBayar
  tagihan: string
  nominalTagihan: number
  riwayat: RiwayatPembayaran[]
}

interface RiwayatPembayaran {
  bulan: string
  tahun: string
  tanggal: string
  nominal: number
  status: StatusBayar
}
\\\

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Pastikan .env.local ada dan terisi dengan benar
- Restart dev server setelah mengubah .env.local

### Error: "Failed to fetch..."
- Cek internet connection
- Verifikasi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY
- Pastikan SQL schema sudah dijalankan di Supabase

### Data tidak muncul
- Pastikan sample data sudah diinsert (cek di SQL schema)
- Buka Supabase Dashboard → Table Editor untuk verifikasi data

### Build gagal
- Hapus node_modules: \m -r node_modules package-lock.json\
- Install ulang: \
pm install\

## Build untuk Production

\\\ash
npm run build
npm start
\\\

## Next Steps (Future Features)

- [ ] Payment gateway integration
- [ ] Admin dashboard
- [ ] Upload bukti pembayaran
- [ ] Email notifications
- [ ] Authentication untuk orang tua
- [ ] SMS reminders
