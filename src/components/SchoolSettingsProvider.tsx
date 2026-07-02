"use client"

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react"
import { getSchoolSettings, getBankInfoByType, type SchoolSettings, type BankInfoSettings } from "@/lib/infaq-db"
import { getAllClasses, type KelasData } from "@/lib/db"

interface SchoolSettingsContextType {
  settings: SchoolSettings | null
  loading: boolean
  kelasList: KelasData[]
  bankPayment: BankInfoSettings | null
  bankInfaq: BankInfoSettings | null
}

const SchoolSettingsContext = createContext<SchoolSettingsContextType>({
  settings: null,
  loading: true,
  kelasList: [],
  bankPayment: null,
  bankInfaq: null,
})

export function useSchoolSettings() {
  return useContext(SchoolSettingsContext)
}

const SETTINGS_CACHE_KEY = "espp_school_settings_data"

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
  const [kelasList, setKelasList] = useState<KelasData[]>([])
  const [bankPayment, setBankPayment] = useState<BankInfoSettings | null>(null)
  const [bankInfaq, setBankInfaq] = useState<BankInfoSettings | null>(null)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true

    const cached = getCachedSettings()
    if (cached) {
      applyFavicon(cached.logo_url)
    }

    // Prefetch semua data penting sekaligus
    Promise.all([
      getSchoolSettings(),
      getAllClasses(),
      getBankInfoByType('payment'),
      getBankInfoByType('infaq'),
    ]).then(([s, k, bp, bi]) => {
      if (s) {
        setSettings(s)
        applyFavicon(s.logo_url)
        try { localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(s)) } catch { /* ignore */ }
      }
      if (k) setKelasList(k)
      if (bp) setBankPayment(bp)
      if (bi) setBankInfaq(bi)
      setLoading(false)
    }).catch(() => {
      if (!cached) setLoading(false)
    })
  }, [])

  return (
    <SchoolSettingsContext.Provider value={{ settings, loading, kelasList, bankPayment, bankInfaq }}>
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
