import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-session'
import { getCoverImage } from '@/lib/images'
import { storageConfigured } from '@/lib/storage'

interface Props {
  searchParams: Promise<{ q?: string; category?: string; status?: string; deleted?: string }>
}

type Row = {
  id: string
  slug: string
  title: string
  coverImage: string | null
  published: boolean
  featured: boolean
  publishedAt: Date | null
  updatedAt: Date
  category: { name: string } | null
}

export default async function AdminPostsPage({ searchParams }: Props) {
  await requireAdmin()
  const { q = '', category = '', status = '', deleted } = await searchParams

  const where: Record<string, unknown> = {}
  if (q) where.title = { contains: q, mode: 'insensitive' }
  if (category) where.category = { slug: category }
  if (status === 'published') where.published = true
  if (status === 'draft') where.published = false
  if (status === 'featured') where.featured = true

  const [posts, categories, total] = await Promise.all([
    prisma.post.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        coverImage: true,
        published: true,
        featured: true,
        publishedAt: true,
        updatedAt: true,
        category: { select: { name: true } },
      },
      orderBy: { publishedAt: 'desc' },
    }) as Promise<Row[]>,
    prisma.category.findMany({ orderBy: { name: 'asc' } }) as Promise<{ slug: string; name: string }[]>,
    prisma.post.count(),
  ])

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <h1>Posts</h1>
          <p style={{ fontSize: 14, color: 'var(--ms-stone-dk)', marginTop: 6 }}>
            {posts.length === total ? `${total} posts` : `${posts.length} of ${total} posts`}
          </p>
        </div>
        <Link href="/admin/posts/new" className="adm-btn adm-btn--primary">+ New post</Link>
      </div>

      {deleted && <p className="adm-notice" style={{ marginBottom: 20 }}>Post deleted.</p>}
      {!storageConfigured() && (
        <p className="adm-notice adm-notice--error" style={{ marginBottom: 20 }}>
          Image uploads are off: add <code>SUPABASE_SERVICE_ROLE_KEY</code> to .env and restart the server. You can still paste image links.
        </p>
      )}

      <form style={{ display: 'grid', gridTemplateColumns: '1fr 180px 160px auto', gap: 10, marginBottom: 20 }} className="adm-filters">
        <input className="adm-input" name="q" defaultValue={q} placeholder="Search titles…" />
        <select className="adm-input" name="category" defaultValue={category}>
          <option value="">All topics</option>
          {categories.map(c => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <select className="adm-input" name="status" defaultValue={status}>
          <option value="">Any status</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
          <option value="featured">Featured</option>
        </select>
        <button className="adm-btn">Filter</button>
      </form>

      <div className="adm-card">
        {posts.length === 0 && <p style={{ padding: 32, color: 'var(--ms-stone-dk)' }}>No posts match.</p>}
        {posts.map(p => (
          <Link
            key={p.id}
            href={`/admin/posts/${p.id}`}
            className="adm-row"
            style={{
              display: 'grid',
              gridTemplateColumns: '72px 1fr auto',
              gap: 18,
              alignItems: 'center',
              padding: '12px 16px',
              borderBottom: '1px solid var(--ms-rule)',
            }}
          >
            <div style={{ position: 'relative', width: 72, height: 48, background: 'var(--ms-off)', overflow: 'hidden' }}>
              <Image src={getCoverImage(p)} alt="" fill sizes="72px" style={{ objectFit: 'cover' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: 'var(--ms-display)', fontWeight: 700, fontSize: 16, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.title}
              </p>
              <p style={{ fontSize: 12, color: 'var(--ms-stone-dk)', marginTop: 4 }}>
                {p.category?.name ?? 'No topic'} · {p.publishedAt ? format(p.publishedAt, 'd MMM yyyy') : 'No date'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {p.featured && <Badge color="var(--ms-accent)">Featured</Badge>}
              <Badge color={p.published ? 'var(--ms-ink)' : 'var(--ms-stone-dk)'}>{p.published ? 'Published' : 'Draft'}</Badge>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        @media (max-width: 800px) { .adm-filters { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
    </>
  )
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span className="adm-label" style={{ fontSize: 9, color, border: `1px solid ${color}`, padding: '3px 7px', whiteSpace: 'nowrap' }}>
      {children}
    </span>
  )
}
