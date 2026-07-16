"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Home } from "lucide-react"
import { getSiswaById, type Siswa } from "@/lib/db"
import { useSchoolSettings } from "@/components/SchoolSettingsProvider"
import { BayarClient } from "./BayarClient"
import { usePageRefresh } from "@/hooks/usePageRefresh"

export default function BayarPage() {
  const params = useParams()
  const id = params.id as string
  const [siswa, setSiswa] = useState<Siswa | null>(null)
  const [loadedId, setLoadedId] = useState("")
  const { bankPayment } = useSchoolSettings()
  const bank = bankPayment

  usePageRefresh(async (isCurrent) => {
    if (!id) return
    const nextSiswa = await getSiswaById(id)
    if (!isCurrent()) return
    setSiswa(nextSiswa || null)
    setLoadedId(id)
  }, { refreshKey: id })

  if (!siswa || loadedId !== id) {
    return (
      <div className="app-shell">
        <header className="public-header">
          <button onClick={() => window.history.back()}><ArrowLeft size={22} /></button>
          <span className="public-header-title">Pembayaran</span>
          <Link href="/" style={{ color: "inherit" }}><Home size={20} /></Link>
        </header>
        <main className="public-page">
          <div className="card" style={{ textAlign: "center", padding: 40 }}>
            <p style={{ color: "var(--neutral)" }}>{id ? "Memuat data..." : "Siswa tidak ditemukan"}</p>
          </div>
        </main>
      </div>
    )
  }

  return <BayarClient siswa={siswa} bank={bank} id={id} />
}
