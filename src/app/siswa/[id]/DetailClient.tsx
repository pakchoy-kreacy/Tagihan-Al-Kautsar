"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { formatRupiah, type Siswa } from "@/lib/db"
import { ArrowLeft, Home, User, Wallet, ChevronRight } from "lucide-react"

interface DetailClientProps {
  siswa: Siswa
  id: string
}

export function DetailClient({ siswa, id }: DetailClientProps) {
  const router = useRouter()

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

  const activeBill = siswa.riwayat.find((r) => r.status !== "lunas")
  const history = siswa.riwayat.filter((r) => r.status === "lunas")
  const activeStatus = activeBill ? statusConfig[activeBill.status] : null

  return (
    <div className="app-shell">
      <header className="public-header">
        <button onClick={() => router.back()}><ArrowLeft size={22} /></button>
        <span className="public-header-title">Detail Tagihan</span>
        <Link href="/"><Home size={20} /></Link>
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

        <div className="bill-card">
          <div className="bill-card-header">
            <div className="bill-card-title">Tagihan Aktif</div>
            {activeStatus && <span className={`bill-status-badge ${activeStatus.className}`}>{activeStatus.label}</span>}
          </div>

          <div className="bill-card-title" style={{ marginBottom: 12 }}>{siswa.tagihan}</div>

          {activeBill?.batas_waktu && (
            <div className="bill-row">
              <span className="label">Jatuh Tempo</span>
              <span className="value">{deadlineText(activeBill)}</span>
            </div>
          )}

          <div className="bill-row" style={{ marginTop: 4 }}>
            <span className="label">Jumlah</span>
            <span className="value amount">{formatRupiah(siswa.nominalTagihan)}</span>
          </div>

          {siswa.status !== "lunas" && siswa.status !== "tidak_ada_tagihan" && (
            <button type="button" className="bill-btn" onClick={() => router.push(`/siswa/${id}/bayar`)}>
              <Wallet size={18} />
              Bayar Sekarang
            </button>
          )}
        </div>

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
