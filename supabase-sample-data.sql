-- ============================================
-- SAMPLE DATA SISWA & TAGIHAN (All Classes)
-- ============================================
-- Jalankan ini di Supabase SQL Editor
-- SETELAH supabase-schema.sql sudah di-run

-- ============================================
-- KELAS 1A (6 siswa)
-- ============================================
INSERT INTO students (nisn, name, class_id)
SELECT '1A-01', 'Adi Saputra', id FROM classes WHERE name = '1A'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '1A-02', 'Bunga Citra', id FROM classes WHERE name = '1A'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '1A-03', 'Cahya Ningsih', id FROM classes WHERE name = '1A'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '1A-04', 'Doni Prasetyo', id FROM classes WHERE name = '1A'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '1A-05', 'Eka Rahmawati', id FROM classes WHERE name = '1A'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '1A-06', 'Fajar Hidayat', id FROM classes WHERE name = '1A'
ON CONFLICT (nisn) DO NOTHING;

-- Tagihan 1A
INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status, paid_date)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'lunas', '2026-07-05'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn IN ('1A-01','1A-02','1A-04','1A-06') AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'belum'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn IN ('1A-03','1A-05') AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

-- ============================================
-- KELAS 1B (5 siswa)
-- ============================================
INSERT INTO students (nisn, name, class_id)
SELECT '1B-01', 'Gilang Permana', id FROM classes WHERE name = '1B'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '1B-02', 'Hana Safitri', id FROM classes WHERE name = '1B'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '1B-03', 'Intan Permata', id FROM classes WHERE name = '1B'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '1B-04', 'Joko Widodo', id FROM classes WHERE name = '1B'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '1B-05', 'Kartika Sari', id FROM classes WHERE name = '1B'
ON CONFLICT (nisn) DO NOTHING;

INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status, paid_date)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'lunas', '2026-07-10'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn IN ('1B-01','1B-02','1B-04') AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;
INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'belum'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn IN ('1B-03','1B-05') AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

-- ============================================
-- KELAS 2A (6 siswa)
-- ============================================
INSERT INTO students (nisn, name, class_id)
SELECT '2A-01', 'Lina Marlina', id FROM classes WHERE name = '2A'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '2A-02', 'M. Rizky Fauzi', id FROM classes WHERE name = '2A'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '2A-03', 'Nadia Putri', id FROM classes WHERE name = '2A'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '2A-04', 'Oscar Maulana', id FROM classes WHERE name = '2A'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '2A-05', 'Putri Ayu', id FROM classes WHERE name = '2A'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '2A-06', 'Qori Amanda', id FROM classes WHERE name = '2A'
ON CONFLICT (nisn) DO NOTHING;

INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status, paid_date)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'lunas', '2026-07-12'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn IN ('2A-01','2A-02','2A-04','2A-06') AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;
INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'belum'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn IN ('2A-03','2A-05') AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

-- ============================================
-- KELAS 2B (5 siswa)
-- ============================================
INSERT INTO students (nisn, name, class_id)
SELECT '2B-01', 'Rudi Hermawan', id FROM classes WHERE name = '2B'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '2B-02', 'Sari Yuliana', id FROM classes WHERE name = '2B'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '2B-03', 'Tomi Gunawan', id FROM classes WHERE name = '2B'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '2B-04', 'Umi Kalsum', id FROM classes WHERE name = '2B'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '2B-05', 'Vina Anggraini', id FROM classes WHERE name = '2B'
ON CONFLICT (nisn) DO NOTHING;

INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status, paid_date)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'lunas', '2026-07-08'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn IN ('2B-01','2B-03','2B-04') AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;
INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'menunggu'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn IN ('2B-02','2B-05') AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

-- ============================================
-- KELAS 3B (6 siswa)
-- ============================================
INSERT INTO students (nisn, name, class_id)
SELECT '3B-01', 'Wawan Setiawan', id FROM classes WHERE name = '3B'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '3B-02', 'Yuni Astuti', id FROM classes WHERE name = '3B'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '3B-03', 'Agus Wijaya', id FROM classes WHERE name = '3B'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '3B-04', 'Bella Amalia', id FROM classes WHERE name = '3B'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '3B-05', 'Citra Dewi', id FROM classes WHERE name = '3B'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '3B-06', 'Dodi Hartono', id FROM classes WHERE name = '3B'
ON CONFLICT (nisn) DO NOTHING;

INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status, paid_date)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'lunas', '2026-07-03'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn IN ('3B-01','3B-03','3B-05') AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;
INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'belum'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn IN ('3B-02','3B-04') AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;
INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'menunggu'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn = '3B-06' AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

-- ============================================
-- KELAS 4A (5 siswa)
-- ============================================
INSERT INTO students (nisn, name, class_id)
SELECT '4A-01', 'Eva Marlina', id FROM classes WHERE name = '4A'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '4A-02', 'Fery Irawan', id FROM classes WHERE name = '4A'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '4A-03', 'Gita Gutawa', id FROM classes WHERE name = '4A'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '4A-04', 'Hendra Gunawan', id FROM classes WHERE name = '4A'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '4A-05', 'Indah Permatasari', id FROM classes WHERE name = '4A'
ON CONFLICT (nisn) DO NOTHING;

INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status, paid_date)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'lunas', '2026-07-01'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn IN ('4A-01','4A-03','4A-05') AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;
INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'belum'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn IN ('4A-02','4A-04') AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

-- ============================================
-- KELAS 4B (5 siswa)
-- ============================================
INSERT INTO students (nisn, name, class_id)
SELECT '4B-01', 'Jasmine Putri', id FROM classes WHERE name = '4B'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '4B-02', 'Kevin Sanjaya', id FROM classes WHERE name = '4B'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '4B-03', 'Larasati Dewi', id FROM classes WHERE name = '4B'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '4B-04', 'Budi Hartono', id FROM classes WHERE name = '4B'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '4B-05', 'Mega Sari', id FROM classes WHERE name = '4B'
ON CONFLICT (nisn) DO NOTHING;

INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status, paid_date)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'lunas', '2026-07-06'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn IN ('4B-01','4B-03','4B-05') AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;
INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'belum'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn IN ('4B-02','4B-04') AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

-- ============================================
-- KELAS 5A (6 siswa)
-- ============================================
INSERT INTO students (nisn, name, class_id)
SELECT '5A-01', 'Nina Zatulini', id FROM classes WHERE name = '5A'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '5A-02', 'Oji Saputra', id FROM classes WHERE name = '5A'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '5A-03', 'Pina Auliani', id FROM classes WHERE name = '5A'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '5A-04', 'Rama Pratama', id FROM classes WHERE name = '5A'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '5A-05', 'Sinta Rahayu', id FROM classes WHERE name = '5A'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '5A-06', 'Teguh Santoso', id FROM classes WHERE name = '5A'
ON CONFLICT (nisn) DO NOTHING;

INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status, paid_date)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'lunas', '2026-07-04'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn IN ('5A-01','5A-03','5A-05') AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;
INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'menunggu'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn IN ('5A-02','5A-04') AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;
INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'belum'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn = '5A-06' AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

-- ============================================
-- KELAS 5B (5 siswa)
-- ============================================
INSERT INTO students (nisn, name, class_id)
SELECT '5B-01', 'Ujang Komarudin', id FROM classes WHERE name = '5B'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '5B-02', 'Via Lestari', id FROM classes WHERE name = '5B'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '5B-03', 'Wildan Syah', id FROM classes WHERE name = '5B'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '5B-04', 'Xena Ardelia', id FROM classes WHERE name = '5B'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '5B-05', 'Yoga Pratama', id FROM classes WHERE name = '5B'
ON CONFLICT (nisn) DO NOTHING;

INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status, paid_date)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'lunas', '2026-07-09'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn IN ('5B-01','5B-03','5B-05') AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;
INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'belum'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn IN ('5B-02','5B-04') AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

-- ============================================
-- KELAS 6A (5 siswa)
-- ============================================
INSERT INTO students (nisn, name, class_id)
SELECT '6A-01', 'Zaki Ahmad', id FROM classes WHERE name = '6A'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '6A-02', 'Ana Safira', id FROM classes WHERE name = '6A'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '6A-03', 'Bani Ardiansyah', id FROM classes WHERE name = '6A'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '6A-04', 'Cici Fatimah', id FROM classes WHERE name = '6A'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '6A-05', 'Deni Mahardika', id FROM classes WHERE name = '6A'
ON CONFLICT (nisn) DO NOTHING;

INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status, paid_date)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'lunas', '2026-07-02'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn IN ('6A-01','6A-03','6A-05') AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;
INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'belum'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn IN ('6A-02','6A-04') AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;

-- ============================================
-- KELAS 6B (5 siswa)
-- ============================================
INSERT INTO students (nisn, name, class_id)
SELECT '6B-01', 'Enung Nurhasanah', id FROM classes WHERE name = '6B'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '6B-02', 'Fadli Ramdhan', id FROM classes WHERE name = '6B'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '6B-03', 'Gina Aulia', id FROM classes WHERE name = '6B'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '6B-04', 'Hasan Basri', id FROM classes WHERE name = '6B'
ON CONFLICT (nisn) DO NOTHING;
INSERT INTO students (nisn, name, class_id)
SELECT '6B-05', 'Ika Nurjanah', id FROM classes WHERE name = '6B'
ON CONFLICT (nisn) DO NOTHING;

INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status, paid_date)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'lunas', '2026-07-07'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn IN ('6B-01','6B-03','6B-05') AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;
INSERT INTO bills (student_id, bill_type_id, academic_year_id, month, year, amount, status)
SELECT s.id, bt.id, ay.id, 'Juli 2026', 2026, 150000, 'belum'
FROM students s, bill_types bt, academic_years ay
WHERE s.nisn IN ('6B-02','6B-04') AND bt.name = 'SPP' AND ay.name = '2025/2026'
ON CONFLICT DO NOTHING;
