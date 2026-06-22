"use client"

import { useState, useEffect } from "react"
import { getSchoolSettings, updateSchoolSettings, getBankInfoByType, updateBankInfo, uploadBuktiInfaq } from "@/lib/infaq-db"
import type { SchoolSettings, BankInfoSettings } from "@/lib/infaq-db"
import { useToast } from "@/components/Toast"

type Tab = "sekolah" | "pembayaran" | "infaq"

export default function AdminPengaturanPage() {
  const { showToast } = useToast()
  const [tab, setTab] = useState<Tab>("sekolah")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // School settings
  const [sekolah, setSekolah] = useState<SchoolSettings | null>(null)

  // Bank Payment
  const [bankPayment, setBankPayment] = useState<BankInfoSettings | null>(null)

  // Bank Infaq
  const [bankInfaq, setBankInfaq] = useState<BankInfoSettings | null>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const [s, bp, bi] = await Promise.all([
      getSchoolSettings(), getBankInfoByType('payment'), getBankInfoByType('infaq')
    ])
    setSekolah(s)
    setBankPayment(bp)
    setBankInfaq(bi)
    setLoading(false)
  }

  async function saveSekolah() {
    if (!sekolah) return
    setSaving(true)
    const ok = await updateSchoolSettings({ id: sekolah.id, nama_sekolah: sekolah.nama_sekolah, logo_url: sekolah.logo_url, nomor_wa: sekolah.nomor_wa })
    setSaving(false); showToast(ok ? "Tersimpan!" : "Gagal!", ok ? "success" : "error")
  }

  async function saveBank(item: BankInfoSettings, type: string) {
    setSaving(true)
    const ok = await updateBankInfo(item.id, { bank_name: item.bank_name, nomor_rekening: item.nomor_rekening, atas_nama: item.atas_nama, qris_url: item.qris_url })
    setSaving(false); showToast(ok ? `${type} tersimpan!` : "Gagal!", ok ? "success" : "error")
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file || !sekolah) return
    setSaving(true)
    try {
      const url = await uploadBuktiInfaq(file, 'logo')
      setSekolah({ ...sekolah, logo_url: url })
      showToast("Logo terupload! Klik simpan.")
    } catch { showToast("Gagal upload logo!", "error") }
    finally { setSaving(false) }
  }

  async function handleQrisUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'payment' | 'infaq') {
    const file = e.target.files?.[0]; if (!file) return
    setSaving(true)
    try {
      const url = await uploadBuktiInfaq(file, `qris_${type}`)
      if (type === 'payment' && bankPayment) setBankPayment({ ...bankPayment, qris_url: url })
      if (type === 'infaq' && bankInfaq) setBankInfaq({ ...bankInfaq, qris_url: url })
      showToast("QRIS terupload! Klik simpan.")
    } catch { showToast("Gagal upload QRIS!", "error") }
    finally { setSaving(false) }
  }

  if (loading) return <div className="admin-page"><div className="loading-text">Memuat...</div></div>

  const tabs: { key: Tab; label: string }[] = [
    { key: "sekolah", label: "Sekolah" },
    { key: "pembayaran", label: "Pembayaran" },
    { key: "infaq", label: "Infaq" },
  ]

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Pengaturan</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.key} className={`admin-btn ${tab === t.key ? "" : "admin-btn-outline"}`}
            onClick={() => setTab(t.key)} style={{ fontSize: 13, padding: "8px 18px" }}>{t.label}</button>
        ))}
      </div>

      {tab === "sekolah" && sekolah && (
        <div className="admin-card">
          <h3 style={{ marginBottom: 14 }}>Data Sekolah</h3>
          <label style={{ fontSize: 12, color: "#757575", display: "block", marginBottom: 4 }}>Nama Sekolah</label>
          <input className="admin-input" value={sekolah.nama_sekolah}
            onChange={e => setSekolah({ ...sekolah, nama_sekolah: e.target.value })} />

          <label style={{ fontSize: 12, color: "#757575", display: "block", marginBottom: 4 }}>Logo</label>
          {sekolah.logo_url && <img src={sekolah.logo_url} alt="logo" style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover", marginBottom: 8 }} />}
          <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ marginBottom: 10, fontSize: 13 }} />

          <label style={{ fontSize: 12, color: "#757575", display: "block", marginBottom: 4 }}>Nomor WhatsApp</label>
          <input className="admin-input" placeholder="08123456789" value={sekolah.nomor_wa}
            onChange={e => setSekolah({ ...sekolah, nomor_wa: e.target.value })} />

          <button className="admin-btn" onClick={saveSekolah} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
        </div>
      )}

      {tab === "pembayaran" && bankPayment && (
        <div className="admin-card">
          <h3 style={{ marginBottom: 14 }}>Rekening Pembayaran SPP</h3>
          <input className="admin-input" placeholder="Nama Bank" value={bankPayment.bank_name}
            onChange={e => setBankPayment({ ...bankPayment, bank_name: e.target.value })} />
          <input className="admin-input" placeholder="Nomor Rekening" value={bankPayment.nomor_rekening}
            onChange={e => setBankPayment({ ...bankPayment, nomor_rekening: e.target.value })} />
          <input className="admin-input" placeholder="Atas Nama" value={bankPayment.atas_nama}
            onChange={e => setBankPayment({ ...bankPayment, atas_nama: e.target.value })} />
          <label style={{ fontSize: 12, color: "#757575", display: "block", marginBottom: 4 }}>QRIS</label>
          {bankPayment.qris_url && <img src={bankPayment.qris_url} alt="QRIS" style={{ width: 120, borderRadius: 10, marginBottom: 8 }} />}
          <input type="file" accept="image/*" onChange={e => handleQrisUpload(e, 'payment')} style={{ marginBottom: 10, fontSize: 13 }} />
          <button className="admin-btn" onClick={() => saveBank(bankPayment, "Pembayaran")} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
        </div>
      )}

      {tab === "infaq" && bankInfaq && (
        <div className="admin-card">
          <h3 style={{ marginBottom: 14 }}>Rekening Infaq</h3>
          <input className="admin-input" placeholder="Nama Bank" value={bankInfaq.bank_name}
            onChange={e => setBankInfaq({ ...bankInfaq, bank_name: e.target.value })} />
          <input className="admin-input" placeholder="Nomor Rekening" value={bankInfaq.nomor_rekening}
            onChange={e => setBankInfaq({ ...bankInfaq, nomor_rekening: e.target.value })} />
          <input className="admin-input" placeholder="Atas Nama" value={bankInfaq.atas_nama}
            onChange={e => setBankInfaq({ ...bankInfaq, atas_nama: e.target.value })} />
          <label style={{ fontSize: 12, color: "#757575", display: "block", marginBottom: 4 }}>QRIS Infaq</label>
          {bankInfaq.qris_url && <img src={bankInfaq.qris_url} alt="QRIS Infaq" style={{ width: 120, borderRadius: 10, marginBottom: 8 }} />}
          <input type="file" accept="image/*" onChange={e => handleQrisUpload(e, 'infaq')} style={{ marginBottom: 10, fontSize: 13 }} />
          <button className="admin-btn" onClick={() => saveBank(bankInfaq, "Infaq")} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
        </div>
      )}
    </div>
  )
}
