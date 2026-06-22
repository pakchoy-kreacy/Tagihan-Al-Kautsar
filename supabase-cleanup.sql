-- ============================================
-- CLEANUP: HAPUS SEMUA DATA DUMMY
-- ============================================
-- HAPUS DULU TAGIHAN (BILLS)
DELETE FROM bills;

-- HAPUS SEMUA SISWA
DELETE FROM students;

-- HAPUS DATA PEMBAYARAN (KALAU ADA)
DELETE FROM payments;

-- RESET AUTO-INCREMENT KALAU ADA
-- (TIDAK PERLU KARENA PAKAI UUID)

-- DATA YANG TETAP ADA:
--   - academic_years (tahun ajaran)
--   - classes (daftar kelas 1A-6B)
--   - bill_types (jenis tagihan: SPP)
--   - bank_info (info rekening)

-- ============================================
-- OPSI: HAPUS SEMUA TERMASUK STRUKTUR
-- UNCOMMENT BARIS DI BAWAH INI JIKA MAU
-- ============================================
-- DROP TABLE IF EXISTS payments;
-- DROP TABLE IF EXISTS bills;
-- DROP TABLE IF EXISTS students;
-- DROP TABLE IF EXISTS classes;
-- DROP TABLE IF EXISTS bill_types;
-- DROP TABLE IF EXISTS academic_years;
-- DROP TABLE IF EXISTS bank_info;
