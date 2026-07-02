"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { SiswaClient } from "./SiswaClient"
import { getStudentsByClass, getActiveYear, type Siswa } from "@/lib/db"

function DaftarSiswaContent() {
  const searchParams = useSearchParams()
  const kelas = searchParams.get("kelas") || ""
  const [allSiswa, setAllSiswa] = useState<Siswa[]>([])
  const [tahunAjaran, setTahunAjaran] = useState("")

  const fetchData = useCallback(async () => {
    if (!kelas) return
    const [siswa, tahun] = await Promise.all([
      getStudentsByClass(kelas),
      getActiveYear(),
    ])
    setAllSiswa(siswa)
    setTahunAjaran(tahun)
  }, [kelas])

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

export default function DaftarSiswaPage() {
  return (
    <Suspense fallback={
      <div className="app-shell">
        <main className="app-main">
          <div className="app-grid">
            <div className="card" style={{ textAlign: "center", padding: 40 }}>
              <p style={{ color: "var(--neutral)" }}>Memuat...</p>
            </div>
          </div>
        </main>
      </div>
    }>
      <DaftarSiswaContent />
    </Suspense>
  )
}
