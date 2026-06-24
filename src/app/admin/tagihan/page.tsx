"use client"

import { useState, useEffect } from "react"
import { getAllBillTypes, getAllClasses, addBillType, updateBillType, deleteBillType, formatRupiah, type BillType, type KelasData } from "@/lib/db"
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
  const [formRecurring, setFormRecurring] = useState(true)
  const [formBatasWaktu, setFormBatasWaktu] = useState("")
  const [formBerlakuKelas, setFormBerlakuKelas] = useState<string[]>([])
  const [deleteTarget, setDeleteTarget] = useState<BillType | null>(null)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const [data, kelas] = await Promise.all([getAllBillTypes(), getAllClasses()])
    setBillTypes(data)
    setKelasList(kelas)
    setLoading(false)
  }

  function openAdd() {
    setEditId(null); setFormName(""); setFormDesc(""); setFormAmount(""); setFormRecurring(true)
    setFormBatasWaktu(""); setFormBerlakuKelas([])
    setShowModal(true)
  }

  function openEdit(b: BillType) {
    setEditId(b.id); setFormName(b.name); setFormDesc(b.description)
    setFormAmount(b.default_amount.toString()); setFormRecurring(b.is_recurring)
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

    const payload: Record<string, unknown> = {
      name: formName.trim(),
      description: formDesc.trim(),
      default_amount: amount,
      is_recurring: formRecurring,
    }
    // Only include new fields if they have values (avoids errors if columns don't exist yet)
    if (formBatasWaktu) payload.batas_waktu = formBatasWaktu
    if (formBerlakuKelas.length > 0) payload.berlaku_untuk_kelas = formBerlakuKelas

    if (editId) {
      const ok = await updateBillType(editId, payload)
      if (ok) { setShowModal(false); showToast("Tagihan diperbarui!"); await fetchData() }
      else showToast("Gagal memperbarui!", "error")
    } else {
      const result = await addBillType(
        formName.trim(), formDesc.trim(), amount, formRecurring,
        formBatasWaktu || undefined,
        formBerlakuKelas.length > 0 ? formBerlakuKelas : undefined
      )
      if (result.success) {
        setShowModal(false)
        showToast(result.billsGenerated && result.billsGenerated > 0
          ? `Tagihan ditambahkan! ${result.billsGenerated} tagihan siswa dibuat.`
          : "Tagihan ditambahkan!")
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
                  <button className="tc-btn" onClick={() => openEdit(b)} title="Edit"><Pencil size={14} /></button>
                  <button className="tc-btn tc-btn-delete" onClick={() => setDeleteTarget(b)} title="Hapus"><Trash2 size={14} /></button>
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
          <div className="admin-modal" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3>{editId ? "Edit Tagihan" : "Tambah Tagihan Baru"}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            <label className="form-label">Nama Tagihan</label>
            <input className="admin-input" placeholder="Contoh: SPP Bulanan, Seragam, Ujian"
              value={formName} onChange={e => setFormName(e.target.value)} autoFocus />

            <label className="form-label">Deskripsi</label>
            <input className="admin-input" placeholder="Keterangan (opsional)"
              value={formDesc} onChange={e => setFormDesc(e.target.value)} />

            <label className="form-label">Nominal Default (Rp)</label>
            <input className="admin-input" placeholder="150000" type="number"
              value={formAmount} onChange={e => setFormAmount(e.target.value)} />

            <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={formRecurring} onChange={e => setFormRecurring(e.target.checked)} />
              Tagihan bulanan (berulang setiap bulan)
            </label>

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
