import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { getPostBySlug, getAllPublishedSlugs, getRecentPosts } from '@/lib/posts'
import { PostCard } from '@/components/PostCard'
import { NewsletterForm } from '@/components/NewsletterForm'
import { getCoverImage } from '@/lib/images'
import { MarkdownBody } from '@/components/MarkdownBody'
import type { Metadata } from 'next'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs()
  return slugs.map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author.name],
    },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const [post, relatedPosts] = await Promise.all([
    getPostBySlug(slug),
    getRecentPosts(3),
  ])

  if (!post) notFound()

  // The title is shown in the header, so drop a leading "# Title" line from the body
  const body = post.content.replace(/^# .*\n+/, '')

  const related = relatedPosts.filter((p: { id: string }) => p.id !== post.id).slice(0, 3)

  return (
    <>
      {/* ── Article Header ───────────────────────────────── */}
      <header
        style={{
          maxWidth: 760,
          margin: '0 auto',
          padding: '64px 24px 48px',
          textAlign: 'center',
        }}
      >
        {/* Category breadcrumb */}
        {post.category && (
          <Link
            href={`/categories/${post.category.slug}`}
            style={{
              fontFamily: 'var(--ms-body)',
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: 'var(--ms-stone-dk)',
              display: 'inline-block',
              marginBottom: 16,
            }}
          >
            {post.category.name}
          </Link>
        )}

        {/* Title */}
        <h1
          style={{
            fontFamily: 'var(--ms-display)',
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
            color: 'var(--ms-ink)',
            marginBottom: 20,
          }}
        >
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p
            style={{
              fontFamily: 'var(--ms-display)',
              fontSize: 18,
              fontStyle: 'italic',
              fontWeight: 400,
              color: 'var(--ms-ink-soft)',
              lineHeight: 1.5,
              maxWidth: 560,
              margin: '0 auto 28px',
            }}
          >
            {post.excerpt}
          </p>
        )}

        {/* Byline */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--ms-body)',
              fontSize: 11,
              color: 'var(--ms-stone-dk)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {post.author.name}
          </span>
          <span style={{ color: 'var(--ms-stone)' }}>·</span>
          <time
            dateTime={post.publishedAt?.toISOString()}
            style={{
              fontFamily: 'var(--ms-body)',
              fontSize: 11,
              color: 'var(--ms-stone)',
              letterSpacing: '0.06em',
            }}
          >
            {post.publishedAt ? format(post.publishedAt, 'MMMM d, yyyy') : ''}
          </time>
        </div>
      </header>

      {/* ── Hero Image area ──────────────────────────────── */}
      <div
        style={{
          background: 'var(--ms-off)',
          aspectRatio: '21/7',
          maxHeight: 480,
          width: '100%',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Image
          src={getCoverImage(post)}
          alt={post.title}
          fill
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
          style={{ objectFit: 'cover' }}
        />
      </div>

      {/* ── Article Body ─────────────────────────────────── */}
      <article
        className="prose-editorial"
        style={{ padding: '60px 24px 80px' }}
      >
        <MarkdownBody source={body} />
      </article>

      {/* ── Tags ─────────────────────────────────────────── */}
      {post.tags.length > 0 && (
        <div
          style={{
            maxWidth: 680,
            margin: '0 auto',
            padding: '0 24px 48px',
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          {post.tags.map(({ tag }: { tag: { id: string; name: string } }) => (
            <span
              key={tag.id}
              style={{
                fontFamily: 'var(--ms-body)',
                fontSize: 9,
                fontWeight: 500,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--ms-stone-dk)',
                border: '1px solid var(--ms-rule)',
                padding: '4px 10px',
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* ── Author Bio ───────────────────────────────────── */}
      <div
        style={{
          maxWidth: 680,
          margin: '0 auto',
          padding: '0 24px 64px',
          borderTop: '1px solid var(--ms-rule)',
          paddingTop: 32,
          display: 'flex',
          gap: 20,
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'var(--ms-stone)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontFamily: 'var(--ms-display)', fontSize: 20, fontWeight: 700, color: 'var(--ms-white)' }}>
            {post.author.name.charAt(0)}
          </span>
        </div>
        <div>
          <p
            style={{
              fontFamily: 'var(--ms-body)',
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--ms-stone-dk)',
              marginBottom: 6,
            }}
          >
            {post.author.name}
          </p>
          {post.author.bio && (
            <p style={{ fontFamily: 'var(--ms-body)', fontSize: 13, color: 'var(--ms-ink-soft)', lineHeight: 1.7 }}>
              {post.author.bio}
            </p>
          )}
        </div>
      </div>

      {/* ── Related Posts ────────────────────────────────── */}
      {related.length > 0 && (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              padding: '0 48px',
              background: 'var(--ms-off)',
              paddingTop: 40,
            }}
          >
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--ms-rule)' }} />
            <span
              style={{
                fontFamily: 'var(--ms-body)',
                fontSize: 9,
                fontWeight: 500,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: 'var(--ms-stone-dk)',
                whiteSpace: 'nowrap',
              }}
            >
              Continue Reading
            </span>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--ms-rule)' }} />
          </div>

          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 2,
              padding: '16px 48px 64px',
              background: 'var(--ms-off)',
            }}
            className="related-grid"
          >
            {related.map((p: { id: string } & Parameters<typeof PostCard>[0]['post']) => (
              <PostCard key={p.id} post={p} />
            ))}
          </section>
        </>
      )}

      {/* ── Newsletter ───────────────────────────────────── */}
      <NewsletterForm />

      <style>{`
        @media (max-width: 768px) {
          .related-grid { grid-template-columns: 1fr !important; padding: 16px 16px 48px !important; }
        }
      `}</style>
    </>
  )
}
