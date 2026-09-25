import Image from 'next/image'
import type { FictionCollection } from '@/lib/fiction'

interface BookCoverProps {
  collection: FictionCollection
  sizes: string
  priority?: boolean
}

// Book covers are 16:25 (512×800 on Squarespace). Collections without a
// cover get a lettered placeholder in the same shape.
export function BookCover({ collection, sizes, priority = false }: BookCoverProps) {
  return (
    <div
      style={{
        position: 'relative',
        aspectRatio: '16/25',
        width: '100%',
        boxShadow: '0 1px 2px rgba(0,0,0,0.08), 0 18px 40px -12px rgba(0,0,0,0.28)',
        background: 'var(--ms-off)',
      }}
    >
      {collection.cover ? (
        <Image
          src={collection.cover}
          alt={collection.coverAlt ?? `${collection.title} cover`}
          fill
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          style={{ objectFit: 'cover' }}
        />
      ) : (
        <div
          role="img"
          aria-label={`${collection.title} cover`}
          style={{
            position: 'absolute',
            inset: 14,
            border: '1px solid var(--ms-stone)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 18,
            textAlign: 'center',
            padding: 16,
          }}
        >
          <span style={{ fontFamily: 'var(--ms-script)', fontSize: 'clamp(44px, 5vw, 68px)', fontWeight: 700, color: 'var(--ms-ink)', lineHeight: 1 }}>
            {collection.title}
          </span>
          <span
            style={{
              fontFamily: 'var(--ms-body)',
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: 'var(--ms-stone-dk)',
            }}
          >
            Shirley Xu
          </span>
        </div>
      )}
    </div>
  )
}
