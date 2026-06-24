"use client"
import "./admin.css"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getSchoolSettings, type SchoolSettings } from "@/lib/infaq-db"
import { LayoutDashboard, Building2, Users, Receipt, ClipboardList, Heart, Settings, LogOut, House } from "lucide-react"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/siswa", label: "Siswa", icon: Users },
  { href: "/admin/kelas", label: "Kelas", icon: Building2 },
  { href: "/admin/tagihan", label: "Kelola Tagihan", icon: Receipt },
  { href: "/admin/verifikasi", label: "Verifikasi", icon: ClipboardList, hasBadge: true },
  { href: "/admin/infaq", label: "Infaq", icon: Heart },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [authChecked, setAuthChecked] = useState(false)
  const [isLoginPage, setIsLoginPage] = useState(false)
  const [settings, setSettings] = useState<SchoolSettings | null>(null)

  useEffect(() => {
    getSchoolSettings().then(setSettings)
  }, [])

  useEffect(() => {
    setIsLoginPage(pathname === "/admin/login")

    if (pathname === "/admin/login") {
      setAuthChecked(true)
      return
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session && pathname !== "/admin/login") {
        router.replace("/admin/login")
      }
      setAuthChecked(true)
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && pathname !== "/admin/login") {
        router.replace("/admin/login")
      }
      setAuthChecked(true)
    })

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    async function fetchPendingCount() {
      const { count } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
      setPendingCount(count || 0)
    }
    fetchPendingCount()
    const interval = setInterval(fetchPendingCount, 30000)
    return () => clearInterval(interval)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  // Halaman login tidak perlu sidebar admin
  if (isLoginPage) {
    return <>{children}</>
  }

  // Tampilkan loading saat mengecek autentikasi
  if (!authChecked) {
    return (
      <div className="admin-layout" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div className="loading-text">Memuat...</div>
      </div>
    )
  }

  return (
    <div className="admin-layout">
      <button className="admin-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <LayoutDashboard size={18} />
        <span>Menu</span>
      </button>

      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar-header">
          {settings?.logo_url ? (
            <div className="admin-sidebar-logo">
              <Image src={settings.logo_url} alt="Logo" width={40} height={40} style={{ borderRadius: "50%", objectFit: "cover" }} />
            </div>
          ) : (
            <div className="admin-sidebar-logo">MI</div>
          )}
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
                {item.hasBadge && pendingCount > 0 && (
                  <span className="admin-nav-badge">{pendingCount}</span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Link href="/" className="admin-back-link">
            <House size={14} /> Kembali ke Beranda
          </Link>
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
