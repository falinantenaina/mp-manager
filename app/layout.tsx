import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SessionProviderWrapper } from '@/components/SessionProviderWrapper'
import { SWRegister } from '@/components/SWRegister'

export const metadata: Metadata = {
  title: 'FB MP Manager',
  description: 'Gestion des messages Facebook',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'FB MP' },
}

export const viewport: Viewport = {
  themeColor: '#1877f2',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <SessionProviderWrapper>
          <SWRegister />
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  )
}
