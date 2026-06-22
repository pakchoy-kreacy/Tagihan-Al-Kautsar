"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getBankInfoByType, submitDonasi, uploadBuktiInfaq } from "@/lib/infaq-db"
import type { BankInfoSettings } from "@/lib/infaq-db"

export default function InfaqPage() {
  const router = useRouter()
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
    getBankInfoByType('infaq').then(b => { setBank(b); setLoading(false) })
  }, [])

  async function handleSubmit() {
    setError("")
    if (!nama) return setError("Isi nama donatur!")
    if (!nominal) return setError("Isi nominal infaq!")
    if (!file) return setError("Pilih file bukti transfer!")

    setSubmitting(true)
    try {
      const bukti_url = await uploadBuktiInfaq(file, 'infaq')
      const ok = await submitDonasi({ nama_donatur: nama, nominal: parseInt(nominal), pesan, bukti_url })
      if (ok) setSuccess(true)
      else setError("Gagal mengirim!")
    } catch {
      setError("Gagal upload!")
    } finally { setSubmitting(false) }
  }

  if (success) {
    return (
      <div className="phone-frame min-h-[700px]">
        <div className="status-bar"><span>?? ????</span><span>?? ?? 12:30</span></div>
        <div className="header"><div style={{ fontSize: 18, fontWeight: 700 }}>?? MI Nurul Iman</div></div>
        <div className="content" style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>??</div>
          <h2 style={{ color: "#1B5E20", marginBottom: 8 }}>Jazakumullah Khairan!</h2>
          <p style={{ color: "#757575", marginBottom: 24 }}>Infaq Anda sedang diverifikasi.</p>
          <button className="btn btn-primary" onClick={() => router.push("/")}>? Kembali ke Beranda</button>
        </div>
        <div className="footer">© 2026 MI Nurul Iman Kabo Jaya</div>
      </div>
    )
  }

  return (
    <div className="phone-frame min-h-[700px]">
      <div className="status-bar"><span>?? ????</span><span>?? ?? 12:30</span></div>
      <div className="header">
        <div className="logo-wrap">
          <div className="logo-circle">??</div>
          <div>
            <div className="logo-text">Infaq</div>
            <div className="logo-sub">MI Nurul Iman Kabo Jaya</div>
          </div>
        </div>
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2, fontStyle: "italic" }}>
          Berbagi itu Indah
        </div>
      </div>

      <div className="content">
        <div className="screen-label">?? Halaman Infaq</div>
        <button className="back" onClick={() => router.push("/")} style={{ marginBottom: 14 }}>? Beranda</button>

        {loading ? (
          <div className="loading-text">Memuat...</div>
        ) : bank ? (
          <div className="card" style={{ background: "#E8F5E9", borderColor: "#A5D6A7" }}>
            <div className="card-title">?? Rekening Infaq</div>
            <div style={{ fontSize: 13, color: "#757575" }}>{bank.bank_name}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1B5E20", letterSpacing: 2 }}>
              {bank.nomor_rekening}
            </div>
            <div style={{ fontSize: 13, color: "#424242" }}>a.n. {bank.atas_nama}</div>
            {bank.qris_url && (
              <div style={{ marginTop: 10, textAlign: "center" }}>
                <img src={bank.qris_url} alt="QRIS Infaq" style={{ width: 150, borderRadius: 10 }} />
              </div>
            )}
          </div>
        ) : (
          <div className="card"><p className="empty-text">Info rekening belum tersedia</p></div>
        )}

        <div className="card">
          <div className="card-title">?? Upload Bukti Infaq</div>
          <input className="form-input" placeholder="Nama Donatur" value={nama}
            onChange={e => setNama(e.target.value)} />
          <input className="form-input" placeholder="Nominal" type="number" value={nominal}
            onChange={e => setNominal(e.target.value)} />
          <textarea className="form-input" placeholder="Pesan (opsional)" rows={3} value={pesan}
            onChange={e => setPesan(e.target.value)} />
          <div className="form-input" style={{ padding: 8, background: "#fafafa" }}>
            <input type="file" accept="image/*"
              onChange={e => setFile(e.target.files?.[0] || null)} />
            {file && <div style={{ fontSize: 12, color: "#757575", marginTop: 4 }}>{file.name}</div>}
          </div>
          {error && <div style={{ color: "#E53935", fontSize: 13, marginTop: 8 }}>{error}</div>}
          <button className="btn btn-primary" style={{ marginTop: 14 }}
            onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Mengirim..." : "?? Kirim Infaq"}
          </button>
        </div>

        <div className="footer">© 2026 MI Nurul Iman Kabo Jaya</div>
      </div>
    </div>
  )
}
