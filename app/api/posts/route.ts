import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Only what is public on the site already. No author email or internal ids, and
// no article body: read the article at /posts/<slug>.
const publicPost = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  coverImage: true,
  featured: true,
  publishedAt: true,
  author: { select: { name: true, slug: true, avatar: true } },
  category: { select: { name: true, slug: true } },
  tags: { select: { tag: { select: { name: true, slug: true } } } },
} as const

const MAX_LIMIT = 50

function intParam(value: string | null, fallback: number, min: number, max: number) {
  const n = Number.parseInt(value ?? '', 10)
  return Number.isNaN(n) ? fallback : Math.min(max, Math.max(min, n))
}

// GET /api/posts — list published posts with optional filters
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const featured = searchParams.get('featured')
  const limit = intParam(searchParams.get('limit'), 10, 1, MAX_LIMIT)
  const offset = intParam(searchParams.get('offset'), 0, 0, 100_000)

  const where: Record<string, unknown> = { published: true }
  if (category) where.category = { slug: category }
  if (featured === 'true') where.featured = true

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      select: publicPost,
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.post.count({ where }),
  ])

  return NextResponse.json({ posts, total, limit, offset })
}
