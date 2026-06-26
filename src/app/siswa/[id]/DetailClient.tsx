"use client"

import { useState, useMemo } from "react"
import { formatRupiah, type Siswa } from "@/lib/db"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, Home, User, Wallet, ChevronRight, Eye, Download, X, Filter } from "lucide-react"

interface DetailClientProps {
  siswa: Siswa | null
  id: string
}

export function DetailClient({ siswa, id }: DetailClientProps) {
  const [navigating, setNavigating] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'lunas' | 'belum' | 'menunggu'>('all')
  
  interface PaymentDetail {
    payment_id: string
    bill_id: string
    bill_name: string
    student_name: string
    kelas: string
    nominal: number
    tanggal_bayar: string
    nama_pengirim: string
    jumlah_transfer: number
    catatan: string
    bukti_url: string
    status: string
  }
  
  const [selectedPayment, setSelectedPayment] = useState<PaymentDetail | null>(null)
  const [loadingPayment, setLoadingPayment] = useState(false)
  
  async function fetchPaymentDetail(billId: string) {
    setLoadingPayment(true)
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          id,
          bill_id,
          nama_pengirim,
          jumlah_transfer,
          catatan,
          bukti_url,
          status,
          created_at,
          bills (
            id,
            amount,
            paid_date,
            bill_types (name),
            students (name, nisn, classes(name))
          )
        `)
        .eq('bill_id', billId)
        .in('status', ['approved', 'pending'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (error) throw error
      
      if (data && data.bills) {
        const billData = data.bills as unknown
        const bill = billData as { id: string; amount: number; paid_date: string | null; bill_types?: { name: string }; students?: { name: string; nisn: string; classes?: { name: string } } }
        const student = bill.students
        const billType = bill.bill_types
        const studentClass = student?.classes
        
        setSelectedPayment({
          payment_id: data.id,
          bill_id: data.bill_id,
          bill_name: billType?.name || '-',
          student_name: student?.name || '-',
          kelas: studentClass?.name || '-',
          nominal: bill.amount || 0,
          tanggal_bayar: bill.paid_date || '-',
          nama_pengirim: data.nama_pengirim || '-',
          jumlah_transfer: data.jumlah_transfer || 0,
          catatan: data.catatan || '-',
          bukti_url: data.bukti_url || '',
          status: data.status,
        })
      }
    } catch (error) {
      console.error('Error fetching payment detail:', error)
    } finally {
      setLoadingPayment(false)
    }
  }
  
  async function handleDownloadBukti(url: string, filename: string) {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Download error:', error)
    }
  }
  
  const activeBills = useMemo(() => siswa?.riwayat.filter((r) => r.status !== "lunas") || [], [siswa])
  const allHistory = useMemo(() => siswa?.riwayat.filter((r) => r.status === "lunas" || r.status === "menunggu") || [], [siswa])
  
  const filteredHistory = useMemo(() => {
    if (filterStatus === 'all') return allHistory
    return allHistory.filter(r => r.status === filterStatus)
  }, [allHistory, filterStatus])
  
  const totalUnpaid = useMemo(() => activeBills.reduce((sum, b) => sum + b.nominal, 0), [activeBills])

  if (!siswa) {
    return (
      <div className="app-shell">
        <header className="public-header">
          <button onClick={() => window.history.back()}><ArrowLeft size={22} /></button>
          <span className="public-header-title">Detail Tagihan</span>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" style={{ color: "inherit", display: "flex" }}><Home size={20} /></a>
        </header>
        <main className="public-page">
          <div className="card" style={{ textAlign: "center", padding: 40 }}>
            <p style={{ color: "var(--neutral)" }}>Memuat data siswa...</p>
          </div>
        </main>
      </div>
    )
  }

  function formatDate(tgl: string) {
    if (!tgl || tgl === "Belum dibayar") return tgl
    try {
      return new Date(tgl).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    } catch {
      return tgl
    }
  }

  function deadlineText(item: Siswa["riwayat"][0]) {
    if (!item.batas_waktu) return null
    try {
      return new Date(item.batas_waktu).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    } catch {
      return null
    }
  }

  const statusConfig: Record<string, { label: string; className: string }> = {
    lunas: { label: "LUNAS", className: "lunas" },
    belum: { label: "BELUM BAYAR", className: "belum" },
    menunggu: { label: "MENUNGGU", className: "menunggu" },
    tidak_ada_tagihan: { label: "TIDAK ADA", className: "lunas" },
  }

  return (
    <div className="app-shell">
      <header className="public-header">
        <button onClick={() => window.history.back()}><ArrowLeft size={22} /></button>
        <span className="public-header-title">Detail Tagihan</span>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/" style={{ color: "inherit", display: "flex" }}><Home size={20} /></a>
      </header>

      <main className="public-page">
        <div className="profile-card">
          <div className="profile-avatar">
            <User size={28} />
          </div>
          <div className="profile-info">
            <div className="name">{siswa.nama}</div>
            <div className="meta">Kelas {siswa.kelas}</div>
            <div className="meta">NISN: {siswa.nisn}</div>
          </div>
        </div>

        {activeBills.length > 0 ? (
          <div className="bill-card">
            <div className="bill-card-header">
              <div className="bill-card-title">Tagihan Aktif ({activeBills.length})</div>
            </div>

            {activeBills.map((bill) => {
              const status = statusConfig[bill.status] || statusConfig.belum
              return (
                <div key={bill.id} style={{ padding: "12px 0", borderBottom: activeBills.length > 1 ? "1px solid var(--sand)" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div className="bill-card-title" style={{ marginBottom: 0, fontSize: 15 }}>{bill.bill_type_name || bill.bulan}</div>
                    <span className={`bill-status-badge ${status.className}`} style={{ fontSize: 11 }}>{status.label}</span>
                  </div>
                  {bill.batas_waktu && (
                    <div style={{ fontSize: 12, color: "var(--neutral)", marginBottom: 4 }}>Jatuh tempo: {deadlineText(bill)}</div>
                  )}
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>{formatRupiah(bill.nominal)}</div>
                </div>
              )
            })}

            <div className="bill-row" style={{ marginTop: 12, paddingTop: 12, borderTop: activeBills.length > 1 ? "2px solid var(--emerald-soft)" : "none" }}>
              <span className="label" style={{ fontWeight: 700 }}>Total Tagihan</span>
              <span className="value amount" style={{ fontSize: 20 }}>{formatRupiah(totalUnpaid)}</span>
            </div>

            <a href={`/siswa/${id}/bayar`} className="bill-btn" style={{ textDecoration: "none", marginTop: 16 }} onClick={() => setNavigating(true)}>
              <Wallet size={18} />
              {navigating ? "Memuat..." : "Bayar Sekarang"}
            </a>
          </div>
        ) : (
          <div className="bill-card">
            <div className="bill-card-header">
              <div className="bill-card-title">Tagihan Aktif</div>
            </div>
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--neutral)" }}>
              {siswa.status === "lunas" ? "Semua tagihan sudah lunas" : "Tidak ada tagihan"}
            </div>
          </div>
        )}

        <div className="history-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="title" style={{ marginBottom: 0 }}>Riwayat Pembayaran</div>
            {allHistory.length > 0 && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <Filter size={14} color="var(--neutral)" />
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'lunas' | 'belum' | 'menunggu')}
                  style={{
                    fontSize: 12,
                    padding: '4px 8px',
                    border: '1px solid var(--sand)',
                    borderRadius: 6,
                    background: 'white',
                    color: 'var(--ink)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">Semua ({allHistory.length})</option>
                  <option value="lunas">Lunas ({allHistory.filter(r => r.status === 'lunas').length})</option>
                  <option value="menunggu">Menunggu ({allHistory.filter(r => r.status === 'menunggu').length})</option>
                </select>
              </div>
            )}
          </div>
          {filteredHistory.length === 0 ? (
            <div className="empty-text" style={{ padding: "12px 0" }}>
              {filterStatus === 'all' ? 'Belum ada riwayat pembayaran' : `Tidak ada tagihan ${filterStatus}`}
            </div>
          ) : (
            filteredHistory.map((item) => {
              const cfg = statusConfig[item.status] || statusConfig.lunas
              const isClickable = item.status === 'lunas' || item.status === 'menunggu'
              return (
                <div 
                  key={item.id} 
                  className={`history-item ${isClickable ? 'clickable' : ''}`}
                  onClick={() => isClickable && fetchPaymentDetail(item.id)}
                  style={{ cursor: isClickable ? 'pointer' : 'default' }}
                >
                  <div className="left">
                    <div className="bill-name">{item.bill_type_name || item.bulan}</div>
                    <div className="bill-date">{formatDate(item.tanggal)}</div>
                  </div>
                  <div className="right">
                    <span className={`status ${cfg.className}`}>{cfg.label}</span>
                    <ChevronRight size={16} color="var(--neutral)" />
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="app-footer">© {new Date().getFullYear()} MI Nurul Iman Kabo Jaya</div>
      </main>
      
      {/* PAYMENT DETAIL MODAL */}
      {selectedPayment && (
        <>
          <div className="modal-overlay" onClick={() => setSelectedPayment(null)}>
            <div className="modal-content" style={{ maxWidth: 600, width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-public">
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>Detail Pembayaran</h3>
              <button 
                onClick={() => setSelectedPayment(null)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  padding: 8, 
                  display: 'flex', 
                  color: 'var(--neutral)' 
                }}
              >
                <X size={20} />
              </button>
            </div>

            {loadingPayment ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--neutral)' }}>
                Memuat detail pembayaran...
              </div>
            ) : (
              <>
                {/* Student Info */}
                <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--sand)' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>
                    {selectedPayment.student_name}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--neutral)' }}>
                    Kelas {selectedPayment.kelas}
                  </div>
                </div>

                {/* Payment Info */}
                <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--neutral)', marginBottom: 4 }}>Jenis Tagihan</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>
                      {selectedPayment.bill_name}
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--neutral)', marginBottom: 4 }}>Nominal Tagihan</div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--emerald)' }}>
                        {formatRupiah(selectedPayment.nominal)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--neutral)', marginBottom: 4 }}>Jumlah Transfer</div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>
                        {formatRupiah(selectedPayment.jumlah_transfer)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, color: 'var(--neutral)', marginBottom: 4 }}>Tanggal Bayar</div>
                    <div style={{ fontSize: 14, color: 'var(--ink)' }}>
                      {selectedPayment.tanggal_bayar !== '-' ? new Date(selectedPayment.tanggal_bayar).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : '-'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, color: 'var(--neutral)', marginBottom: 4 }}>Nama Pengirim</div>
                    <div style={{ fontSize: 14, color: 'var(--ink)' }}>{selectedPayment.nama_pengirim}</div>
                  </div>

                  {selectedPayment.catatan && selectedPayment.catatan !== '-' && (
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--neutral)', marginBottom: 4 }}>Catatan</div>
                      <div style={{ fontSize: 14, color: 'var(--ink)' }}>{selectedPayment.catatan}</div>
                    </div>
                  )}
                </div>

                {/* Bukti Transfer */}
                {selectedPayment.bukti_url && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: 'var(--neutral)', marginBottom: 8 }}>Bukti Transfer</div>
                    <div style={{
                      border: '1px solid var(--sand)',
                      borderRadius: 12,
                      overflow: 'hidden',
                      backgroundColor: '#f8f8f8'
                    }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedPayment.bukti_url}
                        alt="Bukti Transfer"
                        style={{
                          width: '100%',
                          height: 'auto',
                          maxHeight: 400,
                          objectFit: 'contain',
                          display: 'block'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <a
                    href={selectedPayment.bukti_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ flex: 1, minWidth: 140, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <Eye size={16} /> Lihat Bukti
                  </a>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, minWidth: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    onClick={() => handleDownloadBukti(
                      selectedPayment.bukti_url,
                      `Bukti_${selectedPayment.student_name}_${selectedPayment.bill_name}_${selectedPayment.tanggal_bayar}.jpg`
                    )}
                  >
                    <Download size={16} /> Download
                  </button>
                </div>
              </>
            )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
