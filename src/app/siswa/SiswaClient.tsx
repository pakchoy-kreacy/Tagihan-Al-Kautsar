"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getStatKelas, type Siswa, type StatusBayar } from "@/lib/db"
import { NavBar } from "@/components/NavBar"
import { Search } from "lucide-react"

interface SiswaClientProps {
  kelas: string
  tahunAjaran: string
  allSiswa: Siswa[]
}

export function SiswaClient({ kelas, tahunAjaran, allSiswa }: SiswaClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<StatusBayar | "all">("all")

  const siswaList = useMemo(() => {
    return allSiswa.filter((s) => {
      const matchSearch = s.nama.toLowerCase().includes(search.toLowerCase())
      const matchFilter = filter === "all" || s.status === filter
      return matchSearch && matchFilter
    })
  }, [allSiswa, search, filter])

  const stat = useMemo(() => getStatKelas(allSiswa), [allSiswa])

  const filters: { label: string; value: StatusBayar | "all"; color: string }[] = [
    { label: "Semua", value: "all", color: "green" },
    { label: "Lunas", value: "lunas", color: "green" },
    { label: "Belum Bayar", value: "belum", color: "red" },
    { label: "Menunggu", value: "menunggu", color: "yellow" },
    { label: "Tidak Ada Tagihan", value: "tidak_ada_tagihan", color: "green" },
  ]

  const statusMap: Record<StatusBayar, string> = {
    lunas: "Lunas",
    belum: "Belum Bayar",
    menunggu: "Menunggu",
    tidak_ada_tagihan: "Tidak Ada Tagihan",
  }

  return (
    <div className="app-shell">
      <NavBar />
      <main className="app-main">
        <div className="app-grid">
          <section className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div>
                <button type="button" className="back" onClick={() => router.push("/")}>Kembali</button>
                <span style={{ fontSize: 22, fontWeight: 700, color: "var(--emerald)", marginLeft: 12, fontFamily: "var(--font-heading)" }}>
                  Kelas {kelas}
                </span>
              </div>
              <span className="badge badge-lunas">{tahunAjaran}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 16 }}>
              <div style={{ background: "#f8fbf8", borderRadius: 14, padding: 16, textAlign: "center", border: "1px solid #e5ece5" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "var(--emerald)", fontVariantNumeric: "tabular-nums" }}>{stat.total}</div>
                <div style={{ fontSize: 12, color: "var(--neutral)", marginTop: 4 }}>Total Siswa</div>
              </div>
              <div style={{ background: "#f8fbf8", borderRadius: 14, padding: 16, textAlign: "center", border: "1px solid #e5ece5" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "var(--emerald)", fontVariantNumeric: "tabular-nums" }}>{stat.lunas}</div>
                <div style={{ fontSize: 12, color: "var(--neutral)", marginTop: 4 }}>Lunas</div>
              </div>
              <div style={{ background: "#f8fbf8", borderRadius: 14, padding: 16, textAlign: "center", border: "1px solid #e5ece5" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "var(--terracotta)", fontVariantNumeric: "tabular-nums" }}>{stat.belum + stat.menunggu}</div>
                <div style={{ fontSize: 12, color: "var(--neutral)", marginTop: 4 }}>Perlu Dibayar</div>
              </div>
            </div>
          </section>

          <div className="search-box">
            <span className="icon"><Search size={18} /></span>
            <input
              type="text"
              placeholder="Cari nama atau NISN siswa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-chips">
            {filters.map((f) => (
              <button
                key={f.value}
                type="button"
                className={`filter-chip ${f.color} ${filter === f.value ? "active" : ""}`}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {siswaList.length === 0 ? (
            <div className="card" style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: 16, fontFamily: "var(--font-heading)" }}>
                {allSiswa.length === 0 ? "Belum ada data siswa" : "Tidak ada siswa yang cocok"}
              </div>
              <div className="empty-text" style={{ padding: "8px 0 0" }}>
                Coba ubah kata kunci atau filter.
              </div>
            </div>
          ) : (
            <div className="app-cards-grid">
              {siswaList.map((siswa) => (
                <Link key={siswa.id} href={`/siswa/${siswa.id}`} className="block">
                  <div className={`siswa-card border-${siswa.status}`}>
                    <div className="info">
                      <h4>{siswa.nama}</h4>
                      <p>NISN {siswa.nisn}</p>
                    </div>
                    <span className={`badge badge-${siswa.status}`}>
                      {statusMap[siswa.status]}
                      {siswa.riwayat.length > 0 && (
                        <span style={{ marginLeft: 4, opacity: 0.85 }}>
                          ({siswa.riwayat.filter(r => r.status === 'lunas').length}/{siswa.riwayat.length})
                        </span>
                      )}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="counter">
            Menampilkan {siswaList.length} dari {stat.total} siswa
          </div>

          <div className="app-footer">© {new Date().getFullYear()} MI Nurul Iman Kabo Jaya</div>
        </div>
      </main>
    </div>
  )
}
