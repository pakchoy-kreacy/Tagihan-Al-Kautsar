"use client"
import "./admin.css"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "D" },
  { href: "/admin/siswa", label: "Siswa", icon: "S" },
  { href: "/admin/kelas", label: "Kelas", icon: "K" },
  { href: "/admin/pembayaran", label: "Pembayaran", icon: "P" },
  { href: "/admin/verifikasi", label: "Verifikasi", icon: "V" },
  { href: "/admin/verifikasi-infaq", label: "Verifikasi Infaq", icon: "I" },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: "G" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="admin-layout">
      <button className="admin-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <span>Menu</span>
        <span className="admin-menu-label">Admin Panel</span>
      </button>

      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">MI</div>
          <div>
            <div className="admin-sidebar-title">MI Nurul Iman</div>
            <div className="admin-sidebar-sub">Admin Panel</div>
          </div>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${isActive ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Link href="/" className="admin-back-link">Kembali ke Beranda</Link>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="admin-main">{children}</main>
    </div>
  )
}
