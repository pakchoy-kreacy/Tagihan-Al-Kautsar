"use client"

import { useEffect, useState } from "react"
import { getDonations, updateDonasi, deleteDonasi } from "@/lib/infaq-db"
import { formatRupiah } from "@/lib/db"
import type { Donation } from "@/lib/infaq-db"
import { useAdminRole } from "@/context/AdminRoleContext"
import { Heart, Eye, Inbox, X, Pencil, Trash2, Search } from "lucide-react"

export default function AdminInfaqPage() {
  const { role } = useAdminRole()
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const [editItem, setEditItem] = useState<Donation | null>(null)
  const [editForm, setEditForm] = useState({ nama_donatur: "", nominal: "", pesan: "" })
  const [editSaving, setEditSaving] = useState(false)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteSaving, setDeleteSaving] = useState(false)

  useEffect(() => {
    let mounted = true

    async function fetchDonations() {
      setLoading(true)
      const data = await getDonations()
      if (mounted) { setDonations(data); setLoading(false) }
    }

    fetchDonations()
    const interval = setInterval(fetchDonations, 30000)
    const onVisible = () => { if (!document.hidden) fetchDonations() }
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      mounted = false
      clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [])

  const filtered = donations.filter(d =>
    (d.nama_donatur || "").toLowerCase().includes(search.toLowerCase())
  )

  const totalTerkumpul = donations.reduce((s, d) => s + d.nominal, 0)

  function openEdit(d: Donation) {
    setEditItem(d)
    setEditForm({ nama_donatur: d.nama_donatur, nominal: d.nominal.toString(), pesan: d.pesan || "" })
  }

  async function handleSaveEdit() {
    if (!editItem) return
    setEditSaving(true)
    const ok = await updateDonasi(editItem.id, {
      nama_donatur: editForm.nama_donatur,
      nominal: parseInt(editForm.nominal) || 0,
      pesan: editForm.pesan,
    })
    if (ok) {
      setDonations(prev => prev.map(d => d.id === editItem.id ? { ...d, ...editForm, nominal: parseInt(editForm.nominal) || 0 } : d))
      setEditItem(null)
    }
    setEditSaving(false)
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleteSaving(true)
    const ok = await deleteDonasi(deleteId)
    if (ok) {
      setDonations(prev => prev.filter(d => d.id !== deleteId))
      setDeleteId(null)
    }
    setDeleteSaving(false)
  }

  return (
    <div className="admin-page">
      <div className="page-title">Riwayat Infaq</div>
      <p className="page-subtitle">Daftar infaq yang masuk dari orang tua dan masyarakat</p>

      <div className="infaq-total-card">
        <div className="infaq-total-icon">
          <Heart size={28} color="var(--emerald)" />
        </div>
        <div className="infaq-total-content">
          <div className="infaq-total-label">Total Infaq Terkumpul</div>
          <div className="infaq-total-amount">{formatRupiah(totalTerkumpul)}</div>
        </div>
        <div className="infaq-total-count">
          <div className="infaq-total-count-num">{donations.length}</div>
          <div className="infaq-total-count-label">donasi</div>
        </div>
      </div>

      <div className="search-box" style={{ marginBottom: 16 }}>
        <span className="icon"><Search size={18} /></span>
        <input
          type="text"
          placeholder="Cari nama donatur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-text">Memuat...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Inbox size={48} color="var(--neutral)" style={{ opacity: 0.4, marginBottom: 12 }} />
          <p>{donations.length === 0 ? "Belum ada infaq masuk" : "Tidak ada data yang cocok"}</p>
          <p className="empty-state-sub">Infaq dari orang tua akan muncul di sini</p>
        </div>
      ) : (
        <div className="infaq-list">
          {filtered.map(d => (
            <div key={d.id} className="infaq-card">
              <div className="ic-header">
                <div className="ic-donatur">{d.nama_donatur || "Anonim"}</div>
                <div className="ic-amount">{formatRupiah(d.nominal)}</div>
              </div>
              {d.pesan && <div className="ic-pesan">&#8220;{d.pesan}&#8221;</div>}
              <div className="ic-date">
                {new Date(d.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </div>
              <div className="ic-actions">
                {d.bukti_url && (
                  <button type="button" className="ic-action-btn view" onClick={() => setPreviewUrl(d.bukti_url)} aria-label="Lihat bukti transfer">
                    <Eye size={14} /> Bukti
                  </button>
                )}
                {role === 'admin' && (
                  <button type="button" className="ic-action-btn edit" onClick={() => openEdit(d)} aria-label="Edit infaq">
                    <Pencil size={14} /> Edit
                  </button>
                )}
                {role === 'admin' && (
                  <button type="button" className="ic-action-btn delete" onClick={() => setDeleteId(d.id)} aria-label="Hapus infaq">
                    <Trash2 size={14} /> Hapus
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* IMAGE PREVIEW MODAL */}
      {previewUrl && (
        <>
          <div className="admin-overlay" onClick={() => setPreviewUrl(null)} />
          <div className="image-preview-modal">
            <div className="image-preview-header">
              <h3>Bukti Transfer</h3>
              <button className="modal-close" onClick={() => setPreviewUrl(null)} aria-label="Tutup preview"><X size={20} /></button>
            </div>
            <div className="image-preview-body">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Bukti Transfer" className="image-preview-img" />
            </div>
          </div>
        </>
      )}

      {/* EDIT MODAL */}
      {editItem && (
        <>
          <div className="admin-overlay" onClick={() => setEditItem(null)} />
          <div className="admin-modal">
            <div className="modal-header">
              <h3>Edit Infaq</h3>
              <button className="modal-close" onClick={() => setEditItem(null)} aria-label="Tutup edit"><X size={20} /></button>
            </div>
            <div className="modal-body">
              <label className="form-label">Nama Donatur</label>
              <input className="form-input" value={editForm.nama_donatur}
                onChange={(e) => setEditForm(f => ({ ...f, nama_donatur: e.target.value }))} />
              <label className="form-label">Nominal</label>
              <input className="form-input" type="number" value={editForm.nominal}
                onChange={(e) => setEditForm(f => ({ ...f, nominal: e.target.value }))} />
              <label className="form-label">Pesan</label>
              <textarea className="form-input" rows={3} value={editForm.pesan}
                onChange={(e) => setEditForm(f => ({ ...f, pesan: e.target.value }))} />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setEditItem(null)}>Batal</button>
              <button type="button" className="btn btn-primary" onClick={handleSaveEdit} disabled={editSaving}>
                {editSaving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteId && (
        <>
          <div className="admin-overlay" onClick={() => setDeleteId(null)} />
          <div className="admin-modal" style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <h3>Hapus Infaq</h3>
              <button className="modal-close" onClick={() => setDeleteId(null)} aria-label="Tutup konfirmasi"><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 14, color: "var(--ink)", textAlign: "center" }}>
                Yakin ingin menghapus data infaq ini? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setDeleteId(null)}>Batal</button>
              <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleteSaving}
                style={{ background: "var(--terracotta)", color: "white", border: "none" }}>
                {deleteSaving ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
