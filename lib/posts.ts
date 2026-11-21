import { prisma } from './prisma'

// These types mirror what Prisma generates — they match schema.prisma exactly
export type Author = {
  id: string
  name: string
  bio: string | null
  avatar: string | null
  slug: string
  email: string | null
  createdAt: Date
  updatedAt: Date
}

export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  createdAt: Date
}

export type Tag = {
  id: string
  name: string
  slug: string
}

export type Post = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  featured: boolean
  published: boolean
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
  authorId: string
  categoryId: string | null
}

export type PostWithRelations = Post & {
  author: Author
  category: Category | null
  tags: { tag: Tag }[]
}

const postInclude = {
  author: true,
  category: true,
  tags: { include: { tag: true } },
} as const

export async function getFeaturedPosts(limit = 3): Promise<PostWithRelations[]> {
  return prisma.post.findMany({
    where: { published: true, featured: true },
    include: postInclude,
    orderBy: { publishedAt: 'desc' },
    take: limit,
  }) as Promise<PostWithRelations[]>
}

// The homepage cover story is the published post carrying this tag (set with the
// "Cover story" checkbox in the CMS). Without one, the newest featured post is used.
export const COVER_TAG = 'cover-story'

export async function getCoverStory(): Promise<PostWithRelations | null> {
  return prisma.post.findFirst({
    where: { published: true, tags: { some: { tag: { slug: COVER_TAG } } } },
    include: postInclude,
    orderBy: { publishedAt: 'desc' },
  }) as Promise<PostWithRelations | null>
}

// A monthly issue: every post published that month, cover story first, then newest first.
// Months with fewer than MIN_ISSUE_POSTS fall back to the five newest featured posts plus the
// four newest others as of the end of that month (the original line-up rule).
export const MIN_ISSUE_POSTS = 4

export async function getIssuePosts(year: number, month: number): Promise<PostWithRelations[]> {
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 1)
  const inMonth = (await prisma.post.findMany({
    where: { published: true, publishedAt: { gte: start, lt: end } },
    include: postInclude,
    orderBy: { publishedAt: 'desc' },
  })) as PostWithRelations[]

  if (inMonth.length >= MIN_ISSUE_POSTS) {
    const isCover = (p: PostWithRelations) => p.tags.some(t => t.tag.slug === COVER_TAG)
    return [...inMonth.filter(isCover), ...inMonth.filter(p => !isCover(p))]
  }

  const featured = (await prisma.post.findMany({
    where: { published: true, featured: true, publishedAt: { lt: end } },
    include: postInclude,
    orderBy: { publishedAt: 'desc' },
    take: 5,
  })) as PostWithRelations[]
  const latest = (await prisma.post.findMany({
    where: { published: true, publishedAt: { lt: end }, id: { notIn: featured.map(p => p.id) } },
    include: postInclude,
    orderBy: { publishedAt: 'desc' },
    take: 4,
  })) as PostWithRelations[]
  return [...featured, ...latest]
}

export async function getRecentPosts(limit = 6): Promise<PostWithRelations[]> {
  return prisma.post.findMany({
    where: { published: true },
    include: postInclude,
    orderBy: { publishedAt: 'desc' },
    take: limit,
  }) as Promise<PostWithRelations[]>
}

export async function getPostBySlug(slug: string): Promise<PostWithRelations | null> {
  return prisma.post.findUnique({
    where: { slug, published: true },
    include: postInclude,
  }) as Promise<PostWithRelations | null>
}

export async function getPostsByCategory(categorySlug: string, limit = 10): Promise<PostWithRelations[]> {
  return prisma.post.findMany({
    where: {
      published: true,
      category: { slug: categorySlug },
    },
    include: postInclude,
    orderBy: { publishedAt: 'desc' },
    take: limit,
  }) as Promise<PostWithRelations[]>
}

export async function getAllPublishedSlugs(): Promise<string[]> {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true },
  })
  return posts.map((p: { slug: string }) => p.slug)
}

export type CategoryWithCount = Category & { _count: { posts: number } }

export async function getCategories(): Promise<CategoryWithCount[]> {
  return prisma.category.findMany({
    include: { _count: { select: { posts: { where: { published: true } } } } },
    orderBy: { name: 'asc' },
  }) as Promise<CategoryWithCount[]>
}
