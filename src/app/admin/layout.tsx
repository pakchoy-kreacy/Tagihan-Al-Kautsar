"use client"
import "./admin.css"
import { useState, useEffect } from "react"

import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { AdminRoleProvider, useAdminRole } from "@/context/AdminRoleContext"
import { LayoutDashboard, Building2, Users, Receipt, ClipboardList, Heart, Settings, LogOut, House, FileSpreadsheet, Eye } from "lucide-react"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/siswa", label: "Siswa", icon: Users },
  { href: "/admin/kelas", label: "Kelas", icon: Building2 },
  { href: "/admin/tagihan", label: "Kelola Tagihan", icon: Receipt },
  { href: "/admin/rekap-tagihan", label: "Rekap Tagihan", icon: FileSpreadsheet },
  { href: "/admin/verifikasi", label: "Verifikasi", icon: ClipboardList, hasBadge: true },
  { href: "/admin/infaq", label: "Infaq", icon: Heart },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
]

function RoleBanner() {
  const { role, loading } = useAdminRole()
  if (loading || role !== 'viewer') return null
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
      padding: "8px 16px", background: "#fef3c7", borderBottom: "2px solid #f59e0b",
      fontSize: 13, fontWeight: 600, color: "#92400e"
    }}>
      <Eye size={16} /> Mode Demo — Anda hanya bisa melihat data
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  const isLoginPage = pathname === "/admin/login"

  // Restore session from localStorage before AdminRoleProvider mounts
  useEffect(() => {
    async function restore() {
      const raw = localStorage.getItem("espp_supabase_auth") || localStorage.getItem("espp_admin_session")
      if (!raw) return
      try {
        const parsed = JSON.parse(raw)
        const accessToken = parsed.access_token
        const refreshToken = parsed.refresh_token || ""
        if (accessToken) {
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        }
      } catch { /* ignore */ }
    }
    restore()
  }, [])

  useEffect(() => {
    if (isLoginPage) return

    async function fetchPendingCount() {
      const { count } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
      setPendingCount(count || 0)
    }

    fetchPendingCount()

    const channel = supabase
      .channel('pending-payments-badge')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => {
          fetchPendingCount()
        }
      )
      .subscribe()

    const interval = setInterval(fetchPendingCount, 10000)

    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [isLoginPage])

  async function handleLogout() {
    try {
      await supabase.auth.signOut()
    } finally {
      setSidebarOpen(false)
      router.replace("/")
      router.refresh()
    }
  }

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <AdminRoleProvider>
      <div className="admin-layout">
        <button className="admin-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <LayoutDashboard size={18} />
          <span>Menu</span>
        </button>

        <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
          <nav className="admin-nav">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              const Icon = item.icon
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`admin-nav-item ${isActive ? "active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <span className="admin-nav-icon"><Icon size={18} /></span>
                  <span>{item.label}</span>
                  {item.hasBadge && pendingCount > 0 && (
                    <span className="admin-nav-badge">{pendingCount}</span>
                  )}
                </a>
              )
            })}
          </nav>

          <div className="admin-sidebar-footer">
            <a href="/" className="admin-back-link" style={{ textDecoration: "none", color: "inherit" }}>
              <House size={14} /> Kembali ke Beranda
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="admin-logout-btn"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </aside>

        {sidebarOpen && (
          <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        <main className="admin-main">
          <RoleBanner />
          <nav className="breadcrumb">
            <a href="/admin" className="breadcrumb-link" style={{ textDecoration: "none" }}>Admin</a>
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
    </AdminRoleProvider>
  )
}
