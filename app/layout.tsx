import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SmoothScroll } from '@/components/layout/SmoothScroll'

export const metadata: Metadata = {
  title: 'Nothing Records',
  description:
    'Premium electronic music label with transparent distribution, promo support, and direct artist feedback.',
  openGraph: {
    title: 'Nothing Records',
    description:
      'Premium electronic music label with transparent distribution and optional promotion.',
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
