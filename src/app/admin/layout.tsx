"use client"
import "./admin.css"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { LayoutDashboard, Building2, Users, Receipt, ClipboardList, Heart, Settings, LogOut, House } from "lucide-react"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/kelas", label: "Kelas", icon: Building2 },
  { href: "/admin/siswa", label: "Siswa", icon: Users },
  { href: "/admin/tagihan", label: "Kelola Tagihan", icon: Receipt },
  { href: "/admin/verifikasi", label: "Verifikasi", icon: ClipboardList },
  { href: "/admin/infaq", label: "Infaq", icon: Heart },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && pathname !== "/admin/login") {
        router.replace("/admin/login")
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="admin-layout">
      <button className="admin-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <LayoutDashboard size={18} />
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
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${isActive ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="admin-nav-icon"><Icon size={18} /></span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Link href="/" className="admin-back-link" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <House size={14} /> Kembali ke Beranda
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              fontSize: 13,
              cursor: "pointer",
              marginTop: 8,
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="admin-main">
        <nav className="breadcrumb">
          <Link href="/admin" className="breadcrumb-link">Admin</Link>
          {pathname !== "/admin" && (
            <>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">
                {navItems.find(n => n.href === pathname)?.label || pathname.replace("/admin/", "")}
              </span>
            </>
          )}
        </nav>
        {children}
      </main>
    </div>
  )
}
