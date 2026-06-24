import { supabase } from './supabase'

export type StatusBayar = 'lunas' | 'belum' | 'menunggu' | 'tidak_ada_tagihan'

export interface RiwayatPembayaran {
  id: string
  bulan: string
  tahun: string
  tanggal: string
  nominal: number
  status: StatusBayar
}

export interface Siswa {
  id: string
  nisn: string
  nama: string
  kelas: string
  status: StatusBayar
  tagihan: string
  nominalTagihan: number
  riwayat: RiwayatPembayaran[]
}

export interface KelasData {
  id: string
  name: string
}

interface Bill {
  id: string
  student_id: string
  bill_type_id: string
  academic_year_id: string
  month: string
  year: number
  amount: number
  status: string
  paid_date: string | null
}

// Get all classes
export async function getAllClasses(): Promise<KelasData[]> {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('id, name')
      .order('name', { ascending: true })

    if (error) throw error
    return (data || []) as KelasData[]
  } catch (error) {
    console.error('Error fetching classes:', error)
    return []
  }
}

// Get active academic year
export async function getActiveYear(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('academic_years')
      .select('name')
      .eq('is_active', true)
      .single()

    if (error) throw error
    return (data as { name: string })?.name || '2025/2026'
  } catch {
    return '2025/2026'
  }
}

// Get students by class name (optimized: single query with join)
export async function getStudentsByClass(className: string): Promise<Siswa[]> {
  try {
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id')
      .eq('name', className)
      .single()

    if (classError) throw classError
    if (!classData) return []

    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, nisn, name')
      .eq('class_id', classData.id)
      .order('nisn', { ascending: true })

    if (studentsError) throw studentsError
    if (!students || students.length === 0) return []

    const studentIds = students.map((s: { id: string }) => s.id)

    const { data: bills, error: billsError } = await supabase
      .from('bills')
      .select('*')
      .in('student_id', studentIds)
      .order('year', { ascending: false })
      .order('month', { ascending: false })

    if (billsError) throw billsError

    const billsByStudent = new Map<string, Bill[]>()
    for (const bill of (bills || []) as Bill[]) {
      const list = billsByStudent.get(bill.student_id) || []
      list.push(bill)
      billsByStudent.set(bill.student_id, list)
    }

    return students.map((student: { id: string; nisn: string; name: string }) => {
      const typedBills = billsByStudent.get(student.id) || []
      const activeBill = typedBills.find((b: Bill) => b.status !== 'lunas')
      let status: StatusBayar
      if (typedBills.length === 0) {
        status = 'tidak_ada_tagihan'
      } else if (activeBill) {
        status = activeBill.status as StatusBayar
      } else {
        status = 'lunas'
      }

      return {
        id: student.id,
        nisn: student.nisn,
        nama: student.name,
        kelas: className,
        status,
        tagihan: activeBill ? activeBill.month : 'Tidak Ada Tagihan',
        nominalTagihan: activeBill?.amount || 0,
        riwayat: typedBills.map((b: Bill) => ({
          id: b.id,
          bulan: b.month,
          tahun: b.year.toString(),
          tanggal: b.paid_date || 'Belum dibayar',
          nominal: b.amount,
          status: b.status as StatusBayar,
        })),
      }
    })
  } catch (error) {
    console.error('Error fetching students by class:', error)
    return []
  }
}

// Get student by ID
export async function getSiswaById(id: string): Promise<Siswa | undefined> {
  try {
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, nisn, name, classes(name)')
      .eq('id', id)
      .single()

    if (studentError) throw studentError
    if (!student) return undefined

    const { data: bills, error: billsError } = await supabase
      .from('bills')
      .select('*')
      .eq('student_id', id)
      .order('year', { ascending: false })
      .order('month', { ascending: false })

    if (billsError) throw billsError

    const typedBills = (bills || []) as Bill[]
    const activeBill = typedBills.find((b: Bill) => b.status !== 'lunas')
    let status: StatusBayar
    if (typedBills.length === 0) {
      status = 'tidak_ada_tagihan'
    } else if (activeBill) {
      status = activeBill.status as StatusBayar
    } else {
      status = 'lunas'
    }
    const kelas = (student.classes as unknown as { name: string })?.name as string || 'N/A'

    return {
      id: student.id,
      nisn: student.nisn,
      nama: student.name,
      kelas,
      status,
      tagihan: activeBill ? activeBill.month : 'Tidak Ada Tagihan',
      nominalTagihan: activeBill?.amount || 0,
      riwayat: typedBills.map((b: Bill) => ({
        id: b.id,
        bulan: b.month,
        tahun: b.year.toString(),
        tanggal: b.paid_date || 'Belum dibayar',
        nominal: b.amount,
        status: b.status as StatusBayar,
      })),
    }
  } catch (error) {
    console.error('Error fetching student by ID:', error)
    return undefined
  }
}

