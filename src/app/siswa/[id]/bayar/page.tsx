"use client"

import { use, useEffect, useState, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { getSiswaById, formatRupiah, type RiwayatPembayaran } from "@/lib/db"
import { getBankInfo, submitPayment, uploadBukti } from "@/lib/payments-db"
import type { Siswa } from "@/lib/db"
import type { BankInfo } from "@/lib/payments-db"
import { NavBar } from "@/components/NavBar"
import { Check, Upload, X } from "lucide-react"

export default function BayarPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [siswa, setSiswa] = useState<Siswa | null>(null)
  const [bank, setBank] = useState<BankInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    nama_pengirim: "",
    jumlah_transfer: "",
    catatan: "",
  })
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedBill, setSelectedBill] = useState<string>("")

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const unpaidBills = (siswa?.riwayat || []).filter((r: RiwayatPembayaran) => r.status !== "lunas")

  useEffect(() => {
    async function init() {
      setLoading(true)
      try {
        const [s, b] = await Promise.all([getSiswaById(id), getBankInfo()])
        if (s) {
          setSiswa(s)
          const firstUnpaid = s.riwayat.find((r: RiwayatPembayaran) => r.status !== "lunas")
          if (firstUnpaid) {
            setSelectedBill(firstUnpaid.id)
            setForm((f) => ({ ...f, jumlah_transfer: firstUnpaid.nominal.toString() }))
          }
        }
        if (b) setBank(b)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [id])

  async function handleSubmit() {
    setError("")
    if (!file) return setError("Pilih file bukti transfer!")
    if (!form.nama_pengirim) return setError("Isi nama pengirim!")
    if (!form.jumlah_transfer) return setError("Isi jumlah transfer!")
    if (!selectedBill) return setError("Pilih tagihan yang ingin dibayar!")

    setSubmitting(true)
    try {
      const bukti_url = await uploadBukti(file, id)
      const result = await submitPayment({
        student_id: id,
        bill_id: selectedBill,
        nama_pengirim: form.nama_pengirim,
        jumlah_transfer: parseInt(form.jumlah_transfer),
        catatan: form.catatan,
        bukti_url,
      })
      if (result.success) setSuccess(true)
      else setError(result.error || "Gagal mengirim. Coba lagi.")
    } catch {
      setError("Gagal upload. Coba lagi.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="app-shell">
        <NavBar />
        <main className="app-main">
          <div className="loading-text">Memuat...</div>
        </main>
      </div>
    )
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
              <h2 style={{ color: "var(--emerald)", marginBottom: 8 }}>Bukti Terkirim</h2>
              <p style={{ color: "var(--neutral)", marginBottom: 18 }}>
                Pembayaran Anda sedang diverifikasi oleh admin.
              </p>
              <button type="button" className="btn btn-primary" onClick={() => router.push(`/siswa/${id}`)}>
                Kembali ke Detail
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
              <button type="button" className="back" onClick={() => router.back()}>Kembali</button>
              <span className="badge badge-lunas">Pembayaran</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)", marginTop: 12, fontFamily: "var(--font-heading)" }}>Pembayaran SPP</div>
            <div style={{ color: "var(--neutral)", fontSize: 14, marginTop: 4 }}>
              Transfer ke rekening atau scan QRIS, lalu upload bukti.
            </div>
          </section>

          <div className="app-grid-2">
            <div style={{ display: "grid", gap: 14 }}>
              {bank && (
                <div className="card" style={{ background: "var(--emerald-soft)", borderColor: "#a5c9b5" }}>
                  <div className="card-title">Transfer ke</div>
                  <div style={{ marginTop: 4 }}>
                    <div style={{ fontSize: 13, color: "var(--neutral)" }}>{bank.bank_name}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "var(--emerald)", letterSpacing: 2, fontVariantNumeric: "tabular-nums" }}>
                      {bank.nomor_rekening}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--ink)" }}>a.n. {bank.atas_nama}</div>
                  </div>
                  {bank.qris_url && (
                    <div style={{ marginTop: 12, textAlign: "center" }}>
                      <Image src={bank.qris_url} alt="QRIS" width={160} height={160} style={{ borderRadius: 10 }} />
                      <div style={{ fontSize: 12, color: "var(--neutral)", marginTop: 4 }}>Scan QRIS</div>
                    </div>
                  )}
                </div>
              )}

              {siswa && (
                <div className="card">
                  <div className="card-title">Data Siswa</div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{siswa.nama}</div>
                  <div style={{ fontSize: 13, color: "var(--neutral)", marginTop: 2 }}>NISN {siswa.nisn} | Kelas {siswa.kelas}</div>
                  <div style={{ marginTop: 10, padding: "10px 14px", background: "var(--gold-soft)", borderRadius: 10 }}>
                    <span style={{ fontSize: 12, color: "var(--gold)" }}>Tagihan: {siswa.tagihan}</span>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#a87a20", fontVariantNumeric: "tabular-nums" }}>
                      {formatRupiah(siswa.nominalTagihan)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-title">Upload Bukti Transfer</div>

              {unpaidBills.length > 1 && (
                <select
                  className="form-input"
                  value={selectedBill}
                  onChange={(e) => {
                    setSelectedBill(e.target.value)
                    const bill = unpaidBills.find((b) => b.id === e.target.value)
                    if (bill) setForm((f) => ({ ...f, jumlah_transfer: bill.nominal.toString() }))
                  }}
                  style={{ marginBottom: 10 }}
                >
                  {unpaidBills.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bulan} — {formatRupiah(b.nominal)}
                    </option>
                  ))}
                </select>
              )}

              <input
                className="form-input"
                placeholder="Nama Pengirim"
                value={form.nama_pengirim}
                onChange={(e) => setForm((f) => ({ ...f, nama_pengirim: e.target.value }))}
              />

              <input
                className="form-input"
                placeholder="Jumlah Transfer"
                type="number"
                value={form.jumlah_transfer}
                onChange={(e) => setForm((f) => ({ ...f, jumlah_transfer: e.target.value }))}
              />

              <textarea
                className="form-input"
                placeholder="Catatan (opsional)"
                rows={3}
                value={form.catatan}
                onChange={(e) => setForm((f) => ({ ...f, catatan: e.target.value }))}
              />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const selected = e.target.files?.[0] || null
                  setFile(selected)
                  if (fileInputRef.current) fileInputRef.current.value = ""
                }}
              />

              {!file ? (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ height: "auto", padding: "12px 16px", flexDirection: "column", gap: 4 }}
                >
                  <Upload size={20} style={{ color: "var(--emerald)" }} />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>Ketuk untuk pilih gambar</span>
                  <span style={{ fontSize: 11, color: "var(--neutral)", fontWeight: 400 }}>JPG, PNG</span>
                </button>
              ) : (
                <div style={{
                  border: "2px dashed var(--emerald)",
                  borderRadius: 12,
                  padding: 12,
                  background: "var(--emerald-soft)",
                  textAlign: "center",
                }}>
                  {previewUrl && (
                    <div style={{
                      position: "relative",
                      width: "100%",
                      maxWidth: 200,
                      aspectRatio: "1/1",
                      margin: "0 auto 10px",
                      borderRadius: 10,
                      overflow: "hidden",
                      background: "white",
                    }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewUrl} alt="Preview bukti" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: "var(--neutral)", marginBottom: 10, wordBreak: "break-all" }}>{file.name}</div>
                  <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        fontSize: 13,
                        color: "var(--emerald)",
                        fontWeight: 600,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px 8px",
                      }}
                    >
                      Ubah
                    </button>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      style={{
                        fontSize: 13,
                        color: "var(--terracotta)",
                        fontWeight: 600,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px 8px",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <X size={14} />
                      Hapus
                    </button>
                  </div>
                </div>
              )}

              {error && <div style={{ color: "var(--terracotta)", fontSize: 13, marginTop: 8 }}>{error}</div>}

              <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={handleSubmit} disabled={submitting || !file}>
                {submitting ? "Mengirim..." : "Kirim Bukti Pembayaran"}
              </button>
            </div>
          </div>

          <div className="app-footer">© {new Date().getFullYear()} MI Nurul Iman Kabo Jaya</div>
        </div>
      </main>
    </div>
  )
}
