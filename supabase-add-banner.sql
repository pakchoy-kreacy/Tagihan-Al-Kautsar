-- Tambah kolom banner_url ke school_settings
ALTER TABLE school_settings ADD COLUMN IF NOT EXISTS banner_url TEXT DEFAULT '';

-- Update kebijakan RLS untuk kolom baru (sudah tercakup oleh policy SELECT/UPDATE yang ada)