// Format Rupiah
export function formatRupiah(nominal: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(nominal)
}

// Get class statistics
export function getStatKelas(siswaList: Siswa[]) {
  const total = siswaList.length
  const lunas = siswaList.filter((s: Siswa) => s.status === 'lunas').length
  const belum = siswaList.filter((s: Siswa) => s.status === 'belum').length
  const menunggu = siswaList.filter((s: Siswa) => s.status === 'menunggu').length
  const tidakAdaTagihan = siswaList.filter((s: Siswa) => s.status === 'tidak_ada_tagihan').length
  return { total, lunas, belum, menunggu, tidakAdaTagihan }
}

// ============================================
// CRUD SISWA
// ============================================

// Ensure a class exists by name, create if missing. Returns class id or null.
export async function ensureKelas(name: string): Promise<string | null> {
  try {
    const { data: existing } = await supabase
      .from('classes')
      .select('id')
      .eq('name', name)
      .maybeSingle()

    if (existing) return existing.id

    // Auto-create the class
    const grade = parseInt(name.charAt(0)) || 0
    const section = name.charAt(1)?.toUpperCase() || ''

    const { data: yearData } = await supabase
      .from('academic_years')
      .select('id')
      .eq('is_active', true)
      .single()

    const { data: newClass, error } = await supabase
      .from('classes')
      .insert({
        name,
        grade,
        section,
        academic_year_id: yearData?.id || null,
      })
      .select('id')
      .single()

    if (error) throw error
    return newClass?.id || null
  } catch (error) {
    console.error('Error ensuring class:', error)
    return null
  }
}

export async function addSiswa(nisn: string, nama: string, kelas: string): Promise<boolean> {
  try {
    const classId = await ensureKelas(kelas)
    if (!classId) return false

    const { data: inserted, error } = await supabase
      .from('students')
      .insert({ nisn, name: nama, class_id: classId })
      .select('id')
      .single()

    if (error) throw error
    if (!inserted) throw new Error("Gagal mendapatkan ID siswa")

    // Auto-generate bills for the new student
    await generateBillsForStudent(inserted.id, kelas)

    return true
  } catch (error) {
    console.error('Error adding student:', error)
    return false
  }
}

// Returns detailed result for import: { success, error? }
export async function addSiswaDetailed(nisn: string, nama: string, kelas: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!nisn || !nama || !kelas) return { success: false, error: "Data tidak lengkap" }

    const classId = await ensureKelas(kelas)
    if (!classId) return { success: false, error: "Gagal membuat/menemukan kelas" }

    const { data: inserted, error } = await supabase
      .from('students')
      .insert({ nisn, name: nama, class_id: classId })
      .select('id')
      .single()

    if (error) {
      if (error.code === '23505') return { success: false, error: "NISN sudah terdaftar" }
      throw error
    }

    if (!inserted) return { success: false, error: "Gagal mendapatkan ID siswa" }

    // Auto-generate bills for the new student
    await generateBillsForStudent(inserted.id, kelas)

    return { success: true }
  } catch (error) {
    console.error('Error adding student:', error)
    return { success: false, error: "Error database" }
  }
}

export async function updateSiswa(id: string, data: { nisn?: string; name?: string; class_id?: string }): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('students')
      .update(data)
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating student:', error)
    return false
  }
}

export async function deleteSiswa(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting student:', error)
    return false
  }
}

