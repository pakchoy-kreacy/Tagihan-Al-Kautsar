"use client"

import { useEffect } from "react"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="admin-page">
      <div className="admin-section" style={{ textAlign: "center", padding: 40 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)", marginBottom: 12, fontFamily: "var(--font-heading)" }}>
          Terjadi Kesalahan
        </h1>
        <p style={{ color: "var(--neutral)", fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
          Halaman admin mengalami error. Coba lagi atau kembali ke dashboard.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button type="button" className="admin-btn" onClick={reset}>
            Coba Lagi
          </button>
          <a href="/admin" className="admin-btn admin-btn-outline" style={{ textDecoration: "none" }}>
            Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
