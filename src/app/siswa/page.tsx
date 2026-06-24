"use client"

import { useEffect, useState, useCallback } from "react"
import { SiswaClient } from "./SiswaClient"
import { getStudentsByClass, getActiveYear, type Siswa } from "@/lib/db"

export default function DaftarSiswaPage() {
  const [allSiswa, setAllSiswa] = useState<Siswa[]>([])
  const [tahunAjaran, setTahunAjaran] = useState("")
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams()
  const [kelas, setKelas] = useState(params.get("kelas") || "")

  const fetchData = useCallback(async () => {
    const k = new URLSearchParams(window.location.search).get("kelas") || ""
    if (!k) return
    setKelas(k)
    const [siswa, tahun] = await Promise.all([
      getStudentsByClass(k),
      getActiveYear(),
    ])
    setAllSiswa(siswa)
    setTahunAjaran(tahun)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchData(), 0)
    const interval = setInterval(fetchData, 30000)
    const onVisible = () => { if (!document.hidden) fetchData() }
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [fetchData])

  if (!kelas) {
    return (
      <div className="app-shell">
        <main className="app-main">
          <div className="app-grid">
            <div className="card" style={{ textAlign: "center", padding: 40 }}>
              <p style={{ color: "var(--neutral)" }}>Pilih kelas terlebih dahulu dari halaman beranda.</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return <SiswaClient kelas={kelas} tahunAjaran={tahunAjaran} allSiswa={allSiswa} />
}
