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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="grain-overlay" aria-hidden="true" />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  )
}
