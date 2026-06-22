"use client"

import { use, useState, useEffect } from "react"
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

  if (loading) {
    return (
      <div className="phone-frame min-h-[700px]">
        <div className="status-bar">
          <span>?? ????</span>
          <span>?? ?? 12:30</span>
        </div>
        <div className="content">
          <div style={{ textAlign: "center", padding: 40, color: "#9e9e9e" }}>Memuat data siswa...</div>
        </div>
      </div>
    )
  }

  if (notFound || !siswa) {
    return (
      <div className="phone-frame min-h-[700px]">
        <div className="content">
          <p>Siswa tidak ditemukan</p>
          <button className="btn btn-primary" onClick={() => router.back()}>
            Kembali
          </button>
        </div>
      </div>
    )
  }

  const statusLabel =
    siswa.status === "lunas"
      ? { text: "?? LUNAS", className: "badge-lunas" }
      : siswa.status === "belum"
        ? { text: "?? BELUM BAYAR", className: "badge-belum" }
        : { text: "?? MENUNGGU", className: "badge-menunggu" }

  const statusEmoji = (status: string) => {
    if (status === "lunas") return "?"
    if (status === "belum") return "?"
    return "??"
  }

  const statusColor = (status: string) => {
    if (status === "lunas") return "#43A047"
    if (status === "belum") return "#E53935"
    if (status === "menunggu") return "#F9A825"
    return "#9e9e9e"
  }

  return (
    <div className="phone-frame min-h-[700px]">
      <div className="status-bar">
        <span>?? ????</span>
        <span>?? ?? 12:30</span>
      </div>

      <div className="header" style={{ padding: "12px 18px 14px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>?? MI Nurul Iman</div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>Kabo Jaya</div>
        </div>
      </div>

      <div className="content">
        <div className="screen-label">?? Halaman 3 — Detail Siswa</div>

        <div className="back-row">
          <button className="back" onClick={() => router.back()}>
            ?
          </button>
          <h3>Kembali</h3>
        </div>

        <div className="detail-card">
          <div className="avatar">??</div>
          <div className="nama">{siswa.nama}</div>
          <div className="info">
            {siswa.nisn}  Kelas {siswa.kelas}
          </div>

          <hr className="divider" />

          <div className="label">??? Tagihan Aktif</div>
          <div className="value">{siswa.tagihan}</div>
          <div className="value value-green">{formatRupiah(siswa.nominalTagihan)}</div>

          <div style={{ marginTop: 10 }}>
            <span
              className={`badge ${statusLabel.className}`}
              style={{ fontSize: 14, padding: "6px 20px" }}
            >
              {statusLabel.text}
            </span>
          </div>

          <button className="btn btn-primary" style={{ marginTop: 14 }}>
            ?? Bayar Sekarang
          </button>
        </div>

        <div className="riwayat">
          <div className="title">?? Riwayat Pembayaran</div>

          {siswa.riwayat.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "20px 0",
                fontSize: 13,
                color: "#9e9e9e",
              }}
            >
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
                    {item.status === "lunas"
                      ? "Lunas"
                      : item.status === "belum"
                        ? "Belum Bayar"
                        : "Menunggu"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="footer">© 2026 MI Nurul Iman Kabo Jaya</div>
      </div>
    </div>
  )
}

