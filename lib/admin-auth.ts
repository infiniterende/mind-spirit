// Single-password admin sessions for the CMS.
// The session cookie is "<expiry>.<hmac>", signed with ADMIN_PASSWORD, so changing
// the password signs everyone out. Uses Web Crypto so it also runs in proxy.ts.

export const SESSION_COOKIE = 'ms_admin'
export const SESSION_DAYS = 14

const encoder = new TextEncoder()

function secret(): string | null {
  const pw = process.env.ADMIN_PASSWORD
  return pw && pw.length >= 8 ? pw : null
}

export function adminConfigured(): boolean {
  return secret() !== null
}

async function hmac(message: string, key: string): Promise<string> {
  const k = await crypto.subtle.importKey('raw', encoder.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', k, encoder.encode(message))
  return Array.from(new Uint8Array(sig), b => b.toString(16).padStart(2, '0')).join('')
}

// Constant-time string comparison
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function checkPassword(attempt: string): Promise<boolean> {
  const key = secret()
  if (!key) return false
  // Compare digests so timing doesn't leak the password length
  const [a, b] = await Promise.all([hmac(attempt, 'pw-check'), hmac(key, 'pw-check')])
  return safeEqual(a, b)
}

export async function createSessionToken(): Promise<string> {
  const key = secret()
  if (!key) throw new Error('ADMIN_PASSWORD is not set')
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
  return `${expires}.${await hmac(String(expires), key)}`
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  const key = secret()
  if (!key || !token) return false
  const [expires, sig] = token.split('.')
  if (!expires || !sig || Number(expires) < Date.now()) return false
  return safeEqual(sig, await hmac(expires, key))
}
