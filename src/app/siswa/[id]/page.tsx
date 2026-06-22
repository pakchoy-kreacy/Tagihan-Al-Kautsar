"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSiswaById, formatRupiah, type Siswa } from "@/lib/db"

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

  const shellStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "#eef2ee",
    padding: 16,
  }

  const pageStyle: React.CSSProperties = {
    maxWidth: 560,
    margin: "0 auto",
    display: "grid",
    gap: 14,
  }

  const cardHeaderStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: 18,
    padding: 16,
  }

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
      <main style={shellStyle}>
        <div style={pageStyle}>
          <div className="card" style={cardHeaderStyle}>
            <div style={{ color: "#5f6f63", fontSize: 13 }}>Memuat data siswa...</div>
          </div>
        </div>
      </main>
    )
  }

  if (notFound || !siswa) {
    return (
      <main style={shellStyle}>
        <div style={pageStyle}>
          <div className="card" style={{ ...cardHeaderStyle, textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#173b1a" }}>Siswa tidak ditemukan</div>
            <div className="empty-text" style={{ paddingTop: 8 }}>
              Data siswa yang dicari tidak ada atau sudah dihapus.
            </div>
            <button type="button" className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => router.back()}>
              Kembali
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={shellStyle}>
      <div style={pageStyle}>
        <section className="card" style={cardHeaderStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <button type="button" className="back" onClick={() => router.back()}>
              Kembali
            </button>
            <span className={`badge ${statusLabel.className}`}>{statusLabel.text}</span>
          </div>
          <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
            <div className="detail-card" style={{ marginBottom: 0, textAlign: "left", padding: 0, boxShadow: "none", border: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="avatar">MI</div>
                <div>
                  <div className="nama" style={{ fontSize: 22 }}>{siswa.nama}</div>
                  <div className="info" style={{ marginTop: 4 }}>
                    NISN {siswa.nisn} | Kelas {siswa.kelas}
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 0, background: "#f8fbf8" }}>
              <div className="card-title">Tagihan Aktif</div>
              <div style={{ fontSize: 14, color: "#5f6f63" }}>{siswa.tagihan}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#1B5E20", marginTop: 4 }}>
                {formatRupiah(siswa.nominalTagihan)}
              </div>
            </div>

            <button type="button" className="btn btn-primary" onClick={() => router.push(`/siswa/${id}/bayar`)}>
              Bayar Sekarang
            </button>
          </div>
        </section>

        <section className="riwayat">
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

        <div className="footer">© 2026 MI Nurul Iman Kabo Jaya</div>
      </div>
    </main>
  )
}

