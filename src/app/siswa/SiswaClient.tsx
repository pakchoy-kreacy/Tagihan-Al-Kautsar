"use client"

import { useMemo, useState, useEffect } from "react"
import { getStatKelas, type Siswa, type StatusBayar } from "@/lib/db"
import { Search, ArrowLeft, X } from "lucide-react"

interface SiswaClientProps {
  kelas: string
  tahunAjaran: string
  allSiswa: Siswa[]
}

export function SiswaClient({ kelas, tahunAjaran, allSiswa }: SiswaClientProps) {
  // Read initial filters from URL
  const initialFilters = useMemo(() => {
    if (typeof window === 'undefined') return { billType: 'all', status: 'all' as StatusBayar | 'all' }
    const params = new URLSearchParams(window.location.search)
    return {
      billType: params.get('billType') || 'all',
      status: (params.get('status') as StatusBayar | 'all') || 'all'
    }
  }, [])

  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<StatusBayar | "all">(initialFilters.status)
  const [filterBillType, setFilterBillType] = useState<string>(initialFilters.billType)

  // Extract unique bill types from all siswa
  const availableBillTypes = useMemo(() => {
    const billTypeSet = new Set<string>()
    allSiswa.forEach(siswa => {
      siswa.riwayat.forEach(r => {
        if (r.bill_type_name) {
          billTypeSet.add(r.bill_type_name)
        }
      })
    })
    return Array.from(billTypeSet).sort()
  }, [allSiswa])

  // Update URL when filters change
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    params.set('kelas', kelas)
    
    if (filterBillType !== 'all') {
      params.set('billType', filterBillType)
    } else {
      params.delete('billType')
    }
    
    if (filter !== 'all') {
      params.set('status', filter)
    } else {
      params.delete('status')
    }
    
    window.history.replaceState({}, '', `?${params.toString()}`)
  }, [kelas, filterBillType, filter])

  const siswaList = useMemo(() => {
    return allSiswa.filter((s) => {
      const matchSearch = s.nama.toLowerCase().includes(search.toLowerCase())
      const matchFilter = filter === "all" || s.status === filter
      const matchBillType = filterBillType === "all" || 
        s.riwayat.some(r => r.bill_type_name === filterBillType)
      return matchSearch && matchFilter && matchBillType
    })
  }, [allSiswa, search, filter, filterBillType])

  const stat = useMemo(() => getStatKelas(allSiswa), [allSiswa])

  const filters: { label: string; value: StatusBayar | "all"; color: string }[] = [
    { label: "Semua", value: "all", color: "green" },
    { label: "Lunas", value: "lunas", color: "green" },
    { label: "Belum Bayar", value: "belum", color: "red" },
    { label: "Menunggu", value: "menunggu", color: "yellow" },
    { label: "Tidak Ada Tagihan", value: "tidak_ada_tagihan", color: "green" },
  ]

  const statusMap: Record<StatusBayar, string> = {
    lunas: "Lunas",
    belum: "Belum Bayar",
    menunggu: "Menunggu",
    tidak_ada_tagihan: "Tidak Ada Tagihan",
  }

  return (
    <div className="app-shell">
      <main className="app-main">
        <div className="app-grid">
          <section className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a 
                  href="/" 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: 6,
                    textDecoration: 'none',
                    color: 'var(--emerald)',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'color 0.2s'
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Kembali ke Beranda</span>
                </a>
                <span style={{ fontSize: 22, fontWeight: 700, color: "var(--emerald)", fontFamily: "var(--font-heading)" }}>
                  Kelas {kelas}
                </span>
              </div>
              <span className="badge badge-lunas">{tahunAjaran}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 16 }}>
              <div style={{ background: "#f8fbf8", borderRadius: 14, padding: 16, textAlign: "center", border: "1px solid #e5ece5" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "var(--emerald)", fontVariantNumeric: "tabular-nums" }}>{stat.total}</div>
                <div style={{ fontSize: 12, color: "var(--neutral)", marginTop: 4 }}>Total Siswa</div>
              </div>
              <div style={{ background: "#f8fbf8", borderRadius: 14, padding: 16, textAlign: "center", border: "1px solid #e5ece5" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "var(--emerald)", fontVariantNumeric: "tabular-nums" }}>{stat.lunas}</div>
                <div style={{ fontSize: 12, color: "var(--neutral)", marginTop: 4 }}>Lunas</div>
              </div>
              <div style={{ background: "#f8fbf8", borderRadius: 14, padding: 16, textAlign: "center", border: "1px solid #e5ece5" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "var(--terracotta)", fontVariantNumeric: "tabular-nums" }}>{stat.belum + stat.menunggu}</div>
                <div style={{ fontSize: 12, color: "var(--neutral)", marginTop: 4 }}>Perlu Dibayar</div>
              </div>
            </div>
          </section>

          <div className="search-box">
            <span className="icon"><Search size={18} /></span>
            <input
              type="text"
              placeholder="Cari nama atau NISN siswa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {availableBillTypes.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ 
                fontSize: 13, 
                color: 'var(--neutral)', 
                marginBottom: 6, 
                display: 'block',
                fontWeight: 500
              }}>
                Pilih Tagihan:
              </label>
              <select
                value={filterBillType}
                onChange={(e) => setFilterBillType(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  padding: '10px 12px',
                  fontSize: 14,
                  border: '1px solid var(--sand)',
                  borderRadius: 10,
                  background: 'white',
                  color: 'var(--ink)',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                <option value="all">Semua Tagihan</option>
                {availableBillTypes.map(billType => (
                  <option key={billType} value={billType}>
                    {billType}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="filter-chips">
            {filters.map((f) => (
              <button
                key={f.value}
                type="button"
                className={`filter-chip ${f.color} ${filter === f.value ? "active" : ""}`}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {(search || filter !== "all" || filterBillType !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("")
                setFilter("all")
                setFilterBillType("all")
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 500,
                background: 'var(--neutral-soft)',
                border: '1px solid var(--sand)',
                borderRadius: 8,
                cursor: 'pointer',
                color: 'var(--neutral)',
                transition: 'all 0.2s',
                marginBottom: 12
              }}
            >
              <X size={14} />
              <span>Reset Semua Filter</span>
            </button>
          )}

          {siswaList.length === 0 ? (
            <div className="card" style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: 16, fontFamily: "var(--font-heading)" }}>
                {allSiswa.length === 0 ? "Belum ada data siswa" : "Tidak ada siswa yang cocok"}
              </div>
              <div className="empty-text" style={{ padding: "8px 0 0" }}>
                Coba ubah kata kunci atau filter.
              </div>
            </div>
          ) : (
            <div className="app-cards-grid">
              {siswaList.map((siswa) => (
                <a key={siswa.id} href={`/siswa/${siswa.id}`} className="block" style={{ textDecoration: "none", color: "inherit" }}>
                  <div className={`siswa-card border-${siswa.status}`}>
                    <div className="info">
                      <h4>{siswa.nama}</h4>
                      <p>NISN {siswa.nisn}</p>
                    </div>
                    <span className={`badge badge-${siswa.status}`}>
                      {statusMap[siswa.status]}
                      {siswa.riwayat.length > 0 && (
                        <span style={{ marginLeft: 4, opacity: 0.85 }}>
                          ({siswa.riwayat.filter(r => r.status === 'lunas').length}/{siswa.riwayat.length})
                        </span>
                      )}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}

          <div className="counter">
            Menampilkan {siswaList.length} dari {stat.total} siswa
            {filterBillType !== "all" && (
              <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>
                {' '}• {filterBillType}
              </span>
            )}
          </div>

          <div className="app-footer">© {new Date().getFullYear()} MI Nurul Iman Kabo Jaya</div>
        </div>
      </main>
    </div>
  )
}
