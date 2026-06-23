-- ============================================
-- RLS POLICIES + PRODUCTION FIXES
-- Jalankan di SQL Editor Supabase
-- ============================================

-- 0. ADD ALAMAT COLUMN TO school_settings (if not exists)
ALTER TABLE school_settings ADD COLUMN IF NOT EXISTS alamat text DEFAULT '';

-- 0b. ADD BATAS_WAKTU + BERLAKU_UNTUK_KELAS TO bill_types (if not exists)
ALTER TABLE bill_types ADD COLUMN IF NOT EXISTS batas_waktu date;
ALTER TABLE bill_types ADD COLUMN IF NOT EXISTS berlaku_untuk_kelas text[];

-- 1. ENABLE RLS DI SEMUA TABEL
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. PUBLIC READ-ONLY POLICIES
-- Data yang boleh dibaca oleh siapa pun (anon key)
-- ============================================

-- Tahun ajaran aktif (read-only)
CREATE POLICY "Public read active academic_years" ON academic_years
  FOR SELECT USING (true);

-- Daftar kelas (read-only)
CREATE POLICY "Public read classes" ON classes
  FOR SELECT USING (true);

-- Data siswa (read-only)
CREATE POLICY "Public read students" ON students
  FOR SELECT USING (true);

-- Jenis tagihan (read-only)
CREATE POLICY "Public read bill_types" ON bill_types
  FOR SELECT USING (true);

-- Tagihan siswa (read-only)
CREATE POLICY "Public read bills" ON bills
  FOR SELECT USING (true);

-- Info bank aktif (read-only)
CREATE POLICY "Public read active bank_info" ON bank_info
  FOR SELECT USING (is_active = true);

-- Info sekolah (read-only)
CREATE POLICY "Public read school_settings" ON school_settings
  FOR SELECT USING (true);

-- Donasi yang sudah disetujui (read-only tampil)
CREATE POLICY "Public read approved donations" ON donations
  FOR SELECT USING (status = 'approved');

-- ============================================
-- 3. PUBLIC WRITE POLICIES (terbatas)
-- Hanya INSERT untuk payment & donation (user submit)
-- ============================================

-- Siapa pun bisa submit pembayaran
CREATE POLICY "Public insert payments" ON payments
  FOR INSERT WITH CHECK (true);

-- Siapa pun bisa submit donasi
CREATE POLICY "Public insert donations" ON donations
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 4. ADMIN WRITE POLICIES
-- Hanya authenticated users yang bisa UPDATE/DELETE
-- ============================================

-- Admin bisa UPDATE/DELETE students
CREATE POLICY "Admin manage students" ON students
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Admin bisa UPDATE/DELETE classes
CREATE POLICY "Admin manage classes" ON classes
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Admin bisa INSERT/UPDATE/DELETE bills
CREATE POLICY "Admin manage bills" ON bills
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Admin bisa UPDATE/DELETE payments (approve/reject)
CREATE POLICY "Admin manage payments" ON payments
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Admin bisa UPDATE/DELETE donations
CREATE POLICY "Admin manage donations" ON donations
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Admin bisa mengelola bank_info
CREATE POLICY "Admin manage bank_info" ON bank_info
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Admin bisa mengelola school_settings
CREATE POLICY "Admin manage school_settings" ON school_settings
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Admin bisa mengelola academic_years
CREATE POLICY "Admin manage academic_years" ON academic_years
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Admin bisa mengelola bill_types
CREATE POLICY "Admin manage bill_types" ON bill_types
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- 5. STORAGE BUCKET POLICIES
-- Jalankan manual setup:
-- 1. Buka Storage > bukti-pembayaran
-- 2. Policies > tambahkan:
--    - SELECT: bucket_id = 'bukti-pembayaran' (public)
--    - INSERT: bucket_id = 'bukti-pembayaran' (authenticated, ukuran < 5MB)
-- ============================================

-- ============================================
-- 6. UNIQUE CONSTRAINT: bank_info
-- Maksimal 1 bank aktif per tipe
-- ============================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_bank_info_type_active
  ON bank_info(type, is_active)
  WHERE is_active = true;

-- ============================================
-- 7. UNIQUE CONSTRAINT: school_settings
-- Maksimal 1 baris sekolah
-- ============================================
-- (biarkan single row dihandle di kode, tidak perlu unique)

-- ============================================
-- 8. INDEX TAMBAHAN UNTUK PERFORMA
-- ============================================
CREATE INDEX IF NOT EXISTS idx_payments_bill_id ON payments(bill_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_bank_info_type ON bank_info(type);

-- ============================================
-- 9. VALIDASI CONSTRAINT bills
-- Pastikan month tidak bisa kosong/null
-- ============================================
ALTER TABLE bills ALTER COLUMN month SET NOT NULL;
ALTER TABLE bills ALTER COLUMN amount SET NOT NULL;
ALTER TABLE bills ALTER COLUMN year SET NOT NULL;
