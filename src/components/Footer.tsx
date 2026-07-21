"use client"

import { useState, useEffect } from "react"
import { useSchoolSettings } from "./SchoolSettingsProvider"

export function Footer({ schoolName }: { schoolName?: string }) {
  const { settings } = useSchoolSettings()
  const [year, setYear] = useState(new Date().getFullYear())
  useEffect(() => { setYear(new Date().getFullYear()) }, [])

  const name = schoolName || settings?.nama_sekolah || "MI Nurul Iman Kabo Jaya"

  return (
    <div className="app-footer">
      © {year} {name}
    </div>
  )
}
