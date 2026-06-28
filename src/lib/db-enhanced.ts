import { supabase } from './supabase'

// Enhanced function for creating bill types with flexible month generation
export async function createBillTypeWithGeneration(payload: {
  name: string
  description: string
  default_amount: number
  assignment_mode: 'auto' | 'manual'
  applicable_months: string[]
  year: number
  batas_waktu?: string
  berlaku_untuk_kelas?: string[]
}): Promise<{ 
  success: boolean
  billType?: { id: string }
  billsGenerated: number
  error?: string
  message?: string
}> {
  try {
    // For manual mode, validate month in name
    if (payload.assignment_mode === 'manual') {
      const extractedMonth = extractMonthFromName(payload.name)
      if (!extractedMonth) {
        return { 
          success: false,
          billsGenerated: 0,
          error: 'Mode manual: Nama tagihan harus include nama bulan (contoh: SPP Januari)' 
        }
      }
      payload.applicable_months = [extractedMonth]
    }
    
    // Validate auto mode has months
    if (payload.assignment_mode === 'auto' && payload.applicable_months.length === 0) {
      return {
        success: false,
        billsGenerated: 0,
        error: 'Mode auto: Pilih minimal 1 bulan'
      }
    }
    
    // Create bill type
    const { data: billType, error: btError } = await supabase
      .from('bill_types')
      .insert({
        name: payload.name,
        description: payload.description,
        default_amount: payload.default_amount,
        is_recurring: true,
        assignment_mode: payload.assignment_mode,
        applicable_months: payload.applicable_months,
        batas_waktu: payload.batas_waktu,
        berlaku_untuk_kelas: payload.berlaku_untuk_kelas
      })
      .select('id')
      .single()
    
    if (btError) throw btError
    if (!billType) throw new Error('Failed to get bill type ID')
    
    // Get students
    const { data: students } = await supabase
      .from('students')
      .select('id, class_id, classes(name)')
    
    if (!students || students.length === 0) {
      return { 
        success: true, 
        billType, 
        billsGenerated: 0,
        message: 'Tagihan dibuat, tapi tidak ada siswa untuk digenerate.'
      }
    }
    
    // Filter by kelas if specified
    let targetStudents = students
    if (payload.berlaku_untuk_kelas && payload.berlaku_untuk_kelas.length > 0) {
      targetStudents = students.filter(s => {
        const className = (s.classes as unknown as { name: string } | null)?.name || ''
        return className && payload.berlaku_untuk_kelas?.includes(className)
      })
    }
    
    if (targetStudents.length === 0) {
      return {
        success: true,
        billType,
        billsGenerated: 0,
        message: 'Tagihan dibuat, tapi tidak ada siswa yang cocok dengan kelas terpilih.'
      }
    }
    
    // Get active academic year ID (UUID)
    const { data: yearData } = await supabase
      .from('academic_years')
      .select('id')
      .eq('is_active', true)
      .single()
    if (!yearData) throw new Error('No active academic year found')
    const activeYearId = yearData.id
    
    // Generate bills for selected months
    const billsToInsert = []
    for (const student of targetStudents) {
      for (const month of payload.applicable_months) {
        billsToInsert.push({
          student_id: student.id,
          bill_type_id: billType.id,
          academic_year_id: activeYearId,
          month: month,
          year: payload.year,
          amount: payload.default_amount,
          status: 'belum'
        })
      }
    }
    
    // Insert bills
    if (billsToInsert.length > 0) {
      const { error: billsError } = await supabase
        .from('bills')
        .insert(billsToInsert)
      
      if (billsError) {
        console.error('Bills generation error:', billsError)
        // Clean up orphan bill type
        await supabase.from('bill_types').delete().eq('id', billType.id)
        return { 
          success: false, 
          billsGenerated: 0,
          error: 'Gagal membuat tagihan siswa: ' + billsError.message
        }
      }
    }
    
    return { 
      success: true, 
      billType, 
      billsGenerated: billsToInsert.length,
      message: `${billsToInsert.length} tagihan siswa dibuat (${targetStudents.length} siswa × ${payload.applicable_months.length} bulan)`
    }
    
  } catch (error) {
    console.error('Error creating bill type:', error)
    return { 
      success: false, 
      billsGenerated: 0,
      error: 'Failed to create bill type' 
    }
  }
}

// Helper function to extract month from name
function extractMonthFromName(name: string): string | null {
  const nameLower = name.toLowerCase()
  const monthMap: Record<string, string> = {
    'januari': 'Januari',
    'februari': 'Februari',
    'maret': 'Maret',
    'april': 'April',
    'mei': 'Mei',
    'juni': 'Juni',
    'juli': 'Juli',
    'agustus': 'Agustus',
    'september': 'September',
    'oktober': 'Oktober',
    'november': 'November',
    'desember': 'Desember'
  }
  
  for (const [key, value] of Object.entries(monthMap)) {
    if (nameLower.includes(key)) {
      return value
    }
  }
  
  return null
}
