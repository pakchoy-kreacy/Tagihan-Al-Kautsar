"use client"

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react"
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

function getCachedSettings(): SchoolSettings | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(SETTINGS_CACHE_KEY)
    return raw ? JSON.parse(raw) as SchoolSettings : null
  } catch {
    return null
  }
}

export function SchoolSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SchoolSettings | null>(getCachedSettings)
  const [loading, setLoading] = useState(!getCachedSettings)
  const cachedRef = useRef(settings)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true

    const cached = getCachedSettings()
    if (cached) {
      cachedRef.current = cached
      applyFavicon(cached.logo_url)
    }

    getSchoolSettings().then(s => {
      if (s) {
        cachedRef.current = s
        setSettings(s)
        setLoading(false)
        applyFavicon(s.logo_url)
        try { localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(s)) } catch { /* ignore */ }
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
