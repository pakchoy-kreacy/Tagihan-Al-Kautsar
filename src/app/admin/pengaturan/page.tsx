"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { getSchoolSettings, updateSchoolSettings, getBankInfoByType, updateBankInfo, uploadBuktiInfaq, getAllBillTypes, updateBillType } from "@/lib/infaq-db"
import type { SchoolSettings, BankInfoSettings } from "@/lib/infaq-db"
import type { BillType } from "@/lib/db"
import { useToast } from "@/components/Toast"

type Tab = "sekolah" | "pembayaran" | "infaq" | "tagihan" | "tampilan"

export default function AdminPengaturanPage() {
  const { showToast } = useToast()
  const [tab, setTab] = useState<Tab>("sekolah")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [sekolah, setSekolah] = useState<SchoolSettings | null>(null)
  const [bankPayment, setBankPayment] = useState<BankInfoSettings | null>(null)
  const [bankInfaq, setBankInfaq] = useState<BankInfoSettings | null>(null)
  const [billTypes, setBillTypes] = useState<BillType[]>([])
  const [primaryColor, setPrimaryColor] = useState("#1B5E20")
  const [bannerUrl, setBannerUrl] = useState("")
  const [alamat, setAlamat] = useState("")

  async function loadData() {
    setLoading(true)
    const [s, bp, bi, bt] = await Promise.all([
      getSchoolSettings(), getBankInfoByType('payment'), getBankInfoByType('infaq'), getAllBillTypes()
    ])
    setSekolah(s)
    setBankPayment(bp)
    setBankInfaq(bi)
    setBillTypes(bt)
    if (s) {
      setAlamat(s.nomor_wa || "")
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, []) // eslint-disable-line react-hooks/set-state-in-effect

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

  async function saveTagihan(b: BillType) {
    setSaving(true)
    const ok = await updateBillType(b.id, { default_amount: b.default_amount })
    setSaving(false); showToast(ok ? "Tagihan diperbarui!" : "Gagal!", ok ? "success" : "error")
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

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setSaving(true)
    try {
      const url = await uploadBuktiInfaq(file, 'banner')
      setBannerUrl(url)
      showToast("Banner terupload! Klik simpan.")
    } catch { showToast("Gagal upload banner!", "error") }
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

  async function saveTampilan() {
    localStorage.setItem("app_primary_color", primaryColor)
    if (bannerUrl) localStorage.setItem("app_banner_url", bannerUrl)
    showToast("Pengaturan tampilan tersimpan!")
  }

  if (loading) return <div className="admin-page"><div className="loading-text">Memuat...</div></div>

  const tabs: { key: Tab; label: string }[] = [
    { key: "sekolah", label: "🏫 Sekolah" },
    { key: "pembayaran", label: "💳 Pembayaran" },
    { key: "infaq", label: "💚 Infaq" },
    { key: "tagihan", label: "📋 Tagihan" },
    { key: "tampilan", label: "🎨 Tampilan" },
  ]

  return (
    <div className="admin-page">
      <div className="page-title">Pengaturan</div>
      <p className="page-subtitle">Kelola data sekolah, rekening, tagihan, dan tampilan aplikasi</p>

      <div className="pengaturan-tabs">
        {tabs.map(t => (
          <button key={t.key} className={`pengaturan-tab ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {/* TAB: SEKOLAH */}
      {tab === "sekolah" && sekolah && (
        <div className="pengaturan-card">
          <h3 className="pengaturan-section-title">Data Sekolah</h3>
          <div className="pengaturan-row">
            <div>
              <label className="form-label">Nama Sekolah</label>
              <input className="admin-input" value={sekolah.nama_sekolah}
                onChange={e => setSekolah({ ...sekolah, nama_sekolah: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Nomor WhatsApp</label>
              <input className="admin-input" placeholder="08123456789" value={sekolah.nomor_wa}
                onChange={e => setSekolah({ ...sekolah, nomor_wa: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="form-label">Alamat Sekolah</label>
            <textarea className="admin-input" placeholder="Jl. Masjid No. 1, Kabo Jaya..."
              rows={3} value={alamat}
              onChange={e => setAlamat(e.target.value)}
              style={{ resize: "vertical" }} />
          </div>
          <div>
            <label className="form-label">Logo Sekolah</label>
            {sekolah.logo_url && (
              <div style={{ marginBottom: 8 }}>
                <Image src={sekolah.logo_url} alt="logo" width={80} height={80}
                  style={{ borderRadius: 12, objectFit: "cover" }} />
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ fontSize: 13 }} />
          </div>
          <button className="admin-btn" onClick={saveSekolah} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
        </div>
      )}

      {/* TAB: PEMBAYARAN */}
      {tab === "pembayaran" && bankPayment && (
        <div className="pengaturan-card">
          <h3 className="pengaturan-section-title">💳 Rekening Pembayaran SPP</h3>
          <div className="pengaturan-row">
            <div>
              <label className="form-label">Nama Bank</label>
              <input className="admin-input" placeholder="Bank Syariah Indonesia"
                value={bankPayment.bank_name}
                onChange={e => setBankPayment({ ...bankPayment, bank_name: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Nomor Rekening</label>
              <input className="admin-input" placeholder="1234567890"
                value={bankPayment.nomor_rekening}
                onChange={e => setBankPayment({ ...bankPayment, nomor_rekening: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="form-label">Atas Nama</label>
            <input className="admin-input" placeholder="MI Nurul Iman Kabo Jaya"
              value={bankPayment.atas_nama}
              onChange={e => setBankPayment({ ...bankPayment, atas_nama: e.target.value })} />
          </div>
          <div>
            <label className="form-label">QRIS</label>
            {bankPayment.qris_url && (
              <div style={{ marginBottom: 8 }}>
                <Image src={bankPayment.qris_url} alt="QRIS" width={120} height={120}
                  style={{ borderRadius: 10 }} />
              </div>
            )}
            <input type="file" accept="image/*" onChange={e => handleQrisUpload(e, 'payment')} style={{ fontSize: 13 }} />
          </div>
          <button className="admin-btn" onClick={() => saveBank(bankPayment, "Pembayaran")} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
        </div>
      )}

      {/* TAB: INFAQ */}
      {tab === "infaq" && bankInfaq && (
        <div className="pengaturan-card">
          <h3 className="pengaturan-section-title">💚 Rekening Infaq Sekolah</h3>
          <div className="pengaturan-row">
            <div>
              <label className="form-label">Nama Bank</label>
              <input className="admin-input" placeholder="Bank Syariah Indonesia"
                value={bankInfaq.bank_name}
                onChange={e => setBankInfaq({ ...bankInfaq, bank_name: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Nomor Rekening</label>
              <input className="admin-input" placeholder="0987654321"
                value={bankInfaq.nomor_rekening}
                onChange={e => setBankInfaq({ ...bankInfaq, nomor_rekening: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="form-label">Atas Nama</label>
            <input className="admin-input" placeholder="MI Nurul Iman Infaq"
              value={bankInfaq.atas_nama}
              onChange={e => setBankInfaq({ ...bankInfaq, atas_nama: e.target.value })} />
          </div>
          <div>
            <label className="form-label">QRIS Infaq</label>
            {bankInfaq.qris_url && (
              <div style={{ marginBottom: 8 }}>
                <Image src={bankInfaq.qris_url} alt="QRIS Infaq" width={120} height={120}
                  style={{ borderRadius: 10 }} />
              </div>
            )}
            <input type="file" accept="image/*" onChange={e => handleQrisUpload(e, 'infaq')} style={{ fontSize: 13 }} />
          </div>
          <button className="admin-btn" onClick={() => saveBank(bankInfaq, "Infaq")} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
        </div>
      )}

      {/* TAB: TAGIHAN */}
      {tab === "tagihan" && (
        <div className="pengaturan-card">
          <div className="pengaturan-section-header">
            <h3 className="pengaturan-section-title">📋 Jenis Tagihan</h3>
            <Link href="/admin/tagihan" className="admin-link">+ Kelola Lengkap</Link>
          </div>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
            Edit nominal default tagihan. Untuk menambah/hapus jenis tagihan, klik &#8220;Kelola Lengkap&#8221;.
          </p>
          <div className="tagihan-list">
            {billTypes.map(b => (
              <div key={b.id} className="tagihan-item">
                <div className="tagihan-item-left">
                  <div className="tagihan-item-name">{b.name}</div>
                  <div className="tagihan-item-desc">{b.description || "—"}</div>
                </div>
                <div className="tagihan-item-right">
                  <input
                    className="admin-input tagihan-amount-input"
                    type="number"
                    defaultValue={b.default_amount}
                    onBlur={(e) => {
                      const updated = [...billTypes]
                      const idx = updated.findIndex(x => x.id === b.id)
                      updated[idx] = { ...updated[idx], default_amount: parseInt(e.target.value) }
                      setBillTypes(updated)
                    }}
                  />
                  <button className="admin-btn admin-btn-sm" onClick={() => {
                    const updated = [...billTypes]
                    const idx = updated.findIndex(x => x.id === b.id)
                    saveTagihan(updated[idx])
                  }}>Simpan</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: TAMPILAN */}
      {tab === "tampilan" && (
        <div className="pengaturan-card">
          <h3 className="pengaturan-section-title">🎨 Tampilan Aplikasi</h3>
          <div>
            <label className="form-label">Warna Utama</label>
            <div className="tampilan-color-row">
              <input type="color" value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)} className="color-picker" />
              <input className="admin-input" value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)}
                style={{ flex: 1, fontFamily: "monospace" }} />
            </div>
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
              Warna ini digunakan untuk tombol utama, navbar, dan aksen di seluruh aplikasi.
            </p>
          </div>
          <div style={{ marginTop: 20 }}>
            <label className="form-label">Banner Sekolah</label>
            {bannerUrl && (
              <div style={{ marginBottom: 8, borderRadius: 12, overflow: "hidden", maxWidth: 400 }}>
                <Image src={bannerUrl} alt="Banner" width={400} height={160} style={{ objectFit: "cover" }} />
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleBannerUpload} style={{ fontSize: 13 }} />
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
              Banner akan ditampilkan di halaman beranda (opsional).
            </p>
          </div>
          <button className="admin-btn" onClick={saveTampilan} style={{ marginTop: 20 }}>
            Simpan Tampilan
          </button>
        </div>
      )}
    </div>
  )
}
