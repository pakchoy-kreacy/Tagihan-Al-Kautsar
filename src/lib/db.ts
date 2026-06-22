import { supabase } from './supabase'

export type StatusBayar = 'lunas' | 'belum' | 'menunggu'

export interface RiwayatPembayaran {
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

// Get students by class name
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

    const siswaList: Siswa[] = []

    for (const student of students || []) {
      const { data: bills, error: billsError } = await supabase
        .from('bills')
        .select('*')
        .eq('student_id', student.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false })

      if (billsError) throw billsError

      const typedBills = (bills || []) as Bill[]
      const activeBill = typedBills.find((b: Bill) => b.status !== 'lunas')
      const status: StatusBayar = (activeBill?.status as StatusBayar) || 'lunas'

      siswaList.push({
        id: student.id,
        nisn: student.nisn,
        nama: student.name,
        kelas: className,
        status,
        tagihan: activeBill ? activeBill.month : 'SPP Tidak Ada',
        nominalTagihan: activeBill?.amount || 0,
        riwayat: typedBills.map((b: Bill) => ({
          bulan: b.month,
          tahun: b.year.toString(),
          tanggal: b.paid_date || '–',
          nominal: b.amount,
          status: b.status as StatusBayar,
        })),
      })
    }

    return siswaList
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
    const status: StatusBayar = (activeBill?.status as StatusBayar) || 'lunas'
    const kelas = (student as Record<string, unknown>['classes'] as { name: string })?.name || 'N/A'

    return {
      id: student.id,
      nisn: student.nisn,
      nama: student.name,
      kelas,
      status,
      tagihan: activeBill ? activeBill.month : 'SPP Tidak Ada',
      nominalTagihan: activeBill?.amount || 0,
      riwayat: typedBills.map((b: Bill) => ({
        bulan: b.month,
        tahun: b.year.toString(),
        tanggal: b.paid_date || '–',
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
  return { total, lunas, belum, menunggu }
}

// ============================================
// CRUD SISWA
// ============================================
export async function addSiswa(nisn: string, nama: string, kelas: string): Promise<boolean> {
  try {
    const { data: classData } = await supabase
      .from('classes')
      .select('id')
      .eq('name', kelas)
      .single()

    if (!classData) return false

    const { error } = await supabase
      .from('students')
      .insert({ nisn, name: nama, class_id: classData.id })

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error adding student:', error)
    return false
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

// Get all students (for admin)
export async function getAllStudents(): Promise<Siswa[]> {
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select('id, nisn, name, classes(name)')
      .order('nisn', { ascending: true })

    if (error) throw error

    // noop
    const result: Siswa[] = []

    for (const student of students || []) {
      const kelas = (student.classes as unknown as { name: string })?.name as string || 'N/A'
      result.push({
        id: student.id,
        nisn: student.nisn,
        nama: student.name,
        kelas,
        status: 'lunas',
        tagihan: '-',
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
      status: 'lunas',
      tagihan: '-',
      nominalTagihan: 0,
      riwayat: [],
    }
  } catch (error) {
    console.error('Error fetching student by NISN:', error)
    return undefined
  }
}


