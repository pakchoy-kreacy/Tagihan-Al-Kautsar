"use client"

import { useState, Suspense, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { getAllStudentsWithBills, addSiswaDetailed, updateSiswa, deleteSiswa, getAllClasses, markBillAsPaid } from "@/lib/db"
import { formatRupiah, type Siswa, type KelasData } from "@/lib/db"
import { useToast } from "@/components/Toast"
import { ConfirmModal } from "@/components/ConfirmModal"
import { supabase } from "@/lib/supabase"
import { updatePayment, deletePayment } from "@/lib/payments-db"
import { useAdminRole } from "@/context/AdminRoleContext"
import { Search, Upload, Download, Plus, X, Pencil, Trash2, Inbox, FileSpreadsheet } from "lucide-react"
import { usePageRefresh } from "@/hooks/usePageRefresh"
// XLSX di-import dynamic untuk mengurangi bundle size

function SiswaContent() {
  const searchParams = useSearchParams()
  const initialKelas = searchParams.get("kelas") || ""
  const { showToast } = useToast()
  const { role } = useAdminRole()

  const [siswaList, setSiswaList] = useState<Siswa[]>([])
  const [kelasList, setKelasList] = useState<KelasData[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formNisn, setFormNisn] = useState("")
  const [formNama, setFormNama] = useState("")
  const [formKelas, setFormKelas] = useState("")
  const [search, setSearch] = useState("")
  const [selectedKelas, setSelectedKelas] = useState(initialKelas)
  const [deleteTarget, setDeleteTarget] = useState<Siswa | null>(null)
  const [detailSiswa, setDetailSiswa] = useState<Siswa | null>(null)
  const [importing, setImporting] = useState(false)
  
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
  const paymentRequestRef = useRef(0)
  const [confirmStatusChange, setConfirmStatusChange] = useState<{ billId: string; billName: string } | null>(null)
  const [editingPayment, setEditingPayment] = useState(false)
  const [editForm, setEditForm] = useState({ nama_pengirim: "", jumlah_transfer: 0, catatan: "" })
  const [confirmDeletePayment, setConfirmDeletePayment] = useState<string | null>(null)

  const refreshData = usePageRefresh(async (isCurrent) => {
    try {
      const [siswa, kelas] = await Promise.all([getAllStudentsWithBills(), getAllClasses()])
      if (!isCurrent()) return
      setSiswaList(siswa)
      setKelasList(kelas)
    } catch (error) {
      console.error('Error fetching siswa data:', error)
      showToast("Gagal memuat data siswa", "error")
    } finally { if (isCurrent()) setLoading(false) }
  }, { refreshKey: "admin-students" })

  function openAdd() {
    setEditId(null); setFormNisn(""); setFormNama(""); setFormKelas("")
    setShowModal(true)
  }

  function openEdit(s: Siswa) {
    setEditId(s.id); setFormNisn(s.nisn); setFormNama(s.nama); setFormKelas(s.kelas)
    setShowModal(true)
  }

  async function handleSubmit() {
    if (!formNisn || !formNama || !formKelas) return showToast("Isi semua field!", "error")
    if (editId) {
      const classData = kelasList.find(k => k.name === formKelas)
      if (!classData) {
        showToast("Kelas tidak ditemukan. Coba pilih ulang kelasnya.", "error")
        return
      }
      const ok = await updateSiswa(editId, { nisn: formNisn, name: formNama, class_id: classData?.id })
      if (ok) { setShowModal(false); showToast("Siswa diperbarui!"); await refreshData() }
      else showToast("Gagal memperbarui!", "error")
    } else {
      const result = await addSiswaDetailed(formNisn, formNama, formKelas)
      if (result.success) {
        setShowModal(false)
        showToast("Siswa ditambahkan!")
        await refreshData()
      } else {
        showToast(result.error || "Gagal menambah siswa!", "error")
      }
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const ok = await deleteSiswa(deleteTarget.id)
    if (ok) { showToast("Siswa dihapus!"); await refreshData() }
    else showToast("Gagal menghapus!", "error")
    setDeleteTarget(null)
  }

  async function handleDownloadTemplate() {
    const XLSX = await import("xlsx")
    const ws = XLSX.utils.aoa_to_sheet([
      ["NISN", "Nama", "Kelas"],
      ["3A-01", "Ahmad Rizki", "3A"],
      ["3A-02", "Aisyah Putri", "3A"],
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Siswa")
    XLSX.writeFile(wb, "template_siswa.xlsx")
  }

  function handleImportExcel() {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".xlsx,.xls,.csv"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      setImporting(true)
      try {
        const rows: { nisn: string; nama: string; kelas: string }[] = []

        if (file.name.endsWith(".csv")) {
          const text = await file.text()
          const lines = text.split("\n").filter(l => l.trim())
          for (let i = 1; i < lines.length; i++) {
            const parts = parseCSVLine(lines[i])
            if (parts.length >= 3) {
              rows.push({ nisn: parts[0].trim(), nama: parts[1].trim(), kelas: parts[2].trim() })
            }
          }
        } else {
          const XLSX = await import("xlsx")
          const buf = await file.arrayBuffer()
          const wb = XLSX.read(buf, { type: "array" })
          const ws = wb.Sheets[wb.SheetNames[0]]
          const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][]
          for (let i = 1; i < data.length; i++) {
            const row = data[i]
            const nisn = String(row[0] || "").trim()
            const nama = String(row[1] || "").trim()
            const kelas = String(row[2] || "").trim()
            if (nisn && nama && kelas) rows.push({ nisn, nama, kelas })
          }
        }

        if (rows.length === 0) {
          showToast("Tidak ada data valid di file!", "error")
          setImporting(false)
          return
        }

        let success = 0
        let failed = 0

        for (const row of rows) {
          const result = await addSiswaDetailed(row.nisn, row.nama, row.kelas)
          if (result.success) {
            success++
          } else {
            failed++
          }
        }

        if (failed === 0) {
          showToast(`${success} siswa berhasil diimport!`)
        } else if (success === 0) {
          showToast(`Semua ${failed} baris gagal diimport`, "error")
        } else {
          showToast(`${success} berhasil, ${failed} gagal`, "error")
        }

        // Errors are already shown to user via toast, no need to log

        await refreshData()
      } catch {
        showToast("Gagal membaca file! Pastikan format benar.", "error")
      } finally {
        setImporting(false)
      }
    }
    input.click()
  }

  function parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ""
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        inQuotes = !inQuotes
      } else if (ch === "," && !inQuotes) {
        result.push(current)
        current = ""
      } else {
        current += ch
      }
    }
    result.push(current)
    return result
  }
  
  async function fetchPaymentDetail(billId: string) {
    const requestId = ++paymentRequestRef.current
    setSelectedPayment(null)
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
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      if (error) throw error
      
      if (data && data.bills) {
        const billData = data.bills as unknown
        const bill = billData as { id: string; amount: number; paid_date: string | null; bill_types?: { name: string }; students?: { name: string; nisn: string; classes?: { name: string } } }
        const student = bill.students
        const billType = bill.bill_types
        const studentClass = student?.classes
        
        if (paymentRequestRef.current !== requestId) return
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
    } catch {
      showToast('Gagal memuat detail pembayaran', 'error')
    } finally {
      if (paymentRequestRef.current === requestId) setLoadingPayment(false)
    }
  }

  function startEditPayment() {
    if (!selectedPayment) return
    setEditForm({
      nama_pengirim: selectedPayment.nama_pengirim,
      jumlah_transfer: selectedPayment.jumlah_transfer,
      catatan: selectedPayment.catatan,
    })
    setEditingPayment(true)
  }

  async function handleUpdatePayment() {
    if (!selectedPayment) return
    if (!editForm.nama_pengirim.trim()) { showToast("Nama pengirim wajib diisi!", "error"); return }
    if (editForm.jumlah_transfer <= 0) { showToast("Jumlah transfer harus lebih dari 0!", "error"); return }
    const ok = await updatePayment(selectedPayment.payment_id, {
      nama_pengirim: editForm.nama_pengirim.trim(),
      jumlah_transfer: editForm.jumlah_transfer,
      catatan: editForm.catatan.trim(),
    })
    if (ok) {
      showToast("Pembayaran diperbarui!")
      setSelectedPayment({ ...selectedPayment, ...editForm })
      setEditingPayment(false)
    } else {
      showToast("Gagal memperbarui!", "error")
    }
  }

  async function handleDeletePayment() {
    if (!selectedPayment || !confirmDeletePayment) return
    const ok = await deletePayment(selectedPayment.payment_id, selectedPayment.bill_id)
    if (ok) { showToast("Pembayaran dihapus!"); setSelectedPayment(null); setConfirmDeletePayment(null) }
    else showToast("Gagal menghapus!", "error")
  }

  const filtered = siswaList.filter(s => {
    const matchKelas = !selectedKelas || s.kelas === selectedKelas
    const matchSearch = !search ||
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.nisn.toLowerCase().includes(search.toLowerCase())
    return matchKelas && matchSearch
  })

  const statusMap: Record<string, string> = {
    lunas: "Lunas",
    belum: "Belum Bayar",
    menunggu: "Menunggu",
    dicicil: "Dicicil",
    tidak_ada_tagihan: "Tidak Ada Tagihan",
  }

  return (
    <div className="admin-page">
      <div className="page-title">Kelola Siswa</div>
      <p className="page-subtitle">Klik siswa untuk melihat detail dan riwayat pembayaran</p>

      {/* TOOLBAR */}
      <div className="siswa-toolbar">
        <div className="siswa-toolbar-left">
          {role === 'admin' && (
            <button className="admin-btn" onClick={openAdd}>
              <Plus size={15} /> Tambah Siswa
            </button>
          )}
          {role === 'admin' && (
            <button className="admin-btn admin-btn-outline" onClick={handleImportExcel} disabled={importing}>
              {importing ? <><FileSpreadsheet size={15} /> Mengimpor...</> : <><Upload size={15} /> Import Excel</>}
            </button>
          )}
          <button className="admin-btn admin-btn-outline" onClick={handleDownloadTemplate}>
            <Download size={15} /> Template
          </button>
        </div>
        <div className="search-box siswa-search">
          <span className="icon"><Search size={16} color="var(--neutral)" /></span>
          <input
            placeholder="Cari nama atau NISN..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* KELAS FILTER */}
      <div className="filter-chips siswa-filter-chips">
        <button
          className={`filter-chip green ${!selectedKelas ? "active" : ""}`}
          onClick={() => setSelectedKelas("")}
        >Semua</button>
        {kelasList.map(k => (
          <button
            key={k.id}
            className={`filter-chip green ${selectedKelas === k.name ? "active" : ""}`}
            onClick={() => setSelectedKelas(k.name)}
          >Kelas {k.name}</button>
        ))}
      </div>

      {/* DESKTOP TABLE (>=1024px) */}
      {loading ? (
        <div className="siswa-grid">
          {[1,2,3,4,5,6].map(i => <div key={i} className="siswa-card-admin skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Inbox size={48} color="var(--neutral)" style={{ opacity: 0.4, marginBottom: 12 }} />
          <p>Tidak ada siswa yang cocok</p>
          <p className="empty-state-sub">Coba ubah filter atau kata kunci pencarian</p>
        </div>
      ) : (
        <>
          <div className="siswa-table-wrap">
            <table className="siswa-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>NISN</th>
                  <th>Kelas</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} onClick={() => setDetailSiswa(s)}>
                    <td className="st-name">{s.nama}</td>
                    <td className="st-nisn">{s.nisn}</td>
                    <td>Kelas {s.kelas}</td>
                    <td>
                      <span className={`badge badge-${s.status}`}>
                        {statusMap[s.status]}
                        {s.riwayat.length > 0 && (
                          <span style={{ marginLeft: 4, opacity: 0.85 }}>
                            ({s.riwayat.filter(r => r.status === 'lunas').length}/{s.riwayat.length})
                          </span>
                        )}
                      </span>
                    </td>
                    {role === 'admin' && (
                      <td className="st-actions" onClick={e => e.stopPropagation()}>
                        <button className="sca-btn sca-btn-edit" onClick={() => openEdit(s)} aria-label="Edit siswa">
                          <Pencil size={13} style={{ verticalAlign: "middle" }} />
                        </button>
                        <button className="sca-btn sca-btn-delete" onClick={() => setDeleteTarget(s)} aria-label="Hapus siswa">
                          <Trash2 size={13} style={{ verticalAlign: "middle" }} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARD GRID (<1024px) */}
          <div className="siswa-grid">
            {filtered.map(s => (
              <div key={s.id} className="siswa-card-admin" onClick={() => setDetailSiswa(s)}>
                <div className="sca-header">
                  <div className="sca-avatar">{s.nama.charAt(0).toUpperCase()}</div>
                  <div className="sca-info">
                    <div className="sca-name">{s.nama}</div>
                    <div className="sca-nisn">NISN {s.nisn}</div>
                  </div>
                  <span className={`badge badge-${s.status}`}>
                    {statusMap[s.status]}
                    {s.riwayat.length > 0 && (
                      <span style={{ marginLeft: 4, opacity: 0.85 }}>
                        ({s.riwayat.filter(r => r.status === 'lunas').length}/{s.riwayat.length})
                      </span>
                    )}
                  </span>
                </div>
                <div className="sca-footer">
                  <span className="sca-kelas">Kelas {s.kelas}</span>
                  <span className="sca-tagihan">{s.tagihan !== "Tidak Ada Tagihan" ? s.tagihan : "—"}</span>
                </div>
                {role === 'admin' && (
                  <div className="sca-actions">
                    <button className="sca-btn sca-btn-edit" onClick={(e) => { e.stopPropagation(); openEdit(s) }}>Edit</button>
                    <button className="sca-btn sca-btn-delete" onClick={(e) => { e.stopPropagation(); setDeleteTarget(s) }}>Hapus</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <p className="counter">Menampilkan {filtered.length} dari {siswaList.length} siswa</p>

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <>
          <div className="admin-overlay" onClick={() => setShowModal(false)} />
          <div className="admin-modal">
            <div className="modal-header">
              <h3>{editId ? "Edit Siswa" : "Tambah Siswa"}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)} aria-label="Tutup modal"><X size={18} /></button>
            </div>
            <input className="admin-input" placeholder="NISN" value={formNisn}
              onChange={e => setFormNisn(e.target.value)} />
            <input className="admin-input" placeholder="Nama Lengkap" value={formNama}
              onChange={e => setFormNama(e.target.value)} />
            <select className="admin-input" value={formKelas}
              onChange={e => setFormKelas(e.target.value)}>
              <option value="">-- Pilih Kelas --</option>
              {kelasList.map(k => <option key={k.id} value={k.name}>{k.name}</option>)}
            </select>
            <div className="admin-modal-actions">
              <button className="admin-btn admin-btn-outline" onClick={() => setShowModal(false)}>Batal</button>
              <button className="admin-btn" onClick={handleSubmit}>{editId ? "Update" : "Simpan"}</button>
            </div>
          </div>
        </>
      )}

      {/* DETAIL MODAL */}
      {detailSiswa && (
        <>
          <div className="admin-overlay" onClick={() => setDetailSiswa(null)} />
          <div className="admin-modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h3>Detail Siswa</h3>
              <button className="modal-close" onClick={() => setDetailSiswa(null)} aria-label="Tutup detail"><X size={18} /></button>
            </div>
            <div className="detail-siswa">
              <div className="detail-avatar">{detailSiswa.nama.charAt(0).toUpperCase()}</div>
              <div className="detail-name">{detailSiswa.nama}</div>
              <div className="detail-nisn">NISN {detailSiswa.nisn} · Kelas {detailSiswa.kelas}</div>
              <div className={`detail-status badge badge-${detailSiswa.status}`}>{statusMap[detailSiswa.status]}</div>
              {detailSiswa.riwayat.length > 0 && (
                <div style={{ fontSize: 13, color: "var(--neutral)", marginTop: 6 }}>
                  {detailSiswa.riwayat.filter(r => r.status === 'lunas').length} dari {detailSiswa.riwayat.length} tagihan lunas
                </div>
              )}
            </div>

            {detailSiswa.riwayat.length > 0 ? (
              <div className="detail-riwayat">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div className="detail-riwayat-title" style={{ marginBottom: 0 }}>Riwayat Pembayaran</div>
                    {role === 'admin' && detailSiswa.riwayat.some(r => r.status !== 'lunas') && (
                      <button
                        type="button"
                        className="admin-btn admin-btn-sm"
                        style={{ fontSize: 12, padding: "6px 12px" }}
                        onClick={async () => {
                          const unpaid = detailSiswa.riwayat.filter(r => r.status !== 'lunas')
                          let okCount = 0
                          for (const bill of unpaid) {
                            const ok = await markBillAsPaid(bill.id)
                            if (ok) okCount++
                          }
                          if (okCount === unpaid.length) {
                            showToast(`${okCount} tagihan ditandai lunas!`)
                          } else {
                            showToast(`${okCount} dari ${unpaid.length} tagihan berhasil ditandai lunas`, "error")
                          }
                          setDetailSiswa(null)
                          await refreshData()
                        }}
                      >
                        Tandai Semua Lunas
                      </button>
                    )}
                  </div>
                {detailSiswa.riwayat.slice().sort((a, b) => a.sortKey - b.sortKey).map(r => {
                  const isClickable = r.status === 'lunas' || r.status === 'menunggu' || r.status === 'dicicil'
                  return (
                  <div 
                    key={r.id} 
                    className={`riwayat-row status-${r.status} ${isClickable ? 'clickable' : ''}`}
                    onClick={() => isClickable && fetchPaymentDetail(r.id)}
                    style={{ cursor: isClickable ? 'pointer' : 'default' }}
                  >
                    <div>
                      <div className="riwayat-bulan">{r.bill_type_name || r.bulan}</div>
                      <div className="riwayat-tanggal">{r.tanggal}</div>
                    </div>
                    <div className="riwayat-right" style={{ alignItems: "flex-end", gap: 6 }}>
                      <div className="riwayat-nominal">{formatRupiah(r.nominal)}</div>
                      <div className="riwayat-status">{statusMap[r.status]}</div>
                      {role === 'admin' && r.status === 'lunas' ? (
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm admin-btn-outline"
                          style={{ fontSize: 11, padding: "3px 8px" }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setConfirmStatusChange({ billId: r.id, billName: r.bill_type_name || r.bulan })
                          }}
                        >
                          Ubah Status
                        </button>
                      ) : role === 'admin' ? (
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm"
                          style={{ fontSize: 11, padding: "3px 8px" }}
                          onClick={async (e) => {
                            e.stopPropagation()
                            const ok = await markBillAsPaid(r.id)
                            if (ok) {
                              showToast("Tagihan ditandai lunas!")
                              setDetailSiswa(null)
                              await refreshData()
                            } else {
                              showToast("Gagal menandai lunas!", "error")
                            }
                          }}
                        >
                          Tandai Lunas
                        </button>
                      ) : null}
                    </div>
                  </div>
                  )
                })}
              </div>
            ) : (
              <p style={{ color: "var(--neutral)", fontSize: 13, textAlign: "center", padding: "12px 0" }}>
                Belum ada riwayat pembayaran
              </p>
            )}
          </div>
        </>
      )}

      {/* PAYMENT DETAIL MODAL */}
      {selectedPayment && (
        <>
          <div className="admin-overlay" onClick={() => setSelectedPayment(null)} />
          <div className="admin-modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3>Detail Pembayaran</h3>
              <button className="modal-close" onClick={() => setSelectedPayment(null)} aria-label="Tutup detail pembayaran">
                <X size={18} />
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
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>
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
                        onClick={() => window.open(selectedPayment.bukti_url, '_blank')}
                        style={{
                          width: '100%',
                          height: 'auto',
                          maxHeight: 400,
                          objectFit: 'contain',
                          display: 'block',
                          cursor: 'pointer',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {editingPayment ? (
                    <div style={{ width: '100%' }}>
                      <label className="form-label">Nama Pengirim</label>
                      <input className="admin-input" value={editForm.nama_pengirim}
                        onChange={e => setEditForm(f => ({ ...f, nama_pengirim: e.target.value }))}
                        style={{ marginBottom: 12 }} />
                      <label className="form-label">Jumlah Transfer (Rp)</label>
                      <input className="admin-input" type="number" value={editForm.jumlah_transfer}
                        onChange={e => setEditForm(f => ({ ...f, jumlah_transfer: Number(e.target.value) }))}
                        style={{ marginBottom: 12 }} />
                      <label className="form-label">Catatan</label>
                      <input className="admin-input" value={editForm.catatan}
                        onChange={e => setEditForm(f => ({ ...f, catatan: e.target.value }))}
                        style={{ marginBottom: 12 }} />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="admin-btn admin-btn-outline" style={{ flex: 1 }} onClick={() => setEditingPayment(false)}>Batal</button>
                        <button className="admin-btn" style={{ flex: 1 }} onClick={handleUpdatePayment}>Simpan</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button className="admin-btn admin-btn-outline" style={{ flex: 1 }} onClick={startEditPayment}>
                        <Pencil size={15} /> Edit
                      </button>
                      <button className="admin-btn admin-btn-danger" style={{ flex: 1 }} onClick={() => setConfirmDeletePayment(selectedPayment.payment_id)}>
                        <Trash2 size={15} /> Hapus
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Hapus Siswa"
        message={`Yakin hapus ${deleteTarget?.nama}? Data siswa ini akan dihapus permanen.`}
        confirmLabel="Hapus"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmModal
        open={!!confirmStatusChange}
        title="Ubah Status Pembayaran"
        message={`Ubah status ${confirmStatusChange?.billName || 'tagihan ini'} dari Lunas ke Belum Bayar?`}
        confirmLabel="Ubah"
        danger
        onConfirm={async () => {
          if (!confirmStatusChange) return
          const { error } = await supabase
            .from('bills')
            .update({ 
              status: 'belum',
              paid_date: null 
            })
            .eq('id', confirmStatusChange.billId)
          
          if (!error) {
            showToast("Status diubah ke Belum Bayar!")
            setDetailSiswa(null)
            await refreshData()
          } else {
            showToast("Gagal mengubah status!", "error")
          }
          setConfirmStatusChange(null)
        }}
        onCancel={() => setConfirmStatusChange(null)}
      />

      <ConfirmModal
        open={!!confirmDeletePayment}
        title="Hapus Pembayaran"
        message="Yakin hapus data pembayaran ini? Data tidak bisa dikembalikan."
        confirmLabel="Hapus"
        danger
        onConfirm={handleDeletePayment}
        onCancel={() => setConfirmDeletePayment(null)}
      />
    </div>
  )
}

export default function AdminSiswaPage() {
  return (
    <Suspense fallback={<div className="admin-page"><div className="loading-text">Memuat...</div></div>}>
      <SiswaContent />
    </Suspense>
  )
}
