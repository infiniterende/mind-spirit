import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-session'
import { storageConfigured } from '@/lib/storage'
import { PostEditor } from '@/components/admin/PostEditor'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string }>
}

export default async function EditPostPage({ params, searchParams }: Props) {
  await requireAdmin()
  const { id } = await params
  const { saved } = await searchParams

  const [post, categories] = await Promise.all([
    prisma.post.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])
  if (!post) notFound()

  return (
    <PostEditor
      key={post.updatedAt.toISOString()}
      categories={categories}
      uploadsEnabled={storageConfigured()}
      justSaved={saved === '1'}
      post={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? '',
        content: post.content,
        coverImage: post.coverImage ?? '',
        categoryId: post.categoryId ?? '',
        published: post.published,
        featured: post.featured,
        publishedAt: (post.publishedAt ?? post.createdAt).toISOString().slice(0, 10),
      }}
    />
  )
}
