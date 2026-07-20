"use client"

import Image from "next/image"

import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu } from "lucide-react"
import { useSchoolSettings } from "@/components/SchoolSettingsProvider"
import { supabase } from "@/lib/supabase"

export function NavBar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { settings } = useSchoolSettings()

  const isDemo = pathname.startsWith("/demo")
  const schoolName = isDemo ? "Sekolah Demo" : (settings?.nama_sekolah || "MI Nurul Iman")
  const logoUrl = isDemo ? null : settings?.logo_url

  async function handleAdminClick(e: React.MouseEvent) {
    e.preventDefault()
    const { data: { session } } = await supabase.auth.getSession()
    window.location.href = session ? "/admin" : "/admin/login"
  }

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
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/" className={`app-nav-link ${pathname === "/" ? "active" : ""}`} onClick={() => setOpen(false)} style={{ textDecoration: "none" }}>
          Beranda
        </a>
        {!pathname.startsWith("/admin/login") && (
          <a
            href="#"
            className={`app-nav-link ${pathname.startsWith("/admin") ? "active" : ""}`}
            onClick={(e) => {
              handleAdminClick(e)
              setOpen(false)
            }}
            style={{ textDecoration: "none" }}
          >
            Admin
          </a>
        )}
      </div>
    </nav>
  )
}
