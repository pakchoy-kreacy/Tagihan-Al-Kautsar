"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setError("")
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message === "Invalid login credentials"
          ? "Email atau password salah!"
          : error.message)
        setLoading(false)
      } else {
        if (data?.session) {
          try {
            localStorage.setItem("espp_supabase_auth", JSON.stringify(data.session))
          } catch { /* ignore */ }
        }
        window.location.href = "/admin"
      }
    } catch {
      setError("Gagal masuk. Coba lagi.")
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <main className="app-main">
        <div className="app-grid" style={{ maxWidth: 440, margin: "0 auto" }}>
          <section className="card" style={{ padding: 28 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--emerald)", marginBottom: 8, fontFamily: "var(--font-heading)" }}>
              Login Admin
            </h1>
            <p style={{ color: "var(--neutral)", fontSize: 14, marginBottom: 20 }}>
              Masuk dengan email dan password untuk mengelola data sekolah.
            </p>

            <form onSubmit={handleSubmit}>
              <label
                style={{ fontSize: 13, color: "var(--neutral)", display: "block", marginBottom: 6 }}
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="admin@minuruliman.sch.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                style={{ marginBottom: 14 }}
              />

              <label
                style={{ fontSize: 13, color: "var(--neutral)", display: "block", marginBottom: 6 }}
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ marginBottom: 16 }}
              />

              {error && (
                <div
                  style={{
                    color: "var(--terracotta)",
                    fontSize: 14,
                    marginBottom: 12,
                    padding: "10px 14px",
                    background: "var(--terracotta-soft)",
                    borderRadius: 10,
                  }}
                >
                  {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary" disabled={loading || !email || !password}>
                {loading ? "Memeriksa..." : "Masuk"}
              </button>
            </form>
          </section>

          <div className="app-footer">© {new Date().getFullYear()} MI Nurul Iman Kabo Jaya</div>
        </div>
      </main>
    </div>
  )
}
