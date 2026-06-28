-- ============================================
-- ADD ASSIGNMENT MODE & APPLICABLE MONTHS COLUMNS
-- Purpose: Support flexible bill type creation (auto-generate vs manual)
-- ============================================
-- Date: 2025-01-27
-- Run this in Supabase SQL Editor AFTER running supabase-fix-month-corruption.sql

-- ============================================
-- STEP 1: ADD NEW COLUMNS
-- ============================================
ALTER TABLE bill_types 
ADD COLUMN IF NOT EXISTS assignment_mode VARCHAR(10) DEFAULT 'manual';

ALTER TABLE bill_types 
ADD COLUMN IF NOT EXISTS applicable_months TEXT[];

-- ============================================
-- STEP 2: MIGRATE EXISTING DATA
-- ============================================
-- Set existing SPP bill types to have their respective months
UPDATE bill_types 
SET 
  assignment_mode = 'manual',
  applicable_months = ARRAY[
    CASE 
      WHEN name ILIKE '%januari%' THEN 'Januari'
      WHEN name ILIKE '%februari%' THEN 'Februari'
      WHEN name ILIKE '%maret%' THEN 'Maret'
      WHEN name ILIKE '%april%' THEN 'April'
      WHEN name ILIKE '%mei%' THEN 'Mei'
      WHEN name ILIKE '%juni%' THEN 'Juni'
      WHEN name ILIKE '%juli%' THEN 'Juli'
      WHEN name ILIKE '%agustus%' THEN 'Agustus'
      WHEN name ILIKE '%september%' THEN 'September'
      WHEN name ILIKE '%oktober%' THEN 'Oktober'
      WHEN name ILIKE '%november%' THEN 'November'
      WHEN name ILIKE '%desember%' THEN 'Desember'
    END
  ]
WHERE name ILIKE 'SPP%' 
  AND is_recurring = true
  AND applicable_months IS NULL;

-- ============================================
-- STEP 3: VERIFY MIGRATION
-- ============================================
SELECT 
  name,
  assignment_mode,
  applicable_months,
  is_recurring
FROM bill_types
WHERE name ILIKE 'SPP%'
ORDER BY name;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Schema update completed successfully!';
  RAISE NOTICE 'New columns added: assignment_mode, applicable_months';
  RAISE NOTICE 'Existing SPP bill types migrated to manual mode with proper months';
END $$;
