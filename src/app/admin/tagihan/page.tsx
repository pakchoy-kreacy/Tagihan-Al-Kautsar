"use client"

import { useState, useEffect } from "react"
import { getAllBillTypes, addBillType, updateBillType, deleteBillType, formatRupiah, type BillType } from "@/lib/db"
import { useToast } from "@/components/Toast"
import { ConfirmModal } from "@/components/ConfirmModal"
import { Plus, Edit2, Trash2, X } from "@/components/Icons"

export default function AdminTagihanPage() {
  const { showToast } = useToast()
  const [billTypes, setBillTypes] = useState<BillType[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formName, setFormName] = useState("")
  const [formDesc, setFormDesc] = useState("")
  const [formAmount, setFormAmount] = useState("")
  const [formRecurring, setFormRecurring] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<BillType | null>(null)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const data = await getAllBillTypes()
    setBillTypes(data)
    setLoading(false)
  }

  function openAdd() {
    setEditId(null); setFormName(""); setFormDesc(""); setFormAmount(""); setFormRecurring(true)
    setShowModal(true)
  }

  function openEdit(b: BillType) {
    setEditId(b.id); setFormName(b.name); setFormDesc(b.description)
    setFormAmount(b.default_amount.toString()); setFormRecurring(b.is_recurring)
    setShowModal(true)
  }

  async function handleSubmit() {
    if (!formName.trim()) return showToast("Isi nama tagihan!", "error")
    if (!formAmount || isNaN(Number(formAmount))) return showToast("Isi nominal valid!", "error")
    const amount = parseInt(formAmount)
    if (amount < 0) return showToast("Nominal tidak boleh negatif!", "error")

    if (editId) {
      const ok = await updateBillType(editId, {
        name: formName.trim(),
        description: formDesc.trim(),
        default_amount: amount,
        is_recurring: formRecurring,
      })
      if (ok) { setShowModal(false); showToast("Tagihan diperbarui!"); await fetchData() }
      else showToast("Gagal memperbarui!", "error")
    } else {
      const ok = await addBillType(formName.trim(), formDesc.trim(), amount, formRecurring)
      if (ok) { setShowModal(false); showToast("Tagihan ditambahkan!"); await fetchData() }
      else showToast("Gagal menambah tagihan!", "error")
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const ok = await deleteBillType(deleteTarget.id)
    if (ok) { showToast("Tagihan dihapus!"); await fetchData() }
    else showToast("Gagal menghapus!", "error")
    setDeleteTarget(null)
  }

  return (
    <div className="admin-page">
      <div className="page-title">Kelola Tagihan</div>
      <p className="page-subtitle">Tambah dan kelola jenis tagihan sekolah (SPP, Ujian, Seragam, dll)</p>

      {/* TOOLBAR */}
      <div className="tagihan-toolbar">
        <button className="admin-btn" onClick={openAdd}>
          <Plus size={14} /> Tambah Tagihan
        </button>
      </div>

      {/* CARD GRID */}
      {loading ? (
        <div className="tagihan-grid">
          {[1,2,3].map(i => <div key={i} className="tagihan-card skeleton" />)}
        </div>
      ) : billTypes.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <p>Belum ada jenis tagihan. Tambahkan tagihan di atas.</p>
        </div>
      ) : (
        <div className="tagihan-grid">
          {billTypes.map(b => (
            <div key={b.id} className="tagihan-card">
              <div className="tc-header">
                <div className="tc-icon">{b.is_recurring ? "🔄" : "📦"}</div>
                <div className="tc-actions">
                  <button className="tc-btn" onClick={() => openEdit(b)} title="Edit"><Edit2 size={14} /></button>
                  <button className="tc-btn tc-btn-delete" onClick={() => setDeleteTarget(b)} title="Hapus"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="tc-name">{b.name}</div>
              {b.description && <div className="tc-desc">{b.description}</div>}
              <div className="tc-amount">{formatRupiah(b.default_amount)}</div>
              <div className="tc-footer">
                <span className={`tc-badge ${b.is_recurring ? "recurring" : "one-time"}`}>
                  {b.is_recurring ? "🔄 Bulanan" : "📦 Satu Kali"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <>
          <div className="admin-overlay" onClick={() => setShowModal(false)} />
          <div className="admin-modal">
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
        message={`Yakin hapus "${deleteTarget?.name}"? Tagihan yang sudah dibuat untuk siswa tidak ikut terhapus.`}
        confirmLabel="Hapus"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
