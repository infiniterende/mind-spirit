import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { format, parseISO } from 'date-fns'
import {
  getFictionCollection,
  getFictionCollections,
  getFictionPiece,
  getFictionPieces,
  readingTime,
} from '@/lib/fiction'
import { MarkdownBody } from '@/components/MarkdownBody'
import { NewsletterForm } from '@/components/NewsletterForm'

interface Props {
  params: Promise<{ collection: string; slug: string }>
}

export function generateStaticParams() {
  return getFictionCollections().flatMap(c =>
    getFictionPieces(c.slug).map(p => ({ collection: c.slug, slug: p.slug })),
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection, slug } = await params
  const piece = getFictionPiece(collection, slug)
  const c = getFictionCollection(collection)
  if (!piece || !c) return {}
  return { title: `${piece.title} — ${c.title}`, description: piece.excerpt || undefined }
}

const small: React.CSSProperties = {
  fontFamily: 'var(--ms-body)',
  fontSize: 9,
  fontWeight: 500,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--ms-stone-dk)',
}

export default async function FictionPiecePage({ params }: Props) {
  const { collection, slug } = await params
  const c = getFictionCollection(collection)
  const piece = getFictionPiece(collection, slug)
  if (!c || !piece) notFound()

  const siblings = getFictionPieces(c.slug)
  const index = siblings.findIndex(p => p.slug === piece.slug)
  const prev = index > 0 ? siblings[index - 1] : null
  const next = index < siblings.length - 1 ? siblings[index + 1] : null
  const serial = c.kind === 'serial'

  return (
    <>
      <header style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px 8px', textAlign: 'center' }}>
        <Link href={`/fiction/${c.slug}`} style={{ ...small, display: 'inline-block', marginBottom: 18 }}>
          {c.title}
          {serial && siblings.length > 1 && ` · ${index + 1} of ${siblings.length}`}
        </Link>
        <h1
          style={{
            fontFamily: 'var(--ms-script)',
            fontSize: 'clamp(48px, 7.5vw, 81px)',
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: 0,
            color: 'var(--ms-ink)',
            marginBottom: 20,
          }}
        >
          {piece.title}
        </h1>
        <p style={{ fontFamily: 'var(--ms-body)', fontSize: 11, color: 'var(--ms-stone)', letterSpacing: '0.06em' }}>
          {format(parseISO(piece.date), 'MMMM d, yyyy')} · {readingTime(piece.wordCount)}
        </p>
        <hr style={{ width: 48, border: 'none', borderTop: '1px solid var(--ms-ink)', margin: '36px auto 0' }} />
      </header>

      <article className="prose-editorial prose-fiction" style={{ padding: '40px 24px 64px' }}>
        <MarkdownBody source={piece.body} />
      </article>

      {/* ── Prev / next ──────────────────────────────────── */}
      <nav
        aria-label={serial ? 'Chapters' : 'More in this collection'}
        style={{
          maxWidth: 760,
          margin: '0 auto 72px',
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 2,
        }}
        className="fic-pager"
      >
        {[prev, next].map((p, i) =>
          p ? (
            <Link
              key={p.slug}
              href={`/fiction/${c.slug}/${p.slug}`}
              className="pager-link"
              style={{
                border: '1px solid var(--ms-rule)',
                padding: '22px 24px',
                textAlign: i === 0 ? 'left' : 'right',
                gridColumn: i === 0 ? 1 : 2,
              }}
            >
              <span style={{ ...small, display: 'block', marginBottom: 8 }}>
                {i === 0 ? '← Previous' : 'Next →'}
              </span>
              <span style={{ fontFamily: 'var(--ms-serif)', fontSize: 20, fontStyle: 'italic', fontWeight: 500, color: 'var(--ms-ink)', lineHeight: 1.25 }}>
                {p.title}
              </span>
            </Link>
          ) : null,
        )}
      </nav>

      <div style={{ textAlign: 'center', marginBottom: 72 }}>
        <Link
          href={`/fiction/${c.slug}`}
          style={{ ...small, fontSize: 10, letterSpacing: '0.16em', color: 'var(--ms-ink)', borderBottom: '1px solid var(--ms-ink)', paddingBottom: 2 }}
        >
          {serial ? 'All Chapters' : `All ${c.title}`}
        </Link>
      </div>

      <NewsletterForm />

      <style>{`
        .pager-link { transition: background 0.2s; }
        .pager-link:hover { background: var(--ms-off); }
        @media (max-width: 600px) {
          .fic-pager { grid-template-columns: 1fr !important; gap: 8px !important; }
          .fic-pager a { grid-column: 1 !important; text-align: left !important; }
        }
      `}</style>
    </>
  )
}
