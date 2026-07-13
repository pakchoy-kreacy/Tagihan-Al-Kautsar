"use client"

import Image from "next/image"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu } from "lucide-react"
import { useSchoolSettings } from "@/components/SchoolSettingsProvider"
import { supabase } from "@/lib/supabase"

export function NavBar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [hasAdminSession, setHasAdminSession] = useState(false)
  const { settings } = useSchoolSettings()

  const isDemo = pathname.startsWith("/demo")
  const schoolName = isDemo ? "Sekolah Demo" : (settings?.nama_sekolah || "MI Nurul Iman")
  const logoUrl = isDemo ? null : settings?.logo_url

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) setHasAdminSession(!!session?.user?.email)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setHasAdminSession(!!session?.user?.email)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const links = [
    { href: "/", label: "Beranda" },
    ...(hasAdminSession && !pathname.startsWith("/admin/login") ? [{ href: "/admin", label: "Admin" }] : []),
  ]

  return (
    <nav className="app-nav rub-el-hizb">
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/" className="app-nav-brand" onClick={() => setOpen(false)} style={{ textDecoration: "none", color: "inherit" }}>
        {logoUrl ? (
          <Image src={logoUrl} alt={schoolName} width={36} height={36} style={{ borderRadius: "50%", objectFit: "cover" }} />
        ) : (
          <span className="logo">{schoolName.charAt(0)}</span>
        )}
        <span>ESPP MI</span>
      </a>

      <button
        type="button"
        className="app-nav-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Menu navigasi"
        aria-expanded={open}
      >
        <Menu size={22} />
      </button>

      <div className={`app-nav-links ${open ? "open" : ""}`}>
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`app-nav-link ${pathname === link.href ? "active" : ""}`}
            onClick={() => setOpen(false)}
            style={{ textDecoration: "none" }}
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
