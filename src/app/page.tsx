"use client"

import { useEffect, useState } from "react"
import { getSchoolSettings } from "@/lib/infaq-db"
import type { SchoolSettings } from "@/lib/infaq-db"
import Image from "next/image"
import { NavBar } from "@/components/NavBar"
import { ChevronDown, Users, Heart, Lightbulb } from "lucide-react"
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
  const bannerUrl = settings?.banner_url
  const schoolName = settings?.nama_sekolah || "MI Nurul Iman"
  const alamat = settings?.alamat || "Kabo Jaya"

  const isDataReady = !loading

  return (
    <div className="app-shell">
      <NavBar />
      <main className="app-main">
        <div className="app-grid">
          {/* SCHOOL INFO */}
          <section className="card" style={{ background: "#fff", borderRadius: 18, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              {!isDataReady ? (
                <div className="skeleton skeleton-circle" />
              ) : logoUrl ? (
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
            {!isDataReady ? (
              <>
                <div className="skeleton skeleton-text" style={{ width: "60%", marginBottom: 8 }} />
                <div className="skeleton skeleton-text-sm" style={{ width: "40%" }} />
              </>
            ) : (
              <>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", fontFamily: "var(--font-heading)" }}>{schoolName}</div>
                <div style={{ color: "var(--neutral)", fontSize: 13, marginTop: 2 }}>{alamat}</div>
              </>
            )}
              </div>
            </div>
            <p style={{ marginTop: 14, color: "var(--neutral)", lineHeight: 1.6, fontSize: 14 }}>
              Sistem pembayaran siswa yang sederhana, cepat, dan mudah dipakai orang tua.
            </p>
          </section>

          {/* BANNER */}
          {loading ? (
            <div className="skeleton skeleton-banner" />
          ) : bannerUrl ? (
            <section className="home-banner" aria-label="Banner Sekolah">
              <Image src={bannerUrl} alt="Banner Sekolah" fill priority
                sizes="(max-width: 768px) 100vw, 1200px" />
            </section>
          ) : null}

          {/* PETUNJUK */}
          {!loading && (
            <section className="card" style={{ maxWidth: 720, margin: "4px auto 0", padding: 20 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginBottom: 14,
              }}>
                <Lightbulb size={20} style={{ color: "var(--gold)" }} />
                <h2 style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--ink)",
                  margin: 0,
                  fontFamily: "var(--font-heading)",
                }}>
                  Petunjuk
                </h2>
              </div>
              <ol style={{
                margin: 0,
                paddingLeft: 22,
                color: "var(--ink)",
                fontSize: 15,
                lineHeight: 1.7,
              }}>
                <li>Pilih kelas, lalu klik <strong>Lihat Data Siswa</strong>.</li>
                <li>Pilih siswa yang ingin dibayar tagihannya.</li>
                <li>Lakukan pembayaran sesuai tagihan sekolah.</li>
              </ol>
            </section>
          )}

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

          {/* CTA BUTTONS */}
          <div className="app-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => selectedKelas && router.push(`/siswa?kelas=${selectedKelas}`)}
              disabled={!selectedKelas}
            >
              <Users size={18} />
              Lihat Data Siswa
            </button>

            <button type="button" className="btn btn-secondary" onClick={() => router.push("/infaq")}>
              <Heart size={18} />
              Infaq Sekolah
            </button>
          </div>

          <div className="app-footer">© {new Date().getFullYear()} {schoolName}</div>
        </div>
      </main>
    </div>
  )
}
