'use client'

import { usePathname } from 'next/navigation'

// Keeps the public masthead and footer out of the CMS screens.
export function HideOnAdmin({ children }: { children: React.ReactNode }) {
  return usePathname()?.startsWith('/admin') ? null : <>{children}</>
}
