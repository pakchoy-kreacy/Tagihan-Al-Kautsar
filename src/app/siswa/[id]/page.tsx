"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSiswaById, formatRupiah, type Siswa } from "@/lib/db"
import { NavBar } from "@/components/NavBar"

export default function DetailSiswaPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [siswa, setSiswa] = useState<Siswa | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function fetchStudent() {
      setLoading(true)
      try {
        const student = await getSiswaById(id)
        if (student) {
          setSiswa(student)
        } else {
          setNotFound(true)
        }
      } catch (error) {
        console.error("Failed to fetch student:", error)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    fetchStudent()
  }, [id])

  const statusLabel =
    siswa?.status === "lunas"
      ? { text: "Lunas", className: "badge-lunas" }
      : siswa?.status === "belum"
        ? { text: "Belum Bayar", className: "badge-belum" }
        : { text: "Menunggu", className: "badge-menunggu" }

  const statusEmoji = (status: string) => {
    if (status === "lunas") return "OK"
    if (status === "belum") return "!"
    return "..."
  }

  const statusColor = (status: string) => {
    if (status === "lunas") return "#43A047"
    if (status === "belum") return "#E53935"
    if (status === "menunggu") return "#F9A825"
    return "#9e9e9e"
  }

  if (loading) {
    return (
      <div className="app-shell">
        <NavBar />
        <main className="app-main">
          <div className="loading-text">Memuat data siswa...</div>
        </main>
      </div>
    )
  }

  if (notFound || !siswa) {
    return (
      <div className="app-shell">
        <NavBar />
        <main className="app-main">
          <div className="card" style={{ textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#173b1a" }}>Siswa tidak ditemukan</div>
            <div className="empty-text" style={{ paddingTop: 8 }}>
              Data siswa yang dicari tidak ada atau sudah dihapus.
            </div>
            <button type="button" className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => router.back()}>
              Kembali
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <NavBar />
      <main className="app-main">
        <div className="app-grid">
          <section className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <button type="button" className="back" onClick={() => router.back()}>Kembali</button>
              <span className={`badge ${statusLabel.className}`}>{statusLabel.text}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
              <div className="avatar" style={{ width: 64, height: 64, fontSize: 24 }}>MI</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#173b1a" }}>{siswa.nama}</div>
                <div style={{ color: "#5f6f63", fontSize: 14, marginTop: 4 }}>
                  NISN {siswa.nisn} | Kelas {siswa.kelas}
                </div>
              </div>
            </div>
          </section>

          <div className="app-grid-2">
            <section className="card" style={{ background: "#f8fbf8" }}>
              <div className="card-title">Tagihan Aktif</div>
              <div style={{ fontSize: 14, color: "#5f6f63" }}>{siswa.tagihan}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#1B5E20", marginTop: 8 }}>
                {formatRupiah(siswa.nominalTagihan)}
              </div>
              <button
                type="button"
                className="btn btn-primary"
                style={{ marginTop: 16 }}
                onClick={() => router.push(`/siswa/${id}/bayar`)}
              >
                Bayar Sekarang
              </button>
            </section>

            <section className="riwayat" style={{ background: "#fff", borderRadius: 14, padding: "16px 18px" }}>
              <div className="title">Riwayat Pembayaran</div>

              {siswa.riwayat.length === 0 ? (
                <div className="empty-text" style={{ padding: "18px 0" }}>
                  Belum ada riwayat pembayaran
                </div>
              ) : (
                siswa.riwayat.map((item, index) => (
                  <div key={index} className={`riwayat-item status-${item.status}`}>
                    <div className="left">
                      <span className="emoji">{statusEmoji(item.status)}</span>
                      <div>
                        <span className="bulan">{item.bulan}</span>
                        <span className="tgl">{item.tanggal}</span>
                      </div>
                    </div>
                    <div className="right">
                      <div className="nominal">{formatRupiah(item.nominal)}</div>
                      <div className="status-text" style={{ color: statusColor(item.status) }}>
                        {item.status === "lunas" ? "Lunas" : item.status === "belum" ? "Belum Bayar" : "Menunggu"}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>

          <div className="app-footer">© 2026 MI Nurul Iman Kabo Jaya</div>
        </div>
      </main>
    </div>
  )
}
