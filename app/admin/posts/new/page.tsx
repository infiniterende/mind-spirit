import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-session'
import { storageConfigured } from '@/lib/storage'
import { PostEditor } from '@/components/admin/PostEditor'

export default async function NewPostPage() {
  await requireAdmin()
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } })

  return (
    <PostEditor
      categories={categories}
      uploadsEnabled={storageConfigured()}
      post={{
        id: '',
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        coverImage: '',
        categoryId: '',
        published: false,
        featured: false,
        publishedAt: new Date().toISOString().slice(0, 10),
      }}
    />
  )
}
