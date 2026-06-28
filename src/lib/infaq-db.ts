import { supabase } from './supabase'
export { getAllBillTypes, updateBillType } from './db'

export interface Donation {
  id: string
  nama_donatur: string
  nominal: number
  pesan: string
  bukti_url: string
  status: 'pending' | 'approved' | 'rejected'
  keterangan_admin: string
  created_at: string
}

export interface SchoolSettings {
  id: string
  nama_sekolah: string
  logo_url: string
  nomor_wa: string
  alamat: string
  banner_url: string
}

export interface BankInfoSettings {
  id: string
  bank_name: string
  nomor_rekening: string
  atas_nama: string
  qris_url: string
}

// ============================================
// DONATIONS
// ============================================
export async function submitDonasi(data: {
  nama_donatur: string
  nominal: number
  pesan: string
  bukti_url: string
}): Promise<boolean> {
  try {
    const { error } = await supabase.from('donations').insert({
      nama_donatur: data.nama_donatur,
      nominal: data.nominal,
      pesan: data.pesan,
      bukti_url: data.bukti_url,
      status: 'approved',
    })
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error submitting donation:', error)
    return false
  }
}

export async function getDonations(status?: string): Promise<Donation[]> {
  try {
    let query = supabase
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) throw error
    return (data || []) as Donation[]
  } catch (error) {
    console.error('Error fetching donations:', error)
    return []
  }
}

export async function approveDonasi(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('donations')
      .update({ status: 'approved' })
      .eq('id', id)
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error approving donation:', error)
    return false
  }
}

export async function rejectDonasi(id: string, ket: string = ''): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('donations')
      .update({ status: 'rejected', keterangan_admin: ket })
      .eq('id', id)
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error rejecting donation:', error)
    return false
  }
}

export async function updateDonasi(id: string, data: Partial<Pick<Donation, 'nama_donatur' | 'nominal' | 'pesan'>>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('donations')
      .update(data)
      .eq('id', id)
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating donation:', error)
    return false
  }
}

export async function deleteDonasi(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('donations')
      .delete()
      .eq('id', id)
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting donation:', error)
    return false
  }
}

// ============================================
// BANK INFO (payment & infaq)
// ============================================
const BANK_CACHE_KEY_PREFIX = "espp_bank_info_"

export async function getBankInfoByType(type: 'payment' | 'infaq'): Promise<BankInfoSettings | null> {
  const cacheKey = `${BANK_CACHE_KEY_PREFIX}${type}`
  
  // Coba cache dulu
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(cacheKey)
      if (raw) {
        const cached = JSON.parse(raw) as BankInfoSettings
        // Return cache, refresh di background
        refreshBankInfo(type, cacheKey)
        return cached
      }
    } catch { /* ignore */ }
  }

  return refreshBankInfo(type, cacheKey)
}

async function refreshBankInfo(type: 'payment' | 'infaq', cacheKey: string): Promise<BankInfoSettings | null> {
  try {
    const { data, error } = await supabase
      .from('bank_info')
      .select('*')
      .eq('type', type)
      .eq('is_active', true)
      .single()

    if (error) throw error
    const result = data as BankInfoSettings
    if (typeof window !== "undefined") {
      try { localStorage.setItem(cacheKey, JSON.stringify(result)) } catch { /* ignore */ }
    }
    return result
  } catch (error) {
    console.error('Error fetching bank info:', error)
    return null
  }
}

export async function updateBankInfo(id: string, data: Partial<BankInfoSettings>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('bank_info')
      .update(data)
      .eq('id', id)
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating bank info:', error)
    return false
  }
}

// ============================================
// SCHOOL SETTINGS
// ============================================
const SETTINGS_CACHE_KEY = "espp_school_settings_data"

export async function getSchoolSettings(): Promise<SchoolSettings | null> {
  // Coba cache dulu
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(SETTINGS_CACHE_KEY)
      if (raw) {
        const cached = JSON.parse(raw) as SchoolSettings
        // Return cache, refresh di background
        refreshSchoolSettings()
        return cached
      }
    } catch { /* ignore */ }
  }

  return refreshSchoolSettings()
}

async function refreshSchoolSettings(): Promise<SchoolSettings | null> {
  try {
    const { data, error } = await supabase
      .from('school_settings')
      .select('*')
      .single()

    if (error) throw error
    const result = data as SchoolSettings
    if (typeof window !== "undefined") {
      try { localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(result)) } catch { /* ignore */ }
    }
    return result
  } catch (error) {
    console.error('Error fetching school settings:', error)
    return null
  }
}

export async function updateSchoolSettings(data: Partial<SchoolSettings>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('school_settings')
      .update(data)
      .eq('id', data.id)

    if (error) throw error

    // Invalidate cache
    if (typeof window !== "undefined") {
      localStorage.removeItem("espp_school_settings")
    }

    return true
  } catch (error) {
    console.error('Error updating school settings:', error)
    return false
  }
}

// ============================================
// UPLOAD BUKTI
// ============================================
export async function uploadBuktiInfaq(file: File, prefix: string = 'infaq'): Promise<string> {
  try {
    const ext = file.name.split('.').pop()
    const fileName = `infaq/${Date.now()}.${ext}`

    const { data, error } = await supabase.storage
      .from('bukti-pembayaran')
      .upload(fileName, file, { cacheControl: '3600', upsert: false })

    if (error) throw error

    const { data: urlData } = supabase.storage
      .from('bukti-pembayaran')
      .getPublicUrl(data.path)

    return urlData.publicUrl
  } catch (error) {
    console.error('Error uploading:', error)
    throw error
  }
}
