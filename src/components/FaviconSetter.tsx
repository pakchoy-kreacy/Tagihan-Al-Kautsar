"use client"

import { useEffect } from "react"
import { getSchoolSettings } from "@/lib/infaq-db"

export function FaviconSetter() {
  useEffect(() => {
    getSchoolSettings().then(settings => {
      if (!settings?.logo_url) return

      // Hapus semua favicon existing
      const existing = document.querySelectorAll("link[rel*='icon']")
      existing.forEach(el => el.remove())

      // Buat favicon baru
      const link = document.createElement("link")
      link.rel = "icon"
      link.type = "image/png"
      link.href = settings.logo_url
      document.head.appendChild(link)
    })
  }, [])

  return null
}
