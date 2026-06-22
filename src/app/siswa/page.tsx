"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { getStudentsByClass, getStatKelas, type Siswa, type StatusBayar } from "@/lib/db"

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

  const shellStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "#eef2ee",
    padding: 16,
  }

  const pageStyle: React.CSSProperties = {
    maxWidth: 560,
    margin: "0 auto",
    display: "grid",
    gap: 14,
  }

  const headerStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: 18,
    padding: 16,
  }

  const headerRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  }

  const titleStyle: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 700,
    color: "#173b1a",
  }

  const subtitleStyle: React.CSSProperties = {
    marginTop: 4,
    color: "#5f6f63",
    fontSize: 13,
  }

  const statGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
    marginTop: 14,
  }

  const statItemStyle: React.CSSProperties = {
    background: "#f8fbf8",
    borderRadius: 14,
    padding: 12,
    textAlign: "center",
    border: "1px solid #e5ece5",
  }

  const statNumberStyle: React.CSSProperties = {
    fontSize: 22,
    fontWeight: 700,
    color: "#1B5E20",
  }

  const statusMap: Record<StatusBayar, string> = {
    lunas: "Lunas",
    belum: "Belum Bayar",
    menunggu: "Menunggu",
  }

  if (loading) {
    return (
      <main style={shellStyle}>
        <div style={pageStyle}>
          <section className="card" style={headerStyle}>
            <div style={headerRowStyle}>
              <button type="button" className="back" onClick={() => router.push("/")}>Kembali</button>
              <span className="badge badge-lunas">{kelas}</span>
            </div>
            <div style={{ marginTop: 12, ...titleStyle }}>Daftar Siswa</div>
            <div style={subtitleStyle}>Memuat data siswa...</div>
          </section>
          <div className="loading-text">Memuat data siswa...</div>
        </div>
      </main>
    )
  }

  return (
    <main style={shellStyle}>
      <div style={pageStyle}>
        <section className="card" style={headerStyle}>
          <div style={headerRowStyle}>
            <button type="button" className="back" onClick={() => router.push("/")}>Kembali</button>
            <span className="badge badge-lunas">{kelas}</span>
          </div>
          <div style={{ marginTop: 12, ...titleStyle }}>Daftar Siswa</div>
          <div style={subtitleStyle}>Tahun ajaran 2025/2026</div>

          <div style={statGridStyle}>
            <div style={statItemStyle}>
              <div style={statNumberStyle}>{stat.total}</div>
              <div style={{ fontSize: 12, color: "#6b776d" }}>Total</div>
            </div>
            <div style={statItemStyle}>
              <div style={{ ...statNumberStyle, color: "#43A047" }}>{stat.lunas}</div>
              <div style={{ fontSize: 12, color: "#6b776d" }}>Lunas</div>
            </div>
            <div style={statItemStyle}>
              <div style={{ ...statNumberStyle, color: "#E53935" }}>{stat.belum + stat.menunggu}</div>
              <div style={{ fontSize: 12, color: "#6b776d" }}>Perlu Dibayar</div>
            </div>
          </div>
        </section>

        <div className="search-box">
          <span className="icon">Search</span>
          <input
            type="text"
            placeholder="Cari nama siswa..."
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
            <div style={{ fontWeight: 600, color: "#173b1a" }}>
              {allSiswa.length === 0 ? "Belum ada data siswa" : "Tidak ada siswa yang cocok"}
            </div>
            <div className="empty-text" style={{ padding: "8px 0 0" }}>
              Coba ubah kata kunci atau filter kelas.
            </div>
          </div>
        ) : (
          siswaList.map((siswa) => (
            <Link key={siswa.id} href={`/siswa/${siswa.id}`} className="block">
              <div className={`siswa-card border-${siswa.status}`}>
                <div className="info">
                  <h4>{siswa.nama}</h4>
                  <p>{siswa.nisn}</p>
                </div>
                <span className={`badge badge-${siswa.status}`}>{statusMap[siswa.status]}</span>
              </div>
            </Link>
          ))
        )}

        <div className="counter">
          Menampilkan {siswaList.length} dari {stat.total} siswa
        </div>

        <div className="footer">© 2026 MI Nurul Iman Kabo Jaya</div>
      </div>
    </main>
  )
}

export default function DaftarSiswaPage() {
  return (
    <Suspense fallback={<div className="loading-text">Memuat...</div>}>
      <DaftarSiswaContent />
    </Suspense>
  )
}
