"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

const SETTINGS_KEY = "espp_school_settings"

export function LoadingScreen() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [schoolName, setSchoolName] = useState("MI")

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY)
      if (raw) {
        const s = JSON.parse(raw)
        if (s.logo_url) setLogoUrl(s.logo_url)
        if (s.nama_sekolah) {
          const words = s.nama_sekolah.split(/\s+/)
          setSchoolName(words.length >= 2 ? words.slice(-2).join(" ") : words[0] || "MI")
        }
      }
    } catch {}
  }, [])

  return (
    <div className="loading-screen">
      <style>{`
        @keyframes logoSpin {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes barGrow {
          0% { width: 0%; }
          60% { width: 80%; }
          100% { width: 96%; }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>

      {logoUrl ? (
        <div className="loading-logo-img" style={{ animation: "logoSpin 1.2s ease-in-out infinite" }}>
          <Image src={logoUrl} alt="Logo" width={64} height={64} style={{ borderRadius: "50%", objectFit: "cover" }} />
        </div>
      ) : (
        <div className="loading-logo-text" style={{ animation: "logoSpin 1.2s ease-in-out infinite" }}>
          {schoolName.charAt(0)}
        </div>
      )}

      <div className="loading-label" style={{ animation: "fadeInUp 0.4s ease forwards" }}>
        {schoolName}
      </div>

      <div className="loading-bar-track">
        <div className="loading-bar-fill" />
      </div>
    </div>
  )
}
