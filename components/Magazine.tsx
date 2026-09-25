import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import type { PostWithRelations } from '@/lib/posts'
import { getCoverImage } from '@/lib/images'

// Building blocks for the magazine-style homepage.

export function readingMinutes(post: PostWithRelations): number {
  return Math.max(1, Math.round(post.content.split(/\s+/).length / 230))
}

export function Kicker({ post, light = false }: { post: PostWithRelations; light?: boolean }) {
  if (!post.category) return null
  return (
    <Link
      href={`/categories/${post.category.slug}`}
      style={{
        fontFamily: 'var(--ms-body)',
        fontSize: 9,
        fontWeight: 500,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: light ? 'var(--ms-stone)' : 'var(--ms-stone-dk)',
        display: 'inline-block',
        marginBottom: 10,
      }}
    >
      {post.category.name}
    </Link>
  )
}

export function Byline({ post, light = false }: { post: PostWithRelations; light?: boolean }) {
  return (
    <p
      style={{
        fontFamily: 'var(--ms-body)',
        fontSize: 11,
        letterSpacing: '0.04em',
        color: light ? 'var(--ms-stone)' : 'var(--ms-stone-dk)',
      }}
    >
      {post.publishedAt ? format(post.publishedAt, 'MMMM d, yyyy') : ''} · {readingMinutes(post)} min read
    </p>
  )
}

export function Headline({
  post,
  size,
  weight = 700,
  light = false,
  italic = false,
}: {
  post: PostWithRelations
  size: string | number
  weight?: number
  light?: boolean
  italic?: boolean
}) {
  return (
    <Link href={`/posts/${post.slug}`} className="mag-headline">
      <h3
        style={{
          fontFamily: 'var(--ms-display)',
          fontSize: size,
          fontWeight: weight,
          fontStyle: italic ? 'italic' : 'normal',
          lineHeight: 1.15,
          letterSpacing: '-0.01em',
          color: light ? 'var(--ms-white)' : 'var(--ms-ink)',
          marginBottom: 10,
        }}
      >
        {post.title}
      </h3>
    </Link>
  )
}

export function Cover({
  post,
  ratio = '4/3',
  sizes,
  priority = false,
}: {
  post: PostWithRelations
  ratio?: string
  sizes: string
  priority?: boolean
}) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="mag-cover"
      style={{ display: 'block', position: 'relative', aspectRatio: ratio, overflow: 'hidden', background: 'var(--ms-off)' }}
    >
      <Image
        src={getCoverImage(post)}
        alt=""
        fill
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        style={{ objectFit: 'cover', transition: 'transform 0.7s ease' }}
      />
    </Link>
  )
}

export function Dek({ post, size = 14, light = false, lines }: { post: PostWithRelations; size?: number; light?: boolean; lines?: number }) {
  if (!post.excerpt) return null
  return (
    <p
      style={{
        fontFamily: 'var(--ms-body)',
        fontSize: size,
        lineHeight: 1.7,
        color: light ? 'var(--ms-stone)' : 'var(--ms-ink-soft)',
        marginBottom: 12,
        ...(lines
          ? { display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical', overflow: 'hidden' }
          : {}),
      }}
    >
      {post.excerpt}
    </p>
  )
}

export function SectionHeading({
  title,
  description,
  href,
  linkLabel,
  light = false,
}: {
  title: string
  description?: string | null
  href?: string
  linkLabel?: string
  light?: boolean
}) {
  return (
    <div
      className="mag-section-heading"
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 24,
        borderBottom: `1px solid ${light ? 'var(--ms-stone-dk)' : 'var(--ms-ink)'}`,
        paddingBottom: 14,
        marginBottom: 32,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, flexWrap: 'wrap' }}>
        <h2
          style={{
            fontFamily: 'var(--ms-masthead)',
            fontSize: 'clamp(29px, 3.25vw, 43px)',
            fontWeight: 400,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            lineHeight: 1.2,
            color: light ? 'var(--ms-white)' : 'var(--ms-ink)',
          }}
        >
          {title}
        </h2>
        {description && (
          <p
            style={{
              fontFamily: 'var(--ms-body)',
              fontSize: 15,
              color: light ? 'var(--ms-stone)' : 'var(--ms-stone-dk)',
              maxWidth: 440,
            }}
          >
            {description}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          style={{
            fontFamily: 'var(--ms-body)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: light ? 'var(--ms-white)' : 'var(--ms-ink)',
            whiteSpace: 'nowrap',
          }}
        >
          {linkLabel ?? 'See all'} →
        </Link>
      )}
    </div>
  )
}
