"use client"

import { useState, useRef } from "react"

import { getKelasWithStats } from "@/lib/admin-db"
import { addKelas, deleteKelas } from "@/lib/db"
import type { KelasWithStats } from "@/lib/admin-db"
import { useToast } from "@/components/Toast"
import { ConfirmModal } from "@/components/ConfirmModal"
import { useAdminRole } from "@/context/AdminRoleContext"
import { Building2, Users, Plus, Inbox, Trash2 } from "lucide-react"
import { usePageRefresh } from "@/hooks/usePageRefresh"

export default function AdminKelasPage() {
  const { showToast } = useToast()
  const { role } = useAdminRole()
  const [kelasList, setKelasList] = useState<KelasWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [formName, setFormName] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<KelasWithStats | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const actionLock = useRef(false)

  const refreshKelas = usePageRefresh(async (isCurrent) => {
    const data = await getKelasWithStats()
    if (isCurrent()) { setKelasList(data); setLoading(false) }
  }, { refreshKey: "admin-classes" })

  async function handleAdd() {
    if (actionLock.current) return
    if (!formName.trim()) return showToast("Isi nama kelas!", "error")
    actionLock.current = true
    setActionLoading(true)
    try {
      const ok = await addKelas(formName.trim().toUpperCase())
      if (ok) { setFormName(""); showToast("Kelas ditambahkan!"); await refreshKelas() }
      else showToast("Gagal! Kelas mungkin sudah ada.", "error")
    } finally {
      actionLock.current = false
      setActionLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget || actionLock.current) return
    actionLock.current = true
    setActionLoading(true)
    try {
      const ok = await deleteKelas(deleteTarget.id)
      if (ok) { showToast("Kelas dihapus!"); await refreshKelas() }
      else showToast("Gagal menghapus!", "error")
      setDeleteTarget(null)
    } finally {
      actionLock.current = false
      setActionLoading(false)
    }
  }

  const deleteMessage = deleteTarget
    ? deleteTarget.totalSiswa > 0
      ? `Kelas "${deleteTarget.name}" masih punya ${deleteTarget.totalSiswa} siswa. Siswa akan kehilangan kelasnya. Yakin lanjut?`
      : `Yakin hapus kelas "${deleteTarget.name}"?`
    : ""

  return (
    <div className="admin-page">
      <div className="page-title">Kelola Kelas</div>
      <p className="page-subtitle">Klik kartu kelas untuk melihat siswa di kelas tersebut</p>

      {role === 'admin' && (
        <div className="card-add">
          <div className="card-add-inner">
            <Building2 size={20} color="var(--emerald)" style={{ flexShrink: 0 }} />
            <input
              className="admin-input card-add-input"
              placeholder="Nama kelas baru (contoh: 3C)"
              value={formName}
              onChange={e => setFormName(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
            />
            <button className="admin-btn card-add-btn" onClick={handleAdd} disabled={actionLoading}>
              <Plus size={15} /> {actionLoading ? "Memuat..." : "Tambah"}
            </button>
          </div>
        </div>
      )}

      {/* CARD GRID */}
      {loading ? (
        <div className="kelas-grid">
          {[1, 2, 3, 4].map(i => <div key={i} className="kelas-card skeleton" />)}
        </div>
      ) : kelasList.length === 0 ? (
        <div className="empty-state">
          <Inbox size={48} color="var(--neutral)" style={{ opacity: 0.4, marginBottom: 12 }} />
          <p>Belum ada kelas</p>
          <p className="empty-state-sub">Tambahkan kelas baru di atas</p>
        </div>
      ) : (
        <div className="kelas-grid">
          {kelasList.map(kelas => (
            <div key={kelas.id} className="kelas-card-wrapper">
              <a href={`/admin/siswa?kelas=${kelas.name}`} className="kelas-card" style={{ textDecoration: "none", color: "inherit" }}>
                <div className="kelas-card-header">
                  <span className="kelas-badge">Kelas {kelas.name}</span>
                  <span className={`kelas-status ${kelas.tunggakan > 0 ? "has-tunggakan" : "all-paid"}`}>
                    {kelas.tunggakan > 0 ? `${kelas.tunggakan} tunggakan` : "Semua lunas"}
                  </span>
                </div>
                <div className="kelas-card-body">
                  <div className="kelas-student-count">
                    <Users size={18} color="var(--emerald)" />
                    <span className="kelas-student-num">{kelas.totalSiswa}</span>
                    <span className="kelas-student-label"> siswa</span>
                  </div>
                </div>
                <div className="kelas-card-footer">
                  <span className="kelas-card-action">Lihat Siswa →</span>
                </div>
              </a>
              {role === 'admin' && (
                <button
                  className="kelas-card-delete"
                  onClick={() => setDeleteTarget(kelas)}
                  title="Hapus kelas"
                  aria-label="Hapus kelas"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Hapus Kelas"
        message={deleteMessage}
        confirmLabel="Hapus"
        danger
        pending={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
