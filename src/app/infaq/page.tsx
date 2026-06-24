"use client"

import { useEffect, useState } from "react"
import { getBankInfoByType } from "@/lib/infaq-db"
import type { BankInfoSettings } from "@/lib/infaq-db"
import { InfaqClient } from "./InfaqClient"

export default function InfaqPage() {
  const [bank, setBank] = useState<BankInfoSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBankInfoByType("infaq").then(b => {
      setBank(b)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="app-shell">
        <div style={{ padding: "16px 20px", background: "var(--emerald)" }} />
        <main className="app-main">
          <div className="app-grid">
            <div className="skeleton" style={{ width: "100%", height: 80, borderRadius: 14, marginBottom: 14 }} />
            <div className="skeleton" style={{ width: "100%", height: 300, borderRadius: 14 }} />
          </div>
        </main>
      </div>
    )
  }

  return <InfaqClient bank={bank} />
}
