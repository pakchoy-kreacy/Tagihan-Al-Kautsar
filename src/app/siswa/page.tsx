"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { SiswaClient } from "./SiswaClient"
import { getStudentsByClass, getActiveYear, type Siswa, type StatusBayar } from "@/lib/db"
import { usePageRefresh } from "@/hooks/usePageRefresh"

function DaftarSiswaContent() {
  const searchParams = useSearchParams()
  const kelas = searchParams.get("kelas") || ""
  const initialBillType = searchParams.get("billType") || "all"
  const initialStatus = (searchParams.get("status") as StatusBayar | "all") || "all"
  const [allSiswa, setAllSiswa] = useState<Siswa[]>([])
  const [tahunAjaran, setTahunAjaran] = useState("")
  const [loadedKelas, setLoadedKelas] = useState("")

  usePageRefresh(async (isCurrent) => {
    if (!kelas) return
    const [siswa, tahun] = await Promise.all([
      getStudentsByClass(kelas),
      getActiveYear(),
    ])
    if (!isCurrent()) return
    setAllSiswa(siswa)
    setTahunAjaran(tahun)
    setLoadedKelas(kelas)
  }, { refreshKey: kelas })

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

  return (
    <SiswaClient
      key={`${kelas}:${initialBillType}:${initialStatus}`}
      kelas={kelas}
      tahunAjaran={tahunAjaran}
      allSiswa={loadedKelas === kelas ? allSiswa : []}
      initialBillType={initialBillType}
      initialStatus={initialStatus}
    />
  )
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
