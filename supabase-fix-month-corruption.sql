-- ============================================
-- FIX MONTH CORRUPTION IN BILLS TABLE
-- Issue: All bills recorded as "Juni" regardless of actual month
-- Solution: Extract correct month from bill_type.name and update bills
-- ============================================
-- Date: 2025-01-27
-- IMPORTANT: Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: BACKUP (CRITICAL - DO NOT SKIP!)
-- ============================================
CREATE TABLE IF NOT EXISTS bills_backup_20250127 AS SELECT * FROM bills;
CREATE TABLE IF NOT EXISTS bill_types_backup_20250127 AS SELECT * FROM bill_types;

-- Verify backup
DO $$
DECLARE
  bills_count INT;
  bill_types_count INT;
BEGIN
  SELECT COUNT(*) INTO bills_count FROM bills_backup_20250127;
  SELECT COUNT(*) INTO bill_types_count FROM bill_types_backup_20250127;
  RAISE NOTICE 'Backup created: % bills, % bill_types', bills_count, bill_types_count;
END $$;

-- ============================================
-- STEP 2: CREATE CORRECTION MAPPING
-- ============================================
CREATE TEMP TABLE month_correction_map AS
SELECT 
  bt.id as bill_type_id,
  bt.name as bill_type_name,
  CASE 
    WHEN bt.name ILIKE '%januari%' THEN 'Januari'
    WHEN bt.name ILIKE '%februari%' THEN 'Februari'
    WHEN bt.name ILIKE '%maret%' THEN 'Maret'
    WHEN bt.name ILIKE '%april%' THEN 'April'
    WHEN bt.name ILIKE '%mei%' THEN 'Mei'
    WHEN bt.name ILIKE '%juni%' THEN 'Juni'
    WHEN bt.name ILIKE '%juli%' THEN 'Juli'
    WHEN bt.name ILIKE '%agustus%' THEN 'Agustus'
    WHEN bt.name ILIKE '%september%' THEN 'September'
    WHEN bt.name ILIKE '%oktober%' THEN 'Oktober'
    WHEN bt.name ILIKE '%november%' THEN 'November'
    WHEN bt.name ILIKE '%desember%' THEN 'Desember'
    ELSE NULL
  END as correct_month
FROM bill_types bt
WHERE bt.name ILIKE 'SPP%';

-- Display mapping for verification
SELECT 
  bill_type_name,
  correct_month,
  CASE 
    WHEN correct_month IS NULL THEN '⚠ No month found'
    ELSE '✓ Mapped'
  END as status
FROM month_correction_map
ORDER BY bill_type_name;

-- ============================================
-- STEP 3: SHOW BEFORE STATE
-- ============================================
SELECT 
  'BEFORE CORRECTION' as stage,
  bt.name as bill_type_name,
  b.month as current_month_in_bills,
  COUNT(b.id) as total_bills
FROM bill_types bt
LEFT JOIN bills b ON bt.id = b.bill_type_id
WHERE bt.name ILIKE 'SPP%'
GROUP BY bt.name, b.month
ORDER BY bt.name;

-- ============================================
-- STEP 4: APPLY CORRECTION
-- ============================================
WITH update_result AS (
  UPDATE bills b
  SET month = mcm.correct_month
  FROM month_correction_map mcm
  WHERE b.bill_type_id = mcm.bill_type_id
    AND mcm.correct_month IS NOT NULL
    AND b.month != mcm.correct_month  -- Only update if different
  RETURNING b.id
)
SELECT COUNT(*) as rows_updated FROM update_result;

-- ============================================
-- STEP 5: VERIFY CORRECTION
-- ============================================
SELECT 
  'AFTER CORRECTION' as stage,
  bt.name as bill_type_name,
  b.month as corrected_month,
  COUNT(b.id) as total_bills,
  CASE 
    WHEN bt.name ILIKE '%' || b.month || '%' THEN '✓ Correct'
    ELSE '✗ Still wrong'
  END as validation_status
FROM bill_types bt
LEFT JOIN bills b ON bt.id = b.bill_type_id
WHERE bt.name ILIKE 'SPP%'
GROUP BY bt.name, b.month
ORDER BY bt.name;

-- ============================================
-- STEP 6: FINAL DISTRIBUTION CHECK
-- ============================================
SELECT 
  b.month,
  COUNT(b.id) as total_bills,
  COUNT(DISTINCT b.student_id) as unique_students,
  STRING_AGG(DISTINCT bt.name, ', ' ORDER BY bt.name) as bill_types
FROM bills b
JOIN bill_types bt ON b.bill_type_id = bt.id
WHERE bt.name ILIKE 'SPP%'
GROUP BY b.month
ORDER BY 
  CASE b.month
    WHEN 'Januari' THEN 1
    WHEN 'Februari' THEN 2
    WHEN 'Maret' THEN 3
    WHEN 'April' THEN 4
    WHEN 'Mei' THEN 5
    WHEN 'Juni' THEN 6
    WHEN 'Juli' THEN 7
    WHEN 'Agustus' THEN 8
    WHEN 'September' THEN 9
    WHEN 'Oktober' THEN 10
    WHEN 'November' THEN 11
    WHEN 'Desember' THEN 12
    ELSE 99
  END;

-- ============================================
-- ROLLBACK SCRIPT (Use if something goes wrong)
-- ============================================
-- UNCOMMENT AND RUN BELOW IF YOU NEED TO ROLLBACK:
-- DROP TABLE IF EXISTS bills;
-- ALTER TABLE bills_backup_20250127 RENAME TO bills;
-- DROP TABLE IF EXISTS bill_types;
-- ALTER TABLE bill_types_backup_20250127 RENAME TO bill_types;
-- ============================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✓ Month corruption fix completed!';
  RAISE NOTICE 'Check the query results above to verify all months are now correct.';
  RAISE NOTICE 'Backup tables: bills_backup_20250127, bill_types_backup_20250127';
END $$;
