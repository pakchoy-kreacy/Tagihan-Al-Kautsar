-- ============================================
-- FRESH START: Reset semua tagihan & pembayaran
-- Jalankan di Supabase SQL Editor
-- ============================================

-- 1. CICILAN MIGRATION (tambah status 'dicicil' + kolom 'total_paid')
ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_status_check;
ALTER TABLE bills ADD CONSTRAINT bills_status_check
  CHECK (status IN ('lunas', 'belum', 'menunggu', 'dicicil'));

ALTER TABLE bills ADD COLUMN IF NOT EXISTS total_paid INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_payments_bill_status ON payments(bill_id, status);

-- 2. RESET: Hapus semua pembayaran dulu (foreign key dependency)
DELETE FROM payments;

-- 3. RESET: Hapus semua tagihan
DELETE FROM bills;
