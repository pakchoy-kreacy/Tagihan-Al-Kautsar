import { supabase } from './supabase'

export interface AdminStats {
  totalSiswa: number
  lunas: number
  belum: number
  menunggu: number
}

export interface RecentPayment {
  id: string
  nama: string
  kelas: string
  bulan: string
  nominal: number
  tanggal: string
}

export interface UnpaidStudent {
  id: string
  nisn: string
  nama: string
  kelas: string
  tagihan: string
  nominalTagihan: number
}

// ============================================
// STATISTICS
// ============================================
export async function getAdminStats(): Promise<AdminStats> {
  try {
    const { data: bills, error } = await supabase
      .from('bills')
      .select('status')

    if (error) throw error

    const totalSiswa = (await supabase.from('students').select('id', { count: 'exact', head: true })).count || 0

    const lunas = bills?.filter(b => b.status === 'lunas').length || 0
    const belum = bills?.filter(b => b.status === 'belum').length || 0
    const menunggu = bills?.filter(b => b.status === 'menunggu').length || 0

    return { totalSiswa, lunas, belum, menunggu }
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return { totalSiswa: 0, lunas: 0, belum: 0, menunggu: 0 }
  }
}

// ============================================
// RECENT PAYMENTS
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
      .in('status', ['belum', 'menunggu'])
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
