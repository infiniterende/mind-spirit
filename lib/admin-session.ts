// Server-side session checks for admin pages, server actions and route handlers.
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SESSION_COOKIE, verifySessionToken } from './admin-auth'

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  return verifySessionToken(token)
}

// Call at the top of every admin page and server action.
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect('/admin/login')
}
