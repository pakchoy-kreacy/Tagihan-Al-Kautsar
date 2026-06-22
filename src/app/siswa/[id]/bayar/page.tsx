"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSiswaById, formatRupiah, getSiswaByNisn } from "@/lib/db"
import { getBankInfo, submitPayment, uploadBukti } from "@/lib/payments-db"
import type { Siswa } from "@/lib/db"
import type { BankInfo } from "@/lib/payments-db"

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

  useEffect(() => {
    async function init() {
      setLoading(true)
      try {
        const [s, b] = await Promise.all([getSiswaById(id), getBankInfo()])
        if (s) setSiswa(s)
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

    setSubmitting(true)
    try {
      const bukti_url = await uploadBukti(file, id)
      const ok = await submitPayment({
        student_id: id,
        bill_id: siswa?.riwayat.find(r => r.status !== 'lunas')?.bulan || '',
        nama_pengirim: form.nama_pengirim,
        jumlah_transfer: parseInt(form.jumlah_transfer),
        catatan: form.catatan,
        bukti_url,
      })
      if (ok) setSuccess(true)
      else setError("Gagal mengirim! Coba lagi.")
    } catch {
      setError("Gagal upload! Coba lagi.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="phone-frame min-h-[700px]">
        <div className="status-bar"><span>HH:MM</span><span>12:30</span></div>
        <div className="content"><div style={{ textAlign: "center", padding: 40, color: "#9e9e9e" }}>Memuat...</div></div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="phone-frame min-h-[700px]">
        <div className="status-bar"><span>HH:MM</span><span>12:30</span></div>
        <div className="header"><div style={{ fontSize: 18, fontWeight: 700 }}>MI Nurul Iman</div></div>
        <div className="content" style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>?</div>
          <h2 style={{ color: "#1B5E20", marginBottom: 8 }}>Bukti Terkirim!</h2>
          <p style={{ color: "#757575", marginBottom: 24 }}>
            Pembayaran Anda sedang diverifikasi oleh admin.
          </p>
          <button className="btn btn-primary" onClick={() => router.push(`/siswa/${id}`)}>
            Kembali ke Detail
          </button>
        </div>
        <div className="footer">© 2026 MI Nurul Iman Kabo Jaya</div>
      </div>
    )
  }

  return (
    <div className="phone-frame min-h-[700px]">
      <div className="status-bar"><span>HH:MM</span><span>12:30</span></div>
      <div className="header" style={{ padding: "12px 18px" }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>MI Nurul Iman</div>
      </div>

      <div className="content">
        <div className="screen-label">Pembayaran SPP</div>

        <button className="back" onClick={() => router.back()} style={{ marginBottom: 14 }}>? Kembali</button>

        {/* Bank Info */}
        {bank && (
          <div className="card" style={{ background: "#E8F5E9", borderColor: "#A5D6A7" }}>
            <div className="card-title">Transfer ke</div>
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 13, color: "#757575" }}>{bank.bank_name}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#1B5E20", letterSpacing: 2 }}>
                {bank.nomor_rekening}
              </div>
              <div style={{ fontSize: 13, color: "#424242" }}>a.n. {bank.atas_nama}</div>
            </div>
            {bank.qris_url && (
              <div style={{ marginTop: 10, textAlign: "center" }}>
                <img src={bank.qris_url} alt="QRIS" style={{ width: 150, borderRadius: 10 }} />
                <div style={{ fontSize: 11, color: "#757575", marginTop: 4 }}>Scan QRIS</div>
              </div>
            )}
          </div>
        )}

        {/* Student Info */}
        {siswa && (
          <div className="card">
            <div className="card-title">Data Siswa</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{siswa.nama}</div>
            <div style={{ fontSize: 13, color: "#757575" }}>{siswa.nisn} — Kelas {siswa.kelas}</div>
            <div style={{ marginTop: 8, padding: "8px 12px", background: "#FFF8E1", borderRadius: 10 }}>
              <span style={{ fontSize: 12, color: "#F57F17" }}>Tagihan: {siswa.tagihan}</span>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#E65100" }}>
                {formatRupiah(siswa.nominalTagihan)}
              </div>
            </div>
          </div>
        )}

        {/* Upload Form */}
        <div className="card">
          <div className="card-title">Upload Bukti Transfer</div>

          <input className="form-input" placeholder="Nama Pengirim"
            value={form.nama_pengirim}
            onChange={e => setForm(f => ({ ...f, nama_pengirim: e.target.value }))} />

          <input className="form-input" placeholder="Jumlah Transfer" type="number"
            value={form.jumlah_transfer}
            onChange={e => setForm(f => ({ ...f, jumlah_transfer: e.target.value }))} />

          <textarea className="form-input" placeholder="Catatan (opsional)" rows={3}
            value={form.catatan}
            onChange={e => setForm(f => ({ ...f, catatan: e.target.value }))} />

          <div className="form-input" style={{ padding: 8, background: "#fafafa" }}>
            <input type="file" accept="image/*"
              onChange={e => setFile(e.target.files?.[0] || null)} />
            {file && <div style={{ fontSize: 12, color: "#757575", marginTop: 4 }}>{file.name}</div>}
          </div>

          {error && <div style={{ color: "#E53935", fontSize: 13, marginTop: 8 }}>{error}</div>}

          <button className="btn btn-primary" style={{ marginTop: 14 }}
            onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Mengirim..." : "Kirim Bukti Pembayaran"}
          </button>
        </div>

        <div className="footer">© 2026 MI Nurul Iman Kabo Jaya</div>
      </div>
    </div>
  )
}
