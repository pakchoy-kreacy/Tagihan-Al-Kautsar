-- ============================================
-- FIX STORAGE RLS POLICY - ALLOW PUBLIC UPLOAD
-- ============================================
-- Jalankan di Supabase SQL Editor untuk fix upload error

-- Hapus policy lama jika ada
DROP POLICY IF EXISTS "Public can upload bukti" ON storage.objects;
DROP POLICY IF EXISTS "Public can view bukti" ON storage.objects;

-- 1. POLICY: Public bisa VIEW/SELECT bukti yang sudah diupload
CREATE POLICY "Public can view bukti"
ON storage.objects FOR SELECT
USING (bucket_id = 'bukti-pembayaran');

-- 2. POLICY: Public bisa INSERT/UPLOAD
-- NOTE: Folder path 'bukti/' atau 'infaq/' sudah dihandle di code upload
-- File size limit sudah divalidasi client-side (5MB) & server-side Supabase (10MB)
CREATE POLICY "Public can upload bukti"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'bukti-pembayaran'
  AND (storage.foldername(name))[1] IN ('bukti', 'infaq')
);

-- 3. POLICY: Authenticated users (admin) bisa DELETE bukti
CREATE POLICY "Authenticated can delete bukti"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'bukti-pembayaran'
  AND auth.role() = 'authenticated'
);

-- ============================================
-- NOTES:
-- - Public users (siswa/orang tua) sekarang bisa upload tanpa login
-- - Upload dibatasi max 5MB per file
-- - Hanya admin authenticated yang bisa hapus file
-- - Semua orang bisa view/download bukti (untuk verifikasi)
-- ============================================
