-- ============================================
-- CICILAN: 5x upload per tagihan
-- Jalankan di Supabase SQL Editor
-- ============================================

-- 1. TAMBAH STATUS dicicil DAN KOLOM total_paid
ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_status_check;
ALTER TABLE bills ADD CONSTRAINT bills_status_check 
  CHECK (status IN ('lunas', 'belum', 'menunggu', 'dicicil'));

ALTER TABLE bills ADD COLUMN IF NOT EXISTS total_paid INTEGER DEFAULT 0;

-- 2. INDEX UNTUK QUERY PAYMENTS PER BILL
CREATE INDEX IF NOT EXISTS idx_payments_bill_status ON payments(bill_id, status);