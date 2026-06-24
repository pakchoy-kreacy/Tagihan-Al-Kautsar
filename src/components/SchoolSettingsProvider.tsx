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

const SETTINGS_CACHE_KEY = "espp_school_settings"

export function SchoolSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SchoolSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Langsung pakai cache (instant, no delay)
    let cached: SchoolSettings | null = null
    try {
      const raw = localStorage.getItem(SETTINGS_CACHE_KEY)
      if (raw) {
        cached = JSON.parse(raw) as SchoolSettings
        setSettings(cached)
        setLoading(false)
        applyFavicon(cached.logo_url)
      }
    } catch {
      // ignore
    }

    // 2. Fetch update di background (tidak block UI)
    getSchoolSettings().then(s => {
      if (s) {
        setSettings(s)
        setLoading(false)
        applyFavicon(s.logo_url)
        try {
          localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(s))
        } catch {
          // ignore
        }
      } else if (!cached) {
        setLoading(false)
      }
    }).catch(() => {
      if (!cached) setLoading(false)
    })
  }, [])

  return (
    <SchoolSettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SchoolSettingsContext.Provider>
  )
}

function applyFavicon(logoUrl?: string) {
  if (!logoUrl || typeof document === "undefined") return
  const existing = document.querySelectorAll("link[rel*='icon']")
  existing.forEach(el => el.remove())
  const link = document.createElement("link")
  link.rel = "icon"
  link.type = "image/png"
  link.href = logoUrl
  document.head.appendChild(link)
}
