import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"

import { AppProviders } from "@/components/providers/app-providers"

import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
})

export const metadata: Metadata = {
  title: "PCP Baterias",
  description: "Sistema de gestão de produção de baterias",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PCP Baterias"
  }
}

export const viewport: Viewport = {
  themeColor: "#007AFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover"
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
