-- ============================================
-- SUPABASE SCHEMA - SPP MI NURUL IMAN
-- ============================================

-- 1. TABEL TAHUN AJARAN
CREATE TABLE IF NOT EXISTS academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE, -- e.g., "2025/2026"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL KELAS
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(10) NOT NULL UNIQUE, -- e.g., "3A", "4B"
  grade INTEGER NOT NULL, -- 1-6
  section CHAR(1) NOT NULL, -- A, B, etc.
  academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL SISWA
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nisn VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL JENIS TAGIHAN
CREATE TABLE IF NOT EXISTS bill_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL, -- e.g., "SPP", "Seragam", "Buku"
  description TEXT,
  default_amount INTEGER NOT NULL DEFAULT 0,
  is_recurring BOOLEAN DEFAULT true, -- true untuk SPP bulanan
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL TAGIHAN
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  bill_type_id UUID REFERENCES bill_types(id) ON DELETE CASCADE,
  academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
  month VARCHAR(20), -- e.g., "Juni 2026", "Juli 2026"
  year INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'belum' CHECK (status IN ('lunas', 'belum', 'menunggu')),
  paid_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, bill_type_id, month, year)
);

-- INDEX untuk performa
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_bills_student ON bills(student_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_classes_academic_year ON classes(academic_year_id);

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert Tahun Ajaran
INSERT INTO academic_years (name, start_date, end_date, is_active) VALUES
('2025/2026', '2025-07-01', '2026-06-30', true)
ON CONFLICT (name) DO NOTHING;

-- Insert Kelas
INSERT INTO classes (name, grade, section, academic_year_id) 
SELECT '1A', 1, 'A', id FROM academic_years WHERE name = '2025/2026' ON CONFLICT (name) DO NOTHING;
INSERT INTO classes (name, grade, section, academic_year_id) 
SELECT '1B', 1, 'B', id FROM academic_years WHERE name = '2025/2026' ON CONFLICT (name) DO NOTHING;
INSERT INTO classes (name, grade, section, academic_year_id) 
SELECT '2A', 2, 'A', id FROM academic_years WHERE name = '2025/2026' ON CONFLICT (name) DO NOTHING;
INSERT INTO classes (name, grade, section, academic_year_id) 
SELECT '2B', 2, 'B', id FROM academic_years WHERE name = '2025/2026' ON CONFLICT (name) DO NOTHING;
INSERT INTO classes (name, grade, section, academic_year_id) 
SELECT '3A', 3, 'A', id FROM academic_years WHERE name = '2025/2026' ON CONFLICT (name) DO NOTHING;
INSERT INTO classes (name, grade, section, academic_year_id) 
SELECT '3B', 3, 'B', id FROM academic_years WHERE name = '2025/2026' ON CONFLICT (name) DO NOTHING;
INSERT INTO classes (name, grade, section, academic_year_id) 
SELECT '4A', 4, 'A', id FROM academic_years WHERE name = '2025/2026' ON CONFLICT (name) DO NOTHING;
INSERT INTO classes (name, grade, section, academic_year_id) 
SELECT '4B', 4, 'B', id FROM academic_years WHERE name = '2025/2026' ON CONFLICT (name) DO NOTHING;
INSERT INTO classes (name, grade, section, academic_year_id) 
SELECT '5A', 5, 'A', id FROM academic_years WHERE name = '2025/2026' ON CONFLICT (name) DO NOTHING;
INSERT INTO classes (name, grade, section, academic_year_id) 
SELECT '5B', 5, 'B', id FROM academic_years WHERE name = '2025/2026' ON CONFLICT (name) DO NOTHING;
INSERT INTO classes (name, grade, section, academic_year_id) 
SELECT '6A', 6, 'A', id FROM academic_years WHERE name = '2025/2026' ON CONFLICT (name) DO NOTHING;
INSERT INTO classes (name, grade, section, academic_year_id) 
SELECT '6B', 6, 'B', id FROM academic_years WHERE name = '2025/2026' ON CONFLICT (name) DO NOTHING;

-- Insert Jenis Tagihan
INSERT INTO bill_types (name, description, default_amount, is_recurring) VALUES
('SPP', 'Sumbangan Pembinaan Pendidikan - Bulanan', 150000, true)
ON CONFLICT DO NOTHING;

-- Insert Sample Students (Kelas 3A)
INSERT INTO students (nisn, name, class_id)
SELECT '3A-01', 'Ahmad Rizki', id FROM classes WHERE name = '3A'
ON CONFLICT (nisn) DO NOTHING;

INSERT INTO students (nisn, name, class_id)
SELECT '3A-02', 'Aisyah Putri', id FROM classes WHERE name = '3A'
ON CONFLICT (nisn) DO NOTHING;

INSERT INTO students (nisn, name, class_id)
SELECT '3A-03', 'Budi Santoso', id FROM classes WHERE name = '3A'
ON CONFLICT (nisn) DO NOTHING;

INSERT INTO students (nisn, name, class_id)
SELECT '3A-04', 'Dewi Sartika', id FROM classes WHERE name = '3A'
ON CONFLICT (nisn) DO NOTHING;

INSERT INTO students (nisn, name, class_id)
SELECT '3A-05', 'Fahri Alfarizi', id FROM classes WHERE name = '3A'
ON CONFLICT (nisn) DO NOTHING;

INSERT INTO students (nisn, name, class_id)
SELECT '3A-06', 'Siti Aminah', id FROM classes WHERE name = '3A'
ON CONFLICT (nisn) DO NOTHING;

INSERT INTO students (nisn, name, class_id)
SELECT '3A-07', 'Rina Marlina', id FROM classes WHERE name = '3A'
ON CONFLICT (nisn) DO NOTHING;

INSERT INTO students (nisn, name, class_id)
SELECT '3A-08', 'Dimas Ardiansyah', id FROM classes WHERE name = '3A'
ON CONFLICT (nisn) DO NOTHING;

INSERT INTO students (nisn, name, class_id)
SELECT '3A-09', 'Nurul Hidayah', id FROM classes WHERE name = '3A'
ON CONFLICT (nisn) DO NOTHING;

INSERT INTO students (nisn, name, class_id)
SELECT '3A-10', 'Rizky Pratama', id FROM classes WHERE name = '3A'
ON CONFLICT (nisn) DO NOTHING;

INSERT INTO students (nisn, name, class_id)
SELECT '3A-11', 'Zahra Ramadhani', id FROM classes WHERE name = '3A'
ON CONFLICT (nisn) DO NOTHING;

INSERT INTO students (nisn, name, class_id)
SELECT '3A-12', 'M. Fajar Sidik', id FROM classes WHERE name = '3A'
ON CONFLICT (nisn) DO NOTHING;

-- Insert Sample Bills untuk setiap siswa
-- Ahmad Rizki (lunas)
INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status, paid_date)
SELECT s.id, bt.id, ay.id, 'Juni 2026', 2026, 150000, 'lunas', '2026-06-05'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn = '3A-01' AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status, paid_date)
SELECT s.id, bt.id, ay.id, 'Mei 2026', 2026, 150000, 'lunas', '2026-05-10'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn = '3A-01' AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'lunas'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn = '3A-01' AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

