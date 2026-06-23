"use client"

import { useEffect, useState } from "react"
import { getSchoolSettings } from "@/lib/infaq-db"
import type { SchoolSettings } from "@/lib/infaq-db"
import Image from "next/image"
import { NavBar } from "@/components/NavBar"
import { ChevronDown } from "lucide-react"
import { getAllClasses, type KelasData } from "@/lib/db"
import { useRouter } from "next/navigation"

export default function BerandaPage() {
  const router = useRouter()
  const [selectedKelas, setSelectedKelas] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [kelasList, setKelasList] = useState<KelasData[]>([])
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<SchoolSettings | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [classes, s] = await Promise.all([getAllClasses(), getSchoolSettings()])
        setKelasList(classes)
        setSettings(s)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const logoUrl = settings?.logo_url
  const bannerUrl = (settings as SchoolSettings & { banner_url?: string })?.banner_url
  const schoolName = settings?.nama_sekolah || "MI Nurul Iman"
  const alamat = settings?.alamat || "Kabo Jaya"

  return (
    <div className="app-shell">
      <NavBar />
      <main className="app-main">
        <div className="app-grid">
          {/* BANNER */}
          {bannerUrl && (
            <section className="card" style={{ padding: 0, overflow: "hidden", borderRadius: 18 }}>
              <Image src={bannerUrl} alt="Banner Sekolah" width={800} height={200}
                style={{ width: "100%", height: "auto", objectFit: "cover", display: "block" }} />
            </section>
          )}

          {/* SCHOOL INFO */}
          <section className="card" style={{ background: "#fff", borderRadius: 18, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              {logoUrl ? (
                <Image src={logoUrl} alt={schoolName} width={56} height={56}
                  style={{ borderRadius: 999, objectFit: "cover", flexShrink: 0, border: "2px solid var(--emerald-soft)" }} />
              ) : (
                <div style={{
                  width: 56, height: 56, display: "inline-flex", alignItems: "center",
                  justifyContent: "center", borderRadius: 999, background: "var(--emerald)",
                  color: "#fff", fontWeight: 700, fontSize: 20, flexShrink: 0,
                }}>
                  {schoolName.charAt(0)}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)", fontFamily: "var(--font-heading)" }}>{schoolName}</div>
                <div style={{ color: "var(--neutral)", fontSize: 14, marginTop: 2 }}>{alamat}</div>
              </div>
            </div>
            <p style={{ marginTop: 16, color: "var(--neutral)", lineHeight: 1.7, fontSize: 15 }}>
              Sistem pembayaran siswa yang sederhana, cepat, dan mudah dipakai orang tua. Pilih kelas
              untuk melihat data siswa, atau kirim infaq sekolah.
            </p>
          </section>

          {/* PILIH KELAS */}
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

          {/* CTA BUTTONS - only 2 */}
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
          </div>

          <div className="app-footer">© {new Date().getFullYear()} MI Nurul Iman Kabo Jaya</div>
        </div>
      </main>
    </div>
  )
}
