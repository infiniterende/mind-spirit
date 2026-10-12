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

// Bodoni Moda (masthead), Playfair Display (headlines), Cormorant Garamond (serif text),
// DM Sans (body) and Corinthia (script)
const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=Corinthia:wght@400;700&display=swap'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTS_URL} />
      </head>
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
