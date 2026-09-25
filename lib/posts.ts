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
