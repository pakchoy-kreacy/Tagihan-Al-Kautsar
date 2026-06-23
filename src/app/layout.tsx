import type { Metadata } from "next"
import { Sora, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { ToastProvider } from "@/components/Toast"

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
  title: "Sistem Pembayaran MI Nurul Iman",
  description: "Sistem Informasi Tagihan Siswa MI Nurul Iman Kabo Jaya",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`h-full antialiased ${sora.variable} ${jakarta.variable}`}>
      <body className="min-h-full">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
