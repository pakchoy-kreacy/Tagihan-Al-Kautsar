"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getAllClasses, type KelasData } from "@/lib/db"

export default function BerandaPage() {
  const router = useRouter()
  const [selectedKelas, setSelectedKelas] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [kelasList, setKelasList] = useState<KelasData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchClasses() {
      try {
        const classes = await getAllClasses()
        setKelasList(classes)
      } catch (error) {
        console.error("Failed to fetch classes:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchClasses()
  }, [])

  const handlePilihKelas = (kelas: string) => {
    setSelectedKelas(kelas)
    setDropdownOpen(false)
  }

  return (
    <div className="phone-frame min-h-[700px]">
      <div className="status-bar">
        <span>?? ????</span>
        <span>?? ?? 12:30</span>
      </div>

      <div className="header">
        <div className="logo-wrap">
          <div className="logo-circle">??</div>
          <div>
            <div className="logo-text">MI Nurul Iman</div>
            <div className="logo-sub">Kabo Jaya</div>
          </div>
        </div>
        <div className="tagline">Sistem Informasi Tagihan Siswa</div>
        <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>Transparan, Mudah, Praktis</div>
      </div>

      <div className="content">
        <div className="screen-label">?? Halaman 1 — Beranda</div>

        <div className="hero-image">
          <span className="icon">??</span>
          <span className="label">?? Foto Gedung Sekolah</span>
          <span className="camera-badge">?? Ganti</span>
        </div>

        <div className="card">
          <div className="card-title">?? Pilih Kelas</div>
          {loading ? (
            <div style={{ padding: "12px 0", textAlign: "center", color: "#9e9e9e" }}>
              Memuat data kelas...
            </div>
          ) : (
            <>
              <div className="dropdown" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <span className={selectedKelas ? "" : "placeholder"}>
                  {selectedKelas || "-- Pilih Kelas --"}
                </span>
                <span className="arrow">?</span>
              </div>
              {dropdownOpen && (
                <div className="chip-container">
                  {kelasList.map((kelas) => (
                    <span
                      key={kelas.id}
                      className={`chip ${selectedKelas === kelas.name ? "chip-active" : ""}`}
                      onClick={() => handlePilihKelas(kelas.name)}
                    >
                      {kelas.name}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            if (selectedKelas) {
              router.push(`/siswa?kelas=${selectedKelas}`)
            }
          }}
          style={{ opacity: selectedKelas ? 1 : 0.5 }}
        >
          ?? Lihat Data Siswa
        </button>

        <button className="btn btn-secondary" style={{ marginTop: 10 }}>
          ?? Infaq Sekolah
        </button>

        <button className="btn btn-outline" style={{ marginTop: 10 }}>
          ?? Login Admin
        </button>

        <div className="footer">© 2026 MI Nurul Iman Kabo Jaya</div>
      </div>
    </div>
  )
}

