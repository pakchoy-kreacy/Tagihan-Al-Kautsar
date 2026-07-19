import { supabase } from './supabase'
import { getBulanNumber } from './db'

export interface AdminStats {
  totalSiswa: number
  totalKelas: number
  lunas: number
  belum: number
  menunggu: number
  dicicil: number
  totalInfaq: number
}

export interface RecentPayment {
  id: string
  nama: string
  kelas: string
  bulan: string
  nominal: number
  tanggal: string
}

export interface PendingPayment {
  id: string
  student_id: string
  nama: string
  nisn: string
  kelas: string
  bulan: string
  nominal: number
  nama_pengirim: string
  jumlah_transfer: number
  created_at: string
}

export interface PendingDonation {
  id: string
  nama_donatur: string
  nominal: number
  pesan: string
  created_at: string
}

export interface UnpaidStudent {
  id: string
  nisn: string
  nama: string
  kelas: string
  tagihan: string
  nominalTagihan: number
}

export interface KelasWithStats {
  id: string
  name: string
  totalSiswa: number
  tunggakan: number
}

// ============================================
// EXTENDED STATISTICS (6 cards)
// ============================================
export async function getAdminStats(): Promise<AdminStats> {
  try {
    // Get active academic year
    const { data: yearData } = await supabase
      .from('academic_years').select('id').eq('is_active', true).maybeSingle()

    // Get all class IDs for the active year
    let classIds: string[] = []
    if (yearData) {
      const { data: classes } = await supabase
        .from('classes').select('id').eq('academic_year_id', yearData.id)
      classIds = (classes || []).map(c => c.id)
    }

    // Get student IDs in those classes
    let studentIds: string[] = []
    if (classIds.length > 0) {
      const { data: students } = await supabase
        .from('students').select('id').in('class_id', classIds)
      studentIds = (students || []).map(s => s.id)
    }

    // Count stats
    const totalSiswa = studentIds.length
    const totalKelas = classIds.length

    // Count bills by status for these students
    let lunas = 0, belum = 0, menunggu = 0, dicicil = 0
    if (studentIds.length > 0) {
      const [lRes, bRes, mRes, dRes] = await Promise.all([
        supabase.from('bills').select('*', { count: 'exact', head: true }).eq('status', 'lunas').in('student_id', studentIds),
        supabase.from('bills').select('*', { count: 'exact', head: true }).eq('status', 'belum').in('student_id', studentIds),
        supabase.from('bills').select('*', { count: 'exact', head: true }).eq('status', 'menunggu').in('student_id', studentIds),
        supabase.from('bills').select('*', { count: 'exact', head: true }).eq('status', 'dicicil').in('student_id', studentIds),
      ])
      lunas = lRes.count || 0
      belum = bRes.count || 0
      menunggu = mRes.count || 0
      dicicil = dRes.count || 0
    }

    // Count ALL donations (no status filter - infaq is auto-approved)
    const { data: infaqData } = await supabase
      .from('donations').select('nominal')
    const totalInfaq = infaqData?.reduce((sum, d) => sum + (d.nominal || 0), 0) || 0

    return { totalSiswa, totalKelas, lunas, belum, menunggu, dicicil, totalInfaq }
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return { totalSiswa: 0, totalKelas: 0, lunas: 0, belum: 0, menunggu: 0, dicicil: 0, totalInfaq: 0 }
  }
}

// ============================================
// KELAS WITH STATS (for card grid)
// ============================================
export async function getKelasWithStats(): Promise<KelasWithStats[]> {
  try {
    const { data: classes, error } = await supabase
      .from('classes')
      .select('id, name')
      .order('name', { ascending: true })

    if (error) throw error
    if (!classes) return []

    const studentCounts = await Promise.all(
      classes.map(async (c) => {
        const { count } = await supabase
          .from('students').select('*', { count: 'exact', head: true })
          .eq('class_id', c.id)
        return { id: c.id, count: count || 0 }
      })
    )

    const unpaidCounts = await Promise.all(
      classes.map(async (c) => {
        // Get student IDs in this class first
        const { data: classStudents } = await supabase
          .from('students').select('id').eq('class_id', c.id)
        const studentIds = (classStudents || []).map(s => s.id)
        if (studentIds.length === 0) return { id: c.id, count: 0 }

        const { count } = await supabase
          .from('bills').select('*', { count: 'exact', head: true })
.in('status', ['belum', 'menunggu', 'dicicil'])
          .in('student_id', studentIds)
        return { id: c.id, count: count || 0 }
      })
    )

    return classes.map((c, i) => ({
      id: c.id,
      name: c.name,
      totalSiswa: studentCounts[i].count,
      tunggakan: unpaidCounts[i].count,
    }))
  } catch (error) {
    console.error('Error fetching kelas stats:', error)
    return []
  }
}

// ============================================
// RECENT PAYMENTS (approved bills)
// ============================================
export async function getRecentPayments(limit = 10): Promise<RecentPayment[]> {
  try {
    const { data, error } = await supabase
      .from('bills')
      .select(`
        id, month, amount, paid_date,
        students!inner(name),
        classes!inner(name)
      `)
      .eq('status', 'lunas')
      .not('paid_date', 'is', null)
      .order('paid_date', { ascending: false })
      .limit(limit)

    if (error) throw error

    return (data || []).map((item: Record<string, unknown>) => ({
      id: item.id as string,
      nama: (item.students as Record<string, unknown>)?.name as string || '-',
      kelas: (item.classes as Record<string, unknown>)?.name as string || '-',
      bulan: item.month as string,
      nominal: item.amount as number,
      tanggal: item.paid_date as string || '-',
    }))
  } catch (error) {
    console.error('Error fetching recent payments:', error)
    return []
  }
}

