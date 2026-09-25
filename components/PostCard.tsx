import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import type { PostWithRelations } from '@/lib/posts'
import { getCoverImage } from '@/lib/images'

interface PostCardProps {
  post: PostWithRelations
  featured?: boolean
}

export function PostCard({ post, featured = false }: PostCardProps) {
  return (
    <article
      style={{
        background: 'var(--ms-white)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
      className="post-card"
    >
      {/* Image */}
      <Link href={`/posts/${post.slug}`} style={{ display: 'block', overflow: 'hidden' }}>
        <div
          style={{
            background: 'var(--ms-off)',
            aspectRatio: featured ? '16/9' : '4/3',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Image
            src={getCoverImage(post)}
            alt={post.title}
            fill
            sizes={featured ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
            style={{ objectFit: 'cover', transition: 'transform 0.6s ease' }}
            className="card-image"
          />
        </div>
      </Link>

      {/* Body */}
      <div
        style={{
          padding: featured ? '28px 30px 32px' : '20px 22px 26px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Category */}
        {post.category && (
          <Link
            href={`/categories/${post.category.slug}`}
            style={{
              fontFamily: 'var(--ms-body)',
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--ms-stone-dk)',
              display: 'block',
              marginBottom: 8,
            }}
          >
            {post.category.name}
          </Link>
        )}

        {/* Title */}
        <Link href={`/posts/${post.slug}`}>
          <h3
            style={{
              fontFamily: 'var(--ms-display)',
              fontSize: featured ? 'clamp(20px, 2.2vw, 28px)' : 19,
              fontWeight: 700,
              lineHeight: 1.2,
              color: 'var(--ms-ink)',
              marginBottom: 10,
              letterSpacing: '-0.01em',
            }}
          >
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        {post.excerpt && (
          <p
            style={{
              fontFamily: 'var(--ms-body)',
              fontSize: 13,
              color: 'var(--ms-ink-soft)',
              lineHeight: 1.7,
              flex: 1,
            }}
          >
            {post.excerpt}
          </p>
        )}

        {/* Meta row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 16,
          }}
        >
          <time
            dateTime={post.publishedAt?.toISOString()}
            style={{
              fontFamily: 'var(--ms-body)',
              fontSize: 11,
              color: 'var(--ms-stone)',
              letterSpacing: '0.06em',
            }}
          >
            {post.publishedAt ? format(post.publishedAt, 'MMM d, yyyy') : ''}
          </time>

          <Link
            href={`/posts/${post.slug}`}
            style={{
              fontFamily: 'var(--ms-body)',
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--ms-ink)',
              borderBottom: '1px solid var(--ms-ink)',
              paddingBottom: 2,
            }}
          >
            Read
          </Link>
        </div>
      </div>

      <style>{`
        .post-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.08); }
        .post-card:hover .card-image { transform: scale(1.05); }
      `}</style>
    </article>
  )
}
