"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const redirecting = useRef(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session && !redirecting.current) {
        redirecting.current = true
        try {
          localStorage.setItem("espp_admin_session", JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }))
        } catch { /* ignore */ }
        setTimeout(() => { window.location.href = "/admin" }, 100)
      }
    })
    return () => { subscription.unsubscribe() }
  }, [])

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
        return
      }

      if (data?.session) {
        redirecting.current = true
        localStorage.setItem("espp_admin_session", JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        }))

        // Fetch role in background (don't block redirect)
        void supabase
          .from("admin_users")
          .select("role")
          .eq("email", email)
          .maybeSingle()
          .then(({ data: roleData }) => {
            if (roleData?.role) {
              localStorage.setItem("espp_role", roleData.role)
            }
          })

        // Redirect immediately
        window.location.href = "/admin"
      } else {
        setError("Gagal mendapatkan sesi. Coba lagi.")
        setLoading(false)
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
