"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { getBankInfoByType, submitDonasi, uploadBuktiInfaq } from "@/lib/infaq-db"
import type { BankInfoSettings } from "@/lib/infaq-db"
import { NavBar } from "@/components/NavBar"
import { useToast } from "@/components/Toast"
import { Check, Download, Copy } from "lucide-react"

export default function InfaqPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [bank, setBank] = useState<BankInfoSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [nama, setNama] = useState("")
  const [nominal, setNominal] = useState("")
  const [pesan, setPesan] = useState("")
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    getBankInfoByType("infaq").then((b) => {
      setBank(b)
      setLoading(false)
    })
  }, [])

  async function handleSubmit() {
    setError("")
    if (!nama) return setError("Isi nama donatur!")
    if (!nominal) return setError("Isi nominal infaq!")
    if (!file) return setError("Pilih file bukti transfer!")

    setSubmitting(true)
    try {
      const bukti_url = await uploadBuktiInfaq(file, "infaq")
      const ok = await submitDonasi({ nama_donatur: nama, nominal: parseInt(nominal), pesan, bukti_url })
      if (ok) setSuccess(true)
      else setError("Gagal mengirim!")
    } catch {
      setError("Gagal upload!")
    } finally {
      setSubmitting(false)
    }
  }

  async function copyRekening(no: string) {
    try {
      await navigator.clipboard.writeText(no)
      showToast("Nomor rekening disalin!", "success")
    } catch {
      showToast("Gagal menyalin nomor rekening", "error")
    }
  }

  async function downloadQris(url: string) {
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = blobUrl
      a.download = "qris-infaq.png"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
      showToast("QRIS berhasil diunduh!", "success")
    } catch {
      showToast("Gagal mengunduh QRIS", "error")
    }
  }

  if (success) {
    return (
      <div className="app-shell">
        <NavBar />
        <main className="app-main">
          <div className="app-grid">
            <section className="card" style={{ textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
              <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>
                <Check size={48} color="var(--emerald)" />
              </div>
              <h2 style={{ color: "var(--emerald)", marginBottom: 8 }}>Jazakumullah Khairan!</h2>
              <p style={{ color: "var(--neutral)", marginBottom: 24 }}>Infaq Anda telah kami terima.</p>
              <button type="button" className="btn btn-primary" onClick={() => router.push("/")}>
                Kembali ke Beranda
              </button>
            </section>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <NavBar />
      <main className="app-main">
        <div className="app-grid">
          <section className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <button type="button" className="back" onClick={() => router.push("/")}>Kembali</button>
              <span className="badge badge-lunas">Infaq</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--emerald)", marginTop: 12, fontFamily: "var(--font-heading)" }}>Infaq Sekolah</div>
            <div style={{ color: "var(--neutral)", fontSize: 14, marginTop: 4 }}>Berbagi itu indah.</div>
          </section>

          <div className="app-grid-2">
            <div style={{ display: "grid", gap: 14 }}>
              {loading ? (
                <div className="card"><div className="loading-text">Memuat...</div></div>
              ) : bank ? (
                <div className="card" style={{ background: "var(--emerald-soft)", borderColor: "#a5c9b5", textAlign: "center" }}>
                  <div className="card-title" style={{ justifyContent: "center" }}>Rekening Infaq</div>
                  <div style={{ fontSize: 13, color: "var(--neutral)" }}>{bank.bank_name}</div>
                  <div style={{
                    fontSize: "clamp(18px, 5vw, 24px)",
                    fontWeight: 700,
                    color: "var(--emerald)",
                    letterSpacing: 1.5,
                    fontVariantNumeric: "tabular-nums",
                    wordBreak: "break-all",
                    marginTop: 4,
                  }}>
                    {bank.nomor_rekening}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink)", marginTop: 4 }}>a.n. {bank.atas_nama}</div>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={() => copyRekening(bank.nomor_rekening)}
                    style={{ marginTop: 14, width: "100%", maxWidth: 280, marginInline: "auto" }}
                  >
                    <Copy size={16} />
                    Salin Nomor Rekening
                  </button>

                  {bank.qris_url && (
                    <div style={{ marginTop: 18, textAlign: "center" }}>
                      <div style={{
                        position: "relative",
                        width: "100%",
                        maxWidth: 220,
                        aspectRatio: "1/1",
                        margin: "0 auto",
                        borderRadius: 12,
                        overflow: "hidden",
                        background: "white",
                        border: "1px solid #d0e6d8",
                      }}>
                        <Image src={bank.qris_url} alt="QRIS Infaq" fill style={{ objectFit: "contain", padding: 8 }} sizes="220px" />
                      </div>
                      <div style={{ fontSize: 12, color: "var(--neutral)", marginTop: 8 }}>Scan QRIS</div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() => downloadQris(bank.qris_url)}
                        style={{ marginTop: 8, width: "100%", maxWidth: 220, marginInline: "auto" }}
                      >
                        <Download size={16} />
                        Download QRIS
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="card"><p className="empty-text">Info rekening belum tersedia</p></div>
              )}
            </div>

            <div className="card">
              <div className="card-title">Upload Bukti Infaq</div>
              <input className="form-input" placeholder="Nama Donatur" value={nama}
                onChange={(e) => setNama(e.target.value)} />
              <input className="form-input" placeholder="Nominal" type="number" value={nominal}
                onChange={(e) => setNominal(e.target.value)} />
              <textarea className="form-input" placeholder="Pesan (opsional)" rows={3} value={pesan}
                onChange={(e) => setPesan(e.target.value)} />
              <div className="form-input" style={{ padding: 8, background: "#fafafa" }}>
                <input type="file" accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)} />
                {file && <div style={{ fontSize: 12, color: "var(--neutral)", marginTop: 4 }}>{file.name}</div>}
              </div>
              {error && <div style={{ color: "var(--terracotta)", fontSize: 13, marginTop: 8 }}>{error}</div>}
              <button type="button" className="btn btn-primary" style={{ marginTop: 14 }}
                onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Mengirim..." : "Kirim Infaq"}
              </button>
            </div>
          </div>

          <div className="app-footer">© {new Date().getFullYear()} MI Nurul Iman Kabo Jaya</div>
        </div>
      </main>
    </div>
  )
}
