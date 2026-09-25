import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getFictionCollection, getFictionCollections, getFictionPieces, readingTime } from '@/lib/fiction'
import { BookCover } from '@/components/BookCover'

interface Props {
  params: Promise<{ collection: string }>
}

export function generateStaticParams() {
  return getFictionCollections().map(c => ({ collection: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection } = await params
  const c = getFictionCollection(collection)
  return c ? { title: c.title, description: c.description || undefined } : {}
}

export default async function FictionCollectionPage({ params }: Props) {
  const { collection } = await params
  const c = getFictionCollection(collection)
  if (!c) notFound()

  const pieces = getFictionPieces(c.slug)
  const words = pieces.reduce((n, p) => n + p.wordCount, 0)
  const serial = c.kind === 'serial'

  return (
    <>
      <header
        style={{
          background: 'var(--ms-off)',
          borderBottom: '1px solid var(--ms-rule)',
          padding: '56px 48px 48px',
          textAlign: 'center',
        }}
      >
        <Link
          href="/fiction"
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
          Fiction
        </Link>
        <div style={{ width: 'min(64vw, 280px)', margin: '8px auto 40px' }}>
          <BookCover collection={c} sizes="280px" priority />
        </div>
        <h1
          style={{
            fontFamily: 'var(--ms-script)',
            fontSize: 'clamp(60px, 9vw, 108px)',
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: 0,
            color: 'var(--ms-ink)',
            marginBottom: 16,
          }}
        >
          {c.title}
        </h1>
        {c.description && (
          <p style={{ fontFamily: 'var(--ms-body)', fontSize: 15, color: 'var(--ms-ink-soft)', lineHeight: 1.7, maxWidth: 500, margin: '0 auto 16px' }}>
            {c.description}
          </p>
        )}
        <p style={{ fontFamily: 'var(--ms-body)', fontSize: 11, color: 'var(--ms-stone)', letterSpacing: '0.08em' }}>
          {pieces.length} {serial ? (pieces.length === 1 ? 'chapter' : 'chapters') : 'pieces'} · {readingTime(words)}
        </p>
        {serial && pieces[0] && (
          <Link
            href={`/fiction/${c.slug}/${pieces[0].slug}`}
            style={{
              display: 'inline-block',
              marginTop: 24,
              fontFamily: 'var(--ms-body)',
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--ms-white)',
              background: 'var(--ms-ink)',
              padding: '12px 22px',
            }}
          >
            Start with {pieces.length > 1 ? 'Chapter 1' : 'the first chapter'}
          </Link>
        )}
      </header>

      <section style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 80px' }}>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, borderTop: '1px solid var(--ms-ink)' }}>
          {pieces.map(p => (
            <li key={p.slug} style={{ borderBottom: '1px solid var(--ms-rule)' }}>
              <Link
                href={`/fiction/${c.slug}/${p.slug}`}
                className="toc-row"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 24, padding: '18px 0' }}
              >
                <span style={{ fontFamily: 'var(--ms-serif)', fontSize: 22, fontStyle: 'italic', fontWeight: 500, color: 'var(--ms-ink)', lineHeight: 1.25 }}>
                  {p.title}
                </span>
                <span style={{ fontFamily: 'var(--ms-body)', fontSize: 11, color: 'var(--ms-stone)', whiteSpace: 'nowrap' }}>
                  {readingTime(p.wordCount)}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <style>{`
        .toc-row:hover span:first-child { text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 4px; }
        @media (max-width: 768px) { header { padding: 40px 20px 36px !important; } }
      `}</style>
    </>
  )
}
