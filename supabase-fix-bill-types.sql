-- Tambah kolom yang mungkin belum ada di bill_types
ALTER TABLE bill_types ADD COLUMN IF NOT EXISTS batas_waktu DATE;
ALTER TABLE bill_types ADD COLUMN IF NOT EXISTS berlaku_untuk_kelas TEXT[];
