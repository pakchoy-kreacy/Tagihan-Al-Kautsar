"use client"

import { useMemo, useState, useEffect } from "react"
import { getStatKelas, type Siswa, type StatusBayar } from "@/lib/db"
import { Search, ArrowLeft, X, Filter } from "lucide-react"
import { ContactAduan } from "@/components/ContactAduan"
import { Footer } from "@/components/Footer"

interface SiswaClientProps {
  kelas: string
  tahunAjaran: string
  allSiswa: Siswa[]
  initialBillType: string
  initialStatus: StatusBayar | "all"
}

export function SiswaClient({ kelas, tahunAjaran, allSiswa, initialBillType, initialStatus }: SiswaClientProps) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<StatusBayar | "all">(initialStatus)
  const [filterBillType, setFilterBillType] = useState<string>(initialBillType)

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
    
    window.history.replaceState(window.history.state, '', `?${params.toString()}`)
  }, [kelas, filterBillType, filter])

  const siswaList = useMemo(() => {
    return allSiswa.filter((s) => {
      const matchSearch = s.nama.toLowerCase().includes(search.toLowerCase())
      
      // Combined billType + status filter
      const matchBillAndStatus = filterBillType === "all" 
        ? (filter === "all" || s.status === filter)  // No bill filter, just status
        : s.riwayat.some(r => {
            const billTypeMatch = r.bill_type_name === filterBillType
            const statusMatch = filter === "all" || r.status === filter
            return billTypeMatch && statusMatch
          })
      
      return matchSearch && matchBillAndStatus
    }).sort((a, b) => {
      if (a.kelas !== b.kelas) return a.kelas.localeCompare(b.kelas)
      return a.nama.localeCompare(b.nama)
    })
  }, [allSiswa, search, filter, filterBillType])

  const stat = useMemo(() => getStatKelas(allSiswa), [allSiswa])

  // Dynamic filters based on billType filter
  const filters = useMemo(() => {
    const baseFilters: { label: string; value: StatusBayar | "all"; color: string }[] = [
      { label: "Semua", value: "all", color: "green" },
      { label: "Lunas", value: "lunas", color: "green" },
      { label: "Belum Bayar", value: "belum", color: "red" },
      { label: "Menunggu", value: "menunggu", color: "yellow" },
      { label: "Dicicil", value: "dicicil", color: "yellow" },
    ]
    
    // Only show "Tidak Ada Tagihan" when viewing all bills
    if (filterBillType === "all") {
      baseFilters.push({ 
        label: "Tidak Ada Tagihan", 
        value: "tidak_ada_tagihan", 
        color: "green" 
      })
    }
    
    return baseFilters
  }, [filterBillType])

  const statusMap: Record<StatusBayar, string> = {
    lunas: "Lunas",
    belum: "Belum Bayar",
    menunggu: "Menunggu",
    dicicil: "Dicicil",
    tidak_ada_tagihan: "Tidak Ada Tagihan",
  }

  // Helper function for empty state message
  function getEmptyStateMessage(): string {
    if (allSiswa.length === 0) {
      return "Belum ada data siswa"
    }
    
    const parts: string[] = []
    
    if (filterBillType !== "all") {
      parts.push(filterBillType)
    }
    
    if (filter !== "all") {
      parts.push(`(${statusMap[filter]})`)
    }
    
    if (search) {
      parts.push(`dengan kata kunci "${search}"`)
    }
    
    if (parts.length === 0) {
      return "Tidak ada siswa yang cocok"
    }
    
    return `Tidak ada siswa dengan ${parts.join(' ')}`
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
                <div style={{ fontSize: 28, fontWeight: 700, color: "var(--terracotta)", fontVariantNumeric: "tabular-nums" }}>{stat.belum + stat.menunggu + stat.dicicil}</div>
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
            <div style={{
              background: filterBillType !== 'all' ? 'var(--emerald-soft)' : 'white',
              border: `2px solid ${filterBillType !== 'all' ? 'var(--emerald)' : 'var(--sand)'}`,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 10
              }}>
                <Filter size={16} color={filterBillType !== 'all' ? 'var(--emerald)' : 'var(--neutral)'} />
                <label style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--ink)',
                  margin: 0
                }}>
                  Filter Berdasarkan Tagihan
                </label>
              </div>
              
              <select
                value={filterBillType}
                onChange={(e) => {
                  const newBillType = e.target.value
                  setFilterBillType(newBillType)
                  
                  // Auto-reset status filter when changing bill type
                  if (newBillType !== filterBillType && filter !== "all") {
                    setFilter("all")
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: 14,
                  border: '2px solid var(--sand)',
                  borderRadius: 10,
                  background: 'white',
                  color: 'var(--ink)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--emerald)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--sand)'}
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
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                maxWidth: '400px',
                padding: '12px 16px',
                fontSize: 14,
                fontWeight: 600,
                background: 'white',
                border: '2px solid var(--terracotta)',
                borderRadius: 10,
                cursor: 'pointer',
                color: 'var(--terracotta)',
                transition: 'all 0.2s',
                marginBottom: 16
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--terracotta)'
                e.currentTarget.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white'
                e.currentTarget.style.color = 'var(--terracotta)'
              }}
            >
              <X size={16} />
              <span>Reset Semua Filter</span>
            </button>
          )}

          {siswaList.length === 0 ? (
            <div className="card" style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: 16, fontFamily: "var(--font-heading)" }}>
                {getEmptyStateMessage()}
              </div>
              <div className="empty-text" style={{ padding: "8px 0 0" }}>
                Coba ubah filter tagihan atau status.
              </div>
            </div>
          ) : (
            <div className="app-cards-grid">
              {siswaList.map((siswa) => {
                // Compute badge and border based on filter
                let badgeStatus: StatusBayar
                let badgeText: string
                
                if (filterBillType === "all") {
                  // Show overall status with count
                  badgeStatus = siswa.status
                  badgeText = statusMap[siswa.status]
                  if (siswa.riwayat.length > 0) {
                    const lunasCount = siswa.riwayat.filter(r => r.status === 'lunas').length
                    badgeText += ` (${lunasCount}/${siswa.riwayat.length})`
                  }
                } else {
                  // Show specific bill status inline
                  const specificBill = siswa.riwayat.find(r => r.bill_type_name === filterBillType)
                  if (specificBill) {
                    badgeStatus = specificBill.status
                    const statusLabel = statusMap[specificBill.status]
                    // Truncate bill name if too long
                    const billName = filterBillType.length > 25 
                      ? `${filterBillType.substring(0, 22)}...` 
                      : filterBillType
                    badgeText = `${statusLabel} • ${billName}`
                  } else {
                    // Fallback (shouldn't happen)
                    badgeStatus = 'belum'
                    badgeText = 'Tidak Ada'
                  }
                }
                
                return (
                  <a key={siswa.id} href={`/siswa/${siswa.id}`} className="block" style={{ textDecoration: "none", color: "inherit" }}>
                    <div className={`siswa-card border-${badgeStatus}`}>
                      <div className="info">
                        <h4>{siswa.nama}</h4>
                        <p>NISN {siswa.nisn}</p>
                      </div>
                      <span className={`badge badge-${badgeStatus}`}>
                        {badgeText}
                      </span>
                    </div>
                  </a>
                )
              })}
            </div>
          )}

          <div className="counter">
            Menampilkan {siswaList.length} dari {stat.total} siswa
            {(filterBillType !== "all" || filter !== "all") && (
              <div style={{ 
                fontSize: 13, 
                color: 'var(--emerald)', 
                fontWeight: 600,
                marginTop: 4
              }}>
                Filter aktif:
                {filterBillType !== "all" && ` ${filterBillType}`}
                {filterBillType !== "all" && filter !== "all" && " •"}
                {filter !== "all" && ` ${statusMap[filter]}`}
              </div>
            )}
          </div>

          <ContactAduan />

          <Footer />
        </div>
      </main>
    </div>
  )
}
