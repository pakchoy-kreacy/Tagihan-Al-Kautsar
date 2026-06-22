"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { getStudentsByClass, getStatKelas, type Siswa, type StatusBayar } from "@/lib/db"
import { NavBar } from "@/components/NavBar"

function DaftarSiswaContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const kelas = searchParams.get("kelas") || "3A"
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<StatusBayar | "all">("all")
  const [allSiswa, setAllSiswa] = useState<Siswa[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStudents() {
      setLoading(true)
      try {
        const students = await getStudentsByClass(kelas)
        setAllSiswa(students)
      } catch (error) {
        console.error("Failed to fetch students:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [kelas])

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
  ]

  const statusMap: Record<StatusBayar, string> = {
    lunas: "Lunas",
    belum: "Belum Bayar",
    menunggu: "Menunggu",
  }

  if (loading) {
    return (
      <div className="app-shell">
        <NavBar />
        <main className="app-main">
          <div className="app-grid">
            <section className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button type="button" className="back" onClick={() => router.push("/")}>Kembali</button>
                <span className="badge badge-lunas">{kelas}</span>
              </div>
              <div className="loading-text">Memuat data siswa...</div>
            </section>
          </div>
        </main>
      </div>
    )
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
                <span style={{ fontSize: 22, fontWeight: 700, color: "#173b1a", marginLeft: 12 }}>
                  Kelas {kelas}
                </span>
              </div>
              <span className="badge badge-lunas">2025/2026</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 16 }}>
              <div style={{ background: "#f8fbf8", borderRadius: 14, padding: 16, textAlign: "center", border: "1px solid #e5ece5" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#1B5E20" }}>{stat.total}</div>
                <div style={{ fontSize: 12, color: "#6b776d", marginTop: 4 }}>Total Siswa</div>
              </div>
              <div style={{ background: "#f8fbf8", borderRadius: 14, padding: 16, textAlign: "center", border: "1px solid #e5ece5" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#43A047" }}>{stat.lunas}</div>
                <div style={{ fontSize: 12, color: "#6b776d", marginTop: 4 }}>Lunas</div>
              </div>
              <div style={{ background: "#f8fbf8", borderRadius: 14, padding: 16, textAlign: "center", border: "1px solid #e5ece5" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#E53935" }}>{stat.belum + stat.menunggu}</div>
                <div style={{ fontSize: 12, color: "#6b776d", marginTop: 4 }}>Perlu Dibayar</div>
              </div>
            </div>
          </section>

          <div className="search-box">
            <span className="icon">Cari</span>
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
              <div style={{ fontWeight: 600, color: "#173b1a", fontSize: 16 }}>
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
                    <span className={`badge badge-${siswa.status}`}>{statusMap[siswa.status]}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="counter">
            Menampilkan {siswaList.length} dari {stat.total} siswa
          </div>

          <div className="app-footer">© 2026 MI Nurul Iman Kabo Jaya</div>
        </div>
      </main>
    </div>
  )
}

export default function DaftarSiswaPage() {
  return (
    <Suspense fallback={<div className="app-shell"><NavBar /><main className="app-main"><div className="loading-text">Memuat...</div></main></div>}>
      <DaftarSiswaContent />
    </Suspense>
  )
}
