"use client"

import { useState, useMemo, useRef } from "react"
import { formatRupiah, type Siswa } from "@/lib/db"

const MONTH_ORDER: Record<string, number> = {
  Januari: 1, Februari: 2, Maret: 3, April: 4, Mei: 5, Juni: 6,
  Juli: 7, Agustus: 8, September: 9, Oktober: 10, November: 11, Desember: 12
}
function sortBills(a: { bulan: string; tahun: string }, b: { bulan: string; tahun: string }) {
  const ay = parseInt(a.tahun) || 0, by = parseInt(b.tahun) || 0
  if (ay !== by) return ay - by
  return (MONTH_ORDER[a.bulan] || 0) - (MONTH_ORDER[b.bulan] || 0)
}
import { supabase } from "@/lib/supabase"
import { ArrowLeft, Home, User, Wallet, ChevronRight, Eye, Download, X, Filter } from "lucide-react"
import { ContactAduan } from "@/components/ContactAduan"
import { Footer } from "@/components/Footer"
import { useNavigationState } from "@/hooks/useNavigationState"

interface DetailClientProps {
  siswa: Siswa | null
  id: string
}

export function DetailClient({ siswa, id }: DetailClientProps) {
  const { navigatingTo, startNavigation } = useNavigationState()
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
  
const [selectedPayment, setSelectedPayment] = useState<PaymentDetail[]>([])
  const [loadingPayment, setLoadingPayment] = useState(false)
  const [openBillId, setOpenBillId] = useState<string | null>(null)
  const paymentRequestRef = useRef(0)
  
  async function fetchPaymentDetail(billId: string) {
    const requestId = ++paymentRequestRef.current
    setOpenBillId(billId)
    setSelectedPayment([])
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
      
      if (error) throw error
      
      if (paymentRequestRef.current !== requestId) return
      
      const payments = (data || []).map((item: Record<string, unknown>) => {
        const billData = item.bills as Record<string, unknown>
        const student = billData?.students as Record<string, unknown> | undefined
        const billType = billData?.bill_types as Record<string, unknown> | undefined
        const studentClass = student?.classes as Record<string, unknown> | undefined
        
        return {
          payment_id: item.id as string,
          bill_id: item.bill_id as string,
          bill_name: billType?.name as string || '-',
          student_name: student?.name as string || '-',
          kelas: studentClass?.name as string || '-',
          nominal: billData?.amount as number || 0,
          tanggal_bayar: billData?.paid_date as string || '-',
          nama_pengirim: item.nama_pengirim as string || '-',
          jumlah_transfer: item.jumlah_transfer as number || 0,
          catatan: item.catatan as string || '-',
          bukti_url: item.bukti_url as string || '',
          status: item.status as string,
        }
      })
      
      setSelectedPayment(payments)
    } catch (error) {
      console.error('Error fetching payment detail:', error)
    } finally {
      if (paymentRequestRef.current === requestId) setLoadingPayment(false)
    }
  }

