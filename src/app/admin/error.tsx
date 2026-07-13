"use client"

import { useEffect, useState } from "react"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [msg, setMsg] = useState("")

  useEffect(() => {
    console.error(error)
    const message = error?.message || "(tidak ada detail error)"
    setMsg(message)

    // Auto-reload on chunk loading error (allow up to 3 attempts)
    if (message.includes('Failed to load chunk') || message.includes('Loading chunk')) {
      const KEY = '__espp_chunk_reload_count'
      const count = parseInt(sessionStorage.getItem(KEY) || '0', 10)
      if (count < 3) {
        sessionStorage.setItem(KEY, String(count + 1))
        setTimeout(() => {
          window.location.href = '/admin'
        }, 600)
      }
    }
  }, [error])

  return (
    <div className="admin-page">
      <div className="admin-section" style={{ textAlign: "center", padding: 40 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)", marginBottom: 12, fontFamily: "var(--font-heading)" }}>
          Terjadi Kesalahan
        </h1>
        <p style={{ color: "var(--neutral)", fontSize: 14, marginBottom: 8, lineHeight: 1.6 }}>
          Halaman admin mengalami error. Mencoba memuat ulang...
        </p>
        {msg && (
          <p style={{ color: "var(--terracotta)", fontSize: 12, marginBottom: 20, fontFamily: "monospace", background: "var(--terracotta-soft)", padding: "8px 12px", borderRadius: 6, display: "inline-block" }}>
            {msg}
          </p>
        )}
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button type="button" className="admin-btn" onClick={() => window.location.reload()}>
            Refresh Halaman
          </button>
          <a href="/admin" className="admin-btn admin-btn-outline" style={{ textDecoration: "none" }}>
            Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
