"use client"

import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu } from "lucide-react"
import { useSchoolSettings } from "@/components/SchoolSettingsProvider"

export function NavBar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { settings } = useSchoolSettings()

  const schoolName = settings?.nama_sekolah || "MI Nurul Iman"
  const logoUrl = settings?.logo_url

  const links = [
    { href: "/", label: "Beranda" },
    { href: "/admin", label: "Admin" },
  ]

  return (
    <nav className="app-nav rub-el-hizb">
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
