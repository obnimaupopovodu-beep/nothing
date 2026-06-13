import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SmoothScroll } from '@/components/layout/SmoothScroll'

export const metadata: Metadata = {
  title: 'AURORA — Electronic Music Label',
  description: 'Electronic music label and creative collective. Music / Culture / Frequency.',
  openGraph: {
    title: 'AURORA',
    description: 'Electronic music label and creative collective.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className="grain-overlay" aria-hidden="true" />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  )
}
