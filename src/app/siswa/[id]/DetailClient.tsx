"use client"

import Link from "next/link"
import { formatRupiah, type Siswa } from "@/lib/db"
import { ArrowLeft, Home, User, Wallet, ChevronRight } from "lucide-react"

interface DetailClientProps {
  siswa: Siswa
  id: string
}

export function DetailClient({ siswa, id }: DetailClientProps) {

  function formatDate(tgl: string) {
    if (!tgl || tgl === "Belum dibayar") return tgl
    try {
      return new Date(tgl).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    } catch {
      return tgl
    }
  }

  function deadlineText(item: Siswa["riwayat"][0]) {
    if (!item.batas_waktu) return null
    try {
      return new Date(item.batas_waktu).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    } catch {
      return null
    }
  }

  const statusConfig: Record<string, { label: string; className: string }> = {
    lunas: { label: "LUNAS", className: "lunas" },
    belum: { label: "BELUM BAYAR", className: "belum" },
    menunggu: { label: "MENUNGGU", className: "menunggu" },
    tidak_ada_tagihan: { label: "TIDAK ADA", className: "lunas" },
  }

  const activeBills = siswa.riwayat.filter((r) => r.status !== "lunas")
  const history = siswa.riwayat.filter((r) => r.status === "lunas")
  const totalUnpaid = activeBills.reduce((sum, b) => sum + b.nominal, 0)

  return (
    <div className="app-shell">
      <header className="public-header">
        <button onClick={() => window.history.back()}><ArrowLeft size={22} /></button>
        <span className="public-header-title">Detail Tagihan</span>
        <Link href="/" style={{ color: "inherit" }}><Home size={20} /></Link>
      </header>

      <main className="public-page">
        <div className="profile-card">
          <div className="profile-avatar">
            <User size={28} />
          </div>
          <div className="profile-info">
            <div className="name">{siswa.nama}</div>
            <div className="meta">Kelas {siswa.kelas}</div>
            <div className="meta">NISN: {siswa.nisn}</div>
          </div>
        </div>

        {activeBills.length > 0 ? (
          <div className="bill-card">
            <div className="bill-card-header">
              <div className="bill-card-title">Tagihan Aktif ({activeBills.length})</div>
            </div>

            {activeBills.map((bill) => {
              const status = statusConfig[bill.status] || statusConfig.belum
              return (
                <div key={bill.id} style={{ padding: "12px 0", borderBottom: activeBills.length > 1 ? "1px solid var(--sand)" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div className="bill-card-title" style={{ marginBottom: 0, fontSize: 15 }}>{bill.bill_type_name || bill.bulan}</div>
                    <span className={`bill-status-badge ${status.className}`} style={{ fontSize: 11 }}>{status.label}</span>
                  </div>
                  {bill.batas_waktu && (
                    <div style={{ fontSize: 12, color: "var(--neutral)", marginBottom: 4 }}>Jatuh tempo: {deadlineText(bill)}</div>
                  )}
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>{formatRupiah(bill.nominal)}</div>
                </div>
              )
            })}

            <div className="bill-row" style={{ marginTop: 12, paddingTop: 12, borderTop: activeBills.length > 1 ? "2px solid var(--emerald-soft)" : "none" }}>
              <span className="label" style={{ fontWeight: 700 }}>Total Tagihan</span>
              <span className="value amount" style={{ fontSize: 20 }}>{formatRupiah(totalUnpaid)}</span>
            </div>

            <a href={`/siswa/${id}/bayar`} className="bill-btn" style={{ textDecoration: "none", marginTop: 16 }}>
              <Wallet size={18} />
              Bayar Sekarang
            </a>
          </div>
        ) : (
          <div className="bill-card">
            <div className="bill-card-header">
              <div className="bill-card-title">Tagihan Aktif</div>
            </div>
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--neutral)" }}>
              {siswa.status === "lunas" ? "Semua tagihan sudah lunas" : "Tidak ada tagihan"}
            </div>
          </div>
        )}

        <div className="history-card">
          <div className="title">Riwayat Pembayaran</div>
          {history.length === 0 ? (
            <div className="empty-text" style={{ padding: "12px 0" }}>Belum ada riwayat pembayaran</div>
          ) : (
            history.map((item) => {
              const cfg = statusConfig[item.status] || statusConfig.lunas
              return (
                <div key={item.id} className="history-item">
                  <div className="left">
                    <div className="bill-name">{item.bill_type_name ? `${item.bill_type_name} ${item.bulan}` : item.bulan}</div>
                    <div className="bill-date">{formatDate(item.tanggal)}</div>
                  </div>
                  <div className="right">
                    <span className={`status ${cfg.className}`}>{cfg.label}</span>
                    <ChevronRight size={16} color="var(--neutral)" />
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="app-footer">© {new Date().getFullYear()} MI Nurul Iman Kabo Jaya</div>
      </main>
    </div>
  )
}
