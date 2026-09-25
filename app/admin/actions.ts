'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { SESSION_COOKIE, SESSION_DAYS, adminConfigured, checkPassword, createSessionToken } from '@/lib/admin-auth'
import { requireAdmin } from '@/lib/admin-session'

export type FormState = { error?: string; ok?: string } | undefined

// ── Session ──────────────────────────────────────────────────────

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  if (!adminConfigured()) return { error: 'Set ADMIN_PASSWORD (at least 8 characters) in .env, then restart the server.' }
  const ok = await checkPassword(String(formData.get('password') ?? ''))
  if (!ok) {
    await new Promise(r => setTimeout(r, 800)) // slow down guessing
    return { error: 'That password is not right.' }
  }
  ;(await cookies()).set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  })
  redirect('/admin')
}

export async function logout() {
  ;(await cookies()).delete(SESSION_COOKIE)
  redirect('/admin/login')
}

// ── Posts ────────────────────────────────────────────────────────

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// Hosts next/image is configured for (see next.config.ts)
function allowedImage(src: string): boolean {
  if (src.startsWith('/') && !src.startsWith('//')) return true
  try {
    const { protocol, hostname, pathname } = new URL(src)
    const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : ''
    return protocol === 'https:' && (hostname === 'images.unsplash.com' || (hostname === supabase && pathname.startsWith('/storage/v1/object/public/')))
  } catch {
    return false
  }
}

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim()
}

export async function savePost(_: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()

  const id = text(formData, 'id')
  const title = text(formData, 'title')
  const slug = slugify(text(formData, 'slug') || title)
  const content = String(formData.get('content') ?? '')
  const categoryId = text(formData, 'categoryId') || null
  const coverImage = text(formData, 'coverImage') || null
  const date = text(formData, 'publishedAt')

  if (!title) return { error: 'Add a title.' }
  if (!slug) return { error: 'Add a URL slug (letters and numbers).' }
  if (coverImage && !allowedImage(coverImage)) {
    return { error: 'Cover images must be uploaded here or linked from images.unsplash.com.' }
  }

  const data = {
    title,
    slug,
    excerpt: text(formData, 'excerpt') || null,
    content,
    coverImage,
    categoryId,
    published: formData.get('published') === 'on',
    featured: formData.get('featured') === 'on',
    publishedAt: date ? new Date(`${date}T12:00:00`) : new Date(),
  }

  const clash = await prisma.post.findUnique({ where: { slug }, select: { id: true } })
  if (clash && clash.id !== id) return { error: `Another post already uses the URL “${slug}”. Choose a different slug.` }

  let savedId = id
  if (id) {
    await prisma.post.update({ where: { id }, data })
  } else {
    const author = (await prisma.author.findUnique({ where: { slug: 'shirley-xu' } })) ?? (await prisma.author.findFirst())
    if (!author) return { error: 'No author exists yet. Run the database seed first.' }
    const created = await prisma.post.create({ data: { ...data, authorId: author.id } })
    savedId = created.id
  }

  revalidatePath('/', 'layout')
  redirect(`/admin/posts/${savedId}?saved=1`)
}

export async function deletePost(formData: FormData) {
  await requireAdmin()
  const id = text(formData, 'id')
  if (id) {
    await prisma.post.delete({ where: { id } })
    revalidatePath('/', 'layout')
  }
  redirect('/admin?deleted=1')
}
