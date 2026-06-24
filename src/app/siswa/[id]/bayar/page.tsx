"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Home } from "lucide-react"
import { getSiswaById, type Siswa } from "@/lib/db"
import { getBankInfoByType } from "@/lib/infaq-db"
import type { BankInfoSettings } from "@/lib/infaq-db"
import { BayarClient } from "./BayarClient"

export default function BayarPage() {
  const [siswa, setSiswa] = useState<Siswa | null>(null)
  const [bank, setBank] = useState<BankInfoSettings | null>(null)
  const id = typeof window !== "undefined" ? window.location.pathname.split("/")[2] : ""

  useEffect(() => {
    if (!id) return
    let mounted = true

    async function fetchData() {
      const [s, b] = await Promise.all([
        getSiswaById(id),
        getBankInfoByType("payment").then(b => b || getBankInfoByType("infaq")),
      ])
      if (mounted) { setSiswa(s || null); setBank(b) }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
