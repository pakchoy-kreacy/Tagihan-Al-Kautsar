-- ============================================
-- SPRINT 5 - DONATIONS & SETTINGS
-- ============================================

-- 1. TABEL DONASI
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_donatur VARCHAR(100) NOT NULL,
  nominal INTEGER NOT NULL,
  pesan TEXT DEFAULT '',
  bukti_url TEXT DEFAULT '',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  keterangan_admin TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL PENGATURAN SEKOLAH
CREATE TABLE IF NOT EXISTS school_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_sekolah VARCHAR(100) DEFAULT 'MI Nurul Iman',
  logo_url TEXT DEFAULT '',
  nomor_wa VARCHAR(20) DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TAMBAH TYPE DI BANK_INFO UNTUK BEDAKAN PEMBAYARAN & INFAQ
ALTER TABLE IF EXISTS bank_info ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'payment'
  CHECK (type IN ('payment', 'infaq'));

-- 4. INSERT DEFAULT INFAQ BANK INFO
INSERT INTO bank_info (bank_name, nomor_rekening, atas_nama, type) VALUES
('Bank Syariah Indonesia', '0987654321', 'MI Nurul Iman Infaq', 'infaq')
ON CONFLICT DO NOTHING;

-- 5. INSERT DEFAULT SCHOOL SETTINGS
INSERT INTO school_settings (nama_sekolah, nomor_wa) VALUES
('MI Nurul Iman', '08123456789')
ON CONFLICT DO NOTHING;
