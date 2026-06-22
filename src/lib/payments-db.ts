import { supabase } from './supabase'

export interface BankInfo {
  id: string
  bank_name: string
  nomor_rekening: string
  atas_nama: string
  qris_url: string
}

export interface Payment {
  id: string
  student_id: string
  bill_id: string | null
  nama_pengirim: string
  jumlah_transfer: number
  catatan: string
  bukti_url: string
  status: 'pending' | 'approved' | 'rejected'
  keterangan_admin: string
  created_at: string
}

export interface PaymentWithStudent extends Payment {
  nama: string
  nisn: string
  kelas: string
  bulan: string
}

// ============================================
// BANK INFO
// ============================================
export async function getBankInfo(): Promise<BankInfo | null> {
  try {
    const { data, error } = await supabase
      .from('bank_info')
      .select('*')
      .eq('is_active', true)
      .single()

    if (error) throw error
    return data as BankInfo
  } catch (error) {
    console.error('Error fetching bank info:', error)
    return null
  }
}

// ============================================
// UPLOAD BUKTI KE SUPABASE STORAGE
// ============================================
export async function uploadBukti(file: File, studentId: string): Promise<string> {
  try {
    const ext = file.name.split('.').pop()
    const fileName = `bukti_${studentId}_${Date.now()}.${ext}`

    const { data, error } = await supabase.storage
      .from('bukti-pembayaran')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error

    const { data: urlData } = supabase.storage
      .from('bukti-pembayaran')
      .getPublicUrl(data.path)

    return urlData.publicUrl
  } catch (error) {
    console.error('Error uploading bukti:', error)
    throw error
  }
}

// ============================================
// SUBMIT PAYMENT
// ============================================
export async function submitPayment(data: {
  student_id: string
  bill_id: string
  nama_pengirim: string
  jumlah_transfer: number
  catatan: string
  bukti_url: string
}): Promise<boolean> {
  try {
    const { error } = await supabase.from('payments').insert({
      student_id: data.student_id,
      bill_id: data.bill_id,
      nama_pengirim: data.nama_pengirim,
      jumlah_transfer: data.jumlah_transfer,
      catatan: data.catatan,
      bukti_url: data.bukti_url,
      status: 'pending',
    })

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error submitting payment:', error)
    return false
  }
}

// ============================================
// ADMIN: GET ALL PAYMENTS
// ============================================
export async function getPayments(status?: string): Promise<PaymentWithStudent[]> {
  try {
    let query = supabase
      .from('payments')
      .select(`
        *,
        students!inner(id, nisn, name, classes(name)),
        bills!inner(month)
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return (data || []).map((item: Record<string, unknown>) => {
      const studentInfo = item.students as Record<string, unknown>
      const classInfo = (studentInfo?.classes as Record<string, unknown>) || {}
      const billInfo = item.bills as Record<string, unknown>
      return {
        id: item.id as string,
        student_id: item.student_id as string,
        bill_id: item.bill_id as string,
        nama_pengirim: item.nama_pengirim as string,
        jumlah_transfer: item.jumlah_transfer as number,
        catatan: item.catatan as string,
        bukti_url: item.bukti_url as string,
        status: item.status as 'pending' | 'approved' | 'rejected',
        keterangan_admin: item.keterangan_admin as string,
        created_at: item.created_at as string,
        nama: studentInfo?.name as string || '-',
        nisn: studentInfo?.nisn as string || '-',
        kelas: classInfo?.name as string || '-',
        bulan: billInfo?.month as string || '-',
      }
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return []
  }
}

// ============================================
// ADMIN: APPROVE PAYMENT
// ============================================
export async function approvePayment(paymentId: string, billId: string): Promise<boolean> {
  try {
    const { error: payError } = await supabase
      .from('payments')
      .update({ status: 'approved' })
      .eq('id', paymentId)

    if (payError) throw payError

    const { error: billError } = await supabase
      .from('bills')
      .update({ status: 'lunas', paid_date: new Date().toISOString().split('T')[0] })
      .eq('id', billId)

    if (billError) throw billError

    return true
  } catch (error) {
    console.error('Error approving payment:', error)
    return false
  }
}

// ============================================
// ADMIN: REJECT PAYMENT
// ============================================
export async function rejectPayment(paymentId: string, keterangan: string = ''): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('payments')
      .update({ status: 'rejected', keterangan_admin: keterangan })
      .eq('id', paymentId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error rejecting payment:', error)
    return false
  }
}
