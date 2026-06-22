-- ============================================
-- SPRINT 4 - PAYMENTS TABLE & STORAGE
-- ============================================

-- 1. TABEL PEMBAYARAN
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  bill_id UUID REFERENCES bills(id) ON DELETE SET NULL,
  nama_pengirim VARCHAR(100) NOT NULL,
  jumlah_transfer INTEGER NOT NULL,
  catatan TEXT DEFAULT '',
  bukti_url TEXT DEFAULT '',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  keterangan_admin TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);

-- 2. TABEL INFORMASI BANK
CREATE TABLE IF NOT EXISTS bank_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name VARCHAR(50) NOT NULL,
  nomor_rekening VARCHAR(30) NOT NULL,
  atas_nama VARCHAR(100) NOT NULL,
  qris_url TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default bank info
INSERT INTO bank_info (bank_name, nomor_rekening, atas_nama) VALUES
('Bank Syariah Indonesia', '1234567890', 'MI Nurul Iman Kabo Jaya')
ON CONFLICT DO NOTHING;
