"use client"

import { useState, useEffect } from "react"
import { getAllBillTypes, getAllClasses, addBillType, updateBillType, deleteBillType, formatRupiah, type BillType, type KelasData } from "@/lib/db"
import { createBillTypeWithGeneration } from "@/lib/db-enhanced"
import { useToast } from "@/components/Toast"
import { ConfirmModal } from "@/components/ConfirmModal"
import { Plus, Pencil, Trash2, X, RefreshCw, Package, Inbox, CalendarDays } from "lucide-react"

export default function AdminTagihanPage() {
  const { showToast } = useToast()
  const [billTypes, setBillTypes] = useState<BillType[]>([])
  const [kelasList, setKelasList] = useState<KelasData[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formName, setFormName] = useState("")
  const [formDesc, setFormDesc] = useState("")
  const [formAmount, setFormAmount] = useState("")
  const [formBatasWaktu, setFormBatasWaktu] = useState("")
  const [formBerlakuKelas, setFormBerlakuKelas] = useState<string[]>([])
  const [deleteTarget, setDeleteTarget] = useState<BillType | null>(null)
  
  // New states for dropdown toggle
  const [assignmentMode, setAssignmentMode] = useState<'auto' | 'manual'>('manual')
  const [allMonths, setAllMonths] = useState(false)
  const [selectedMonths, setSelectedMonths] = useState<string[]>([])
  
  const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  async function fetchData() {
    setLoading(true)
    const [data, kelas] = await Promise.all([getAllBillTypes(), getAllClasses()])
    setBillTypes(data)
    setKelasList(kelas)
    setLoading(false)
  }

  useEffect(() => {
    const timer = setTimeout(() => fetchData(), 0)
    const interval = setInterval(fetchData, 30000)
    const onVisible = () => { if (!document.hidden) fetchData() }
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [])

  function openAdd() {
    setEditId(null); setFormName(""); setFormDesc(""); setFormAmount("250000")
    setFormBatasWaktu(""); setFormBerlakuKelas([])
    setAssignmentMode('manual'); setAllMonths(false); setSelectedMonths([])
    setShowModal(true)
  }

  function openEdit(b: BillType) {
    setEditId(b.id); setFormName(b.name); setFormDesc(b.description)
    setFormAmount(b.default_amount.toString())
    setFormBatasWaktu(b.batas_waktu || "")
    setFormBerlakuKelas(b.berlaku_untuk_kelas || [])
    setShowModal(true)
  }

  function toggleKelas(name: string) {
    setFormBerlakuKelas(prev =>
      prev.includes(name) ? prev.filter(k => k !== name) : [...prev, name]
    )
  }

  async function handleSubmit() {
    if (!formName.trim()) return showToast("Isi nama tagihan!", "error")
    if (!formAmount || isNaN(Number(formAmount))) return showToast("Isi nominal valid!", "error")
    const amount = parseInt(formAmount)
    if (amount < 0) return showToast("Nominal tidak boleh negatif!", "error")

    // Validate months for auto mode
    if (assignmentMode === 'auto' && selectedMonths.length === 0) {
      return showToast("Mode auto: Pilih minimal 1 bulan!", "error")
    }

    if (editId) {
      // Edit mode - use old function for backward compatibility
      const payload: Record<string, unknown> = {
        name: formName.trim(),
        description: formDesc.trim(),
        default_amount: amount,
        is_recurring: true,
      }
      if (formBatasWaktu) payload.batas_waktu = formBatasWaktu
      if (formBerlakuKelas.length > 0) payload.berlaku_untuk_kelas = formBerlakuKelas
      
      const ok = await updateBillType(editId, payload)
      if (ok) { setShowModal(false); showToast("Tagihan diperbarui!"); await fetchData() }
      else showToast("Gagal memperbarui!", "error")
    } else {
      // Create mode - use new enhanced function
      const monthsToApply = assignmentMode === 'auto' ? selectedMonths : []
      
      const result = await createBillTypeWithGeneration({
        name: formName.trim(),
        description: formDesc.trim(),
        default_amount: amount,
        assignment_mode: assignmentMode,
        applicable_months: monthsToApply,
        batas_waktu: formBatasWaktu || undefined,
        berlaku_untuk_kelas: formBerlakuKelas.length > 0 ? formBerlakuKelas : undefined
      })
      
      if (result.success) {
        setShowModal(false)
        showToast(
          result.billsGenerated
            ? `Tagihan ditambahkan! ${result.billsGenerated} tagihan siswa dibuat.`
            : (result.message || "Tagihan ditambahkan!")
        )
        await fetchData()
      } else {
        showToast(result.error || "Gagal menambah tagihan!", "error")
      }
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const ok = await deleteBillType(deleteTarget.id)
    if (ok) { showToast("Tagihan dihapus!"); await fetchData() }
    else showToast("Gagal menghapus!", "error")
    setDeleteTarget(null)
  }

  function formatTanggal(tgl: string) {
    if (!tgl) return ""
    try {
      return new Date(tgl).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    } catch {
      return tgl
    }
  }

  return (
    <div className="admin-page">
      <div className="page-title">Kelola Tagihan</div>
      <p className="page-subtitle">Tambah dan kelola jenis tagihan sekolah (SPP, Ujian, Seragam, dll)</p>

      {/* TOOLBAR */}
      <div className="tagihan-toolbar">
        <button className="admin-btn" onClick={openAdd}>
          <Plus size={15} /> Tambah Tagihan
        </button>
      </div>

      {/* CARD GRID */}
      {loading ? (
        <div className="tagihan-grid">
          {[1,2,3].map(i => <div key={i} className="tagihan-card skeleton" />)}
        </div>
      ) : billTypes.length === 0 ? (
        <div className="empty-state">
          <Inbox size={48} color="var(--neutral)" style={{ opacity: 0.4, marginBottom: 12 }} />
          <p>Belum ada jenis tagihan</p>
          <p className="empty-state-sub">Tambahkan tagihan baru di atas</p>
        </div>
      ) : (
        <div className="tagihan-grid">
          {billTypes.map(b => (
            <div key={b.id} className="tagihan-card">
              <div className="tc-header">
                <div className="tc-icon">
                  {b.is_recurring ? <RefreshCw size={24} color="var(--emerald)" /> : <Package size={24} color="var(--neutral)" />}
                </div>
                <div className="tc-actions">
                  <button className="tc-btn" onClick={() => openEdit(b)} title="Edit" aria-label="Edit tagihan"><Pencil size={14} /></button>
                  <button className="tc-btn tc-btn-delete" onClick={() => setDeleteTarget(b)} title="Hapus" aria-label="Hapus tagihan"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="tc-name">{b.name}</div>
              {b.description && <div className="tc-desc">{b.description}</div>}
              <div className="tc-amount">{formatRupiah(b.default_amount)}</div>
              <div className="tc-footer">
                <span className={`tc-badge ${b.is_recurring ? "recurring" : "one-time"}`}>
                  {b.is_recurring ? "Bulanan" : "Satu Kali"}
                </span>
                {b.batas_waktu && (
                  <span className="tc-badge tc-badge-deadline">
                    <CalendarDays size={11} style={{ verticalAlign: "middle" }} /> {formatTanggal(b.batas_waktu)}
                  </span>
                )}
              </div>
              {b.berlaku_untuk_kelas && b.berlaku_untuk_kelas.length > 0 && (
                <div className="tc-kelas-tags">
                  {b.berlaku_untuk_kelas.map(k => (
                    <span key={k} className="tc-kelas-tag">{k}</span>
                  ))}
                </div>
              )}
              {(!b.berlaku_untuk_kelas || b.berlaku_untuk_kelas.length === 0) && (
                <div className="tc-kelas-all">Semua Kelas</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <>
          <div className="admin-overlay" onClick={() => setShowModal(false)} />
          <div className="admin-modal" style={{ maxWidth: 540, maxHeight: '70vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>{editId ? "Edit Tagihan" : "Tambah Tagihan Baru"}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)} aria-label="Tutup modal"><X size={18} /></button>
            </div>

            <label className="form-label">Nama Tagihan</label>
            <input className="admin-input" placeholder="Contoh: SPP Bulanan, Seragam, Ujian"
              value={formName} onChange={e => setFormName(e.target.value)} autoFocus />

            <label className="form-label">Deskripsi</label>
            <input className="admin-input" placeholder="Keterangan (opsional)"
              value={formDesc} onChange={e => setFormDesc(e.target.value)} />

            <label className="form-label">Nominal Default (Rp)</label>
            <input className="admin-input" placeholder="250000" type="number"
              value={formAmount} onChange={e => setFormAmount(e.target.value)} />

            {/* Mode Toggle - Only for new bill types */}
            {!editId && (
              <>
                <div className="form-label" style={{ marginTop: 16 }}>Mode Penagihan</div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <label style={{
                    cursor: 'pointer', flex: 1, padding: 12,
                    border: '2px solid', borderRadius: 10,
                    borderColor: assignmentMode === 'auto' ? 'var(--emerald)' : '#e0e0e0',
                    background: assignmentMode === 'auto' ? 'var(--emerald-soft)' : 'white',
                    transition: 'all 0.2s'
                  }}>
                    <input type="radio" checked={assignmentMode === 'auto'}
                      onChange={() => {
                        setAssignmentMode('auto')
                        setAllMonths(true)
                        setSelectedMonths(MONTHS)
                      }} />
                    <div style={{ marginTop: 8 }}>
                      <strong>Auto-Generate</strong>
                      <p style={{ fontSize: 12, color: 'var(--neutral)', marginTop: 4 }}>
                        Buat 1 tagihan, pilih bulan (1-12), auto-generate untuk semua siswa
                      </p>
                    </div>
                  </label>

                  <label style={{
                    cursor: 'pointer', flex: 1, padding: 12,
                    border: '2px solid', borderRadius: 10,
                    borderColor: assignmentMode === 'manual' ? 'var(--emerald)' : '#e0e0e0',
                    background: assignmentMode === 'manual' ? 'var(--emerald-soft)' : 'white',
                    transition: 'all 0.2s'
                  }}>
                    <input type="radio" checked={assignmentMode === 'manual'}
                      onChange={() => {
                        setAssignmentMode('manual')
                        setSelectedMonths([])
                      }} />
                    <div style={{ marginTop: 8 }}>
                      <strong>Manual per Bulan</strong>
                      <p style={{ fontSize: 12, color: 'var(--neutral)', marginTop: 4 }}>
                        Buat tagihan terpisah untuk setiap bulan (seperti sekarang)
                      </p>
                    </div>
                  </label>
                </div>

                {/* Month Selector - Only for Auto mode */}
                {assignmentMode === 'auto' && (
                  <>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <input type="checkbox" checked={allMonths}
                        onChange={(e) => {
                          setAllMonths(e.target.checked)
                          if (e.target.checked) setSelectedMonths(MONTHS)
                          else setSelectedMonths([])
                        }} />
                      <span className="form-label" style={{ marginBottom: 0 }}>
                        Semua bulan (Januari - Desember)
                      </span>
                    </label>

                    {!allMonths && (
                      <>
                        <div className="form-label">Pilih Bulan yang Berlaku:</div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: 8,
                          padding: 12,
                          border: '1px solid #e0e0e0',
                          borderRadius: 10,
                          maxHeight: 240,
                          overflowY: 'auto'
                        }}>
                          {MONTHS.map(month => (
                            <label key={month} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              cursor: 'pointer',
                              padding: '6px 8px',
                              borderRadius: 6,
                              background: selectedMonths.includes(month) ? 'var(--emerald-soft)' : 'transparent',
                              transition: 'background 0.2s'
                            }}>
                              <input
                                type="checkbox"
                                checked={selectedMonths.includes(month)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedMonths(prev => [...prev, month])
                                  } else {
                                    setSelectedMonths(prev => prev.filter(m => m !== month))
                                  }
                                }}
                              />
                              <span style={{ fontSize: 13 }}>{month}</span>
                            </label>
                          ))}
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: 8,
                          padding: '8px 12px',
                          background: 'var(--emerald-soft)',
                          borderRadius: 8
                        }}>
                          <span style={{ fontSize: 12, color: 'var(--emerald)', fontWeight: 600 }}>
                            {selectedMonths.length} bulan terpilih
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedMonths([])}
                            style={{
                              fontSize: 11,
                              color: 'var(--terracotta)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              textDecoration: 'underline'
                            }}
                          >
                            Clear semua
                          </button>
                        </div>
                      </>
                    )}

                    {/* Preview */}
                    {selectedMonths.length > 0 && (
                      <div style={{
                        marginTop: 12,
                        padding: 12,
                        background: '#f0f9ff',
                        border: '1px solid #0ea5e9',
                        borderRadius: 10,
                        fontSize: 13
                      }}>
                        <strong>Preview:</strong> Akan generate {selectedMonths.length} × jumlah siswa tagihan
                        {formBerlakuKelas.length > 0 && ` (hanya kelas ${formBerlakuKelas.join(', ')})`}
                      </div>
                    )}
                  </>
                )}

                {/* Manual mode helper */}
                {assignmentMode === 'manual' && (
                  <div style={{
                    padding: 12,
                    background: '#fef3c7',
                    border: '1px solid #f59e0b',
                    borderRadius: 10,
                    fontSize: 13,
                    marginTop: 12
                  }}>
                    <strong>Mode Manual:</strong> Nama tagihan harus include nama bulan (contoh: "SPP Januari", "SPP Februari").
                    Tagihan akan di-generate untuk 1 bulan saja sesuai nama.
                  </div>
                )}
              </>
            )}

            <label className="form-label">Batas Waktu Bayar (opsional)</label>
            <input className="admin-input" type="date"
              value={formBatasWaktu} onChange={e => setFormBatasWaktu(e.target.value)} />
            <p style={{ fontSize: 12, color: "var(--neutral)", marginTop: -4, marginBottom: 12 }}>
              Kosongkan jika tidak ada deadline
            </p>

            <label className="form-label">Berlaku untuk Kelas (opsional)</label>
            <div className="kelas-checkbox-list">
              {kelasList.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--neutral)" }}>Belum ada kelas. Jika dikosongkan, tagihan berlaku untuk semua kelas.</p>
              ) : (
                <>
                  {kelasList.map(k => (
                    <label key={k.id} className="kelas-checkbox-item">
                      <input type="checkbox" checked={formBerlakuKelas.includes(k.name)}
                        onChange={() => toggleKelas(k.name)} />
                      <span>{k.name}</span>
                    </label>
                  ))}
                  <p style={{ fontSize: 12, color: "var(--neutral)", marginTop: 4 }}>
                    Tidak dipilih = berlaku untuk semua kelas
                  </p>
                </>
              )}
            </div>

            <div className="admin-modal-actions">
              <button className="admin-btn admin-btn-outline" onClick={() => setShowModal(false)}>Batal</button>
              <button className="admin-btn" onClick={handleSubmit}>{editId ? "Update" : "Simpan"}</button>
            </div>
          </div>
        </>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Hapus Tagihan"
        message={`Yakin hapus "${deleteTarget?.name}"? Semua tagihan siswa yang terkait juga akan dihapus.`}
        confirmLabel="Hapus"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