// ============================================
// MARK BILL AS PAID (manual by admin)
// ============================================
export async function markBillAsPaid(billId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('bills')
      .update({ status: 'lunas', paid_date: new Date().toISOString().split('T')[0] })
      .eq('id', billId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error marking bill as paid:', error)
    return false
  }
}

// ============================================
// CRUD KELAS
// ============================================
export async function addKelas(name: string): Promise<boolean> {
  try {
    const grade = parseInt(name.charAt(0))
    const section = name.charAt(1).toUpperCase()

    const { data: yearData } = await supabase
      .from('academic_years')
      .select('id')
      .eq('is_active', true)
      .single()

    const { error } = await supabase
      .from('classes')
      .insert({
        name,
        grade,
        section,
        academic_year_id: yearData?.id || null,
      })

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error adding class:', error)
    return false
  }
}

export async function deleteKelas(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting class:', error)
    return false
  }
}

// Get all students with bill info (for admin)
export async function getAllStudentsWithBills(): Promise<Siswa[]> {
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select('id, nisn, name, classes(name)')
      .order('nisn', { ascending: true })

    if (error) throw error
    if (!students || students.length === 0) return []

    const studentIds = students.map((s: { id: string }) => s.id)

    const { data: bills, error: billsError } = await supabase
      .from('bills')
      .select('*')
      .in('student_id', studentIds)
      .order('year', { ascending: false })
      .order('month', { ascending: false })

    if (billsError) throw billsError

    const billsByStudent = new Map<string, Bill[]>()
    for (const bill of (bills || []) as Bill[]) {
      const list = billsByStudent.get(bill.student_id) || []
      list.push(bill)
      billsByStudent.set(bill.student_id, list)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return students.map((student: any) => {
      const typedBills = billsByStudent.get(student.id) || []
      const activeBill = typedBills.find((b: Bill) => b.status !== 'lunas')
      let status: StatusBayar
      if (typedBills.length === 0) {
        status = 'tidak_ada_tagihan'
      } else if (activeBill) {
        status = activeBill.status as StatusBayar
      } else {
        status = 'lunas'
      }
      const kelas = student.classes?.name || student.classes?.[0]?.name || 'N/A'

      return {
        id: student.id,
        nisn: student.nisn,
        nama: student.name,
        kelas,
        status,
        tagihan: activeBill ? activeBill.month : 'Tidak Ada Tagihan',
        nominalTagihan: activeBill?.amount || 0,
        riwayat: typedBills.map((b: Bill) => ({
          id: b.id,
          bulan: b.month,
          tahun: b.year.toString(),
          tanggal: b.paid_date || 'Belum dibayar',
          nominal: b.amount,
          status: b.status as StatusBayar,
        })),
      }
    })
  } catch (error) {
    console.error('Error fetching all students:', error)
    return []
  }
}

// Get all students without bills (legacy admin list)
export async function getAllStudents(): Promise<Siswa[]> {
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select('id, nisn, name, classes(name)')
      .order('nisn', { ascending: true })

    if (error) throw error

    const result: Siswa[] = []
    for (const student of students || []) {
    const kelas = (student as unknown as { classes?: { name?: string } })?.classes?.name || 'N/A'
      result.push({
        id: student.id,
        nisn: student.nisn,
        nama: student.name,
        kelas,
        status: 'tidak_ada_tagihan',
        tagihan: 'Tidak Ada Tagihan',
        nominalTagihan: 0,
        riwayat: [],
      })
    }
    return result
  } catch (error) {
    console.error('Error fetching all students:', error)
    return []
  }
}

export async function getSiswaByNisn(nisn: string): Promise<Siswa | undefined> {
  try {
    const { data: student, error } = await supabase
      .from('students')
      .select('id, nisn, name, classes(name)')
      .eq('nisn', nisn)
      .single()

    if (error || !student) return undefined

    return {
      id: student.id,
      nisn: student.nisn,
      nama: student.name,
      kelas: (student.classes as unknown as { name: string })?.name as string || 'N/A',
      status: 'tidak_ada_tagihan',
      tagihan: 'Tidak Ada Tagihan',
      nominalTagihan: 0,
      riwayat: [],
    }
  } catch (error) {
    console.error('Error fetching student by NISN:', error)
    return undefined
  }
}

