"use client"

import { useEffect } from "react"


export default function Error({
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
    <div className="app-shell">
      <main className="app-main">
        <div className="app-grid" style={{ maxWidth: 480, margin: "0 auto" }}>
          <section className="card" style={{ textAlign: "center", padding: 32 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)", marginBottom: 12, fontFamily: "var(--font-heading)" }}>
              Terjadi Kesalahan
            </h1>
            <p style={{ color: "var(--neutral)", fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
              Maaf, halaman yang Anda buka mengalami error. Coba lagi atau kembali ke beranda.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button type="button" className="btn btn-primary" onClick={reset}>
                Coba Lagi
              </button>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/" className="btn btn-outline" style={{ textDecoration: "none" }}>
                Ke Beranda
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
