"use client"

import { MessageCircleWarning, Phone } from "lucide-react"
import { usePathname } from "next/navigation"

export function ContactAduan() {
  const pathname = usePathname()

  if (pathname.startsWith("/admin")) return null

  const phoneNumber = "6282221941424"
  const message = encodeURIComponent("Halo, saya ingin menyampaikan aduan terkait ESPP MI Nurul Iman.")
  const href = `https://wa.me/${phoneNumber}?text=${message}`

  return (
    <div className="contact-aduan-wrap">
      <div className="contact-aduan-card">
        <div className="contact-aduan-copy">
          <div className="contact-aduan-title">
            <MessageCircleWarning size={18} />
            Kontak Aduan
          </div>
          <p className="contact-aduan-text">
            Untuk laporan atau aduan, silakan hubungi WhatsApp admin.
          </p>
        </div>
        <a className="contact-aduan-btn" href={href} target="_blank" rel="noopener noreferrer">
          <Phone size={16} />
          WhatsApp 082221941424
        </a>
      </div>
    </div>
  )
}
