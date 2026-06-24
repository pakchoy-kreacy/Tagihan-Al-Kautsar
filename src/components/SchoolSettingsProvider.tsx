"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { getSchoolSettings, type SchoolSettings } from "@/lib/infaq-db"

interface SchoolSettingsContextType {
  settings: SchoolSettings | null
  loading: boolean
}

const SchoolSettingsContext = createContext<SchoolSettingsContextType>({
  settings: null,
  loading: true,
})

export function useSchoolSettings() {
  return useContext(SchoolSettingsContext)
}

const CACHE_KEY = "espp_school_settings"

export function SchoolSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SchoolSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Load dari cache dulu (instant)
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached) as SchoolSettings
        setSettings(parsed)
        setLoading(false)
        applyFavicon(parsed.logo_url)
      }
    } catch {
      // ignore cache errors
    }

    // 2. Fetch terbaru dari Supabase (background)
    getSchoolSettings().then(s => {
      setSettings(s)
      setLoading(false)
      applyFavicon(s?.logo_url)

      // Simpan ke cache
      if (s) {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(s))
        } catch {
          // ignore storage errors
        }
      }
    })
  }, [])

  return (
    <SchoolSettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SchoolSettingsContext.Provider>
  )
}

function applyFavicon(logoUrl?: string) {
  if (!logoUrl) return
  const existing = document.querySelectorAll("link[rel*='icon']")
  existing.forEach(el => el.remove())
  const link = document.createElement("link")
  link.rel = "icon"
  link.type = "image/png"
  link.href = logoUrl
  document.head.appendChild(link)
}