// ============================================
// CRUD BILL TYPES
// ============================================
export interface BillType {
  id: string
  name: string
  description: string
  default_amount: number
  is_recurring: boolean
  batas_waktu: string | null
  berlaku_untuk_kelas: string[] | null
}

export async function getAllBillTypes(): Promise<BillType[]> {
  try {
    const { data, error } = await supabase
      .from('bill_types')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return (data || []) as BillType[]
  } catch (error) {
    console.error('Error fetching bill types:', error)
    return []
  }
}

export async function addBillType(name: string, description: string, default_amount: number, is_recurring: boolean, batas_waktu?: string, berlaku_untuk_kelas?: string[]): Promise<{ success: boolean; billsGenerated?: number; error?: string }> {
  try {
    const payload: Record<string, unknown> = {
      name,
      description,
      default_amount,
      is_recurring,
    }
    if (batas_waktu) payload.batas_waktu = batas_waktu
    if (berlaku_untuk_kelas && berlaku_untuk_kelas.length > 0) payload.berlaku_untuk_kelas = berlaku_untuk_kelas

    const { data: inserted, error } = await supabase
      .from('bill_types')
      .insert(payload)
      .select('id')
      .single()

    if (error) throw error
    if (!inserted) throw new Error("Gagal mendapatkan ID tagihan")

    // Auto-generate bills for current month/year
    const now = new Date()
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
    const monthLabel = `${monthNames[now.getMonth()]} ${now.getFullYear()}`
    const year = now.getFullYear()

    const generated = await generateBillsForBillType(inserted.id, monthLabel, year)

    return { success: true, billsGenerated: generated.count }
  } catch (error) {
    console.error('Error adding bill type:', error)
    return { success: false, error: "Gagal menambah tagihan" }
  }
}

async function generateBillsForBillType(billTypeId: string, month: string, year: number): Promise<{ count: number }> {
  try {
    const [{ data: billType }, { data: yearData }, { data: students }] = await Promise.all([
      supabase.from('bill_types').select('*').eq('id', billTypeId).single(),
      supabase.from('academic_years').select('id').eq('is_active', true).single(),
      supabase.from('students').select('id, classes(name)'),
    ])

    if (!billType || !yearData || !students) return { count: 0 }

    const applicableClasses = (billType.berlaku_untuk_kelas || []) as string[]
    const billsToInsert = []

    for (const student of students) {
      const className = (student.classes as unknown as { name: string })?.name || ''
      if (applicableClasses.length > 0 && !applicableClasses.includes(className)) continue

      billsToInsert.push({
        student_id: student.id,
        bill_type_id: billTypeId,
        academic_year_id: yearData.id,
        month,
        year,
        amount: billType.default_amount as number,
        status: 'belum',
      })
    }

    if (billsToInsert.length === 0) return { count: 0 }

    const { error } = await supabase
      .from('bills')
      .upsert(billsToInsert, {
        onConflict: 'student_id,bill_type_id,month,year',
        ignoreDuplicates: true,
      })

    if (error) throw error
    return { count: billsToInsert.length }
  } catch (error) {
    console.error('Error generating bills for bill type:', error)
    return { count: 0 }
  }
}

async function generateBillsForStudent(studentId: string, className: string): Promise<{ count: number }> {
  try {
    const now = new Date()
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
    const monthLabel = `${monthNames[now.getMonth()]} ${now.getFullYear()}`
    const year = now.getFullYear()

    const [{ data: billTypes }, { data: yearData }] = await Promise.all([
      supabase.from('bill_types').select('*'),
      supabase.from('academic_years').select('id').eq('is_active', true).single(),
    ])

    if (!billTypes || !yearData) return { count: 0 }

    const billsToInsert = []
    for (const bt of billTypes) {
      const applicableClasses = (bt.berlaku_untuk_kelas || []) as string[]
      if (applicableClasses.length > 0 && !applicableClasses.includes(className)) continue

      billsToInsert.push({
        student_id: studentId,
        bill_type_id: bt.id,
        academic_year_id: yearData.id,
        month: monthLabel,
        year,
        amount: bt.default_amount as number,
        status: 'belum',
      })
    }

    if (billsToInsert.length === 0) return { count: 0 }

    const { error } = await supabase
      .from('bills')
      .upsert(billsToInsert, {
        onConflict: 'student_id,bill_type_id,month,year',
        ignoreDuplicates: true,
      })

    if (error) throw error
    return { count: billsToInsert.length }
  } catch (error) {
    console.error('Error generating bills for student:', error)
    return { count: 0 }
  }
}

