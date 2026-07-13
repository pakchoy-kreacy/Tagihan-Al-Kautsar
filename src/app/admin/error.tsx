"use client"

import { useEffect, useState } from "react"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [info, setInfo] = useState<Record<string, string>>({})

  useEffect(() => {
    console.error(error)
    const message = error?.message || "(tidak ada detail error)"

    let hasAuth = "no"
    let hasBackup = "no"
    let lsLen = "0"
    try {
      hasAuth = localStorage.getItem("espp_supabase_auth") ? "yes" : "no"
      hasBackup = localStorage.getItem("espp_admin_session") ? "yes" : "no"
      lsLen = String(localStorage.length)
    } catch { /* ignore */ }

    const diag: Record<string, string> = {
      pesan: message,
      url: typeof window !== "undefined" ? window.location.href : "-",
      session_lokal: hasAuth,
      backup_session: hasBackup,
      jumlah_ls: lsLen,
    }
    setInfo(diag)

    if (message.includes('Failed to load chunk') || message.includes('Loading chunk')) {
      const KEY = '__espp_chunk_reload_count'
      const count = parseInt(sessionStorage.getItem(KEY) || '0', 10)
      if (count < 3) {
        sessionStorage.setItem(KEY, String(count + 1))
        const sep = window.location.search ? '&' : '?'
        setTimeout(() => {
          window.location.href = '/admin' + sep + '_cb=' + Date.now()
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
        <p style={{ color: "var(--neutral)", fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>
          Halaman admin mengalami error. Mencoba memuat ulang...
        </p>
        <div style={{ textAlign: "left", fontSize: 12, fontFamily: "monospace", background: "var(--terracotta-soft)", padding: "12px 16px", borderRadius: 8, display: "inline-block", maxWidth: "100%" }}>
          {Object.entries(info).map(([k, v]) => (
            <div key={k} style={{ marginBottom: 4 }}>
              <b>{k}:</b> {v}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
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
