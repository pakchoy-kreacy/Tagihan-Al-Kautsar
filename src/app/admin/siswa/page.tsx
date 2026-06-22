"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { getAllStudentsWithBills, addSiswa, updateSiswa, deleteSiswa, getAllClasses } from "@/lib/db"
import { formatRupiah, type Siswa, type KelasData } from "@/lib/db"
import { useToast } from "@/components/Toast"
import { ConfirmModal } from "@/components/ConfirmModal"
import { Search, Upload, Download, Plus, X } from "@/components/Icons"

function SiswaContent() {
  const searchParams = useSearchParams()
  const initialKelas = searchParams.get("kelas") || ""
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
  const [selectedKelas, setSelectedKelas] = useState(initialKelas)
  const [deleteTarget, setDeleteTarget] = useState<Siswa | null>(null)
  const [detailSiswa, setDetailSiswa] = useState<Siswa | null>(null)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [siswa, kelas] = await Promise.all([getAllStudentsWithBills(), getAllClasses()])
      setSiswaList(siswa)
      setKelasList(kelas)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  function openAdd() {
    setEditId(null); setFormNisn(""); setFormNama(""); setFormKelas("")
    setShowModal(true)
  }

  function openEdit(s: Siswa) {
    setEditId(s.id); setFormNisn(s.nisn); setFormNama(s.nama); setFormKelas(s.kelas)
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

  function handleDownloadTemplate() {
    const csv = "NISN,Nama,Kelas\n3A-01,Ahmad Rizki,3A\n3A-02,Aisyah Putri,3A"
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "template_siswa.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportExcel() {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".csv"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      const lines = text.split("\n").filter(l => l.trim())
      let imported = 0
      for (let i = 1; i < lines.length; i++) {
        const [nisn, nama, kelas] = lines[i].split(",").map(s => s.trim())
        if (nisn && nama && kelas) {
          const ok = await addSiswa(nisn, nama, kelas)
          if (ok) imported++
        }
      }
      showToast(`${imported} siswa berhasil diimport!`)
      await fetchData()
    }
    input.click()
  }

  const filtered = siswaList.filter(s => {
    const matchKelas = !selectedKelas || s.kelas === selectedKelas
    const matchSearch = !search ||
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.nisn.toLowerCase().includes(search.toLowerCase())
    return matchKelas && matchSearch
  })

  const statusMap: Record<string, string> = { lunas: "Lunas", belum: "Belum Bayar", menunggu: "Menunggu" }

  return (
    <div className="admin-page">
      <div className="page-title">Kelola Siswa</div>
      <p className="page-subtitle">Klik kartu siswa untuk melihat detail dan riwayat pembayaran</p>

      {/* TOOLBAR */}
      <div className="siswa-toolbar">
        <div className="siswa-toolbar-left">
          <button className="admin-btn" onClick={openAdd}>
            <Plus size={14} /> Tambah Siswa
          </button>
          <button className="admin-btn admin-btn-outline" onClick={handleImportExcel}>
            <Upload size={14} /> Import Excel
          </button>
          <button className="admin-btn admin-btn-outline" onClick={handleDownloadTemplate}>
            <Download size={14} /> Template
          </button>
        </div>
        <div className="search-box siswa-search">
          <span className="icon"><Search size={16} /></span>
          <input
            placeholder="Cari nama atau NISN..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* KELAS FILTER */}
      <div className="filter-chips siswa-filter-chips">
        <button
          className={`filter-chip green ${!selectedKelas ? "active" : ""}`}
          onClick={() => setSelectedKelas("")}
        >Semua</button>
        {kelasList.map(k => (
          <button
            key={k.id}
            className={`filter-chip green ${selectedKelas === k.name ? "active" : ""}`}
            onClick={() => setSelectedKelas(k.name)}
          >{k.name}</button>
        ))}
      </div>

      {/* CARD GRID */}
      {loading ? (
        <div className="siswa-grid">
          {[1,2,3,4,5,6].map(i => <div key={i} className="siswa-card-admin skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">👥</span>
          <p>Tidak ada siswa yang cocok</p>
        </div>
      ) : (
        <div className="siswa-grid">
          {filtered.map(s => (
            <div key={s.id} className="siswa-card-admin" onClick={() => setDetailSiswa(s)}>
              <div className="sca-header">
                <div className="sca-avatar">MI</div>
                <div className="sca-info">
                  <div className="sca-name">{s.nama}</div>
                  <div className="sca-nisn">NISN {s.nisn}</div>
                </div>
                <span className={`badge badge-${s.status}`}>{statusMap[s.status]}</span>
              </div>
              <div className="sca-footer">
                <span className="sca-kelas">🏫 {s.kelas}</span>
                <span className="sca-tagihan">{s.tagihan !== "-" ? s.tagihan : "—"}</span>
              </div>
              <div className="sca-actions">
                <button className="sca-btn sca-btn-edit" onClick={(e) => { e.stopPropagation(); openEdit(s) }}>Edit</button>
                <button className="sca-btn sca-btn-delete" onClick={(e) => { e.stopPropagation(); setDeleteTarget(s) }}>Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="counter">Menampilkan {filtered.length} dari {siswaList.length} siswa</p>

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <>
          <div className="admin-overlay" onClick={() => setShowModal(false)} />
          <div className="admin-modal">
            <div className="modal-header">
              <h3>{editId ? "Edit Siswa" : "Tambah Siswa"}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
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

      {/* DETAIL MODAL */}
      {detailSiswa && (
        <>
          <div className="admin-overlay" onClick={() => setDetailSiswa(null)} />
          <div className="admin-modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3>Detail Siswa</h3>
              <button className="modal-close" onClick={() => setDetailSiswa(null)}><X size={18} /></button>
            </div>
            <div className="detail-siswa">
              <div className="detail-avatar">MI</div>
              <div className="detail-name">{detailSiswa.nama}</div>
              <div className="detail-nisn">NISN {detailSiswa.nisn} · {detailSiswa.kelas}</div>
              <div className={`detail-status badge badge-${detailSiswa.status}`}>{statusMap[detailSiswa.status]}</div>
            </div>
            {detailSiswa.riwayat.length > 0 ? (
              <div className="detail-riwayat">
                <div className="detail-riwayat-title">Riwayat Pembayaran</div>
                {detailSiswa.riwayat.map(r => (
                  <div key={r.id} className={`riwayat-row status-${r.status}`}>
                    <div>
                      <div className="riwayat-bulan">{r.bulan} {r.tahun}</div>
                      <div className="riwayat-tanggal">{r.tanggal}</div>
                    </div>
                    <div className="riwayat-right">
                      <div className="riwayat-nominal">{formatRupiah(r.nominal)}</div>
                      <div className="riwayat-status">{statusMap[r.status]}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", padding: "12px 0" }}>
                Belum ada riwayat pembayaran
              </p>
            )}
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

export default function AdminSiswaPage() {
  return (
    <Suspense fallback={<div className="admin-page"><div className="loading-text">Memuat...</div></div>}>
      <SiswaContent />
    </Suspense>
  )
}
