"use client"

import { useEffect, useState } from "react"
import { HomeClient } from "./HomeClient"
import { getAllClasses } from "@/lib/db"
import { getSchoolSettings } from "@/lib/infaq-db"
import type { SchoolSettings } from "@/lib/infaq-db"
import type { KelasData } from "@/lib/db"

function getCachedSettings(): SchoolSettings | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem("espp_school_settings_data")
    return raw ? JSON.parse(raw) as SchoolSettings : null
  } catch { return null }
}

function getCachedKelas(): KelasData[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem("espp_classes")
    return raw ? JSON.parse(raw) as KelasData[] : []
  } catch { return [] }
}

export default function BerandaPage() {
  const [settings, setSettings] = useState<SchoolSettings | null>(getCachedSettings)
  const [kelasList, setKelasList] = useState<KelasData[]>(getCachedKelas)

  useEffect(() => {
    let mounted = true

    async function fetchData() {
      const [s, k] = await Promise.all([getSchoolSettings(), getAllClasses()])
      if (!mounted) return
      if (s) setSettings(s)
      if (k.length > 0) setKelasList(k)
    }

    fetchData()
    const interval = setInterval(fetchData, 60000)
    const onVisible = () => { if (!document.hidden) fetchData() }
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      mounted = false
      clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [])

  return <HomeClient settings={settings} kelasList={kelasList} />
}
