import type { Metadata } from "next"
import { Sora, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { ToastProvider } from "@/components/Toast"
import { FaviconSetter } from "@/components/FaviconSetter"

const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-heading",
  display: "swap",
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
})

export const metadata: Metadata = {
  title: "ESPP MI Nurul Iman",
  description: "Sistem pembayaran siswa MI Nurul Iman yang sederhana, cepat, dan mudah dipakai orang tua.",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`h-full antialiased ${sora.variable} ${jakarta.variable}`}>
      <body className="min-h-full">
        <ToastProvider>
          <FaviconSetter />
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
