"use client"

import { useEffect, useState, useRef } from "react"
import { SiswaClient } from "./SiswaClient"
import { getStudentsByClass, getActiveYear, type Siswa } from "@/lib/db"

export default function DaftarSiswaPage() {
  const [allSiswa, setAllSiswa] = useState<Siswa[]>([])
  const [tahunAjaran, setTahunAjaran] = useState("")
  const [kelas, setKelas] = useState("3A")
  const [loading, setLoading] = useState(true)
  const initialFetchDone = useRef(false)

  useEffect(() => {
    if (initialFetchDone.current) return
    initialFetchDone.current = true

    const params = new URLSearchParams(window.location.search)
    const k = params.get("kelas") || "3A"
    setKelas(k)
    setLoading(true)
    Promise.all([
      getStudentsByClass(k),
      getActiveYear(),
    ]).then(([siswa, tahun]) => {
      setAllSiswa(siswa)
      setTahunAjaran(tahun)
      setLoading(false)
    })
  }, [])

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
