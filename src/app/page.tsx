"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAllClasses, type KelasData } from "@/lib/db"
import { NavBar } from "@/components/NavBar"
import { ChevronDown } from "@/components/Icons"

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

  return (
    <div className="app-shell">
      <NavBar />
      <main className="app-main">
        <div className="app-grid">
          <section className="card" style={{ background: "#fff", borderRadius: 18, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 999,
                  background: "#1B5E20",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                MI
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#173b1a" }}>MI Nurul Iman</div>
                <div style={{ color: "#5f6f63", fontSize: 14, marginTop: 2 }}>Kabo Jaya</div>
              </div>
            </div>
            <p style={{ marginTop: 16, color: "#5f6f63", lineHeight: 1.7, fontSize: 15 }}>
              Sistem pembayaran siswa yang sederhana, cepat, dan mudah dipakai orang tua. Pilih kelas
              untuk melihat data siswa, atau kirim infaq sekolah.
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
                  <span className="arrow"><ChevronDown size={14} /></span>
                </button>
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

          <div className="app-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => selectedKelas && router.push(`/siswa?kelas=${selectedKelas}`)}
              disabled={!selectedKelas}
            >
              Lihat Data Siswa
            </button>

            <button type="button" className="btn btn-secondary" onClick={() => router.push("/infaq")}>
              Infaq Sekolah
            </button>

            <button type="button" className="btn btn-outline" onClick={() => router.push("/admin")}>
              Login Admin
            </button>
          </div>

          <div className="app-footer">© {new Date().getFullYear()} MI Nurul Iman Kabo Jaya</div>
        </div>
      </main>
    </div>
  )
}
