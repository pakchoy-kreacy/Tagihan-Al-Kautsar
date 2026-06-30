"use client"

const stats = [
  { label: "Total Pemasukan", value: "Rp 2.450.000.000", icon: "💰" },
  { label: "Total Siswa", value: "350", icon: "👨‍🎓" },
  { label: "Ketepatan Bayar", value: "85%", icon: "✅" },
  { label: "Total Tunggakan", value: "Rp 120.000.000", icon: "📋" },
]

const fitur = [
  { title: "Manajemen SPP & Tagihan", desc: "Buat tagihan SPP bulanan otomatis, atur kelas, dan pantau pembayaran secara real-time.", icon: "📊" },
  { title: "Infaq Online", desc: "Terima donasi infaq secara digital dengan bukti upload dan verifikasi otomatis.", icon: "🤝" },
  { title: "Rekap & Export Excel", desc: "Export data pembayaran ke Excel dengan detail tunggakan per siswa.", icon: "📑" },
]

const dummySiswa = [
  { nisn: "0012345671", nama: "Ahmad Fauzi", kelas: "5A", tagihan: "Rp 250.000", status: "Lunas" as const },
  { nisn: "0012345672", nama: "Siti Nurhaliza", kelas: "5A", tagihan: "Rp 500.000", status: "Belum" as const },
  { nisn: "0012345673", nama: "Budi Santoso", kelas: "5B", tagihan: "Rp 250.000", status: "Lunas" as const },
  { nisn: "0012345674", nama: "Dewi Lestari", kelas: "5B", tagihan: "Rp 250.000", status: "Menunggu" as const },
  { nisn: "0012345675", nama: "Rudi Hermawan", kelas: "6A", tagihan: "Rp 750.000", status: "Belum" as const },
  { nisn: "0012345676", nama: "Ani Rahmawati", kelas: "6A", tagihan: "Rp 250.000", status: "Lunas" as const },
  { nisn: "0012345677", nama: "Doni Prasetyo", kelas: "6B", tagihan: "Rp 500.000", status: "Belum" as const },
  { nisn: "0012345678", nama: "Rina Marlina", kelas: "4A", tagihan: "Rp 250.000", status: "Lunas" as const },
  { nisn: "0012345679", nama: "Agus Wijaya", kelas: "4A", tagihan: "Rp 250.000", status: "Menunggu" as const },
  { nisn: "0012345680", nama: "Maya Sari", kelas: "4B", tagihan: "Rp 250.000", status: "Lunas" as const },
]

const statusColor = {
  Lunas: { bg: "#d1fae5", text: "#065f46" },
  Belum: { bg: "#fef3c7", text: "#92400e" },
  Menunggu: { bg: "#dbeafe", text: "#1e40af" },
}

export default function DemoPage() {
  return (
    <div style={{ position: "relative", minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, sans-serif", overflow: "hidden" }}>
      {/* Watermark */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{
          fontSize: 200, fontWeight: 900, color: "rgba(220, 38, 38, 0.08)",
          transform: "rotate(-30deg)", whiteSpace: "nowrap", userSelect: "none",
          letterSpacing: 40, width: "200%", textAlign: "center"
        }}>
          DEMO DEMO DEMO DEMO DEMO
        </div>
      </div>

      {/* Header */}
      <header style={{
        background: "linear-gradient(135deg, #059669, #10b981)", color: "white", padding: "40px 20px 60px",
        textAlign: "center", position: "relative"
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>📚</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 8px" }}>ESPP</h1>
        <p style={{ fontSize: 16, opacity: 0.9, margin: 0 }}>Management Pembayaran Sekolah Digital</p>
      </header>

      {/* Stats */}
      <div style={{ maxWidth: 960, margin: "-30px auto 0", padding: "0 16px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, position: "relative" }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: "white", borderRadius: 12, padding: "16px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1e293b" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Fitur */}
      <div style={{ maxWidth: 960, margin: "40px auto", padding: "0 16px" }}>
        <h2 style={{ textAlign: "center", fontSize: 22, fontWeight: 700, color: "#1e293b", marginBottom: 24 }}>Fitur Unggulan</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
          {fitur.map((f, i) => (
            <div key={i} style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderTop: "4px solid #10b981" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 8px" }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabel Siswa */}
      <div style={{ maxWidth: 960, margin: "0 auto 40px", padding: "0 16px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", marginBottom: 16, textAlign: "center" }}>Contoh Data Siswa</h2>
        <div style={{ overflowX: "auto", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "white", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
                <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 600 }}>NISN</th>
                <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 600 }}>Nama</th>
                <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 600 }}>Kelas</th>
                <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 600 }}>Tagihan</th>
                <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {dummySiswa.map((s, i) => (
                <tr key={i} style={{ borderTop: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "10px 12px", color: "#334155" }}>{s.nisn}</td>
                  <td style={{ padding: "10px 12px", color: "#334155", fontWeight: 500 }}>{s.nama}</td>
                  <td style={{ padding: "10px 12px", color: "#334155" }}>{s.kelas}</td>
                  <td style={{ padding: "10px 12px", color: "#334155" }}>{s.tagihan}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{
                      display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                      background: statusColor[s.status].bg, color: statusColor[s.status].text
                    }}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", padding: "40px 20px", background: "white", maxWidth: 960, margin: "0 auto 0", borderRadius: "12px 12px 0 0", boxShadow: "0 -2px 8px rgba(0,0,0,0.05)" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: "0 0 8px" }}>Tertarik?</h2>
        <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 20px" }}>Hubungi kami untuk info lebih lanjut dan demo gratis.</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
          <a href="mailto:info@espp.sch.id" style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 24px",
            background: "#059669", color: "white", borderRadius: 8, fontWeight: 600, fontSize: 14,
            textDecoration: "none"
          }}>📧 info@espp.sch.id</a>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 24px",
            background: "#f1f5f9", color: "#475569", borderRadius: 8, fontWeight: 600, fontSize: 14
          }}>📞 08xx-xxxx-xxxx</span>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "16px 20px", fontSize: 12, color: "#94a3b8" }}>
        © {new Date().getFullYear()} ESPP - Management Pembayaran Sekolah Digital
      </footer>
    </div>
  )
}