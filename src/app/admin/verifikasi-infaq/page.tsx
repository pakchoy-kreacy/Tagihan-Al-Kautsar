"use client"

import { useState, useEffect } from "react"
import { getDonations, approveDonasi, rejectDonasi } from "@/lib/infaq-db"
import { formatRupiah } from "@/lib/db"
import type { Donation } from "@/lib/infaq-db"
import { useToast } from "@/components/Toast"
import { ConfirmModal } from "@/components/ConfirmModal"
import { Check, X } from "@/components/Icons"

export default function AdminVerifikasiInfaqPage() {
  const { showToast } = useToast()
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("pending")
  const [approveTarget, setApproveTarget] = useState<Donation | null>(null)
  const [rejectModal, setRejectModal] = useState<{ id: string; ket: string } | null>(null)

  useEffect(() => { fetchDonations() }, [filter])

  async function fetchDonations() {
    setLoading(true)
    const data = await getDonations(filter === "all" ? undefined : filter)
    setDonations(data)
    setLoading(false)
  }

  async function handleApprove() {
    if (!approveTarget) return
    const ok = await approveDonasi(approveTarget.id)
    if (ok) { showToast("Infaq disetujui!"); fetchDonations() }
    else showToast("Gagal!", "error")
    setApproveTarget(null)
  }

  async function handleReject(id: string, ket: string) {
    setRejectModal(null)
    const ok = await rejectDonasi(id, ket)
    if (ok) { showToast("Infaq ditolak"); fetchDonations() }
    else showToast("Gagal!", "error")
  }

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Verifikasi Infaq</h1>
      <p style={{ color: "#757575", marginBottom: 14, fontSize: 13 }}>
        Verifikasi donasi dan bukti transfer infaq.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {["pending", "approved", "rejected", "all"].map(val => (
          <button key={val}
            className={`admin-btn ${filter === val ? "" : "admin-btn-outline"}`}
            onClick={() => setFilter(val)}
            style={{ fontSize: 12, padding: "8px 16px" }}>
            {val === "pending" ? "Menunggu" : val === "approved" ? "Disetujui" : val === "rejected" ? "Ditolak" : "Semua"}
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
                        {d.bukti_url ? <a href={d.bukti_url} target="_blank" rel="noopener noreferrer" style={{ color: "#43A047" }}>Lihat</a> : "-"}
                      </td>
                      <td style={{ fontSize: 12 }}>{new Date(d.created_at).toLocaleDateString("id-ID")}</td>
                      <td>
                        {d.status === "pending" ? (
                          <div style={{ display: "flex", gap: 4 }}>
                            <button className="admin-btn admin-btn-sm" onClick={() => setApproveTarget(d)} title="Setujui">
                              <Check size={14} color="#fff" />
                            </button>
                            <button className="admin-btn admin-btn-sm admin-btn-danger"
                              onClick={() => setRejectModal({ id: d.id, ket: "" })} title="Tolak">
                              <X size={14} color="#fff" />
                            </button>
                          </div>
                        ) : d.status === "approved" ? (
                          <span style={{ color: "#43A047", fontWeight: 600 }}>Disetujui</span>
                        ) : (
                          <span style={{ color: "#E53935", fontWeight: 600 }} title={d.keterangan_admin}>Ditolak</span>
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

      <ConfirmModal
        open={!!approveTarget}
        title="Setujui Infaq"
        message={`Setujui infaq dari ${approveTarget?.nama_donatur} sebesar ${approveTarget ? formatRupiah(approveTarget.nominal) : ""}?`}
        confirmLabel="Setujui"
        onConfirm={handleApprove}
        onCancel={() => setApproveTarget(null)}
      />

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
