-- ============================================
-- ADD ADMIN USERS TABLE (untuk role viewer)
-- ============================================
-- Jalankan di Supabase SQL Editor
-- Setelah itu: buat user demo@gmail.com di Supabase Auth > Add User (pw: demo789)

CREATE TABLE IF NOT EXISTS admin_users (
  email VARCHAR(255) PRIMARY KEY,
  role VARCHAR(20) NOT NULL DEFAULT 'viewer'
    CHECK (role IN ('admin', 'viewer'))
);

-- Insert demo viewer account
INSERT INTO admin_users (email, role) VALUES ('demo@gmail.com', 'viewer')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- NOTES:
-- - role 'admin'  = full akses (tambah/edit/hapus)
-- - role 'viewer' = hanya bisa lihat data
-- - Admin login tetap via Supabase Auth (email/password)
-- - Tambah user baru: INSERT INTO admin_users VALUES ('email@example.com', 'viewer');
-- ============================================
