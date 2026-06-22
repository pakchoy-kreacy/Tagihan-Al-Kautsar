"use client"

import { useState, useEffect } from "react"
import { getDonations, approveDonasi, rejectDonasi } from "@/lib/infaq-db"
import { formatRupiah } from "@/lib/db"
import type { Donation } from "@/lib/infaq-db"

export default function AdminVerifikasiInfaqPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("pending")
  const [rejectModal, setRejectModal] = useState<{ id: string; ket: string } | null>(null)

  useEffect(() => { fetchDonations() }, [filter])

  async function fetchDonations() {
    setLoading(true)
    const data = await getDonations(filter === "all" ? undefined : filter)
    setDonations(data)
    setLoading(false)
  }

  async function handleApprove(id: string) {
    if (!confirm("Approve infaq ini?")) return
    const ok = await approveDonasi(id)
    if (ok) fetchDonations()
    else alert("Gagal!")
  }

  async function handleReject(id: string, ket: string) {
    setRejectModal(null)
    const ok = await rejectDonasi(id, ket)
    if (ok) fetchDonations()
    else alert("Gagal!")
  }

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">?? Verifikasi Infaq</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {["pending", "approved", "rejected", "all"].map(val => (
          <button key={val}
            className={`admin-btn ${filter === val ? "" : "admin-btn-outline"}`}
            onClick={() => setFilter(val)}
            style={{ fontSize: 12, padding: "8px 16px" }}>
            {val === "pending" ? "?? Menunggu" : val === "approved" ? "? Disetujui" : val === "rejected" ? "? Ditolak" : "?? Semua"}
          </button>
        ))}
      </div>

      {loading ? <div className="loading-text">Memuat...</div> : (
        <div className="admin-section">
          {donations.length === 0 ? <p className="empty-text">Belum ada infaq</p> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Donatur</th><th>Nominal</th><th>Pesan</th><th>Bukti</th><th>Tanggal</th><th>Aksi</th></tr>
                </thead>
                <tbody>
                  {donations.map(d => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 600 }}>{d.nama_donatur}</td>
                      <td style={{ fontWeight: 600 }}>{formatRupiah(d.nominal)}</td>
                      <td style={{ fontSize: 12, color: "#757575", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {d.pesan || "-"}
                      </td>
                      <td>
                        {d.bukti_url ? <a href={d.bukti_url} target="_blank" style={{ color: "#43A047" }}>?? Lihat</a> : "-"}
                      </td>
                      <td style={{ fontSize: 12 }}>{new Date(d.created_at).toLocaleDateString("id-ID")}</td>
                      <td>
                        {d.status === "pending" ? (
                          <div style={{ display: "flex", gap: 4 }}>
                            <button className="admin-btn admin-btn-sm" onClick={() => handleApprove(d.id)}>?</button>
                            <button className="admin-btn admin-btn-sm admin-btn-danger"
                              onClick={() => setRejectModal({ id: d.id, ket: "" })}>?</button>
                          </div>
                        ) : d.status === "approved" ? (
                          <span style={{ color: "#43A047", fontWeight: 600 }}>?</span>
                        ) : (
                          <span style={{ color: "#E53935", fontWeight: 600 }} title={d.keterangan_admin}>?</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {rejectModal && (
        <>
          <div className="admin-overlay" onClick={() => setRejectModal(null)} />
          <div className="admin-modal">
            <h3>Tolak Infaq</h3>
            <textarea className="admin-input" placeholder="Alasan..." rows={3}
              value={rejectModal.ket}
              onChange={e => setRejectModal(r => r ? { ...r, ket: e.target.value } : null)} />
            <div className="admin-modal-actions">
              <button className="admin-btn admin-btn-outline" onClick={() => setRejectModal(null)}>Batal</button>
              <button className="admin-btn admin-btn-danger"
                onClick={() => handleReject(rejectModal.id, rejectModal.ket)}>Tolak</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
