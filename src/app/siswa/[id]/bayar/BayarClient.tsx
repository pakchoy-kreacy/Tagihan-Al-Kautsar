"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { formatRupiah, type Siswa } from "@/lib/db"
import { submitPayment, uploadBukti } from "@/lib/payments-db"
import type { BankInfoSettings } from "@/lib/infaq-db"
import { useToast } from "@/components/Toast"
import { ArrowLeft, Home, Banknote, QrCode, Copy, Upload, X, Check } from "lucide-react"
import { ContactAduan } from "@/components/ContactAduan"
import { Footer } from "@/components/Footer"
import { useFilePreview } from "@/hooks/useFilePreview"

interface BayarClientProps {
  siswa: Siswa
  bank: BankInfoSettings | null
  id: string
}

export function BayarClient({ siswa, bank, id }: BayarClientProps) {
  const { showToast } = useToast()

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const [method, setMethod] = useState<"transfer" | "qris">("transfer")

const unpaidBills = (siswa.riwayat.filter((r) => r.status !== "lunas") || []).sort((a, b) => {
  const MONTH_ORDER: Record<string, number> = { Januari: 1, Februari: 2, Maret: 3, April: 4, Mei: 5, Juni: 6, Juli: 7, Agustus: 8, September: 9, Oktober: 10, November: 11, Desember: 12 }
  const ay = parseInt(a.tahun) || 0, by = parseInt(b.tahun) || 0
  if (ay !== by) return ay - by
  return (MONTH_ORDER[a.bulan] || 0) - (MONTH_ORDER[b.bulan] || 0)
})
  const firstUnpaid = unpaidBills[0]
  const [selectedBill, setSelectedBill] = useState<string>(firstUnpaid?.id || "")

  const [form, setForm] = useState({
    nama_pengirim: "",
    jumlah_transfer: firstUnpaid ? String(Math.max(0, firstUnpaid.nominal - (firstUnpaid.total_paid || 0))) : "",
    catatan: "",
  })

  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const submittingRef = useRef(false)
  const previewUrl = useFilePreview(file)

  function validateFile(f: File): string | null {
    const maxSize = 5 * 1024 * 1024
    if (f.size > maxSize) return "File terlalu besar! Maksimal 5 MB."
    const allowed = ['image/jpeg', 'image/png', 'image/jpg']
    if (!allowed.includes(f.type)) return "Hanya file JPG/PNG yang diperbolehkan."
    return null
  }

async function handleSubmit() {
    if (submittingRef.current) return
    setError("")
    if (!file) return setError("Pilih file bukti transfer!")
    const fileErr = validateFile(file)
    if (fileErr) return setError(fileErr)
    if (!form.nama_pengirim) return setError("Isi nama pengirim!")
    if (!form.jumlah_transfer) return setError("Isi jumlah transfer!")
    const selectedBillData = unpaidBills.find((bill) => bill.id === selectedBill) || unpaidBills[0]
    if (!selectedBillData) return setError("Pilih tagihan yang ingin dibayar!")
    if (!unpaidBills.some((bill) => bill.id === selectedBillData.id)) {
      return setError("Tagihan sudah berubah. Pilih tagihan aktif kembali.")
    }
    if ((selectedBillData.payment_count || 0) >= 5) {
      return setError("Maksimal 5 kali cicilan per tagihan.")
    }
    const sisa = selectedBillData.nominal - (selectedBillData.total_paid || 0)
    if (parseInt(form.jumlah_transfer) > sisa) {
      return setError(`Jumlah transfer melebihi sisa tagihan (${formatRupiah(sisa)}).`)
    }

    submittingRef.current = true
    setSubmitting(true)
    try {
      const bukti_url = await uploadBukti(file, id)
      const result = await submitPayment({
        student_id: id,
        bill_id: selectedBillData.id,
        nama_pengirim: form.nama_pengirim,
        jumlah_transfer: parseInt(form.jumlah_transfer),
        catatan: form.catatan,
        bukti_url,
      })
      if (result.success) setSuccess(true)
      else setError(result.error || "Gagal mengirim. Coba lagi.")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal upload. Coba lagi.")
    } finally {
      submittingRef.current = false
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
      if (!res.ok) throw new Error(`Download gagal (${res.status})`)
      const blob = await res.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = blobUrl
      a.download = "qris-pembayaran.png"
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 0)
      showToast("QRIS berhasil di-download!", "success")
    } catch {
      showToast("Gagal download QRIS", "error")
    }
  }

  if (success) {
    return (
      <div className="app-shell">
        <header className="public-header">
          <button onClick={() => window.history.back()}><ArrowLeft size={22} /></button>
          <span className="public-header-title">Pembayaran</span>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" style={{ color: "inherit", display: "flex" }}><Home size={20} /></a>
        </header>
        <main className="public-page">
          <div className="card" style={{ textAlign: "center", padding: 32, marginTop: 20 }}>
            <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>
              <Check size={48} color="var(--emerald)" />
            </div>
            <h2 style={{ color: "var(--emerald)", marginBottom: 8 }}>Bukti Terkirim</h2>
            <p style={{ color: "var(--neutral)", marginBottom: 18 }}>
              Pembayaran Anda sedang diverifikasi oleh admin.
            </p>
            <a href={`/siswa/${id}`} className="btn btn-primary" style={{ textDecoration: "none" }}>
              Kembali ke Detail
            </a>
          </div>
        </main>
      </div>
    )
  }

