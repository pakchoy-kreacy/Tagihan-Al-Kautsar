"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { refreshSchoolSettings, refreshBankInfo, type SchoolSettings, type BankInfoSettings } from "@/lib/infaq-db"
import { getAllClasses, type KelasData } from "@/lib/db"
import { usePageRefresh } from "@/hooks/usePageRefresh"

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
  const [kelasList, setKelasList] = useState<KelasData[]>([])
  const [bankPayment, setBankPayment] = useState<BankInfoSettings | null>(null)
  const [bankInfaq, setBankInfaq] = useState<BankInfoSettings | null>(null)

  useEffect(() => {
    applyFavicon(settings?.logo_url)
  }, [settings?.logo_url])

  usePageRefresh(async (isCurrent) => {
    const [s, k, bp, bi] = await Promise.all([
      refreshSchoolSettings(),
      getAllClasses(true),
      refreshBankInfo('payment'),
      refreshBankInfo('infaq'),
    ])
    if (!isCurrent()) return
    if (s) {
      setSettings(s)
      applyFavicon(s.logo_url)
      try { localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(s)) } catch { /* ignore */ }
    }
    if (k) setKelasList(k)
    if (bp) setBankPayment(bp)
    if (bi) setBankInfaq(bi)
  }, { intervalMs: 60000, refreshKey: "school-static-data" })

  return (
    <SchoolSettingsContext.Provider value={{ settings, loading: false, kelasList, bankPayment, bankInfaq }}>
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
