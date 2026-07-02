"use client"

import { useState, useEffect } from "react"

import { getKelasWithStats } from "@/lib/admin-db"
import { addKelas, deleteKelas } from "@/lib/db"
import type { KelasWithStats } from "@/lib/admin-db"
import { useToast } from "@/components/Toast"
import { ConfirmModal } from "@/components/ConfirmModal"
import { useAdminRole } from "@/context/AdminRoleContext"
import { Building2, Users, Plus, Inbox, Trash2 } from "lucide-react"

export default function AdminKelasPage() {
  const { showToast } = useToast()
  const { role } = useAdminRole()
  const [kelasList, setKelasList] = useState<KelasWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [formName, setFormName] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<KelasWithStats | null>(null)

  async function fetchKelas() {
    setLoading(true)
    const data = await getKelasWithStats()
    setKelasList(data); setLoading(false)
  }

  useEffect(() => {
    const timer = setTimeout(() => fetchKelas(), 0)
    const interval = setInterval(fetchKelas, 30000)

    const onVisible = () => { if (!document.hidden) fetchKelas() }
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [])

  async function handleAdd() {
    if (!formName.trim()) return showToast("Isi nama kelas!", "error")
    const ok = await addKelas(formName.trim().toUpperCase())
    if (ok) { setFormName(""); showToast("Kelas ditambahkan!"); await fetchKelas() }
    else showToast("Gagal! Kelas mungkin sudah ada.", "error")
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const ok = await deleteKelas(deleteTarget.id)
    if (ok) { showToast("Kelas dihapus!"); await fetchKelas() }
    else showToast("Gagal menghapus!", "error")
    setDeleteTarget(null)
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
            <button className="admin-btn card-add-btn" onClick={handleAdd}>
              <Plus size={15} /> Tambah
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
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
