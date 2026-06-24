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

export function SchoolSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SchoolSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSchoolSettings().then(s => {
      setSettings(s)
      setLoading(false)

      // Set favicon sekali
      if (s?.logo_url) {
        const existing = document.querySelectorAll("link[rel*='icon']")
        existing.forEach(el => el.remove())
        const link = document.createElement("link")
        link.rel = "icon"
        link.type = "image/png"
        link.href = s.logo_url
        document.head.appendChild(link)
      }
    })
  }, [])

  return (
    <SchoolSettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SchoolSettingsContext.Provider>
  )
}
