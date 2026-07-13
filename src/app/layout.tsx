import type { Metadata } from "next"
import Script from "next/script"
import { Sora, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { ToastProvider } from "@/components/Toast"
import { SchoolSettingsProvider } from "@/components/SchoolSettingsProvider"
import { Preconnect } from "@/components/Preconnect"
import { NavBar } from "@/components/NavBar"

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: "ESPP MI Nurul Iman",
  description: "Sistem pembayaran siswa MI Nurul Iman yang sederhana, cepat, dan mudah dipakai orang tua.",
  icons: [
    {
      rel: "icon",
      type: "image/png",
      url: "/icon.png",
    },
  ],
  openGraph: {
    title: "ESPP MI Nurul Iman",
    description: "Sistem pembayaran siswa MI Nurul Iman yang sederhana, cepat, dan mudah dipakai orang tua.",
    images: ["/icon.png"],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "ESPP MI Nurul Iman",
    description: "Sistem pembayaran siswa MI Nurul Iman yang sederhana, cepat, dan mudah dipakai orang tua.",
    images: ["/icon.png"],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`h-full antialiased ${sora.variable} ${jakarta.variable}`}>
      <head>
        <Preconnect />
        <Script id="chunk-error-handler" strategy="beforeInteractive">{`
          (function() {
            var done = false;
            function reload() {
              if (done) return;
              done = true;
              window.location.reload();
            }
            window.addEventListener('error', function(e) {
              var msg = e && e.message ? e.message : '';
              if (msg.indexOf('Failed to load chunk') !== -1 || msg.indexOf('Loading chunk') !== -1) {
                setTimeout(reload, 300);
              }
            }, true);
            window.addEventListener('unhandledrejection', function(e) {
              var msg = e && e.reason && e.reason.message ? e.reason.message : '';
              if (msg.indexOf('Failed to load chunk') !== -1 || msg.indexOf('Loading chunk') !== -1) {
                setTimeout(reload, 300);
              }
            }, true);
          })();
        `}</Script>
      </head>
      <body className="min-h-full" suppressHydrationWarning>
        <SchoolSettingsProvider>
          <NavBar />
          <ToastProvider>
            {children}
          </ToastProvider>
        </SchoolSettingsProvider>
      </body>
    </html>
  )
}
