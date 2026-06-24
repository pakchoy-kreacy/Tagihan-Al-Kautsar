"use client"

import { useEffect, useState } from "react"
import { HomeClient } from "./HomeClient"
import { getAllClasses } from "@/lib/db"
import { getSchoolSettings } from "@/lib/infaq-db"
import type { SchoolSettings } from "@/lib/infaq-db"
import type { KelasData } from "@/lib/db"

export default function BerandaPage() {
  const [settings, setSettings] = useState<SchoolSettings | null>(null)
  const [kelasList, setKelasList] = useState<KelasData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getSchoolSettings(),
      getAllClasses(),
    ]).then(([s, k]) => {
      setSettings(s)
      setKelasList(k)
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
            <div className="skeleton" style={{ width: "100%", height: 180, borderRadius: 20 }} />
            <div className="skeleton" style={{ width: "100%", height: 120, borderRadius: 16 }} />
            <div className="skeleton" style={{ width: "100%", height: 100, borderRadius: 16 }} />
          </div>
        </main>
      </div>
    )
  }

  return <HomeClient settings={settings} kelasList={kelasList} />
}
