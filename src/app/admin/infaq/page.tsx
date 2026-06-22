"use client"

import { useEffect, useState } from "react"
import { getDonations, approveDonasi, rejectDonasi } from "@/lib/infaq-db"
import { formatRupiah } from "@/lib/db"
import type { Donation } from "@/lib/infaq-db"

export default function AdminInfaqPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDonations("all").then((data) => {
      setDonations(data)
      setLoading(false)
    })
  }, [])

  const total = donations.reduce((sum, d) => sum + (d.status === "approved" ? d.nominal : 0), 0)
  const pending = donations.filter((d) => d.status === "pending").length

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Infaq</h1>
      <p style={{ color: "#757575", marginBottom: 14, fontSize: 13 }}>
        Ringkasan donasi infaq yang masuk.
      </p>

      <div className="admin-stats">
        <div className="stat-card stat-total">
          <div className="stat-number">{formatRupiah(total)}</div>
          <div className="stat-label">Total Diterima</div>
        </div>
        <div className="stat-card stat-menunggu">
          <div className="stat-number">{pending}</div>
          <div className="stat-label">Menunggu Verifikasi</div>
        </div>
      </div>

      {loading ? (
        <div className="loading-text">Memuat...</div>
      ) : donations.length === 0 ? (
        <p className="empty-text">Belum ada data infaq</p>
      ) : (
        <div className="admin-section">
          <div className="admin-section-header">
            <h2>Donasi Terbaru</h2>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Donatur</th>
                  <th>Nominal</th>
                  <th>Pesan</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {donations.slice(0, 10).map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600 }}>{d.nama_donatur}</td>
                    <td style={{ fontWeight: 600 }}>{formatRupiah(d.nominal)}</td>
                    <td style={{ fontSize: 12, color: "#757575", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {d.pesan || "-"}
                    </td>
                    <td>
                      <span
                        className={`badge ${d.status === "approved" ? "badge-lunas" : d.status === "pending" ? "badge-menunggu" : "badge-belum"}`}
                      >
                        {d.status === "approved" ? "Disetujui" : d.status === "pending" ? "Menunggu" : "Ditolak"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
