import type { Metadata } from 'next'
import './globals.css'
import { Masthead } from '@/components/Masthead'
import { Footer } from '@/components/Footer'
import { HideOnAdmin } from '@/components/HideOnAdmin'

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
        <HideOnAdmin>
          <Masthead />
        </HideOnAdmin>
        <main>{children}</main>
        <HideOnAdmin>
          <Footer />
        </HideOnAdmin>
      </body>
    </html>
  )
}
