"use client"

import { useEffect, useState } from "react"
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

  const shellStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "#eef2ee",
    padding: 16,
  }

  const pageStyle: React.CSSProperties = {
    maxWidth: 520,
    margin: "0 auto",
    display: "grid",
    gap: 14,
  }

  const headerStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: 18,
    padding: 16,
  }

  const brandRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
  }

  const logoStyle: React.CSSProperties = {
    width: 48,
    height: 48,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    background: "#1B5E20",
    color: "#fff",
    fontWeight: 700,
    flexShrink: 0,
  }

  const titleStyle: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 700,
    color: "#173b1a",
    lineHeight: 1.2,
  }

  const subtitleStyle: React.CSSProperties = {
    marginTop: 4,
    fontSize: 13,
    color: "#5f6f63",
  }

  const descriptionStyle: React.CSSProperties = {
    marginTop: 12,
    color: "#5f6f63",
    lineHeight: 1.6,
    fontSize: 14,
  }

  const actionStyle: React.CSSProperties = {
    width: "100%",
    marginTop: 0,
  }

  const selectButton = (
    <button
      type="button"
      className="dropdown"
      onClick={() => setDropdownOpen((open) => !open)}
      aria-expanded={dropdownOpen}
      aria-label="Pilih kelas"
      style={{ width: "100%" }}
    >
      <span className={selectedKelas ? "" : "placeholder"}>
        {selectedKelas || "-- Pilih Kelas --"}
      </span>
      <span className="arrow">v</span>
    </button>
  )

  return (
    <main style={shellStyle}>
      <div style={pageStyle}>
        <section className="card" style={headerStyle}>
          <div style={brandRowStyle}>
            <div style={logoStyle}>MI</div>
            <div>
              <div style={titleStyle}>MI Nurul Iman</div>
              <div style={subtitleStyle}>Kabo Jaya</div>
            </div>
          </div>
          <p style={descriptionStyle}>
            Sistem pembayaran siswa yang sederhana, cepat, dan mudah dipakai orang tua.
          </p>
        </section>

        <section className="card">
          <div className="card-title">Pilih Kelas</div>
          {loading ? (
            <div className="loading-text" style={{ padding: "8px 0 4px" }}>
              Memuat data kelas...
            </div>
          ) : kelasList.length === 0 ? (
            <div className="empty-text">Data kelas belum tersedia.</div>
          ) : (
            <>
              {selectButton}
              {dropdownOpen && (
                <div className="chip-container" style={{ marginTop: 12 }}>
                  {kelasList.map((kelas) => (
                    <button
                      key={kelas.id}
                      type="button"
                      className={`chip ${selectedKelas === kelas.name ? "chip-active" : ""}`}
                      onClick={() => {
                        setSelectedKelas(kelas.name)
                        setDropdownOpen(false)
                      }}
                    >
                      {kelas.name}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => selectedKelas && router.push(`/siswa?kelas=${selectedKelas}`)}
          disabled={!selectedKelas}
          style={actionStyle}
        >
          Lihat Data Siswa
        </button>

        <button type="button" className="btn btn-secondary" onClick={() => router.push("/infaq")}>
          Infaq Sekolah
        </button>

        <button type="button" className="btn btn-outline" onClick={() => router.push("/admin")}>
          Login Admin
        </button>

        <div className="footer">© 2026 MI Nurul Iman Kabo Jaya</div>
      </div>
    </main>
  )
}

