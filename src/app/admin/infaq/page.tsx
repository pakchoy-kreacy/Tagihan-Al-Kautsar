"use client"

import { useEffect, useState } from "react"
import { getDonations, approveDonasi, rejectDonasi } from "@/lib/infaq-db"
import { formatRupiah } from "@/lib/db"
import type { Donation } from "@/lib/infaq-db"
import { useToast } from "@/components/Toast"
import { ConfirmModal } from "@/components/ConfirmModal"
import { Check, X } from "@/components/Icons"

export default function AdminInfaqPage() {
  const { showToast } = useToast()
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [approveTarget, setApproveTarget] = useState<Donation | null>(null)
  const [rejectModal, setRejectModal] = useState<{ id: string; ket: string } | null>(null)

  useEffect(() => { fetchDonations() }, [filter]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const tabs = [
    { value: "all", label: "Semua" },
    { value: "pending", label: "Menunggu" },
    { value: "approved", label: "Disetujui" },
    { value: "rejected", label: "Ditolak" },
  ]

  const statusLabel: Record<string, string> = {
    pending: "Menunggu",
    approved: "Disetujui",
    rejected: "Ditolak",
  }

  return (
    <div className="admin-page">
      <div className="page-title">Infaq</div>
      <p className="page-subtitle">Kelola donasi infaq dari orang tua dan masyarakat</p>

      {/* STATS ROW */}
      <div className="infaq-stats">
        <div className="infaq-stat-card">
          <div className="infaq-stat-num">
            {formatRupiah(donations.filter(d => d.status === "approved").reduce((s, d) => s + d.nominal, 0))}
          </div>
          <div className="infaq-stat-label">Total Diterima</div>
        </div>
        <div className="infaq-stat-card pending">
          <div className="infaq-stat-num">
            {donations.filter(d => d.status === "pending").length}
          </div>
          <div className="infaq-stat-label">Menunggu</div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="filter-chips">
        {tabs.map(t => (
          <button key={t.value}
            className={`filter-chip green ${filter === t.value ? "active" : ""}`}
            onClick={() => setFilter(t.value)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* DONATION LIST */}
      {loading ? (
        <div className="loading-text">Memuat...</div>
      ) : donations.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">💚</span>
          <p>Tidak ada infaq</p>
        </div>
      ) : (
        <div className="infaq-list">
          {donations.map(d => (
            <div key={d.id} className="infaq-card">
              <div className="ic-header">
                <div className="ic-donatur">{d.nama_donatur}</div>
                <span className={`badge badge-${d.status === "approved" ? "lunas" : d.status === "pending" ? "menunggu" : "belum"}`}>
                  {statusLabel[d.status]}
                </span>
              </div>
              <div className="ic-amount">{formatRupiah(d.nominal)}</div>
              {d.pesan && <div className="ic-pesan">&#8220;{d.pesan}&#8221;</div>}
              <div className="ic-date">
                {new Date(d.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </div>
              {d.status === "pending" && (
                <div className="ic-actions">
                  <button className="admin-btn admin-btn-sm" onClick={() => setApproveTarget(d)} title="Setujui">
                    <Check size={14} color="#fff" /> Setujui
                  </button>
                  <button className="admin-btn admin-btn-sm admin-btn-danger"
                    onClick={() => setRejectModal({ id: d.id, ket: "" })} title="Tolak">
                    <X size={14} color="#fff" /> Tolak
                  </button>
                  {d.bukti_url && (
                    <a href={d.bukti_url} target="_blank" rel="noopener noreferrer"
                      className="admin-btn admin-btn-sm admin-btn-outline">
                      Lihat Bukti
                    </a>
                  )}
                </div>
              )}
              {d.status !== "pending" && d.bukti_url && (
                <div className="ic-bukti">
                  <a href={d.bukti_url} target="_blank" rel="noopener noreferrer"
                    style={{ color: "#4F46E5", fontSize: 12, fontWeight: 600 }}>
                    Lihat Bukti Transfer
                  </a>
                </div>
              )}
            </div>
          ))}
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
            <textarea className="admin-input" placeholder="Alasan penolakan (opsional)" rows={3}
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
