"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSiswaById, formatRupiah } from "@/lib/db"
import { getBankInfo, submitPayment, uploadBukti } from "@/lib/payments-db"
import type { Siswa } from "@/lib/db"
import type { BankInfo } from "@/lib/payments-db"
import { NavBar } from "@/components/NavBar"

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
      const activeBill = siswa?.riwayat.find((r) => r.status !== "lunas")
      const ok = await submitPayment({
        student_id: id,
        bill_id: activeBill?.id || "",
        nama_pengirim: form.nama_pengirim,
        jumlah_transfer: parseInt(form.jumlah_transfer),
        catatan: form.catatan,
        bukti_url,
      })
      if (ok) setSuccess(true)
      else setError("Gagal mengirim. Coba lagi.")
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
              <div style={{ fontSize: 48, marginBottom: 12, color: "#1B5E20", fontWeight: 700 }}>OK</div>
              <h2 style={{ color: "#1B5E20", marginBottom: 8 }}>Bukti Terkirim</h2>
              <p style={{ color: "#5f6f63", marginBottom: 18 }}>
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
            <div style={{ fontSize: 20, fontWeight: 700, color: "#173b1a", marginTop: 12 }}>Pembayaran SPP</div>
            <div style={{ color: "#5f6f63", fontSize: 14, marginTop: 4 }}>
              Transfer ke rekening atau scan QRIS, lalu upload bukti.
            </div>
          </section>

          <div className="app-grid-2">
            <div style={{ display: "grid", gap: 14 }}>
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
                    <div style={{ marginTop: 12, textAlign: "center" }}>
                      <img src={bank.qris_url} alt="QRIS" style={{ width: 160, borderRadius: 10 }} />
                      <div style={{ fontSize: 12, color: "#757575", marginTop: 4 }}>Scan QRIS</div>
                    </div>
                  )}
                </div>
              )}

              {siswa && (
                <div className="card">
                  <div className="card-title">Data Siswa</div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{siswa.nama}</div>
                  <div style={{ fontSize: 13, color: "#757575", marginTop: 2 }}>NISN {siswa.nisn} | Kelas {siswa.kelas}</div>
                  <div style={{ marginTop: 10, padding: "10px 14px", background: "#FFF8E1", borderRadius: 10 }}>
                    <span style={{ fontSize: 12, color: "#F57F17" }}>Tagihan: {siswa.tagihan}</span>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#E65100" }}>
                      {formatRupiah(siswa.nominalTagihan)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-title">Upload Bukti Transfer</div>

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

              <div className="form-input" style={{ padding: 8, background: "#fafafa" }}>
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                {file && <div style={{ fontSize: 12, color: "#757575", marginTop: 4 }}>{file.name}</div>}
              </div>

              {error && <div style={{ color: "#E53935", fontSize: 13, marginTop: 8 }}>{error}</div>}

              <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Mengirim..." : "Kirim Bukti Pembayaran"}
              </button>
            </div>
          </div>

          <div className="app-footer">© 2026 MI Nurul Iman Kabo Jaya</div>
        </div>
      </main>
    </div>
  )
}
