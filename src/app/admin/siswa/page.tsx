"use client"

import { useState, useEffect } from "react"
import { getAllStudents, addSiswa, deleteSiswa, getAllClasses } from "@/lib/db"
import type { Siswa, KelasData } from "@/lib/db"

export default function AdminSiswaPage() {
  const [siswaList, setSiswaList] = useState<Siswa[]>([])
  const [kelasList, setKelasList] = useState<KelasData[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formNisn, setFormNisn] = useState("")
  const [formNama, setFormNama] = useState("")
  const [formKelas, setFormKelas] = useState("")
  const [search, setSearch] = useState("")

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

  async function handleSubmit() {
    if (!formNisn || !formNama || !formKelas) return alert("Isi semua field!")
    const ok = await addSiswa(formNisn, formNama, formKelas)
    if (ok) {
      setShowModal(false); setFormNisn(""); setFormNama(""); setFormKelas("")
      await fetchData()
    } else { alert("Gagal menambah siswa!") }
  }

  async function handleDelete(id: string, nama: string) {
    if (!confirm(`Hapus ${nama}?`)) return
    const ok = await deleteSiswa(id)
    if (ok) await fetchData()
    else alert("Gagal menghapus!")
  }

  const filtered = siswaList.filter(s =>
    s.nama.toLowerCase().includes(search.toLowerCase()) ||
    s.nisn.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Kelola Siswa</h1>
        <button className="admin-btn" onClick={() => setShowModal(true)}>+ Tambah</button>
      </div>

      <div className="search-box" style={{ marginBottom: 14 }}>
        <span className="icon">🔍</span>
        <input placeholder="Cari NISN atau Nama..." value={search}
          onChange={e => setSearch(e.target.value)} />
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
                    <button className="admin-btn admin-btn-sm admin-btn-danger"
                      onClick={() => handleDelete(s.id, s.nama)}>Hapus</button>
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
            <h3>Tambah Siswa</h3>
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
              <button className="admin-btn" onClick={handleSubmit}>Simpan</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
