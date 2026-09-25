import type { Metadata } from 'next'
import './globals.css'
import { Masthead } from '@/components/Masthead'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: {
    default: 'Mind & Spirit',
    template: '%s | Mind & Spirit',
  },
  description: 'A magazine for faith, wellness, creative writing, and illustration.',
  openGraph: {
    siteName: 'Mind & Spirit',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Masthead />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
