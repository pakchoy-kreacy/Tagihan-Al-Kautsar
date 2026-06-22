import Link from "next/link"
import { NavBar } from "@/components/NavBar"

export default function NotFound() {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="app-main">
        <div className="app-grid" style={{ maxWidth: 480, margin: "0 auto" }}>
          <section className="card" style={{ textAlign: "center", padding: 32 }}>
            <h1 style={{ fontSize: 48, fontWeight: 800, color: "#1B5E20", marginBottom: 8 }}>404</h1>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#173b1a", marginBottom: 12 }}>
              Halaman Tidak Ditemukan
            </h2>
            <p style={{ color: "#5f6f63", fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
              Maaf, halaman yang Anda cari tidak ada atau sudah dipindahkan.
            </p>
            <Link href="/" className="btn btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>
              Ke Beranda
            </Link>
          </section>
        </div>
      </main>
    </div>
  )
}
