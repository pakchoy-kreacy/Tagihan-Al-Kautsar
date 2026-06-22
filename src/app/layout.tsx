import type { Metadata } from "next"
import "./globals.css"
import { ToastProvider } from "@/components/Toast"

export const metadata: Metadata = {
  title: "Sistem Pembayaran MI Nurul Iman",
  description: "Sistem Informasi Tagihan Siswa MI Nurul Iman Kabo Jaya",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