function closePaymentDetail() {
    paymentRequestRef.current += 1
    setOpenBillId(null)
    setSelectedPayment([])
    setLoadingPayment(false)
  }
  
  async function handleDownloadBukti(url: string, filename: string) {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Download gagal (${response.status})`)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 0)
    } catch (error) {
      console.error('Download error:', error)
    }
  }
  
  const activeBills = useMemo(() => (siswa?.riwayat.filter((r) => r.status !== "lunas") || []).sort(sortBills), [siswa])
  const payableBills = useMemo(() => activeBills.filter((bill) => bill.status === "belum"), [activeBills])
  const allHistory = useMemo(() => (siswa?.riwayat.filter((r) => r.status === "lunas" || r.status === "menunggu") || []).sort(sortBills), [siswa])
  
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
    dicicil: { label: "DICICIL", className: "menunggu" },
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
              const sisa = bill.nominal - (bill.total_paid || 0)
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
                  {(bill.total_paid || 0) > 0 && (
                    <div style={{ fontSize: 12, color: "var(--neutral)", marginTop: 4 }}>
                      Terbayar: {formatRupiah(bill.total_paid || 0)} · Sisa: {formatRupiah(sisa)}
                      {bill.payment_count ? ` · Cicilan ke-${bill.payment_count}/5` : ""}
                    </div>
                  )}
                </div>
              )
            })}

            <div className="bill-row" style={{ marginTop: 12, paddingTop: 12, borderTop: activeBills.length > 1 ? "2px solid var(--emerald-soft)" : "none" }}>
              <span className="label" style={{ fontWeight: 700 }}>Total Tagihan</span>
              <span className="value amount" style={{ fontSize: 20 }}>{formatRupiah(totalUnpaid)}</span>
            </div>

            {payableBills.length > 0 && (
              <a
                href={`/siswa/${id}/bayar`}
                className="bill-btn"
                style={{ textDecoration: "none", marginTop: 16 }}
                onClick={(event) => startNavigation("bayar", event)}
                aria-busy={navigatingTo === "bayar"}
                aria-disabled={navigatingTo !== null}
              >
                <Wallet size={18} />
                {navigatingTo === "bayar" ? "Memuat..." : "Bayar Sekarang"}
              </a>
            )}
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

        <ContactAduan />

        <Footer />
      </main>
      
      {/* PAYMENT DETAIL MODAL */}
      {openBillId && (
        <>
          <div className="modal-overlay" onClick={closePaymentDetail}>
            <div className="modal-content" style={{ maxWidth: 600, width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-public">
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>Detail Pembayaran</h3>
              <button 
                onClick={closePaymentDetail}
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
            ) : selectedPayment.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--neutral)' }}>
                Tidak ada data pembayaran
              </div>
            ) : (
              <>
                {/* Student Info */}
                <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--sand)' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>
                    {selectedPayment[0].student_name}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--neutral)' }}>
                    Kelas {selectedPayment[0].kelas} · {selectedPayment[0].bill_name}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--emerald)', marginTop: 4 }}>
                    Total Tagihan: {formatRupiah(selectedPayment[0].nominal)} · Total Terbayar: {formatRupiah(selectedPayment.filter(p => p.status === 'approved').reduce((s, p) => s + p.jumlah_transfer, 0))}
                  </div>
                </div>

                {selectedPayment.map((payment, idx) => {
                  const statusCfg = statusConfig[payment.status] || statusConfig.lunas
                  return (
                    <div key={payment.payment_id} style={{
                      marginBottom: 16,
                      padding: 14,
                      border: '1px solid var(--sand)',
                      borderRadius: 12,
                      background: payment.status === 'approved' ? 'var(--emerald-soft)' : 'var(--gold-soft)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Cicilan ke-{selectedPayment.length - idx}</span>
                        <span className={`bill-status-badge ${statusCfg.className}`} style={{ fontSize: 10 }}>{statusCfg.label}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                        <div>
                          <span style={{ color: 'var(--neutral)' }}>Jumlah Transfer: </span>
                          <span style={{ fontWeight: 600 }}>{formatRupiah(payment.jumlah_transfer)}</span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--neutral)' }}>Pengirim: </span>
                          <span style={{ fontWeight: 600 }}>{payment.nama_pengirim}</span>
                        </div>
                        {payment.catatan && payment.catatan !== '-' && (
                          <div style={{ gridColumn: '1 / -1' }}>
                            <span style={{ color: 'var(--neutral)' }}>Catatan: </span>
                            <span>{payment.catatan}</span>
                          </div>
                        )}
                      </div>
                      {payment.bukti_url && (
                        <div style={{ marginTop: 10 }}>
                          <div style={{
                            border: '1px solid var(--sand)',
                            borderRadius: 8,
                            overflow: 'hidden',
                            backgroundColor: '#f8f8f8'
                          }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={payment.bukti_url}
                              alt="Bukti Transfer"
                              style={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: 200,
                                objectFit: 'contain',
                                display: 'block'
                              }}
                            />
                          </div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            <a
                              href={payment.bukti_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline"
                              style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 12px', fontSize: 13 }}
                            >
                              <Eye size={14} /> Lihat
                            </a>
                            <button
                              className="btn btn-primary"
                              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 12px', fontSize: 13 }}
                              onClick={() => handleDownloadBukti(
                                payment.bukti_url,
                                `Bukti_${payment.student_name}_${payment.bill_name}_${idx + 1}.jpg`
                              )}
                            >
                              <Download size={14} /> Download
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </>
            )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
