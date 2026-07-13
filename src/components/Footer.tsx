"use client"

import { useState, useEffect } from "react"

export function Footer({ schoolName }: { schoolName?: string }) {
  const [year, setYear] = useState<number | null>(null)

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  return (
    <div className="app-footer">
      © {year || "..."} {schoolName || "MI Nurul Iman Kabo Jaya"}
    </div>
  )
}
