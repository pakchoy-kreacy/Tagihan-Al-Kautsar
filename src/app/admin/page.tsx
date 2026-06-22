"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getAdminStats, getPendingPayments, getPendingDonations, type PendingPayment, type PendingDonation } from "@/lib/admin-db"
import { formatRupiah } from "@/lib/db"
import type { AdminStats } from "@/lib/admin-db"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([])
  const [pendingDonations, setPendingDonations] = useState<PendingDonation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [statsData, payments, donations] = await Promise.all([
          getAdminStats(),
          getPendingPayments(5),
          getPendingDonations(5),
        ])
        setStats(statsData)
        setPendingPayments(payments)
        setPendingDonations(donations)
      } catch (error) {
        console.error("Failed to fetch admin data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="admin-page">
        <div className="skeleton-header" />
        <div className="skeleton-cards" />
      </div>
    )
  }

  const hasPending = pendingPayments.length > 0 || pendingDonations.length > 0

  return (
    <div className="admin-page">
      <div className="page-title">Dashboard</div>
      <p className="page-subtitle">Ringkasan data sekolah dan aktivitas terbaru</p>

      {/* 6 STAT CARDS */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{stats?.totalSiswa || 0}</div>
            <div className="stat-label">Total Siswa</div>
          </div>
        </div>
        <div className="stat-card stat-kelas">
          <div className="stat-icon">🏫</div>
          <div className="stat-content">
            <div className="stat-number">{stats?.totalKelas || 0}</div>
            <div className="stat-label">Total Kelas</div>
          </div>
        </div>
        <div className="stat-card stat-lunas">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{stats?.lunas || 0}</div>
            <div className="stat-label">Sudah Bayar</div>
          </div>
        </div>
        <div className="stat-card stat-belum">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-number">{stats?.belum || 0}</div>
            <div className="stat-label">Belum Bayar</div>
          </div>
        </div>
        <div className="stat-card stat-menunggu">
          <div className="stat-icon">🕐</div>
          <div className="stat-content">
            <div className="stat-number">{stats?.menunggu || 0}</div>
            <div className="stat-label">Menunggu</div>
          </div>
        </div>
        <div className="stat-card stat-infaq">
          <div className="stat-icon">💚</div>
          <div className="stat-content">
            <div className="stat-number">{formatRupiah(stats?.totalInfaq || 0)}</div>
            <div className="stat-label">Total Infaq</div>
          </div>
        </div>
      </div>

      {/* VERIFIKASI MENUNGGU */}
      {hasPending && (
        <div className="pending-alert">
          <div className="pending-alert-header">
            <span className="pending-alert-icon">🔔</span>
            <span className="pending-alert-text">
              Ada {pendingPayments.length + pendingDonations.length} verifikasi menunggu
            </span>
            <div className="pending-alert-actions">
              {pendingPayments.length > 0 && (
                <Link href="/admin/verifikasi" className="btn-pending">
                  Pembayaran ({pendingPayments.length})
                </Link>
              )}
              {pendingDonations.length > 0 && (
                <Link href="/admin/verifikasi-infaq" className="btn-pending">
                  Infaq ({pendingDonations.length})
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AKTIVITAS TERBARU */}
      <div className="activity-grid">
        {/* Pending Pembayaran */}
        <div className="activity-card">
          <div className="activity-card-header">
            <span className="activity-title">🕐 Menunggu Verifikasi</span>
            <Link href="/admin/verifikasi" className="activity-link">Lihat Semua</Link>
          </div>
          {pendingPayments.length === 0 ? (
            <div className="activity-empty">Tidak ada pembayaran menunggu</div>
          ) : (
            <div className="activity-list">
              {pendingPayments.map((p) => (
                <div key={p.id} className="activity-item">
                  <div className="activity-item-left">
                    <div className="activity-item-name">{p.nama}</div>
                    <div className="activity-item-sub">{p.kelas} · {p.bulan}</div>
                  </div>
                  <div className="activity-item-right">
                    <div className="activity-item-amount">{formatRupiah(p.jumlah_transfer)}</div>
                    <div className="activity-item-date">
                      {new Date(p.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Infaq */}
        <div className="activity-card">
          <div className="activity-card-header">
            <span className="activity-title">💚 Infaq Menunggu</span>
            <Link href="/admin/verifikasi-infaq" className="activity-link">Lihat Semua</Link>
          </div>
          {pendingDonations.length === 0 ? (
            <div className="activity-empty">Tidak ada infaq menunggu</div>
          ) : (
            <div className="activity-list">
              {pendingDonations.map((d) => (
                <div key={d.id} className="activity-item">
                  <div className="activity-item-left">
                    <div className="activity-item-name">{d.nama_donatur}</div>
                    <div className="activity-item-sub">
                      {d.pesan || "Tanpa pesan"}
                    </div>
                  </div>
                  <div className="activity-item-right">
                    <div className="activity-item-amount">{formatRupiah(d.nominal)}</div>
                    <div className="activity-item-date">
                      {new Date(d.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="quick-actions">
        <Link href="/admin/siswa" className="quick-action-card">
          <span className="qa-icon">👥</span>
          <span className="qa-label">Kelola Siswa</span>
        </Link>
        <Link href="/admin/kelas" className="quick-action-card">
          <span className="qa-icon">🏫</span>
          <span className="qa-label">Kelola Kelas</span>
        </Link>
        <Link href="/admin/tagihan" className="quick-action-card">
          <span className="qa-icon">📋</span>
          <span className="qa-label">Kelola Tagihan</span>
        </Link>
        <Link href="/admin/verifikasi" className="quick-action-card">
          <span className="qa-icon">✅</span>
          <span className="qa-label">Verifikasi</span>
        </Link>
        <Link href="/admin/pengaturan" className="quick-action-card">
          <span className="qa-icon">⚙️</span>
          <span className="qa-label">Pengaturan</span>
        </Link>
      </div>
    </div>
  )
}
