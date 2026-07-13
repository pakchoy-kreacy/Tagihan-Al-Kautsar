"use client"

import { useState, useEffect } from "react"
import { getAllBillTypes, getAllClasses, updateBillType, deleteBillType, formatRupiah, type BillType, type KelasData } from "@/lib/db"
import { createBillTypeWithGeneration } from "@/lib/db-enhanced"
import { useToast } from "@/components/Toast"
import { ConfirmModal } from "@/components/ConfirmModal"
import { useAdminRole } from "@/context/AdminRoleContext"
import { Plus, Pencil, Trash2, X, RefreshCw, Package, Inbox, CalendarDays } from "lucide-react"

export default function AdminTagihanPage() {
  const { showToast } = useToast()
  const { role } = useAdminRole()
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
  
  const [assignmentMode, setAssignmentMode] = useState<'auto' | 'manual'>('manual')
  const [formYear, setFormYear] = useState(2024)
  const [manualMonth, setManualMonth] = useState('Januari')
  const [mounted, setMounted] = useState(false)
  
  const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  const YEARS = Array.from({ length: 14 }, (_, i) => 2024 - 2 + i)

  useEffect(() => {
    setMounted(true)
    setFormYear(new Date().getFullYear())
  }, [])

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
    setAssignmentMode('manual'); setManualMonth('Januari')
    if (mounted) setFormYear(new Date().getFullYear())
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
    if (!formAmount || isNaN(Number(formAmount))) return showToast("Isi nominal valid!", "error")
    const amount = parseInt(formAmount)
    if (amount < 0) return showToast("Nominal tidak boleh negatif!", "error")

    if (editId) {
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
    } else if (assignmentMode === 'auto') {
      if (!formYear) return showToast("Pilih tahun!", "error")
      
      setShowModal(false)
      
      const promises = MONTHS.map(month =>
        createBillTypeWithGeneration({
          name: `SPP ${month} ${formYear}`,
          description: formDesc.trim(),
          default_amount: amount,
          assignment_mode: 'manual',
          applicable_months: [month],
          year: formYear,
          batas_waktu: formBatasWaktu || undefined,
          berlaku_untuk_kelas: formBerlakuKelas.length > 0 ? formBerlakuKelas : undefined
        })
      )
      
      const results = await Promise.all(promises)
      const successCount = results.filter(r => r.success).length
      const totalBills = results.reduce((sum, r) => sum + r.billsGenerated, 0)
      
      if (successCount > 0) {
        showToast(`Berhasil! ${successCount} tagihan dibuat (${totalBills} tagihan siswa).`)
      } else {
        showToast("Gagal membuat tagihan!", "error")
      }
      await fetchData()
    } else {
      if (!manualMonth) return showToast("Pilih bulan!", "error")
      if (!formYear) return showToast("Pilih tahun!", "error")
      
      const name = `SPP ${manualMonth} ${formYear}`
      
      const result = await createBillTypeWithGeneration({
        name,
        description: formDesc.trim(),
        default_amount: amount,
        assignment_mode: 'manual',
        applicable_months: [manualMonth],
        year: formYear,
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
      {role === 'admin' && (
        <div className="tagihan-toolbar">
          <button className="admin-btn" onClick={openAdd}>
            <Plus size={15} /> Tambah Tagihan
          </button>
        </div>
      )}

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
                {role === 'admin' && (
                  <div className="tc-actions">
                    <button className="tc-btn" onClick={() => openEdit(b)} title="Edit" aria-label="Edit tagihan"><Pencil size={14} /></button>
                    <button className="tc-btn tc-btn-delete" onClick={() => setDeleteTarget(b)} title="Hapus" aria-label="Hapus tagihan"><Trash2 size={14} /></button>
                  </div>
                )}
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

            {editId ? (
              <>
                <label className="form-label">Nama Tagihan</label>
                <input className="admin-input" placeholder="Nama tagihan"
                  value={formName} onChange={e => setFormName(e.target.value)} autoFocus />
              </>
            ) : (
              <>
                <div className="form-label" style={{ marginTop: 0 }}>Mode Penagihan</div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <label style={{
                    cursor: 'pointer', flex: 1, padding: 12,
                    border: '2px solid', borderRadius: 10,
                    borderColor: assignmentMode === 'auto' ? 'var(--emerald)' : '#e0e0e0',
                    background: assignmentMode === 'auto' ? 'var(--emerald-soft)' : 'white',
                  }}>
                    <input type="radio" checked={assignmentMode === 'auto'}
                      onChange={() => setAssignmentMode('auto')} />
                    <div style={{ marginTop: 8 }}>
                      <strong>Auto-Generate</strong>
                      <p style={{ fontSize: 12, color: 'var(--neutral)', marginTop: 4 }}>
                        Buat 12 tagihan (Jan-Des) otomatis untuk tahun tertentu
                      </p>
                    </div>
                  </label>

                  <label style={{
                    cursor: 'pointer', flex: 1, padding: 12,
                    border: '2px solid', borderRadius: 10,
                    borderColor: assignmentMode === 'manual' ? 'var(--emerald)' : '#e0e0e0',
                    background: assignmentMode === 'manual' ? 'var(--emerald-soft)' : 'white',
                  }}>
                    <input type="radio" checked={assignmentMode === 'manual'}
                      onChange={() => setAssignmentMode('manual')} />
                    <div style={{ marginTop: 8 }}>
                      <strong>Manual per Bulan</strong>
                      <p style={{ fontSize: 12, color: 'var(--neutral)', marginTop: 4 }}>
                        Buat 1 tagihan untuk bulan & tahun tertentu
                      </p>
                    </div>
                  </label>
                </div>

                {assignmentMode === 'auto' ? (
                  <div style={{ marginBottom: 16 }}>
                    <label className="form-label">Tahun</label>
                    <select className="admin-input" value={formYear}
                      onChange={e => setFormYear(Number(e.target.value))}>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <div style={{
                      marginTop: 12, padding: 12,
                      background: 'var(--emerald-soft)',
                      border: '1px solid var(--emerald)',
                      borderRadius: 10, fontSize: 13
                    }}>
                      <strong>Akan membuat 12 tagihan:</strong>
                      <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4 }}>
                        {MONTHS.map(m => (
                          <span key={m}>• SPP {m} {formYear}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                      <div style={{ flex: 1 }}>
                        <label className="form-label">Bulan</label>
                        <select className="admin-input" value={manualMonth}
                          onChange={e => setManualMonth(e.target.value)}>
                          {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label className="form-label">Tahun</label>
                        <select className="admin-input" value={formYear}
                          onChange={e => setFormYear(Number(e.target.value))}>
                          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>
                    <label className="form-label" style={{ marginTop: 12 }}>Nama Tagihan</label>
                    <input className="admin-input" value={`SPP ${manualMonth} ${formYear}`} readOnly
                      style={{ background: '#f5f5f5', color: '#666' }} />
                  </div>
                )}
              </>
            )}

            <label className="form-label">Deskripsi</label>
            <input className="admin-input" placeholder="Keterangan (opsional)"
              value={formDesc} onChange={e => setFormDesc(e.target.value)} />

            <label className="form-label">Nominal Default (Rp)</label>
            <input className="admin-input" placeholder="250000" type="number"
              value={formAmount} onChange={e => setFormAmount(e.target.value)} />

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
