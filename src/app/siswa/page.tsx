"use client"

import { useEffect, useState, useCallback } from "react"
import { SiswaClient } from "./SiswaClient"
import { getStudentsByClass, getActiveYear, type Siswa } from "@/lib/db"

export default function DaftarSiswaPage() {
  const [allSiswa, setAllSiswa] = useState<Siswa[]>([])
  const [tahunAjaran, setTahunAjaran] = useState("")
  const [kelas, setKelas] = useState("3A")
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams(window.location.search)
    const k = params.get("kelas") || "3A"
    setKelas(k)
    const [siswa, tahun] = await Promise.all([
      getStudentsByClass(k),
      getActiveYear(),
    ])
    setAllSiswa(siswa)
    setTahunAjaran(tahun)
    setLoading(false)
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

  if (loading) {
    return (
      <div className="app-shell">
        <div className="app-nav rub-el-hizb">
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px" }}>
            <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "50%" }} />
            <div className="skeleton" style={{ width: 80, height: 16 }} />
          </div>
        </div>
        <main className="app-main">
          <div className="app-grid">
            <div className="skeleton" style={{ width: "100%", height: 120, borderRadius: 16 }} />
            <div className="skeleton" style={{ width: "100%", height: 44, borderRadius: 12 }} />
            <div className="skeleton" style={{ width: "100%", height: 80, borderRadius: 16 }} />
            {[1,2,3].map(i => (
              <div key={i} className="skeleton" style={{ width: "100%", height: 72, borderRadius: 14 }} />
            ))}
          </div>
        </main>
      </div>
    )
  }

  return <SiswaClient kelas={kelas} tahunAjaran={tahunAjaran} allSiswa={allSiswa} />
}
