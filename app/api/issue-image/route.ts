// Local-only helper for building issue PDFs: returns a resized JPEG of a site image.
// Chrome stores WebP losslessly inside PDFs, which makes them enormous; JPEG stays small.
// Disabled outside development.
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const REMOTE_HOSTS = ['images.unsplash.com']

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== 'development') return new Response('Not found', { status: 404 })

  const { searchParams } = new URL(request.url)
  const src = searchParams.get('src') ?? ''
  const width = Math.min(2000, Math.max(200, Number(searchParams.get('w')) || 1200))

  let input: Buffer
  if (src.startsWith('/images/') && !src.includes('..')) {
    input = await readFile(path.join(process.cwd(), 'public', src))
  } else {
    let url: URL
    try {
      url = new URL(src)
    } catch {
      return new Response('Bad src', { status: 400 })
    }
    const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : ''
    const allowed = url.protocol === 'https:' && (REMOTE_HOSTS.includes(url.hostname) || (url.hostname === supabase && url.pathname.startsWith('/storage/v1/object/public/')))
    if (!allowed) return new Response('Host not allowed', { status: 400 })
    const res = await fetch(url)
    if (!res.ok) return new Response('Upstream error', { status: 502 })
    input = Buffer.from(await res.arrayBuffer())
  }

  const jpeg = await sharp(input).rotate().resize({ width, withoutEnlargement: true }).flatten({ background: '#ffffff' }).jpeg({ quality: 80, mozjpeg: true }).toBuffer()
  return new Response(new Uint8Array(jpeg), { headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'no-store' } })
}
