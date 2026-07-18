"use client"
import "./admin.css"
import { useState, useEffect, useRef } from "react"

import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { AdminRoleProvider, useAdminRole } from "@/context/AdminRoleContext"
import { LayoutDashboard, Building2, Users, Receipt, ClipboardList, Heart, Settings, LogOut, FileSpreadsheet, Eye, Home } from "lucide-react"
import { usePageRefresh } from "@/hooks/usePageRefresh"

const navItems = [
  { href: "/", label: "Beranda", icon: Home },
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

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Early return BEFORE any other hooks
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  return <AdminShellInner>{children}</AdminShellInner>
}

function AdminShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  return (
    <AdminRoleProvider>
      <AdminShellContent sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} pendingCount={pendingCount} setPendingCount={setPendingCount} router={router} pathname={pathname}>
        {children}
      </AdminShellContent>
    </AdminRoleProvider>
  )
}

function AdminShellContent({ children, sidebarOpen, setSidebarOpen, pendingCount, setPendingCount, router, pathname }: { children: React.ReactNode; sidebarOpen: boolean; setSidebarOpen: (v: boolean) => void; pendingCount: number; setPendingCount: (v: number) => void; router: ReturnType<typeof useRouter>; pathname: string }) {
  const { role, loading } = useAdminRole()
  const [loggingOut, setLoggingOut] = useState(false)
  const loggingOutRef = useRef(false)

  const refreshPendingCount = usePageRefresh(async (isCurrent) => {
    const { count } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
    if (isCurrent()) setPendingCount(count || 0)
  }, { intervalMs: 10000, refreshKey: "pending-payments", enabled: !loading && role !== null })

  useEffect(() => {
    if (loading || !role) return
    const channel = supabase
      .channel('pending-payments-badge')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => { void refreshPendingCount() }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loading, refreshPendingCount, role])

  async function handleLogout() {
    if (loggingOutRef.current) return
    loggingOutRef.current = true
    setLoggingOut(true)
    try {
      await supabase.auth.signOut()
    } catch {
      // Navigation still clears the protected screen if sign-out fails.
    } finally {
      setSidebarOpen(false)
      router.replace("/")
      router.refresh()
    }
  }

  return (
      <div className="admin-layout">
        <button className="admin-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <LayoutDashboard size={18} />
          <span>Menu</span>
        </button>

        <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
          <nav className="admin-nav">
            {navItems.map((item) => {
              const isActive = item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href || pathname.startsWith(item.href + "/")
              const Icon = item.icon
              return (
                <a key={item.href} href={item.href}
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
            <button type="button" onClick={handleLogout} className="admin-logout-btn" disabled={loggingOut}>
              <LogOut size={16} /> {loggingOut ? "Memuat..." : "Logout"}
            </button>
          </div>
        </aside>

        {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}

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
  )
}
