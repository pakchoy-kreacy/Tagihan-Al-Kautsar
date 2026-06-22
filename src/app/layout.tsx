import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Sistem Pembayaran MI Nurul Iman",
  description: "Sistem Informasi Tagihan Siswa MI Nurul Iman Kabo Jaya",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col items-center p-4 sm:p-8">{children}</body>
    </html>
  )
}
