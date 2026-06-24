"use client"

import { useEffect, useState } from "react"
import { getSiswaById, type Siswa } from "@/lib/db"
import { DetailClient } from "./DetailClient"

export default function DetailSiswaPage() {
  const [siswa, setSiswa] = useState<Siswa | null>(null)
  const [loading, setLoading] = useState(true)
  const id = typeof window !== "undefined" ? window.location.pathname.split("/").pop() || "" : ""

  useEffect(() => {
    if (!id) return
    let mounted = true

    async function fetchData() {
      const s = await getSiswaById(id)
      if (mounted) { setSiswa(s || null); setLoading(false) }
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

  if (loading) {
    return (
      <div className="app-shell">
        <header className="public-header">
          <div className="skeleton" style={{ width: 22, height: 22, borderRadius: 6 }} />
          <div className="skeleton" style={{ width: 120, height: 16 }} />
          <div className="skeleton" style={{ width: 20, height: 20, borderRadius: 6 }} />
        </header>
        <main className="public-page">
          <div className="profile-card">
            <div className="skeleton" style={{ width: 56, height: 56, borderRadius: "50%" }} />
            <div className="profile-info">
              <div className="skeleton" style={{ width: 140, height: 18, borderRadius: 6 }} />
              <div className="skeleton" style={{ width: 90, height: 13, borderRadius: 6, marginTop: 6 }} />
              <div className="skeleton" style={{ width: 110, height: 13, borderRadius: 6, marginTop: 4 }} />
            </div>
          </div>
          <div className="bill-card">
            <div className="skeleton" style={{ width: 100, height: 15, borderRadius: 6, marginBottom: 12 }} />
            <div className="skeleton" style={{ width: 80, height: 22, borderRadius: 6, marginBottom: 12 }} />
            <div className="skeleton" style={{ width: 60, height: 18, borderRadius: 6 }} />
          </div>
        </main>
      </div>
    )
  }

  if (!siswa) {
    return (
      <div className="app-shell">
        <header className="public-header">
          <div className="skeleton" style={{ width: 22, height: 22, borderRadius: 6 }} />
          <div className="skeleton" style={{ width: 120, height: 16 }} />
          <div className="skeleton" style={{ width: 20, height: 20, borderRadius: 6 }} />
        </header>
        <main className="public-page">
          <div className="card" style={{ textAlign: "center", padding: 40 }}>
            <p style={{ color: "var(--neutral)" }}>Siswa tidak ditemukan</p>
          </div>
        </main>
      </div>
    )
  }

  return <DetailClient siswa={siswa} id={id} />
}