-- Aisyah Putri (lunas)
INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status, paid_date)
SELECT s.id, bt.id, ay.id, 'Juni 2026', 2026, 150000, 'lunas', '2026-06-03'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn = '3A-02' AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status, paid_date)
SELECT s.id, bt.id, ay.id, 'Mei 2026', 2026, 150000, 'lunas', '2026-05-08'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn = '3A-02' AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status, paid_date)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'lunas', '2026-07-01'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn = '3A-02' AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

-- Budi Santoso (belum)
INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status, paid_date)
SELECT s.id, bt.id, ay.id, 'Juni 2026', 2026, 150000, 'lunas', '2026-06-05'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn = '3A-03' AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'belum'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn = '3A-03' AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

-- Dewi Sartika (lunas)
INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status, paid_date)
SELECT s.id, bt.id, ay.id, 'Juni 2026', 2026, 150000, 'lunas', '2026-06-12'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn = '3A-04' AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status, paid_date)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'lunas', '2026-07-15'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn = '3A-04' AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

-- Fahri Alfarizi (belum - 2 bulan)
INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status)
SELECT s.id, bt.id, ay.id, 'Juni 2026', 2026, 150000, 'belum'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn = '3A-05' AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'belum'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn = '3A-05' AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

-- Siti Aminah (menunggu)
INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status, paid_date)
SELECT s.id, bt.id, ay.id, 'Juni 2026', 2026, 150000, 'lunas', '2026-06-20'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn = '3A-06' AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'menunggu'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn = '3A-06' AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

-- Rina Marlina (lunas)
INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status, paid_date)
SELECT s.id, bt.id, ay.id, 'Juni 2026', 2026, 150000, 'lunas', '2026-06-02'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn = '3A-07' AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status, paid_date)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'lunas', '2026-07-02'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn = '3A-07' AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

-- Dimas Ardiansyah (lunas)
INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status, paid_date)
SELECT s.id, bt.id, ay.id, 'Juni 2026', 2026, 150000, 'lunas', '2026-06-01'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn = '3A-08' AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status, paid_date)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'lunas', '2026-07-01'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn = '3A-08' AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

-- Nurul Hidayah (belum - tidak ada riwayat)
INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'belum'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn = '3A-09' AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

-- Rizky Pratama (menunggu)
INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'menunggu'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn = '3A-10' AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

-- Zahra Ramadhani (lunas)
INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status, paid_date)
SELECT s.id, bt.id, ay.id, 'Juni 2026', 2026, 150000, 'lunas', '2026-06-15'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn = '3A-11' AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status, paid_date)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'lunas', '2026-07-10'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn = '3A-11' AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

-- M. Fajar Sidik (lunas)
INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status, paid_date)
SELECT s.id, bt.id, ay.id, 'Juni 2026', 2026, 150000, 'lunas', '2026-06-18'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn = '3A-12' AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status, paid_date)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'lunas', '2026-07-15'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn = '3A-12' AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;
