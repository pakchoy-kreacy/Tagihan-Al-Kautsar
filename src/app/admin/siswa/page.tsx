"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { getAllStudentsWithBills, addSiswa, addSiswaDetailed, updateSiswa, deleteSiswa, getAllClasses, markBillAsPaid } from "@/lib/db"
import { formatRupiah, type Siswa, type KelasData } from "@/lib/db"
import { useToast } from "@/components/Toast"
import { ConfirmModal } from "@/components/ConfirmModal"
import { Search, Upload, Download, Plus, X, Pencil, Trash2, Inbox, FileSpreadsheet } from "lucide-react"
import * as XLSX from "xlsx"

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
  const [importing, setImporting] = useState(false)

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
    const ws = XLSX.utils.aoa_to_sheet([
      ["NISN", "Nama", "Kelas"],
      ["3A-01", "Ahmad Rizki", "3A"],
      ["3A-02", "Aisyah Putri", "3A"],
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Siswa")
    XLSX.writeFile(wb, "template_siswa.xlsx")
  }

  function handleImportExcel() {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".xlsx,.xls,.csv"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      setImporting(true)
      try {
        const rows: { nisn: string; nama: string; kelas: string }[] = []

        if (file.name.endsWith(".csv")) {
          const text = await file.text()
          const lines = text.split("\n").filter(l => l.trim())
          for (let i = 1; i < lines.length; i++) {
            const parts = parseCSVLine(lines[i])
            if (parts.length >= 3) {
              rows.push({ nisn: parts[0].trim(), nama: parts[1].trim(), kelas: parts[2].trim() })
            }
          }
        } else {
          const buf = await file.arrayBuffer()
          const wb = XLSX.read(buf, { type: "array" })
          const ws = wb.Sheets[wb.SheetNames[0]]
          const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][]
          for (let i = 1; i < data.length; i++) {
            const row = data[i]
            const nisn = String(row[0] || "").trim()
            const nama = String(row[1] || "").trim()
            const kelas = String(row[2] || "").trim()
            if (nisn && nama && kelas) rows.push({ nisn, nama, kelas })
          }
        }

        if (rows.length === 0) {
          showToast("Tidak ada data valid di file!", "error")
          setImporting(false)
          return
        }

        let success = 0
        let failed = 0
        const errors: string[] = []

        for (const row of rows) {
          const result = await addSiswaDetailed(row.nisn, row.nama, row.kelas)
          if (result.success) {
            success++
          } else {
            failed++
            errors.push(`${row.nama} (${row.nisn}): ${result.error}`)
          }
        }

        if (failed === 0) {
          showToast(`${success} siswa berhasil diimport!`)
        } else if (success === 0) {
          showToast(`Semua ${failed} baris gagal diimport`, "error")
        } else {
          showToast(`${success} berhasil, ${failed} gagal`, "error")
        }

        if (errors.length > 0) {
          console.error("Import errors:", errors)
        }

        await fetchData()
      } catch (err) {
        console.error("Import error:", err)
        showToast("Gagal membaca file! Pastikan format benar.", "error")
      } finally {
        setImporting(false)
      }
    }
    input.click()
  }

  function parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ""
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        inQuotes = !inQuotes
      } else if (ch === "," && !inQuotes) {
        result.push(current)
        current = ""
      } else {
        current += ch
      }
    }
    result.push(current)
    return result
  }

  const filtered = siswaList.filter(s => {
    const matchKelas = !selectedKelas || s.kelas === selectedKelas
    const matchSearch = !search ||
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.nisn.toLowerCase().includes(search.toLowerCase())
    return matchKelas && matchSearch
  })

  const statusMap: Record<string, string> = {
    lunas: "Lunas",
    belum: "Belum Bayar",
    menunggu: "Menunggu",
    tidak_ada_tagihan: "Tidak Ada Tagihan",
  }

  return (
    <div className="admin-page">
      <div className="page-title">Kelola Siswa</div>
      <p className="page-subtitle">Klik siswa untuk melihat detail dan riwayat pembayaran</p>

      {/* TOOLBAR */}
      <div className="siswa-toolbar">
        <div className="siswa-toolbar-left">
          <button className="admin-btn" onClick={openAdd}>
            <Plus size={15} /> Tambah Siswa
          </button>
          <button className="admin-btn admin-btn-outline" onClick={handleImportExcel} disabled={importing}>
            {importing ? <><FileSpreadsheet size={15} /> Mengimpor...</> : <><Upload size={15} /> Import Excel</>}
          </button>
          <button className="admin-btn admin-btn-outline" onClick={handleDownloadTemplate}>
            <Download size={15} /> Template
          </button>
        </div>
        <div className="search-box siswa-search">
          <span className="icon"><Search size={16} color="var(--neutral)" /></span>
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

      {/* DESKTOP TABLE (>=1024px) */}
      {loading ? (
        <div className="siswa-grid">
          {[1,2,3,4,5,6].map(i => <div key={i} className="siswa-card-admin skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Inbox size={48} color="var(--neutral)" style={{ opacity: 0.4, marginBottom: 12 }} />
          <p>Tidak ada siswa yang cocok</p>
          <p className="empty-state-sub">Coba ubah filter atau kata kunci pencarian</p>
        </div>
      ) : (
        <>
          <div className="siswa-table-wrap">
            <table className="siswa-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>NISN</th>
                  <th>Kelas</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} onClick={() => setDetailSiswa(s)}>
                    <td className="st-name">{s.nama}</td>
                    <td className="st-nisn">{s.nisn}</td>
                    <td>{s.kelas}</td>
                    <td><span className={`badge badge-${s.status}`}>{statusMap[s.status]}</span></td>
                    <td className="st-actions" onClick={e => e.stopPropagation()}>
                      <button className="sca-btn sca-btn-edit" onClick={() => openEdit(s)}>
                        <Pencil size={13} style={{ verticalAlign: "middle" }} />
                      </button>
                      <button className="sca-btn sca-btn-delete" onClick={() => setDeleteTarget(s)}>
                        <Trash2 size={13} style={{ verticalAlign: "middle" }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARD GRID (<1024px) */}
          <div className="siswa-grid">
            {filtered.map(s => (
              <div key={s.id} className="siswa-card-admin" onClick={() => setDetailSiswa(s)}>
                <div className="sca-header">
                  <div className="sca-avatar">{s.nama.charAt(0).toUpperCase()}</div>
                  <div className="sca-info">
                    <div className="sca-name">{s.nama}</div>
                    <div className="sca-nisn">NISN {s.nisn}</div>
                  </div>
                  <span className={`badge badge-${s.status}`}>{statusMap[s.status]}</span>
                </div>
                <div className="sca-footer">
                  <span className="sca-kelas">{s.kelas}</span>
                  <span className="sca-tagihan">{s.tagihan !== "Tidak Ada Tagihan" ? s.tagihan : "—"}</span>
                </div>
                <div className="sca-actions">
                  <button className="sca-btn sca-btn-edit" onClick={(e) => { e.stopPropagation(); openEdit(s) }}>Edit</button>
                  <button className="sca-btn sca-btn-delete" onClick={(e) => { e.stopPropagation(); setDeleteTarget(s) }}>Hapus</button>
                </div>
              </div>
            ))}
          </div>
        </>
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
              <div className="detail-avatar">{detailSiswa.nama.charAt(0).toUpperCase()}</div>
              <div className="detail-name">{detailSiswa.nama}</div>
              <div className="detail-nisn">NISN {detailSiswa.nisn} · {detailSiswa.kelas}</div>
              <div className={`detail-status badge badge-${detailSiswa.status}`}>{statusMap[detailSiswa.status]}</div>
              {detailSiswa.status !== 'lunas' && detailSiswa.status !== 'tidak_ada_tagihan' && (
                <button
                  type="button"
                  className="admin-btn"
                  style={{ marginTop: 14 }}
                  onClick={async () => {
                    const activeBill = detailSiswa.riwayat.find(r => r.status !== 'lunas')
                    if (!activeBill) return
                    const ok = await markBillAsPaid(activeBill.id)
                    if (ok) {
                      showToast("Tagihan ditandai lunas!")
                      setDetailSiswa(null)
                      await fetchData()
                    } else {
                      showToast("Gagal menandai lunas!", "error")
                    }
                  }}
                >
                  Tandai Lunas (Konfirmasi Manual)
                </button>
              )}
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
              <p style={{ color: "var(--neutral)", fontSize: 13, textAlign: "center", padding: "12px 0" }}>
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
