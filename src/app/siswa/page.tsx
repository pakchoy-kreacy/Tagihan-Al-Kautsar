"use client"

import { Suspense, useState, useMemo, useEffect } from "react"
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
    { label: "🟢 All", value: "all", color: "green" },
    { label: "🟢 Lunas", value: "lunas", color: "green" },
    { label: "🔴 Belum", value: "belum", color: "red" },
    { label: "🟡 Menunggu", value: "menunggu", color: "yellow" },
  ]

  if (loading) {
    return (
      <div className="content">
        <div className="screen-label">📱 Halaman 2 — Daftar Siswa</div>
        <div style={{ padding: "40px 0", textAlign: "center", color: "#9e9e9e" }}>
          Memuat data siswa...
        </div>
      </div>
    )
  }

  return (
    <div className="content">
      <div className="screen-label">📱 Halaman 2 — Daftar Siswa</div>

      <div className="back-row">
        <button className="back" onClick={() => router.push("/")}>◀</button>
        <h3>Kelas {kelas}</h3>
        <span className="sub">2025/2026</span>
      </div>

      <div className="card card-green">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, color: "#1B5E20", fontWeight: 600 }}>📊 Statistik Kelas</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#1B5E20" }}>{stat.total}</div>
            <div style={{ fontSize: 11, color: "#616161" }}>Total Siswa</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#43A047" }}>🟢 Lunas</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#43A047" }}>{stat.lunas}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#E53935" }}>🔴 Belum</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#E53935" }}>{stat.belum}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#F9A825" }}>🟡 Menunggu</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#F9A825" }}>{stat.menunggu}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="search-box">
        <span className="icon">🔍</span>
        <input
          type="text"
          placeholder="Cari nama siswa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="filter-chips">
        {filters.map((f) => (
          <span
            key={f.value}
            className={`filter-chip ${f.color} ${filter === f.value ? "active" : ""}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </span>
        ))}
      </div>

      {siswaList.length === 0 ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#9e9e9e" }}>
          {allSiswa.length === 0 ? "Belum ada data siswa" : "Tidak ada siswa yang cocok"}
        </div>
      ) : (
        siswaList.map((siswa) => (
          <Link key={siswa.id} href={`/siswa/${siswa.id}`} className="block">
            <div className={`siswa-card border-${siswa.status}`}>
              <div className="info">
                <h4>{siswa.nama}</h4>
                <p>{siswa.nisn}</p>
              </div>
              <span className={`badge badge-${siswa.status}`}>
                {siswa.status === "lunas" ? "🟢 LUNAS" : siswa.status === "belum" ? "🔴 BELUM BAYAR" : "🟡 MENUNGGU"}
              </span>
            </div>
          </Link>
        ))
      )}

      <div className="counter">
        Menampilkan {siswaList.length} dari {stat.total} siswa
      </div>

      <div className="footer">© 2026 MI Nurul Iman Kabo Jaya</div>
    </div>
  )
}

export default function DaftarSiswaPage() {
  return (
    <div className="phone-frame min-h-[700px]">
      <div className="status-bar">
        <span>📱 ●●○○</span>
        <span>📶 🔋 12:30</span>
      </div>

      <div className="header" style={{ padding: "12px 18px 14px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>🌙 MI Nurul Iman</div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>Kabo Jaya</div>
        </div>
      </div>

      <Suspense fallback={
        <div className="content">
          <div style={{ textAlign: "center", padding: 40, color: "#9e9e9e" }}>Memuat...</div>
        </div>
      }>
        <DaftarSiswaContent />
      </Suspense>
    </div>
  )
}