export async function updateBillType(id: string, data: { name?: string; description?: string; default_amount?: number; is_recurring?: boolean; batas_waktu?: string | null; berlaku_untuk_kelas?: string[] | null }): Promise<boolean> {
  try {
    // Only include fields that are defined to avoid errors if columns don't exist yet
    const payload: Record<string, unknown> = {}
    if (data.name !== undefined) payload.name = data.name
    if (data.description !== undefined) payload.description = data.description
    if (data.default_amount !== undefined) payload.default_amount = data.default_amount
    if (data.is_recurring !== undefined) payload.is_recurring = data.is_recurring
    if (data.batas_waktu !== undefined) payload.batas_waktu = data.batas_waktu
    if (data.berlaku_untuk_kelas !== undefined) payload.berlaku_untuk_kelas = data.berlaku_untuk_kelas

    const { error } = await supabase.from('bill_types').update(payload).eq('id', id)
    if (error) {
      console.error('Supabase update bill type error:', error.message, error.details)
      throw error
    }
    return true
  } catch (error) {
    console.error('Error updating bill type:', error)
    return false
  }
}

export async function deleteBillType(id: string): Promise<boolean> {
  try {
    // Hapus semua tagihan siswa yang terkait dengan jenis tagihan ini
    const { error: billsError } = await supabase.from('bills').delete().eq('bill_type_id', id)
    if (billsError) throw billsError

    const { error } = await supabase.from('bill_types').delete().eq('id', id)
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting bill type:', error)
    return false
  }
}

// ============================================
// GENERATE BILLS FROM BILL TYPES
// ============================================
export async function generateBills(month: string, year: number): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const { data: yearData, error: yearError } = await supabase
      .from('academic_years')
      .select('id')
      .eq('is_active', true)
      .single()

    if (yearError || !yearData) {
      return { success: false, count: 0, error: "Tahun ajaran aktif tidak ditemukan" }
    }

    const { data: billTypes, error: btError } = await supabase.from('bill_types').select('*')
    if (btError) throw btError
    if (!billTypes || billTypes.length === 0) {
      return { success: false, count: 0, error: "Belum ada jenis tagihan" }
    }

    const { data: students, error: stError } = await supabase
      .from('students')
      .select('id, classes(name)')

    if (stError) throw stError
    if (!students || students.length === 0) {
      return { success: false, count: 0, error: "Belum ada siswa" }
    }

    const billsToInsert = []
    for (const bt of billTypes) {
      const applicableClasses = bt.berlaku_untuk_kelas
      for (const student of students) {
        const className = (student.classes as unknown as { name: string })?.name || ''
        if (applicableClasses && applicableClasses.length > 0 && !applicableClasses.includes(className)) {
          continue
        }
        billsToInsert.push({
          student_id: student.id,
          bill_type_id: bt.id,
          academic_year_id: yearData.id,
          month,
          year,
          amount: bt.default_amount,
          status: 'belum',
        })
      }
    }

    if (billsToInsert.length === 0) {
      return { success: true, count: 0 }
    }

    const { error } = await supabase
      .from('bills')
      .upsert(billsToInsert, {
        onConflict: 'student_id,bill_type_id,month,year',
        ignoreDuplicates: true,
      })

    if (error) throw error

    return { success: true, count: billsToInsert.length }
  } catch (error) {
    console.error('Error generating bills:', error)
    return { success: false, count: 0, error: "Gagal generate tagihan" }
  }
}
