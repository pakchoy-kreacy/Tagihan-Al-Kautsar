"use client"

import { useEffect, useState } from "react"
import { getDonations } from "@/lib/infaq-db"
import { formatRupiah } from "@/lib/db"
import type { Donation } from "@/lib/infaq-db"
import { Heart, Eye, Inbox, X } from "lucide-react"

export default function AdminInfaqPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  async function fetchDonations() {
    setLoading(true)
    const data = await getDonations()
    setDonations(data)
    setLoading(false)
  }

  useEffect(() => { fetchDonations() }, []) // eslint-disable-line react-hooks/set-state-in-effect

  const totalTerkumpul = donations.reduce((s, d) => s + d.nominal, 0)

  return (
    <div className="admin-page">
      <div className="page-title">Riwayat Infaq</div>
      <p className="page-subtitle">Daftar infaq yang masuk dari orang tua dan masyarakat</p>

      <div className="infaq-total-card">
        <div className="infaq-total-icon">
          <Heart size={28} color="var(--emerald)" />
        </div>
        <div className="infaq-total-content">
          <div className="infaq-total-label">Total Infaq Terkumpul</div>
          <div className="infaq-total-amount">{formatRupiah(totalTerkumpul)}</div>
        </div>
        <div className="infaq-total-count">
          <div className="infaq-total-count-num">{donations.length}</div>
          <div className="infaq-total-count-label">donasi</div>
        </div>
      </div>

      {loading ? (
        <div className="loading-text">Memuat...</div>
      ) : donations.length === 0 ? (
        <div className="empty-state">
          <Inbox size={48} color="var(--neutral)" style={{ opacity: 0.4, marginBottom: 12 }} />
          <p>Belum ada infaq masuk</p>
          <p className="empty-state-sub">Infaq dari orang tua akan muncul di sini</p>
        </div>
      ) : (
        <div className="infaq-list">
          {donations.map(d => (
            <div key={d.id} className="infaq-card">
              <div className="ic-header">
                <div className="ic-donatur">{d.nama_donatur || "Anonim"}</div>
                <div className="ic-amount">{formatRupiah(d.nominal)}</div>
              </div>
              {d.pesan && <div className="ic-pesan">&#8220;{d.pesan}&#8221;</div>}
              <div className="ic-date">
                {new Date(d.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </div>
              {d.bukti_url && (
                <div className="ic-bukti">
                  <button type="button" className="ic-bukti-link" onClick={() => setPreviewUrl(d.bukti_url)}>
                    <Eye size={14} /> Lihat Bukti Transfer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* IMAGE PREVIEW MODAL */}
      {previewUrl && (
        <>
          <div className="admin-overlay" onClick={() => setPreviewUrl(null)} />
          <div className="image-preview-modal">
            <div className="image-preview-header">
              <h3>Bukti Transfer</h3>
              <button className="modal-close" onClick={() => setPreviewUrl(null)}><X size={20} /></button>
            </div>
            <div className="image-preview-body">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Bukti Transfer" className="image-preview-img" />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
