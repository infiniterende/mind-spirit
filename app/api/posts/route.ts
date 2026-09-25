import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/posts — list published posts with optional filters
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const featured = searchParams.get('featured')
  const limit = parseInt(searchParams.get('limit') ?? '10', 10)
  const offset = parseInt(searchParams.get('offset') ?? '0', 10)

  const where: Record<string, unknown> = { published: true }
  if (category) where.category = { slug: category }
  if (featured === 'true') where.featured = true

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: true,
        category: true,
        tags: { include: { tag: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.post.count({ where }),
  ])

  return NextResponse.json({ posts, total, limit, offset })
}
