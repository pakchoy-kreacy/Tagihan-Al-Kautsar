"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSiswaById, formatRupiah, type Siswa } from "@/lib/db"
import { NavBar } from "@/components/NavBar"
import { CircleCheck, Hourglass, Clock, CircleDot } from "lucide-react"

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
        : siswa?.status === "menunggu"
          ? { text: "Menunggu", className: "badge-menunggu" }
          : { text: "Tidak Ada Tagihan", className: "badge-tidak-ada-tagihan" }

  const statusIcon = (status: string) => {
    if (status === "lunas") return <CircleCheck size={18} color="var(--emerald)" />
    if (status === "belum") return <Hourglass size={18} color="var(--terracotta)" />
    if (status === "menunggu") return <Clock size={18} color="var(--gold)" />
    return <CircleDot size={18} color="var(--neutral)" />
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
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", fontFamily: "var(--font-heading)" }}>Siswa tidak ditemukan</div>
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
              <span className={`badge ${statusLabel.className}`}>
                {statusLabel.text}
                {siswa.riwayat.length > 0 && (
                  <span style={{ marginLeft: 4, opacity: 0.85 }}>
                    ({siswa.riwayat.filter(r => r.status === 'lunas').length}/{siswa.riwayat.length})
                  </span>
                )}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
              <div className="avatar" style={{ width: 64, height: 64, fontSize: 24 }}>
                {siswa.nama.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", fontFamily: "var(--font-heading)" }}>{siswa.nama}</div>
                <div style={{ color: "var(--neutral)", fontSize: 14, marginTop: 4 }}>
                  NISN {siswa.nisn} | Kelas {siswa.kelas}
                </div>
              </div>
            </div>
          </section>

          <div className="app-grid-2">
            <section className="card" style={{ background: "#f8fbf8" }}>
              <div className="card-title">Tagihan Aktif</div>
              <div style={{ fontSize: 14, color: "var(--neutral)" }}>{siswa.tagihan}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "var(--emerald)", marginTop: 8, fontVariantNumeric: "tabular-nums" }}>
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
                      <span className="emoji">{statusIcon(item.status)}</span>
                      <div>
                        <span className="bulan">{item.bulan}</span>
                        <span className="tgl">{item.tanggal}</span>
                      </div>
                    </div>
                    <div className="right">
                      <div className="nominal">{formatRupiah(item.nominal)}</div>
                      <div className="status-text">
                        {item.status === "lunas" ? "Lunas" : item.status === "belum" ? "Belum Bayar" : "Menunggu"}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>

          <div className="app-footer">© {new Date().getFullYear()} MI Nurul Iman Kabo Jaya</div>
        </div>
      </main>
    </div>
  )
}
