import type { Metadata, Viewport } from 'next'
import './globals.css'
import './workspace.css'
import { SiteExperience } from '@/components/layout/SiteExperience'

export const metadata: Metadata = {
  title: 'uwbelieve',
  description:
    'Premium electronic music label with transparent distribution, promo support, and direct artist feedback.',
  openGraph: {
    title: 'uwbelieve',
    description:
      'Premium electronic music label with transparent distribution and optional promotion.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#04060E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var workspaceTheme=localStorage.getItem('nothing-workspace-theme');if(workspaceTheme==='light'||workspaceTheme==='dark')document.documentElement.dataset.workspaceTheme=workspaceTheme}catch(e){}",
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SiteExperience>{children}</SiteExperience>
      </body>
    </html>
  )
}
