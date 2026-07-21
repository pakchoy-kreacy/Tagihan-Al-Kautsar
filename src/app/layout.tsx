import type { Metadata, Viewport } from "next"
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const SITE_NAME = "ESPP MI Nurul Iman"
const TITLE = "Sistem Pembayaran SPP & Tagihan Sekolah | ESPP MI Nurul Iman"
const DESCRIPTION = "Sistem pembayaran SPP dan tagihan sekolah MI Nurul Iman. Wali murid dapat melihat tagihan, melakukan pembayaran secara online, serta memantau riwayat pembayaran dengan mudah, cepat, dan aman."

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1F8F5C",
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  generator: "Next.js",
  keywords: ["SPP", "pembayaran sekolah", "tagihan sekolah", "MI Nurul Iman", "spp online", "ESPP", "pembayaran siswa"],

  icons: [
    { rel: "icon", url: "/favicon.ico", sizes: "any" },
    { rel: "icon", type: "image/png", url: "/icon.png", sizes: "192x192" },
    { rel: "apple-touch-icon", url: "/icon.png" },
  ],

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "Logo ESPP MI Nurul Iman",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/icon.png"],
  },

  alternates: {
    canonical: SITE_URL,
  },

  verification: {
    google: "CZULPC-A-k7S3Md0yJF8xtE8G3wDNRpWloWhSk-Z4cE",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon.png`,
      description: DESCRIPTION,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "id-ID",
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#webapplication`,
      name: SITE_NAME,
      url: SITE_URL,
      applicationCategory: "Educational Application",
      operatingSystem: "Web",
      browserRequirements: "Requires JavaScript",
      offers: { "@type": "Offer", price: "0", priceCurrency: "IDR" },
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`h-full antialiased ${sora.variable} ${jakarta.variable}`}>
      <head>
        <Preconnect />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || 'G-G6WCB1S0W3'}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || 'G-G6WCB1S0W3'}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
        <Script
          id="schema-jsonld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
