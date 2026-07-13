"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { formatRupiah, updateBillStatus, getAllClasses } from "@/lib/db"
import { useToast } from "@/components/Toast"
import { Download, X, Inbox } from "lucide-react"
// XLSX di-import dynamic untuk mengurangi bundle size

interface BillType {
  id: string
  name: string
  description: string
  default_amount: number
  is_recurring: boolean
  berlaku_untuk_kelas: string[] | null
}

interface StudentBill {
  bill_id: string
  student_id: string
  student_name: string
  nisn: string
  class_name: string
  bill_type_id: string
  bill_type_name: string
  month: string
  year: number
  amount: number
  status: string
  paid_date: string | null
}

interface RekapItem {
  billType: BillType
  lunas: StudentBill[]
  belum: StudentBill[]
  menunggu: StudentBill[]
  totalNominal: number
  lunasNominal: number
  belumNominal: number
}

export default function RekapTagihanPage() {
  const { showToast } = useToast()
  const [rekap, setRekap] = useState<RekapItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBillType, setSelectedBillType] = useState<RekapItem | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [editingBillId, setEditingBillId] = useState<string | null>(null)
  const [filterKelas, setFilterKelas] = useState<string>("all")
  const [kelasList, setKelasList] = useState<string[]>([])
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportTarget, setExportTarget] = useState<RekapItem | null>(null)

  async function fetchData() {
    setLoading(true)
    try {
      const [{ data: billTypes }, { data: students }, { data: bills }, classes] = await Promise.all([
        supabase.from("bill_types").select("*").order("batas_waktu", { ascending: true, nullsFirst: false }).order("name"),
        supabase.from("students").select("id, name, nisn, classes(name)"),
        supabase.from("bills").select("*").order("year", { ascending: false }).order("month"),
        getAllClasses(),
      ])
      
      setKelasList(classes.map(c => c.name))

      if (!billTypes) return

      const studentMap = new Map<string, { name: string; nisn: string; className: string }>()
      for (const s of students || []) {
        const classesArray = s.classes as { name: string }[] | null
        const className = classesArray && classesArray.length > 0 ? classesArray[0].name : "N/A"
        studentMap.set(s.id, {
          name: s.name,
          nisn: s.nisn,
          className,
        })
      }

      const rekapItems: RekapItem[] = billTypes.map(bt => {
        const btBills = (bills || [])
          .filter(b => b.bill_type_id === bt.id)
          .map(b => {
            const student = studentMap.get(b.student_id)
            return {
              bill_id: b.id,
              student_id: b.student_id,
              student_name: student?.name || "-",
              nisn: student?.nisn || "-",
              class_name: student?.className || "N/A",
              bill_type_id: bt.id,
              bill_type_name: bt.name,
              month: b.month,
              year: b.year,
              amount: b.amount,
              status: b.status,
              paid_date: b.paid_date,
            }
          })

        const lunas = btBills.filter(b => b.status === "lunas")
        const belum = btBills.filter(b => b.status === "belum")
        const menunggu = btBills.filter(b => b.status === "menunggu")

        return {
          billType: bt,
          lunas,
          belum,
          menunggu,
          totalNominal: btBills.reduce((sum, b) => sum + b.amount, 0),
          lunasNominal: lunas.reduce((sum, b) => sum + b.amount, 0),
          belumNominal: belum.reduce((sum, b) => sum + b.amount, 0),
        }
      })

      setRekap(rekapItems)
    } catch (error) {
      console.error("Error fetching rekap:", error)
      showToast("Gagal memuat data rekap!", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => fetchData(), 0)
    const interval = setInterval(fetchData, 30000)
    const onVisible = () => { if (!document.hidden) fetchData() }
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisible)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleExportExcel() {
    const XLSX = await import("xlsx")
    const rows: Record<string, unknown>[] = []

    for (const item of rekap) {
      const allBills = [...item.lunas, ...item.belum, ...item.menunggu]
      for (const bill of allBills) {
        rows.push({
          "Jenis Tagihan": bill.bill_type_name,
          "Nama Siswa": bill.student_name,
          "NISN": bill.nisn,
          "Kelas": bill.class_name,
          "Bulan": bill.month,
          "Nominal": bill.amount,
          "Status": bill.status === "lunas" ? "Lunas" : bill.status === "belum" ? "Belum Bayar" : "Menunggu",
          "Tanggal Bayar": bill.paid_date || "-",
        })
      }
    }

    if (rows.length === 0) {
      showToast("Tidak ada data untuk di-export!", "error")
      return
    }

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Tagihan")

    // Auto column width
    const colWidths = Object.keys(rows[0]).map(key => ({
      wch: Math.max(key.length, ...rows.map(r => String(r[key]).length)) + 2
    }))
    ws["!cols"] = colWidths

    XLSX.writeFile(wb, "rekap-tagihan.xlsx")
    showToast("Berhasil di-export ke Excel!", "success")
  }

  async function handleExportPerBillType() {
    if (!exportTarget) return
    const XLSX = await import("xlsx")

    let allBills = [...exportTarget.lunas, ...exportTarget.belum, ...exportTarget.menunggu]
    
    // Apply class filter
    if (filterKelas !== "all") {
      allBills = allBills.filter(b => b.class_name === filterKelas)
    }
    
    if (allBills.length === 0) {
      showToast("Tidak ada data untuk di-export!", "error")
      return
    }
    
    // Fetch all bills for tunggakan calculation
    const studentIds = [...new Set(allBills.map(b => b.student_id))]
    const { data: allStudentBills } = await supabase
      .from('bills')
      .select('student_id, amount, status, month, year, bill_types(name)')
      .in('student_id', studentIds)
      // Remove academic_year filter to include ALL unpaid bills
      .in('status', ['belum', 'menunggu'])
      .order('year', { ascending: true })
    
    // Build student bills map
    const studentBillsMap = new Map<string, typeof allStudentBills>()
    for (const bill of allStudentBills || []) {
      if (!studentBillsMap.has(bill.student_id)) {
        studentBillsMap.set(bill.student_id, [])
      }
      studentBillsMap.get(bill.student_id)!.push(bill)
    }
    
    const rows: Record<string, unknown>[] = allBills.map(bill => {
      // Get student's all bills
      const studentBills = studentBillsMap.get(bill.student_id) || []
      
      // Filter unpaid bills
      const unpaidBills = studentBills.filter(b => b.status !== 'lunas')
      
      const totalTunggakan = unpaidBills.reduce((sum, b) => sum + b.amount, 0)
      
      // Get unique months from unpaid bills
      const unpaidMonths = [...new Set(
        unpaidBills
          .map(b => (b as { month?: string }).month)
          .filter(Boolean)
      )].join(', ')
      
      return {
        "Nama Siswa": bill.student_name,
        "NISN": bill.nisn,
        "Kelas": bill.class_name,
        "Nominal": bill.amount,
        "Status": bill.status === "lunas" ? "Lunas" : bill.status === "belum" ? "Belum Bayar" : "Menunggu",
        "Tanggal Bayar": bill.paid_date || "-",
        "Bulan-Bulan Tunggakan": unpaidMonths || "-",
        "Total Tunggakan": totalTunggakan,
      }
    })

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, exportTarget.billType.name)

    const colWidths = Object.keys(rows[0]).map(key => ({
      wch: Math.max(key.length, ...rows.map(r => String(r[key]).length)) + 2
    }))
    ws["!cols"] = colWidths

    // Dynamic filename based on filter
    const kelasStr = filterKelas === "all" ? "" : `_Kelas_${filterKelas}`
    const filename = `Rekap_${exportTarget.billType.name}${kelasStr}.xlsx`
    
    XLSX.writeFile(wb, filename)
    showToast("Berhasil di-export ke Excel!", "success")
    setShowExportModal(false)
    setExportTarget(null)
    setFilterKelas("all")
  }

  return (
    <div className="admin-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        <div>
          <div className="page-title">Rekap Tagihan</div>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Ringkasan tagihan per jenis tagihan</p>
        </div>
        <button className="admin-btn" onClick={handleExportExcel}>
          <Download size={15} /> Export Semua
        </button>
      </div>

      {loading ? (
        <div className="tagihan-grid">
          {[1,2,3].map(i => <div key={i} className="tagihan-card skeleton" />)}
        </div>
      ) : rekap.length === 0 ? (
        <div className="empty-state">
          <Inbox size={48} color="var(--neutral)" style={{ opacity: 0.4, marginBottom: 12 }} />
          <p>Belum ada data tagihan</p>
        </div>
      ) : (
        <div className="rekap-grid">
          {rekap.map(item => (
            <div
              key={item.billType.id}
              className="rekap-card"
              onClick={() => setSelectedBillType(item)}
              style={{ cursor: "pointer" }}
            >
              <div className="rekap-card-header">
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                  <div className="rekap-card-title">{item.billType.name}</div>
                  {item.billType.is_recurring && (
                    <span className="tc-badge recurring" style={{ fontSize: 10 }}>Bulanan</span>
                  )}
                </div>
                <button
                  className="rekap-card-export-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setExportTarget(item)
                    setShowExportModal(true)
                  }}
                >
                  <Download size={14} /> Export
                </button>
              </div>

              {item.billType.description && (
                <div className="rekap-card-desc">{item.billType.description}</div>
              )}

              <div className="rekap-card-amount">{formatRupiah(item.billType.default_amount)}</div>

              <div className="rekap-card-stats">
                <div className="rekap-stat">
                  <div className="rekap-stat-num" style={{ color: "var(--emerald)" }}>{item.lunas.length}</div>
                  <div className="rekap-stat-label">Lunas</div>
                </div>
                <div className="rekap-stat">
                  <div className="rekap-stat-num" style={{ color: "var(--terracotta)" }}>{item.belum.length}</div>
                  <div className="rekap-stat-label">Belum</div>
                </div>
                <div className="rekap-stat">
                  <div className="rekap-stat-num" style={{ color: "var(--gold)" }}>{item.menunggu.length}</div>
                  <div className="rekap-stat-label">Menunggu</div>
                </div>
                <div className="rekap-stat">
                  <div className="rekap-stat-num" style={{ color: "var(--ink)" }}>{item.lunas.length + item.belum.length + item.menunggu.length}</div>
                  <div className="rekap-stat-label">Total</div>
                </div>
              </div>

              {item.belum.length > 0 && (
                <div className="rekap-card-tunggakan">
                  Tunggakan: {formatRupiah(item.belumNominal)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedBillType && (
        <>
          <div className="admin-overlay" onClick={() => { setSelectedBillType(null); setFilterStatus("all") }} />
          <div className="admin-modal" style={{ maxWidth: 700, maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
            <div className="modal-header">
              <h3>{selectedBillType.billType.name}</h3>
              <button className="modal-close" onClick={() => { setSelectedBillType(null); setFilterStatus("all") }}><X size={18} /></button>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", flexShrink: 0 }}>
              {[
                { value: "all", label: "Semua" },
                { value: "belum", label: "Belum Bayar" },
                { value: "menunggu", label: "Menunggu" },
                { value: "lunas", label: "Lunas" },
              ].map(tab => (
                <button
                  key={tab.value}
                  className={`admin-btn ${filterStatus === tab.value ? "" : "admin-btn-outline"}`}
                  style={{ fontSize: 12, padding: "6px 14px" }}
                  onClick={() => setFilterStatus(tab.value)}
                >
                  {tab.label}
                </button>
              ))}
              <button
                className="admin-btn admin-btn-outline"
                style={{ fontSize: 12, padding: "6px 14px", marginLeft: "auto" }}
                onClick={handleExportPerBillType}
              >
                <Download size={13} /> Export
              </button>
            </div>

            {(() => {
              const allBills = [...selectedBillType.lunas, ...selectedBillType.belum, ...selectedBillType.menunggu]
              const filtered = filterStatus === "all" ? allBills : allBills.filter(b => b.status === filterStatus)

              if (filtered.length === 0) {
                return <p className="empty-text" style={{ padding: "16px 0" }}>Tidak ada data</p>
              }

              return (
                <div className="admin-table-wrap" style={{ flex: 1, overflowY: "auto", maxHeight: "50vh" }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Nama</th>
                        <th>Kelas</th>
                        <th>Bulan</th>
                        <th>Nominal</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(bill => (
                        <tr key={bill.bill_id}>
                          <td style={{ fontWeight: 600 }}>{bill.student_name}<br />
                            <span style={{ fontSize: 11, color: "#6b776d" }}>{bill.nisn}</span>
                          </td>
                          <td>{bill.class_name}</td>
                          <td>{bill.month}</td>
                          <td style={{ fontWeight: 600 }}>{formatRupiah(bill.amount)}</td>
                          <td>
                            {editingBillId === bill.bill_id ? (
                              <select
                                className="admin-input"
                                style={{ padding: "4px 8px", fontSize: 12, width: "auto" }}
                                defaultValue={bill.status}
                                autoFocus
                                onChange={async (e) => {
                                  const newStatus = e.target.value
                                  const ok = await updateBillStatus(bill.bill_id, newStatus)
                                  if (ok) {
                                    showToast("Status diperbarui!")
                                    setEditingBillId(null)
                                    await fetchData()
                                    if (selectedBillType) {
                                      const updated = rekap.find(r => r.billType.id === selectedBillType.billType.id)
                                      if (updated) setSelectedBillType(updated)
                                    }
                                  } else {
                                    showToast("Gagal update status!", "error")
                                  }
                                }}
                                onBlur={() => setEditingBillId(null)}
                              >
                                <option value="belum">Belum</option>
                                <option value="menunggu">Menunggu</option>
                                <option value="lunas">Lunas</option>
                              </select>
                            ) : (
                              <span
                                className={`badge badge-${bill.status}`}
                                style={{ cursor: "pointer" }}
                                onClick={() => setEditingBillId(bill.bill_id)}
                                title="Klik untuk edit status"
                              >
                                {bill.status === "lunas" ? "Lunas" : bill.status === "belum" ? "Belum" : "Menunggu"}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })()}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: 13, color: "var(--neutral)", flexShrink: 0 }}>
              <span>Total: {selectedBillType.lunas.length + selectedBillType.belum.length + selectedBillType.menunggu.length} tagihan</span>
              <span style={{ fontWeight: 600 }}>Dibayar: {formatRupiah(selectedBillType.lunasNominal)}</span>
            </div>
          </div>
        </>
      )}

      {/* EXPORT MODAL */}
      {showExportModal && exportTarget && (
        <>
          <div className="admin-overlay" onClick={() => setShowExportModal(false)} />
          <div className="admin-modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3>Export {exportTarget.billType.name}</h3>
              <button className="modal-close" onClick={() => setShowExportModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            <label className="admin-label" style={{ marginBottom: 6, display: "block", fontSize: 13, fontWeight: 600 }}>Filter Kelas</label>
            <select 
              className="admin-select"
              value={filterKelas}
              onChange={e => setFilterKelas(e.target.value)}
              style={{ marginBottom: 16 }}
            >
              <option value="all">Semua Kelas</option>
              {kelasList.map(k => (
                <option key={k} value={k}>Kelas {k}</option>
              ))}
            </select>
            
            <button 
              className="admin-btn admin-btn-primary"
              onClick={handleExportPerBillType}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <Download size={16} /> Export to Excel
            </button>
          </div>
        </>
      )}
    </div>
  )
}
