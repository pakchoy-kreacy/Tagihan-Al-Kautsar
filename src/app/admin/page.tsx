"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getAdminStats, getRecentPayments, getUnpaidStudents } from "@/lib/admin-db"
import { formatRupiah } from "@/lib/db"
import type { AdminStats, RecentPayment, UnpaidStudent } from "@/lib/admin-db"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([])
  const [unpaidStudents, setUnpaidStudents] = useState<UnpaidStudent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [statsData, paymentsData, unpaidData] = await Promise.all([
          getAdminStats(),
          getRecentPayments(5),
          getUnpaidStudents(),
        ])
        setStats(statsData)
        setRecentPayments(paymentsData)
        setUnpaidStudents(unpaidData)
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
        <h1 className="admin-page-title">?? Dashboard</h1>
        <div className="loading-text">Memuat data...</div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">?? Dashboard</h1>

      {/* Stats Cards */}
      <div className="admin-stats">
        <div className="stat-card stat-total">
          <div className="stat-number">{stats?.totalSiswa || 0}</div>
          <div className="stat-label">Total Siswa</div>
        </div>
        <div className="stat-card stat-lunas">
          <div className="stat-number">{stats?.lunas || 0}</div>
          <div className="stat-label">Lunas</div>
        </div>
        <div className="stat-card stat-belum">
          <div className="stat-number">{stats?.belum || 0}</div>
          <div className="stat-label">Belum Bayar</div>
        </div>
        <div className="stat-card stat-menunggu">
          <div className="stat-number">{stats?.menunggu || 0}</div>
          <div className="stat-label">Menunggu</div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h2>?? Pembayaran Terbaru</h2>
          <Link href="/admin/pembayaran" className="admin-link">Lihat Semua</Link>
        </div>
        {recentPayments.length === 0 ? (
          <p className="empty-text">Belum ada pembayaran</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Kelas</th>
                  <th>Bulan</th>
                  <th>Nominal</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p, i) => (
                  <tr key={i}>
                    <td>{p.nama}</td>
                    <td>{p.kelas}</td>
                    <td>{p.bulan}</td>
                    <td>{formatRupiah(p.nominal)}</td>
                    <td>{p.tanggal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Unpaid Students */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h2>?? Siswa Belum Bayar</h2>
          <Link href="/admin/siswa" className="admin-link">Kelola Siswa</Link>
        </div>
        {unpaidStudents.length === 0 ? (
          <p className="empty-text">Semua siswa sudah bayar ?</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>NISN</th>
                  <th>Nama</th>
                  <th>Kelas</th>
                  <th>Tagihan</th>
                  <th>Nominal</th>
                </tr>
              </thead>
              <tbody>
                {unpaidStudents.slice(0, 10).map((s) => (
                  <tr key={s.id}>
                    <td>{s.nisn}</td>
                    <td>{s.nama}</td>
                    <td>{s.kelas}</td>
                    <td>{s.tagihan}</td>
                    <td>{formatRupiah(s.nominalTagihan)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {unpaidStudents.length > 10 && (
          <p className="more-text">...dan {unpaidStudents.length - 10} siswa lainnya</p>
        )}
      </div>
    </div>
  )
}
