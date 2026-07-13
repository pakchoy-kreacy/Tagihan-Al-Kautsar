"use client"

import { useState } from "react"
import { ChevronDown, Users, Heart, Lightbulb, Search, UserCheck, Wallet } from "lucide-react"
import Image from "next/image"
import type { SchoolSettings } from "@/lib/infaq-db"
import type { KelasData } from "@/lib/db"
import { ContactAduan } from "@/components/ContactAduan"
import { Footer } from "@/components/Footer"

interface HomeClientProps {
  settings: SchoolSettings | null
  kelasList: KelasData[]
}

export function HomeClient({ settings, kelasList }: HomeClientProps) {
  const [selectedKelas, setSelectedKelas] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [navigatingSiswa, setNavigatingSiswa] = useState(false)
  const [navigatingInfaq, setNavigatingInfaq] = useState(false)

  const logoUrl = settings?.logo_url
  const bannerUrl = settings?.banner_url
  const schoolName = settings?.nama_sekolah || "MI Nurul Iman"
  const alamat = settings?.alamat || "Kabo Jaya"

  return (
    <div className="app-shell">
      <main className="app-main">
        <div className="app-grid">
          {/* SCHOOL INFO */}
          <section className="card" style={{ background: "#fff", borderRadius: 18, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
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
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", fontFamily: "var(--font-heading)" }}>ESPP MI</div>
                <div style={{ color: "var(--neutral)", fontSize: 13, marginTop: 2 }}>
                  {settings ? `${schoolName} · ${alamat}` : "Sistem Pembayaran Siswa"}
                </div>
              </div>
            </div>
            <p style={{ marginTop: 14, color: "var(--ink)", lineHeight: 1.6, fontSize: 14 }}>
              Sistem pembayaran siswa MI Nurul Iman yang sederhana, cepat, dan mudah dipakai orang tua.
            </p>
          </section>

          {/* BANNER */}
          {bannerUrl && (
            <section className="home-banner" aria-label="Banner Sekolah">
              <Image src={bannerUrl} alt="Banner Sekolah" fill priority
                sizes="(max-width: 768px) 100vw, 1200px" />
            </section>
          )}

          {/* PETUNJUK */}
          <section className="petunjuk-card">
            <div className="petunjuk-header">
              <Lightbulb size={22} style={{ color: "var(--gold)" }} />
              <h2 className="petunjuk-title">Petunjuk Pembayaran</h2>
            </div>
            <div className="petunjuk-list">
              <div className="petunjuk-step">
                <div className="petunjuk-step-icon"><Search size={18} /></div>
                <p className="petunjuk-step-text">
                  <strong>Pilih kelas</strong> yang sesuai, lalu klik <strong>Lihat Data Siswa</strong>.
                </p>
              </div>
              <div className="petunjuk-step">
                <div className="petunjuk-step-icon"><UserCheck size={18} /></div>
                <p className="petunjuk-step-text">
                  <strong>Pilih siswa</strong> yang ingin dibayar tagihannya.
                </p>
              </div>
              <div className="petunjuk-step">
                <div className="petunjuk-step-icon"><Wallet size={18} /></div>
                <p className="petunjuk-step-text">
                  <strong>Lakukan pembayaran</strong> sesuai tagihan sekolah yang tertera.
                </p>
              </div>
            </div>
          </section>

          {/* PILIH KELAS */}
          <section className="card">
            <div className="card-title">Pilih Kelas</div>
            {kelasList.length === 0 ? (
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
                    {selectedKelas ? `Kelas ${selectedKelas}` : "-- Pilih Kelas --"}
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
                        Kelas {kelas.name}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>

          {/* CTA BUTTONS */}
          <div className="app-actions">
            {selectedKelas ? (
              <a 
                href={`/siswa?kelas=${selectedKelas}`} 
                className="btn btn-primary" 
                style={{ textDecoration: "none" }}
                onClick={() => setNavigatingSiswa(true)}
              >
                <Users size={18} />
                {navigatingSiswa ? "Memuat..." : "Lihat Data Siswa"}
              </a>
            ) : (
              <button type="button" className="btn btn-primary" disabled>
                <Users size={18} />
                Lihat Data Siswa
              </button>
            )}

            <a 
              href="/infaq" 
              className="btn btn-secondary" 
              style={{ textDecoration: "none" }}
              onClick={() => setNavigatingInfaq(true)}
            >
              <Heart size={18} />
              {navigatingInfaq ? "Memuat..." : "Infaq Sekolah"}
            </a>
          </div>

          <ContactAduan />

          <Footer schoolName={schoolName} />
        </div>
      </main>
    </div>
  )
}
