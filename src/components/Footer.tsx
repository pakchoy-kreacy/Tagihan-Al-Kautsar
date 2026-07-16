"use client"

export function Footer({ schoolName }: { schoolName?: string }) {
  const year = new Date().getFullYear()

  return (
    <div className="app-footer">
      © {year} {schoolName || "MI Nurul Iman Kabo Jaya"}
    </div>
  )
}
