"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { getRecentPayments, type RecentPayment } from "@/lib/admin-db"
import { formatRupiah } from "@/lib/db"

export default function AdminPembayaranPage() {
  const [payments, setPayments] = useState<RecentPayment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function fetchData() {
      const data = await getRecentPayments(50)
      if (mounted) { setPayments(data); setLoading(false) }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000)

    const onVisible = () => { if (!document.hidden) fetchData() }
    document.addEventListener("visibilitychange", onVisible)

    const channel = supabase
      .channel("pembayaran-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () => { fetchData() })
      .subscribe()

    return () => {
      mounted = false
      clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisible)
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Riwayat Pembayaran</h1>
      <p style={{ color: "var(--neutral)", marginBottom: 14, fontSize: 13 }}>
        Daftar pembayaran masuk terbaru untuk verifikasi dan monitoring.
      </p>
      {loading ? <div className="loading-text">Memuat...</div> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nama</th><th>Kelas</th><th>Bulan</th>
                <th>Nominal</th><th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <tr key={i}>
                  <td>{p.nama}</td>
                  <td>{p.kelas}</td>
                  <td>{p.bulan}</td>
                  <td>{formatRupiah(p.nominal)}</td>
                  <td>{p.tanggal}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--neutral)" }}>Belum ada pembayaran</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