const selectedBillData = unpaidBills.find((b) => b.id === selectedBill) || unpaidBills[0]
  const effectiveSelectedBill = selectedBillData?.id || ""
  const billName = selectedBillData
    ? (selectedBillData.bill_type_name || selectedBillData.bulan)
    : siswa.tagihan || "-"
  const billAmount = selectedBillData ? selectedBillData.nominal : siswa.nominalTagihan || 0
  const billTotalPaid = selectedBillData?.total_paid || 0
  const billSisa = Math.max(0, billAmount - billTotalPaid)
  const billPaymentCount = selectedBillData?.payment_count || 0
  const maxUploadReached = billPaymentCount >= 5

  return (
    <div className="app-shell">
      <header className="public-header">
        <button onClick={() => window.history.back()}><ArrowLeft size={22} /></button>
        <span className="public-header-title">Pembayaran</span>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/" style={{ color: "inherit", display: "flex" }}><Home size={20} /></a>
      </header>

      <main className="public-page with-bottom-btn">
        <div className="payment-summary">
          <div className="left">
            <div className="name">{siswa.nama}</div>
            <div className="desc">{billName}</div>
          </div>
          <div className="amount" style={{ textAlign: "right" }}>
            <div>{formatRupiah(billAmount)}</div>
            {billTotalPaid > 0 && (
              <div style={{ fontSize: 12, color: "var(--neutral)", marginTop: 2 }}>
                Terbayar: {formatRupiah(billTotalPaid)}
              </div>
            )}
            <div style={{ fontSize: 12, color: "var(--emerald)", fontWeight: 600, marginTop: 2 }}>
              Sisa: {formatRupiah(billSisa)}
            </div>
            {billPaymentCount > 0 && (
              <div style={{ fontSize: 11, color: "var(--neutral)", marginTop: 2 }}>
                Upload ke-{billPaymentCount} dari 5
              </div>
            )}
          </div>
        </div>

        {unpaidBills.length > 1 && (
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-title">Pilih Tagihan</div>
            <select
              className="form-input"
              value={effectiveSelectedBill}
              onChange={(e) => {
                setSelectedBill(e.target.value)
                const bill = unpaidBills.find((b) => b.id === e.target.value)
                if (bill) {
                  const sisa = bill.nominal - (bill.total_paid || 0)
                  setForm((f) => ({ ...f, jumlah_transfer: String(Math.max(0, sisa)) }))
                }
              }}
              style={{ marginBottom: 0 }}
            >
              {unpaidBills.map((b) => {
                const sisa = b.nominal - (b.total_paid || 0)
                const countInfo = b.payment_count ? ` (${b.payment_count}/5)` : ""
                return (
                  <option key={b.id} value={b.id}>
                    {b.bill_type_name || b.bulan} — {formatRupiah(b.nominal)} | Sisa {formatRupiah(sisa)}{countInfo}
                  </option>
                )
              })}
            </select>
          </div>
        )}

        <div className="method-title">Pilih Metode Pembayaran</div>

        <div className={`method-option ${method === "transfer" ? "active" : ""}`} onClick={() => setMethod("transfer")}>
          <div className="icon"><Banknote size={22} /></div>
          <div className="text">
            <p className="title">Transfer Bank</p>
            <p className="subtitle">Bayar melalui transfer ke rekening sekolah</p>
          </div>
          <div className="radio" />
        </div>

        <div className={`method-option ${method === "qris" ? "active" : ""}`} onClick={() => setMethod("qris")}>
          <div className="icon"><QrCode size={22} /></div>
          <div className="text">
            <p className="title">QRIS</p>
            <p className="subtitle">Bayar dengan scan QRIS</p>
          </div>
          <div className="radio" />
        </div>

        {method === "transfer" && bank && (
          <div className="account-info">
            <div className="title">Informasi Rekening</div>
            <div className="account-row">
              <span className="label">Bank</span>
              <span className="value">{bank.bank_name}</span>
            </div>
            <div className="account-row">
              <span className="label">Nomor Rekening</span>
              <span className="value rekening">{bank.nomor_rekening}</span>
            </div>
            <div className="account-row">
              <span className="label">Atas Nama</span>
              <span className="value">{bank.atas_nama}</span>
            </div>
            <button type="button" className="copy-btn" onClick={() => copyRekening(bank.nomor_rekening)}>
              <Copy size={16} />
              Salin Nomor Rekening
            </button>
          </div>
        )}

        {method === "transfer" && !bank && (
          <div className="card" style={{ marginTop: 14 }}><p className="empty-text">Info rekening belum tersedia</p></div>
        )}

        {method === "qris" && bank?.qris_url && (
          <div className="qris-box">
            <Image src={bank.qris_url} alt="QRIS Pembayaran" width={220} height={220} style={{ objectFit: "contain" }} />
            <button type="button" className="copy-btn" onClick={() => downloadQris(bank.qris_url!)}>
              Download QRIS
            </button>
          </div>
        )}

        {method === "qris" && !bank?.qris_url && (
          <div className="card" style={{ marginTop: 14 }}><p className="empty-text">QRIS belum tersedia</p></div>
        )}

        <div className="card" style={{ marginTop: 14, marginBottom: 20 }}>
          <div className="card-title">Konfirmasi Pembayaran</div>
          <input className="form-input" placeholder="Nama Pengirim" value={form.nama_pengirim}
            onChange={(e) => setForm((f) => ({ ...f, nama_pengirim: e.target.value }))} />
          <input className="form-input" placeholder="Jumlah Transfer" type="number" value={form.jumlah_transfer}
            onChange={(e) => setForm((f) => ({ ...f, jumlah_transfer: e.target.value }))} />
          <textarea className="form-input" placeholder="Catatan (opsional)" rows={3} value={form.catatan}
            onChange={(e) => setForm((f) => ({ ...f, catatan: e.target.value }))} />

          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" style={{ display: "none" }}
            onChange={(e) => { const s = e.target.files?.[0] || null; setFile(s); if (fileInputRef.current) fileInputRef.current.value = "" }} />

          {!file ? (
            <button type="button" className="btn btn-outline" onClick={() => fileInputRef.current?.click()}
              style={{ height: "auto", padding: "12px 16px", flexDirection: "column", gap: 4 }}>
              <Upload size={20} style={{ color: "var(--emerald)" }} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>Ketuk untuk pilih gambar</span>
              <span style={{ fontSize: 11, color: "var(--neutral)", fontWeight: 400 }}>JPG, PNG</span>
            </button>
          ) : (
            <div style={{ border: "2px dashed var(--emerald)", borderRadius: 12, padding: 12, background: "var(--emerald-soft)", textAlign: "center" }}>
              {previewUrl && (
                <div style={{ position: "relative", width: "100%", maxWidth: 200, aspectRatio: "1/1", margin: "0 auto 10px", borderRadius: 10, overflow: "hidden", background: "white" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Preview bukti" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              <div style={{ fontSize: 12, color: "var(--neutral)", marginBottom: 10, wordBreak: "break-all" }}>{file.name}</div>
              <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8 }}>
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  style={{ fontSize: 13, color: "var(--emerald)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: "4px 8px" }}>
                  Ubah
                </button>
                <button type="button" onClick={() => setFile(null)}
                  style={{ fontSize: 13, color: "var(--terracotta)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: "4px 8px", display: "flex", alignItems: "center", gap: 4 }}>
                  <X size={14} /> Hapus
                </button>
              </div>
            </div>
          )}

          {error && <div style={{ color: "var(--terracotta)", fontSize: 13, marginTop: 8 }}>{error}</div>}
        </div>

        <ContactAduan />

        <Footer />
      </main>

      <div className="bottom-btn">
        <button onClick={handleSubmit} disabled={submitting || !file || maxUploadReached}>
          {submitting ? "Mengirim..." : maxUploadReached ? "Maksimal 5 Cicilan" : "Konfirmasi & Upload Bukti"}
        </button>
      </div>
    </div>
  )
}
