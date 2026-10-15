import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ServiceWorker } from '@/components/ServiceWorker'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  applicationName: 'THE 14',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'THE 14',
  },
  title: 'THE 14',
  description: 'Kwani me hudoo!!',
  icons: {
    icon: [{ url: '/favicon.png', sizes: '64x64', type: 'image/png' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#1c1917',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        {children}
        <ServiceWorker />
      </body>
    </html>
  )
}
