'use client'

import { usePathname } from 'next/navigation'

// Keeps the public masthead and footer out of the CMS screens and the print edition.
export function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const path = usePathname() ?? ''
  return path.startsWith('/admin') || path.startsWith('/issue/') ? null : <>{children}</>
}
