"use client"

import { useState, useEffect } from "react"
import { getPayments, approvePayment, rejectPayment } from "@/lib/payments-db"
import { formatRupiah } from "@/lib/db"
import type { PaymentWithStudent } from "@/lib/payments-db"

export default function AdminVerifikasiPage() {
  const [payments, setPayments] = useState<PaymentWithStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("pending")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectModal, setRejectModal] = useState<{ id: string; ket: string } | null>(null)

  useEffect(() => { fetchPayments() }, [filter])

  async function fetchPayments() {
    setLoading(true)
    const data = await getPayments(filter === "all" ? undefined : filter)
    setPayments(data)
    setLoading(false)
  }

  async function handleApprove(payment: PaymentWithStudent) {
    if (!confirm(`Approve pembayaran dari ${payment.nama}?`)) return
    setActionLoading(payment.id)
    const ok = await approvePayment(payment.id, payment.bill_id || "")
    if (ok) await fetchPayments()
    else alert("Gagal approve!")
    setActionLoading(null)
  }

  async function handleReject(paymentId: string, ket: string) {
    setRejectModal(null)
    setActionLoading(paymentId)
    const ok = await rejectPayment(paymentId, ket)
    if (ok) await fetchPayments()
    else alert("Gagal reject!")
    setActionLoading(null)
  }

  const tabs = [
    { value: "pending", label: "Menunggu" },
    { value: "approved", label: "Disetujui" },
    { value: "rejected", label: "Ditolak" },
    { value: "all", label: "Semua" },
  ]

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Verifikasi Pembayaran</h1>
      <p style={{ color: "#757575", marginBottom: 14, fontSize: 13 }}>
        Approve atau tolak bukti pembayaran yang masuk.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.value}
            className={`admin-btn ${filter === t.value ? "" : "admin-btn-outline"}`}
            onClick={() => setFilter(t.value)}
            style={{ fontSize: 12, padding: "8px 16px" }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <div className="loading-text">Memuat...</div> : (
        <div className="admin-section">
          {payments.length === 0 ? (
            <p className="empty-text">Tidak ada data pembayaran</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Siswa</th>
                    <th>Kelas</th>
                    <th>Bulan</th>
                    <th>Pengirim</th>
                    <th>Nominal</th>
                    <th>Bukti</th>
                    <th>Tanggal</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.nama}<br />
                        <span style={{ fontSize: 11, color: "#9e9e9e" }}>{p.nisn}</span>
                      </td>
                      <td>{p.kelas}</td>
                      <td>{p.bulan}</td>
                      <td>{p.nama_pengirim}</td>
                      <td style={{ fontWeight: 600 }}>{formatRupiah(p.jumlah_transfer)}</td>
                      <td>
                        {p.bukti_url ? (
                          <a href={p.bukti_url} target="_blank"
                            style={{ color: "#43A047", fontSize: 13 }}>
                            Lihat
                          </a>
                        ) : '-'}
                      </td>
                      <td style={{ fontSize: 12 }}>{new Date(p.created_at).toLocaleDateString("id-ID")}</td>
                      <td>
                        {p.status === "pending" && (
                          <div style={{ display: "flex", gap: 4 }}>
                            <button className="admin-btn admin-btn-sm"
                              onClick={() => handleApprove(p)}
                              disabled={actionLoading === p.id}>
                              OK
                            </button>
                            <button className="admin-btn admin-btn-sm admin-btn-danger"
                              onClick={() => setRejectModal({ id: p.id, ket: "" })}
                              disabled={actionLoading === p.id}>
                              X
                            </button>
                          </div>
                        )}
                        {p.status === "approved" && <span style={{ color: "#43A047", fontWeight: 600 }}>OK</span>}
                        {p.status === "rejected" && (
                          <span title={p.keterangan_admin} style={{ color: "#E53935", fontWeight: 600 }}>
                            Ditolak {p.keterangan_admin && "(info)"}
                          </span>
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
            <h3>Tolak Pembayaran</h3>
            <p style={{ fontSize: 13, color: "#757575", marginBottom: 12 }}>
              Berikan alasan penolakan (opsional)
            </p>
            <textarea className="admin-input" placeholder="Alasan..."
              rows={3} value={rejectModal.ket}
              onChange={e => setRejectModal(r => r ? { ...r, ket: e.target.value } : null)} />
            <div className="admin-modal-actions">
              <button className="admin-btn admin-btn-outline" onClick={() => setRejectModal(null)}>Batal</button>
              <button className="admin-btn admin-btn-danger"
                onClick={() => handleReject(rejectModal.id, rejectModal.ket)}>
                Tolak
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
