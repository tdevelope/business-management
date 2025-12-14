import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { QueryProvider } from "@/providers/QueryProvider"
import { SessionProvider } from "@/components/SessionProvider"
import { Navbar } from "@/components/Navbar"

export const metadata: Metadata = {
  title: "BookingPro - מערכת ניהול עסקים",
  description: "מערכת הזמנות מקצועית לניהול עסקים",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="font-sans antialiased">
        <QueryProvider>
          <SessionProvider>
            <Navbar />
            <main>{children}</main>
            <Toaster />
          </SessionProvider>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  )
}
