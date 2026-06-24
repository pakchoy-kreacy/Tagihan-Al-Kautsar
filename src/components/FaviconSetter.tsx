"use client"

import { useEffect } from "react"
import { getSchoolSettings } from "@/lib/infaq-db"

export function FaviconSetter() {
  useEffect(() => {
    getSchoolSettings().then(settings => {
      if (settings?.logo_url) {
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement || document.createElement("link")
        link.rel = "icon"
        link.type = "image/png"
        link.href = settings.logo_url
        if (!link.parentNode) {
          document.head.appendChild(link)
        }
      }
    })
  }, [])

  return null
}
