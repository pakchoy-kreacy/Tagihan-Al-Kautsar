"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { formatRupiah } from "@/lib/db"
import { usePageRefresh } from "@/hooks/usePageRefresh"
import { X } from "lucide-react"

interface PaymentRow {
  id: string
  nama: string
  kelas: string
  bulan: string
  nominal: number
  tanggal: string
  status: string
  bukti_url: string | null
}

export default function AdminPembayaranPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const refreshData = usePageRefresh(async (isCurrent) => {
    const { data } = await supabase
      .from('payments')
      .select(`
        id, jumlah_transfer, bukti_url, created_at, status,
        students!inner(nisn, name, classes!inner(name)),
        bills!inner(month, amount)
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!isCurrent()) return
    const rows: PaymentRow[] = (data || []).map((item: Record<string, unknown>) => {
      const student = item.students as Record<string, unknown> | undefined
      const bill = item.bills as Record<string, unknown> | undefined
      return {
        id: item.id as string,
        nama: student?.name as string || '-',
        kelas: (student?.classes as Record<string, unknown>)?.name as string || '-',
        bulan: bill?.month as string || '-',
        nominal: bill?.amount as number || 0,
        tanggal: item.created_at ? new Date(item.created_at as string).toLocaleDateString("id-ID") : '-',
        status: item.status as string,
        bukti_url: item.bukti_url as string | null,
      }
    })
    setPayments(rows)
    setLoading(false)
  }, { refreshKey: "admin-payments" })

  useEffect(() => {
    const channel = supabase
      .channel("pembayaran-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () => { void refreshData() })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [refreshData])

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Riwayat Pembayaran</h1>
      <p style={{ color: "var(--neutral)", marginBottom: 14, fontSize: 13 }}>
        Semua pembayaran yang pernah masuk.
      </p>
      {loading ? <div className="loading-text">Memuat...</div> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nama</th><th>Kelas</th><th>Bulan</th>
                <th>Nominal</th><th>Tanggal</th><th>Status</th><th>Bukti</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.nama}</td>
                  <td>{p.kelas}</td>
                  <td>{p.bulan}</td>
                  <td style={{ fontWeight: 600 }}>{formatRupiah(p.nominal)}</td>
                  <td style={{ fontSize: 12 }}>{p.tanggal}</td>
                  <td>
                    <span className={`badge badge-${p.status}`}>
                      {p.status === "approved" ? "Lunas" : p.status === "pending" ? "Menunggu" : p.status === "rejected" ? "Ditolak" : p.status}
                    </span>
                  </td>
                  <td>
                    {p.bukti_url ? (
                      <button type="button" onClick={() => setPreviewUrl(p.bukti_url!)}
                        style={{ color: "var(--emerald)", fontSize: 13, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                        Lihat
                      </button>
                    ) : '-'}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--neutral)", padding: 24 }}>Belum ada pembayaran</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {previewUrl && (
        <>
          <div className="admin-overlay" onClick={() => setPreviewUrl(null)} />
          <div className="image-preview-modal">
            <div className="image-preview-header">
              <h3>Bukti Transfer</h3>
              <button className="modal-close" onClick={() => setPreviewUrl(null)}><X size={20} /></button>
            </div>
            <div className="image-preview-body">
              <img src={previewUrl} alt="Bukti Transfer" className="image-preview-img" />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