// ============================================
// PENDING PAYMENTS (for activity section)
// ============================================
export async function getPendingPayments(limit = 5): Promise<PendingPayment[]> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        id, student_id, nama_pengirim, jumlah_transfer, created_at,
        students!inner(nisn, name, classes!inner(name)),
        bills!inner(month, amount)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return (data || []).map((item: Record<string, unknown>) => {
      const studentInfo = item.students as Record<string, unknown>
      const classInfo = (studentInfo?.classes as Record<string, unknown>) || {}
      const billInfo = item.bills as Record<string, unknown>
      return {
        id: item.id as string,
        student_id: item.student_id as string,
        nama: studentInfo?.name as string || '-',
        nisn: studentInfo?.nisn as string || '-',
        kelas: classInfo?.name as string || '-',
        bulan: billInfo?.month as string || '-',
        nominal: billInfo?.amount as number || 0,
        nama_pengirim: item.nama_pengirim as string,
        jumlah_transfer: item.jumlah_transfer as number,
        created_at: item.created_at as string,
      }
    })
  } catch (error) {
    console.error('Error fetching pending payments:', error)
    return []
  }
}

// ============================================
// PENDING DONATIONS (for activity section)
// ============================================
export async function getPendingDonations(limit = 5): Promise<PendingDonation[]> {
  try {
    const { data, error } = await supabase
      .from('donations')
      .select('id, nama_donatur, nominal, pesan, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data || []) as PendingDonation[]
  } catch (error) {
    console.error('Error fetching pending donations:', error)
    return []
  }
}

// ============================================
// UNPAID STUDENTS
// ============================================
export async function getUnpaidStudents(): Promise<UnpaidStudent[]> {
  try {
    const { data, error } = await supabase
      .from('bills')
      .select(`
        id, month, amount, status,
        students!inner(id, nisn, name),
        classes!inner(name)
      `)
      .in('status', ['belum', 'menunggu', 'dicicil'])
      .order('status', { ascending: true })

    if (error) throw error

    const seen = new Set<string>()
    return (data || []).reduce((acc: UnpaidStudent[], item: Record<string, unknown>) => {
      const studentId = ((item.students as Record<string, unknown>)?.id as string)
      if (seen.has(studentId)) return acc
      seen.add(studentId)
      acc.push({
        id: studentId,
        nisn: (item.students as Record<string, unknown>)?.nisn as string || '-',
        nama: (item.students as Record<string, unknown>)?.name as string || '-',
        kelas: (item.classes as Record<string, unknown>)?.name as string || '-',
        tagihan: item.month as string,
        nominalTagihan: item.amount as number,
      })
      return acc
    }, [])
  } catch (error) {
    console.error('Error fetching unpaid students:', error)
    return []
  }
}

// ============================================
// REKAP SUMMARY (for dashboard)
// ============================================
export interface RekapSummaryItem {
  id: string
  name: string
  description: string
  default_amount: number
  is_recurring: boolean
  lunas: number
  belum: number
  menunggu: number
  dicicil: number
  total: number
}

function sortNameChronological(a: { name: string }, b: { name: string }): number {
  const partsA = a.name.split(' ')
  const partsB = b.name.split(' ')
  const yearA = parseInt(partsA[partsA.length - 1]) || 0
  const yearB = parseInt(partsB[partsB.length - 1]) || 0
  if (yearA !== yearB) return yearA - yearB
  return getBulanNumber(a.name) - getBulanNumber(b.name)
}

export async function getRekapSummary(): Promise<RekapSummaryItem[]> {
  try {
    const { data: billTypes, error: btError } = await supabase
      .from('bill_types')
      .select('id, name, description, default_amount, is_recurring')

    if (btError) throw btError
    if (!billTypes || billTypes.length === 0) return []

    const { data: bills, error: bError } = await supabase
      .from('bills')
      .select('bill_type_id, status')

    if (bError) throw bError

    const billsByType = new Map<string, { lunas: number; belum: number; menunggu: number; dicicil: number }>()
    for (const bill of bills || []) {
      const existing = billsByType.get(bill.bill_type_id) || { lunas: 0, belum: 0, menunggu: 0, dicicil: 0 }
      if (bill.status === 'lunas') existing.lunas++
      else if (bill.status === 'belum') existing.belum++
      else if (bill.status === 'menunggu') existing.menunggu++
      else if (bill.status === 'dicicil') existing.dicicil++
      billsByType.set(bill.bill_type_id, existing)
    }

    return billTypes
      .map(bt => {
        const counts = billsByType.get(bt.id) || { lunas: 0, belum: 0, menunggu: 0, dicicil: 0 }
        return {
          id: bt.id,
          name: bt.name,
          description: bt.description || '',
          default_amount: bt.default_amount,
          is_recurring: bt.is_recurring,
          lunas: counts.lunas,
          belum: counts.belum,
          menunggu: counts.menunggu,
          dicicil: counts.dicicil,
          total: counts.lunas + counts.belum + counts.menunggu + counts.dicicil,
        }
      })
      .sort(sortNameChronological)
  } catch (error) {
    console.error('Error fetching rekap summary:', error)
    return []
  }
}
