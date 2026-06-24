"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getSiswaById, formatRupiah, type RiwayatPembayaran } from "@/lib/db"
import type { Siswa } from "@/lib/db"
import { ArrowLeft, Home, User, Wallet, ChevronRight } from "lucide-react"

export default function DetailSiswaPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [siswa, setSiswa] = useState<Siswa | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function fetchStudent() {
      setLoading(true)
      try {
        const student = await getSiswaById(id)
        if (student) {
          setSiswa(student)
        } else {
          setNotFound(true)
        }
      } catch (error) {
        console.error("Failed to fetch student:", error)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    fetchStudent()
  }, [id])

  function formatDate(tgl: string) {
    if (!tgl || tgl === "Belum dibayar") return tgl
    try {
      return new Date(tgl).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    } catch {
      return tgl
    }
  }

  function deadlineText(item: RiwayatPembayaran) {
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

  if (loading) {
    return (
      <div className="app-shell">
        <header className="public-header">
          <button onClick={() => router.back()}><ArrowLeft size={22} /></button>
          <span className="public-header-title">Detail Tagihan</span>
          <Link href="/"><Home size={20} /></Link>
        </header>
        <main className="public-page">
          <div className="loading-text" style={{ padding: 40, textAlign: "center" }}>Memuat...</div>
        </main>
      </div>
    )
  }

  if (notFound || !siswa) {
    return (
      <div className="app-shell">
        <header className="public-header">
          <button onClick={() => router.back()}><ArrowLeft size={22} /></button>
          <span className="public-header-title">Detail Tagihan</span>
          <Link href="/"><Home size={20} /></Link>
        </header>
        <main className="public-page">
          <div className="card" style={{ textAlign: "center", padding: 32, marginTop: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", fontFamily: "var(--font-heading)" }}>Siswa tidak ditemukan</div>
            <div className="empty-text" style={{ paddingTop: 8 }}>
              Data siswa yang dicari tidak ada atau sudah dihapus.
            </div>
            <button type="button" className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => router.back()}>
              Kembali
            </button>
          </div>
        </main>
      </div>
    )
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
        {/* Profile Card */}
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

        {/* Active Bill */}
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

        {/* Payment History */}
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
