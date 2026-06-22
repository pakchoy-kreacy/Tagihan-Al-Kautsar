"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { NavBar } from "@/components/NavBar"

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push("/admin")
      } else {
        setError("Password salah!")
      }
    } catch {
      setError("Gagal masuk. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <NavBar />
      <main className="app-main">
        <div className="app-grid" style={{ maxWidth: 440, margin: "0 auto" }}>
          <section className="card" style={{ padding: 28 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#173b1a", marginBottom: 8 }}>
              Login Admin
            </h1>
            <p style={{ color: "#5f6f63", fontSize: 14, marginBottom: 20 }}>
              Masuk untuk mengelola data sekolah.
            </p>

            <form onSubmit={handleSubmit}>
              <label
                style={{ fontSize: 13, color: "#5f6f63", display: "block", marginBottom: 6 }}
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Masukkan password admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                style={{ marginBottom: 16 }}
              />

              {error && (
                <div
                  style={{
                    color: "#E53935",
                    fontSize: 14,
                    marginBottom: 12,
                    padding: "10px 14px",
                    background: "#FFEBEE",
                    borderRadius: 10,
                  }}
                >
                  {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary" disabled={loading || !password}>
                {loading ? "Memeriksa..." : "Masuk"}
              </button>
            </form>
          </section>

          <div className="app-footer">© 2026 MI Nurul Iman Kabo Jaya</div>
        </div>
      </main>
    </div>
  )
}
