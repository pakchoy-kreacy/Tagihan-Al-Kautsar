"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

export function NavBar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const links = [
    { href: "/", label: "Beranda" },
    { href: "/infaq", label: "Infaq" },
    { href: "/admin", label: "Admin" },
  ]

  return (
    <nav className="app-nav">
      <Link href="/" className="app-nav-brand" onClick={() => setOpen(false)}>
        <span className="logo">MI</span>
        <span>MI Nurul Iman</span>
      </Link>

      <button
        type="button"
        className="app-nav-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
        aria-expanded={open}
      >
        Menu
      </button>

      <div className={`app-nav-links ${open ? "open" : ""}`}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`app-nav-link ${pathname === link.href ? "active" : ""}`}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
