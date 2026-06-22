"use client"

import { useState, useEffect } from "react"
import { getAllClasses, addKelas, deleteKelas } from "@/lib/db"
import type { KelasData } from "@/lib/db"
import { useToast } from "@/components/Toast"
import { ConfirmModal } from "@/components/ConfirmModal"

export default function AdminKelasPage() {
  const { showToast } = useToast()
  const [kelasList, setKelasList] = useState<KelasData[]>([])
  const [loading, setLoading] = useState(true)
  const [formName, setFormName] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<KelasData | null>(null)

  useEffect(() => { fetchKelas() }, [])

  async function fetchKelas() {
    setLoading(true)
    const data = await getAllClasses()
    setKelasList(data)
    setLoading(false)
  }

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

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Kelola Kelas</h1>
      </div>

      <p style={{ color: "#757575", marginBottom: 14, fontSize: 13 }}>
        Tambah atau hapus kelas sesuai kebutuhan data siswa.
      </p>

      <div className="admin-card">
        <h3 style={{ marginBottom: 10 }}>Tambah Kelas Baru</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="admin-input" placeholder="Contoh: 3C, 7A"
            value={formName} onChange={e => setFormName(e.target.value)}
            style={{ flex: 1 }} />
          <button className="admin-btn" onClick={handleAdd}>Tambah</button>
        </div>
      </div>

      {loading ? <div className="loading-text">Memuat...</div> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nama Kelas</th><th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {kelasList.map(k => (
                <tr key={k.id}>
                  <td style={{ fontWeight: 600 }}>{k.name}</td>
                  <td>
                    <button className="admin-btn admin-btn-sm admin-btn-danger"
                      onClick={() => setDeleteTarget(k)}>Hapus</button>
                  </td>
                </tr>
              ))}
              {kelasList.length === 0 && (
                <tr><td colSpan={2} style={{ textAlign: "center", color: "#9e9e9e" }}>Belum ada kelas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ fontSize: 12, color: "#6b776d", marginTop: 8 }}>
        Kelas 1A-6B sudah dibuat otomatis dari database. Tambah kelas tambahan jika diperlukan.
      </p>

      <ConfirmModal
        open={!!deleteTarget}
        title="Hapus Kelas"
        message={`Yakin hapus kelas ${deleteTarget?.name}? Semua siswa di kelas ini akan kehilangan kelas.`}
        confirmLabel="Hapus"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
