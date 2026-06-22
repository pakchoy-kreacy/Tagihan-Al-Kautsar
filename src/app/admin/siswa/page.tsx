"use client"

import { useState, useEffect } from "react"
import { getAllStudents, addSiswa, updateSiswa, deleteSiswa, getAllClasses } from "@/lib/db"
import type { Siswa, KelasData } from "@/lib/db"
import { useToast } from "@/components/Toast"
import { ConfirmModal } from "@/components/ConfirmModal"
import { Search } from "@/components/Icons"

export default function AdminSiswaPage() {
  const { showToast } = useToast()
  const [siswaList, setSiswaList] = useState<Siswa[]>([])
  const [kelasList, setKelasList] = useState<KelasData[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formNisn, setFormNisn] = useState("")
  const [formNama, setFormNama] = useState("")
  const [formKelas, setFormKelas] = useState("")
  const [search, setSearch] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<Siswa | null>(null)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [siswa, kelas] = await Promise.all([getAllStudents(), getAllClasses()])
      setSiswaList(siswa)
      setKelasList(kelas)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  function openAdd() {
    setEditId(null)
    setFormNisn(""); setFormNama(""); setFormKelas("")
    setShowModal(true)
  }

  function openEdit(s: Siswa) {
    setEditId(s.id)
    setFormNisn(s.nisn); setFormNama(s.nama); setFormKelas(s.kelas)
    setShowModal(true)
  }

  async function handleSubmit() {
    if (!formNisn || !formNama || !formKelas) return showToast("Isi semua field!", "error")
    if (editId) {
      const classData = kelasList.find(k => k.name === formKelas)
      const ok = await updateSiswa(editId, { nisn: formNisn, name: formNama, class_id: classData?.id })
      if (ok) { setShowModal(false); showToast("Siswa diperbarui!"); await fetchData() }
      else showToast("Gagal memperbarui!", "error")
    } else {
      const ok = await addSiswa(formNisn, formNama, formKelas)
      if (ok) { setShowModal(false); showToast("Siswa ditambahkan!"); await fetchData() }
      else showToast("Gagal menambah siswa!", "error")
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const ok = await deleteSiswa(deleteTarget.id)
    if (ok) { showToast("Siswa dihapus!"); await fetchData() }
    else showToast("Gagal menghapus!", "error")
    setDeleteTarget(null)
  }

  const filtered = siswaList.filter(s =>
    s.nama.toLowerCase().includes(search.toLowerCase()) ||
    s.nisn.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Kelola Siswa</h1>
        <button className="admin-btn" onClick={openAdd}>+ Tambah</button>
      </div>

      <p style={{ color: "#757575", marginBottom: 14, fontSize: 13 }}>
        Cari, tambah, edit, dan hapus data siswa dengan cepat.
      </p>

      <div className="search-box" style={{ marginBottom: 14 }}>
        <span className="icon"><Search size={18} /></span>
        <input placeholder="Cari NISN atau Nama..." value={search}
          onChange={e => setSearch(e.target.value)} aria-label="Cari siswa" />
      </div>

      {loading ? <div className="loading-text">Memuat...</div> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>NISN</th><th>Nama</th><th>Kelas</th><th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>{s.nisn}</td>
                  <td>{s.nama}</td>
                  <td>{s.kelas}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="admin-btn admin-btn-sm admin-btn-outline"
                        onClick={() => openEdit(s)}>Edit</button>
                      <button className="admin-btn admin-btn-sm admin-btn-danger"
                        onClick={() => setDeleteTarget(s)}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: "center", color: "#9e9e9e" }}>Tidak ada data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <>
          <div className="admin-overlay" onClick={() => setShowModal(false)} />
          <div className="admin-modal">
            <h3>{editId ? "Edit Siswa" : "Tambah Siswa"}</h3>
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

      <ConfirmModal
        open={!!deleteTarget}
        title="Hapus Siswa"
        message={`Yakin hapus ${deleteTarget?.nama}? Data siswa ini akan dihapus permanen.`}
        confirmLabel="Hapus"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
