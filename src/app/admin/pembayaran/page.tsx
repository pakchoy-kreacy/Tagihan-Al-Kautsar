"use client"

import { useState, useEffect } from "react"
import { getRecentPayments, type RecentPayment } from "@/lib/admin-db"
import { formatRupiah } from "@/lib/db"

export default function AdminPembayaranPage() {
  const [payments, setPayments] = useState<RecentPayment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRecentPayments(50).then(data => { setPayments(data); setLoading(false) })
  }, [])

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">?? Riwayat Pembayaran</h1>
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
                <tr><td colSpan={5} style={{ textAlign: "center", color: "#9e9e9e" }}>Belum ada pembayaran</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
