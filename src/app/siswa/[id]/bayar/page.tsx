"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Home } from "lucide-react"
import { getSiswaById, type Siswa } from "@/lib/db"
import { useSchoolSettings } from "@/components/SchoolSettingsProvider"
import { BayarClient } from "./BayarClient"

export default function BayarPage() {
  const params = useParams()
  const id = params.id as string
  const [siswa, setSiswa] = useState<Siswa | null>(null)
  const { bankPayment, bankInfaq } = useSchoolSettings()
  const bank = bankPayment || bankInfaq

  useEffect(() => {
    if (!id) return
    let mounted = true

    async function fetchData() {
      const s = await getSiswaById(id)
      if (mounted) setSiswa(s || null)
    }

    fetchData()
    const interval = setInterval(fetchData, 30000)
    const onVisible = () => { if (!document.hidden) fetchData() }
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      mounted = false
      clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [id])

  if (!siswa) {
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
