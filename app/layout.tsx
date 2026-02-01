import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Auto Tycoon - Car Corporation Manager',
  description: 'Build your automotive empire from 1950s to modern era. Design cars, research technologies, manage factories and dealerships.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a1a2e',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pl">
      <body className={`font-sans antialiased min-h-screen relative`}>
        {/* Background Layer - Z-0 */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/auto-tycoon-2026/images/background.jpg')] bg-cover bg-center bg-fixed" />
          <div className="absolute inset-0 bg-black/93" />
        </div>

        {/* Content Layer - Z-10 - Must be relative to sit on top */}
        <div className="relative z-10">
          {children}
        </div>

        <Analytics />
      </body>
    </html>
  )
}
