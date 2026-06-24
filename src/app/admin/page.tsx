"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getAdminStats, getPendingPayments, getRekapSummary, type PendingPayment } from "@/lib/admin-db"
import { formatRupiah } from "@/lib/db"
import type { AdminStats } from "@/lib/admin-db"
import type { RekapSummaryItem } from "@/lib/admin-db"
import { Users, Building2, CircleCheck, Hourglass, Clock, Heart, Bell, ClipboardList, Settings, Receipt, FileSpreadsheet } from "lucide-react"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([])
  const [rekap, setRekap] = useState<RekapSummaryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [statsData, payments, rekapData] = await Promise.all([
          getAdminStats(),
          getPendingPayments(5),
          getRekapSummary(),
        ])
        setStats(statsData)
        setPendingPayments(payments)
        setRekap(rekapData)
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

  const hasPending = pendingPayments.length > 0

  return (
    <div className="admin-page">
      <div className="dashboard-header-strip">
        <div className="page-title">Dashboard</div>
        <p className="page-subtitle">Ringkasan data sekolah dan aktivitas terbaru</p>
      </div>

      {/* 6 STAT CARDS */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon"><Users size={24} color="var(--emerald)" /></div>
          <div className="stat-content">
            <div className="stat-number">{stats?.totalSiswa || 0}</div>
            <div className="stat-label">Total Siswa</div>
          </div>
        </div>
        <div className="stat-card stat-kelas">
          <div className="stat-icon"><Building2 size={24} color="var(--ink)" /></div>
          <div className="stat-content">
            <div className="stat-number">{stats?.totalKelas || 0}</div>
            <div className="stat-label">Total Kelas</div>
          </div>
        </div>
        <div className="stat-card stat-lunas">
          <div className="stat-icon"><CircleCheck size={24} color="var(--emerald)" /></div>
          <div className="stat-content">
            <div className="stat-number">{stats?.lunas || 0}</div>
            <div className="stat-label">Sudah Bayar</div>
          </div>
        </div>
        <div className="stat-card stat-belum">
          <div className="stat-icon"><Hourglass size={24} color="var(--terracotta)" /></div>
          <div className="stat-content">
            <div className="stat-number">{stats?.belum || 0}</div>
            <div className="stat-label">Belum Bayar</div>
          </div>
        </div>
        <div className="stat-card stat-menunggu">
          <div className="stat-icon"><Clock size={24} color="var(--gold)" /></div>
          <div className="stat-content">
            <div className="stat-number">{stats?.menunggu || 0}</div>
            <div className="stat-label">Menunggu</div>
          </div>
        </div>
        <div className="stat-card stat-infaq">
          <div className="stat-icon"><Heart size={24} color="var(--emerald)" /></div>
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
            <Bell size={20} color="var(--gold)" />
            <span className="pending-alert-text">
              Ada {pendingPayments.length} verifikasi pembayaran menunggu
            </span>
            <div className="pending-alert-actions">
              <Link href="/admin/verifikasi" className="btn-pending">
                Lihat ({pendingPayments.length})
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* REKAP TAGIHAN RINGKASAN */}
      {rekap.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FileSpreadsheet size={18} color="var(--emerald)" />
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>Rekap Tagihan</span>
            </div>
            <Link href="/admin/rekap-tagihan" style={{ fontSize: 13, color: "var(--emerald)", fontWeight: 600, textDecoration: "none" }}>
              Lihat Semua
            </Link>
          </div>
          <div className="rekap-grid">
            {rekap.map(item => (
              <Link key={item.id} href="/admin/rekap-tagihan" className="rekap-card" style={{ textDecoration: "none", color: "inherit" }}>
                <div className="rekap-card-header">
                  <div className="rekap-card-title">{item.name}</div>
                  {item.is_recurring && (
                    <span className="tc-badge recurring" style={{ fontSize: 10 }}>Bulanan</span>
                  )}
                </div>
                <div className="rekap-card-amount">{formatRupiah(item.default_amount)}</div>
                <div className="rekap-card-stats">
                  <div className="rekap-stat">
                    <div className="rekap-stat-num" style={{ color: "var(--emerald)" }}>{item.lunas}</div>
                    <div className="rekap-stat-label">Lunas</div>
                  </div>
                  <div className="rekap-stat">
                    <div className="rekap-stat-num" style={{ color: "var(--terracotta)" }}>{item.belum}</div>
                    <div className="rekap-stat-label">Belum</div>
                  </div>
                  <div className="rekap-stat">
                    <div className="rekap-stat-num" style={{ color: "var(--gold)" }}>{item.menunggu}</div>
                    <div className="rekap-stat-label">Menunggu</div>
                  </div>
                  <div className="rekap-stat">
                    <div className="rekap-stat-num" style={{ color: "var(--ink)" }}>{item.total}</div>
                    <div className="rekap-stat-label">Total</div>
                  </div>
                </div>
                {item.belum > 0 && (
                  <div className="rekap-card-tunggakan">
                    Belum bayar: {item.belum} siswa
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* AKTIVITAS TERBARU */}
      <div className="activity-grid">
        {/* Pending Pembayaran */}
        <div className="activity-card">
          <div className="activity-card-header">
            <span className="activity-title" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Clock size={16} color="var(--gold)" /> Menunggu Verifikasi
            </span>
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
      </div>

      {/* QUICK ACTIONS */}
      <div className="quick-actions">
        <Link href="/admin/siswa" className="quick-action-card">
          <Users size={24} color="var(--emerald)" />
          <span className="qa-label">Kelola Siswa</span>
        </Link>
        <Link href="/admin/kelas" className="quick-action-card">
          <Building2 size={24} color="var(--emerald)" />
          <span className="qa-label">Kelola Kelas</span>
        </Link>
        <Link href="/admin/tagihan" className="quick-action-card">
          <Receipt size={24} color="var(--emerald)" />
          <span className="qa-label">Kelola Tagihan</span>
        </Link>
        <Link href="/admin/verifikasi" className="quick-action-card">
          <ClipboardList size={24} color="var(--emerald)" />
          <span className="qa-label">Verifikasi</span>
        </Link>
        <Link href="/admin/pengaturan" className="quick-action-card">
          <Settings size={24} color="var(--emerald)" />
          <span className="qa-label">Pengaturan</span>
        </Link>
      </div>
    </div>
  )
}
