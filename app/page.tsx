import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { getCategories, getFeaturedPosts, getPostsByCategory, getRecentPosts, type PostWithRelations } from '@/lib/posts'
import { getFictionCollections } from '@/lib/fiction'
import { FEATURED_ART } from '@/lib/portfolio'
import { getCoverImage } from '@/lib/images'
import { NewsletterForm } from '@/components/NewsletterForm'
import { BookCover } from '@/components/BookCover'
import { readingMinutes } from '@/components/Magazine'

export const revalidate = 60 // ISR: revalidate every 60s

// Section names in Latin, with the English topic they cover
const SECTIONS = [
  { slug: 'faith', latin: 'Fides' },
  { slug: 'mind', latin: 'Mens' },
  { slug: 'wellness', latin: 'Vita' },
  { slug: 'reflections', latin: 'Meditationes' },
] as const

// Scripture set in the Fides section (Douay-Rheims, public domain)
const FIDES_VERSE = {
  text: 'Now faith is the substance of things to be hoped for, the evidence of things that appear not.',
  reference: 'Hebrews 11:1',
  translation: 'Douay-Rheims',
}

// ── Small typographic pieces ──────────────────────────────────────

const caps: React.CSSProperties = {
  fontFamily: 'var(--ms-body)',
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: '0.24em',
  textTransform: 'uppercase',
}

function Tag({ post, light = false }: { post: PostWithRelations; light?: boolean }) {
  if (!post.category) return null
  return (
    <Link
      href={`/categories/${post.category.slug}`}
      style={{ ...caps, fontSize: 11, color: light ? 'var(--ms-bone)' : 'var(--ms-accent)', display: 'inline-block', marginBottom: 12 }}
    >
      {post.category.name}
    </Link>
  )
}

function Meta({ post, light = false }: { post: PostWithRelations; light?: boolean }) {
  return (
    <p style={{ ...caps, fontSize: 10, letterSpacing: '0.16em', color: light ? 'rgba(244,241,236,0.7)' : 'var(--ms-stone-dk)' }}>
      {post.publishedAt ? format(post.publishedAt, 'd MMM yyyy') : ''} — {readingMinutes(post)} min
    </p>
  )
}

function Title({
  post,
  size,
  light = false,
  italic = false,
  weight = 700,
}: {
  post: PostWithRelations
  size: string | number
  light?: boolean
  italic?: boolean
  weight?: number
}) {
  return (
    <Link href={`/posts/${post.slug}`} className="ed-title">
      <h3
        style={{
          fontFamily: 'var(--ms-display)',
          fontSize: size,
          fontWeight: weight,
          fontStyle: italic ? 'italic' : 'normal',
          lineHeight: 1.15,
          letterSpacing: '-0.01em',
          color: light ? 'var(--ms-bone)' : 'var(--ms-ink)',
          marginBottom: 14,
        }}
      >
        {post.title}
      </h3>
    </Link>
  )
}

function Photo({
  post,
  ratio,
  sizes,
  mono = false,
  priority = false,
  fill = false,
}: {
  post: PostWithRelations
  ratio?: string
  sizes: string
  mono?: boolean
  priority?: boolean
  fill?: boolean
}) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className={mono ? 'ed-photo ed-mono' : 'ed-photo'}
      style={{
        display: 'block',
        position: fill ? 'absolute' : 'relative',
        inset: fill ? 0 : undefined,
        aspectRatio: fill ? undefined : ratio,
        overflow: 'hidden',
        background: 'var(--ms-noir)',
      }}
    >
      <Image
        src={getCoverImage(post)}
        alt=""
        fill
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        style={{ objectFit: 'cover' }}
      />
    </Link>
  )
}

function SectionHead({
  no,
  latin,
  english,
  href,
  light = false,
}: {
  no: string
  latin: string
  english: string
  href?: string
  light?: boolean
}) {
  const ink = light ? 'var(--ms-bone)' : 'var(--ms-ink)'
  return (
    <header
      className="ed-head"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'end',
        gap: 24,
        borderTop: `1px solid ${ink}`,
        paddingTop: 14,
        marginBottom: 48,
      }}
    >
      <div>
        <p style={{ ...caps, color: 'var(--ms-accent)', marginBottom: 14 }}>
          ✝ {no} <span style={{ color: light ? 'rgba(244,241,236,0.6)' : 'var(--ms-stone-dk)', marginLeft: 8 }}>— {english}</span>
        </p>
        <h2
          style={{
            fontFamily: 'var(--ms-masthead)',
            fontSize: 'clamp(56px, 9vw, 132px)',
            fontWeight: 400,
            fontStyle: 'italic',
            lineHeight: 0.85,
            letterSpacing: '-0.03em',
            color: ink,
          }}
        >
          {latin}
        </h2>
      </div>
      {href && (
        <Link href={href} className="ed-more" style={{ ...caps, color: ink, whiteSpace: 'nowrap', paddingBottom: 8 }}>
          View all →
        </Link>
      )}
    </header>
  )
}

// ── Page ──────────────────────────────────────────────────────────

export default async function HomePage() {
  const [featured, recent, categories, ...sectionPosts] = await Promise.all([
    getFeaturedPosts(5),
    getRecentPosts(30),
    getCategories(),
    ...SECTIONS.map(s => getPostsByCategory(s.slug, 14)),
  ])

  // Each story appears once on the page
  const used = new Set<string>()
  const take = (posts: PostWithRelations[], n: number) => {
    const picked = posts.filter(p => !used.has(p.id)).slice(0, n)
    picked.forEach(p => used.add(p.id))
    return picked
  }

  const [cover, ...coverLines] = take(featured, 5)
  const contents = [...coverLines, ...take(recent, 4)]
  const [faith, mind, vita, meditationes] = SECTIONS.map((s, i) => ({
    ...s,
    category: categories.find(c => c.slug === s.slug),
    posts: take(sectionPosts[i], s.slug === 'mind' ? 4 : 5),
  }))
  const books = getFictionCollections().filter(c => c.cover)
  const ticker = recent.slice(0, 10)
  const now = new Date()

  return (
    <div className="ed">
      {/* ── Dateline ─────────────────────────────────────── */}
      <div
        className="ed-dateline"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
          padding: '11px 40px',
          background: 'var(--ms-noir)',
          color: 'var(--ms-bone)',
          ...caps,
          fontSize: 9,
        }}
      >
        <span>N° {format(now, 'MM')} — {format(now, 'MMMM yyyy')}</span>
        <span className="ed-hide-sm">Faith · Mind · Life · Fiction · Art</span>
        <span>A.M.D.G.</span>
      </div>

      {/* ── Cover ────────────────────────────────────────── */}
      {cover && (
        <section
          className="ed-cover"
          style={{ position: 'relative', height: 'min(92vh, 980px)', minHeight: 620, overflow: 'hidden', background: 'var(--ms-noir)' }}
        >
          <Photo post={cover} sizes="100vw" priority fill />
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.78) 100%)',
            }}
          />

          {/* Cover lines, top right */}
          <ul
            className="ed-coverlines"
            style={{ position: 'absolute', top: 40, right: 40, width: 300, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 18, padding: '20px 22px 22px', background: 'rgba(11,11,11,0.62)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
          >
            {coverLines.slice(0, 3).map(p => (
              <li key={p.id} style={{ borderTop: '1px solid rgba(244,241,236,0.35)', paddingTop: 12 }}>
                <Link href={`/posts/${p.slug}`} style={{ color: 'var(--ms-bone)' }}>
                  <span style={{ ...caps, fontSize: 10, color: 'var(--ms-bone)', opacity: 0.8, display: 'block', marginBottom: 6 }}>
                    {p.category?.name}
                  </span>
                  <span style={{ fontFamily: 'var(--ms-display)', fontSize: 17, fontWeight: 700, lineHeight: 1.25 }}>{p.title}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Cover story */}
          <div style={{ position: 'absolute', left: 40, right: 40, bottom: 48, maxWidth: 1100 }} className="ed-cover-text">
            <p style={{ ...caps, color: 'var(--ms-bone)', marginBottom: 20 }}>
              <span style={{ background: 'var(--ms-accent)', padding: '5px 10px', marginRight: 14 }}>Cover Story</span>
              {cover.category?.name}
            </p>
            <Link href={`/posts/${cover.slug}`}>
              <h1
                style={{
                  fontFamily: 'var(--ms-masthead)',
                  fontSize: 'clamp(44px, 7.4vw, 118px)',
                  fontWeight: 600,
                  lineHeight: 0.92,
                  letterSpacing: '-0.035em',
                  color: 'var(--ms-bone)',
                  marginBottom: 22,
                  textWrap: 'balance',
                }}
              >
                {cover.title}
              </h1>
            </Link>
            {cover.excerpt && (
              <p
                style={{
                  fontFamily: 'var(--ms-serif)',
                  fontSize: 'clamp(18px, 1.6vw, 23px)',
                  fontStyle: 'italic',
                  color: 'var(--ms-bone)',
                  maxWidth: 620,
                  lineHeight: 1.45,
                  marginBottom: 18,
                  opacity: 0.92,
                }}
              >
                {cover.excerpt}
              </p>
            )}
            <Meta post={cover} light />
          </div>
        </section>
      )}

      {/* ── Ticker ───────────────────────────────────────── */}
      <div
        aria-hidden
        style={{ background: 'var(--ms-noir)', color: 'var(--ms-bone)', overflow: 'hidden', borderTop: '1px solid #222', whiteSpace: 'nowrap' }}
      >
        <div className="ed-ticker" style={{ display: 'inline-flex', padding: '14px 0' }}>
          {[0, 1].map(copy => (
            <span key={copy} style={{ display: 'inline-flex' }}>
              {ticker.map(p => (
                <span key={p.id} style={{ fontFamily: 'var(--ms-display)', fontStyle: 'italic', fontSize: 19, padding: '0 28px' }}>
                  {p.title}
                  <span style={{ color: 'var(--ms-accent)', fontStyle: 'normal', marginLeft: 56 }}>✝</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── Contents ─────────────────────────────────────── */}
      {contents.length > 0 && (
        <section className="ed-wrap" style={{ padding: '96px 40px 88px' }}>
          <div className="ed-contents" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 4fr) minmax(0, 8fr)', gap: 56 }}>
            <div>
              <p style={{ ...caps, color: 'var(--ms-accent)', marginBottom: 18 }}>In This Issue</p>
              <h2
                style={{
                  fontFamily: 'var(--ms-masthead)',
                  fontSize: 'clamp(64px, 8vw, 120px)',
                  fontWeight: 400,
                  fontStyle: 'italic',
                  lineHeight: 0.85,
                  letterSpacing: '-0.04em',
                  color: 'var(--ms-ink)',
                }}
              >
                Contents
              </h2>
              <p style={{ fontFamily: 'var(--ms-serif)', fontSize: 21, fontStyle: 'italic', color: 'var(--ms-ink-soft)', marginTop: 24, maxWidth: 320, lineHeight: 1.45 }}>
                Essays on faith, the mind, and a well-ordered life — written for the modern believer.
              </p>
            </div>
            <ol style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: 48 }} className="ed-toc">
              {contents.map((p, i) => (
                <li key={p.id} style={{ borderTop: '1px solid var(--ms-ink)', padding: '18px 0 26px' }}>
                  <Link href={`/posts/${p.slug}`} className="ed-toc-item" style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: 16 }}>
                    <span
                      style={{
                        fontFamily: 'var(--ms-masthead)',
                        fontSize: 44,
                        fontWeight: 400,
                        lineHeight: 0.9,
                        color: 'var(--ms-accent)',
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>
                      <span style={{ ...caps, fontSize: 10, color: 'var(--ms-stone-dk)', display: 'block', marginBottom: 8 }}>{p.category?.name}</span>
                      <span style={{ fontFamily: 'var(--ms-display)', fontSize: 20, fontWeight: 700, lineHeight: 1.25, color: 'var(--ms-ink)', display: 'block' }}>
                        {p.title}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ── Fides: portrait + pull quote ─────────────────── */}
      {faith.posts.length > 0 && (
        <section className="ed-wrap" style={{ padding: '24px 40px 112px' }}>
          <SectionHead no="I" latin={faith.latin} english="Faith" href="/categories/faith" />
          <div className="ed-fides" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 7fr)', gap: 64, alignItems: 'start' }}>
            <article style={{ position: 'relative' }}>
              <Photo post={faith.posts[0]} ratio="4/5" sizes="(max-width: 900px) 100vw, 42vw" />
              <div
                className="ed-overlap"
                style={{ background: 'var(--ms-white)', padding: '28px 32px 0 0', marginTop: -120, marginRight: '18%', position: 'relative' }}
              >
                <Tag post={faith.posts[0]} />
                <Title post={faith.posts[0]} size="clamp(30px, 3.2vw, 46px)" />
                <Meta post={faith.posts[0]} />
              </div>
            </article>
            <div>
              <figure style={{ borderLeft: '3px solid var(--ms-accent)', paddingLeft: 28, marginBottom: 64 }}>
                <blockquote
                  style={{
                    fontFamily: 'var(--ms-display)',
                    fontSize: 'clamp(26px, 2.8vw, 40px)',
                    fontStyle: 'italic',
                    fontWeight: 400,
                    lineHeight: 1.3,
                    letterSpacing: '-0.015em',
                    color: 'var(--ms-ink)',
                    marginBottom: 20,
                  }}
                >
                  “{FIDES_VERSE.text}”
                </blockquote>
                <figcaption style={{ ...caps, color: 'var(--ms-accent)' }}>
                  {FIDES_VERSE.reference} <span style={{ color: 'var(--ms-stone-dk)', marginLeft: 8 }}>— {FIDES_VERSE.translation}</span>
                </figcaption>
              </figure>
              <div className="ed-fides-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '40px 32px' }}>
                {faith.posts.slice(1, 5).map(p => (
                  <article key={p.id}>
                    <Photo post={p} ratio="3/2" sizes="(max-width: 900px) 50vw, 26vw" />
                    <div style={{ paddingTop: 16 }}>
                      <Title post={p} size={21} />
                      <Meta post={p} />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Mens: black band, monochrome ─────────────────── */}
      {mind.posts.length > 0 && (
        <section style={{ background: 'var(--ms-noir)' }}>
          <div className="ed-wrap" style={{ padding: '96px 40px 104px' }}>
            <SectionHead no="II" latin={mind.latin} english="Mind" href="/categories/mind" light />
            <div className="ed-mens" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 5fr)', gap: 48 }}>
              <article>
                <Photo post={mind.posts[0]} ratio="16/10" sizes="(max-width: 900px) 100vw, 58vw" mono />
                <div style={{ paddingTop: 24, maxWidth: 640 }}>
                  <Tag post={mind.posts[0]} light />
                  <Title post={mind.posts[0]} size="clamp(30px, 3.4vw, 50px)" light />
                  {mind.posts[0].excerpt && (
                    <p style={{ fontFamily: 'var(--ms-body)', fontSize: 15, lineHeight: 1.7, color: 'rgba(244,241,236,0.72)', marginBottom: 14 }}>
                      {mind.posts[0].excerpt}
                    </p>
                  )}
                  <Meta post={mind.posts[0]} light />
                </div>
              </article>
              <div>
                {mind.posts.slice(1).map((p, i) => (
                  <article
                    key={p.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 1fr) 140px',
                      gap: 20,
                      padding: '0 0 28px',
                      marginBottom: 28,
                      borderBottom: i < mind.posts.length - 2 ? '1px solid #2a2a2a' : 'none',
                    }}
                  >
                    <div>
                      <p style={{ fontFamily: 'var(--ms-masthead)', fontSize: 15, fontStyle: 'italic', color: 'var(--ms-accent)', marginBottom: 8 }}>
                        {['ii.', 'iii.', 'iv.'][i]}
                      </p>
                      <Title post={p} size={22} light />
                      <Meta post={p} light />
                    </div>
                    <Photo post={p} ratio="1/1" sizes="140px" mono />
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Vita: mosaic with overlaid titles ────────────── */}
      {vita.posts.length > 0 && (
        <section className="ed-wrap" style={{ padding: '104px 40px' }}>
          <SectionHead no="III" latin={vita.latin} english="Wellness" href="/categories/wellness" />
          <div
            className="ed-vita"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gridTemplateRows: 'repeat(2, minmax(260px, 30vw))',
              gap: 10,
              maxHeight: 900,
            }}
          >
            {vita.posts.slice(0, 5).map((p, i) => (
              <article
                key={p.id}
                className={`ed-tile ed-tile-${i}`}
                style={{
                  position: 'relative',
                  gridColumn: i === 0 ? 'span 2' : undefined,
                  gridRow: i === 0 ? 'span 2' : undefined,
                  overflow: 'hidden',
                }}
              >
                <Photo post={p} sizes={i === 0 ? '(max-width: 900px) 100vw, 50vw' : '(max-width: 900px) 50vw, 25vw'} fill />
                <div
                  style={{
                    position: 'absolute',
                    inset: 'auto 0 0 0',
                    padding: i === 0 ? '80px 32px 30px' : '60px 18px 16px',
                    background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.75) 100%)',
                    pointerEvents: 'none',
                  }}
                >
                  <p style={{ ...caps, fontSize: 9, color: 'var(--ms-bone)', opacity: 0.8, marginBottom: 8 }}>{readingMinutes(p)} min read</p>
                  <h3
                    style={{
                      fontFamily: 'var(--ms-display)',
                      fontSize: i === 0 ? 'clamp(28px, 3vw, 42px)' : 19,
                      fontWeight: 700,
                      fontStyle: i === 0 ? 'italic' : 'normal',
                      lineHeight: 1.15,
                      color: 'var(--ms-bone)',
                    }}
                  >
                    {p.title}
                  </h3>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── Fabulae: black shelf ─────────────────────────── */}
      {books.length > 0 && (
        <section style={{ background: 'var(--ms-noir)' }}>
          <div className="ed-wrap" style={{ padding: '96px 40px 104px' }}>
            <SectionHead no="IV" latin="Fabulae" english="Fiction" href="/fiction" light />
            <div className="ed-shelf" style={{ display: 'grid', gridTemplateColumns: `repeat(${books.length}, minmax(0, 1fr))`, gap: 28, alignItems: 'end' }}>
              {books.map((b, i) => (
                <Link key={b.slug} href={`/fiction/${b.slug}`} className="ed-book" style={{ display: 'block' }}>
                  <BookCover collection={b} sizes="(max-width: 900px) 45vw, 20vw" />
                  <p style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 18, borderTop: '1px solid #333', paddingTop: 12 }}>
                    <span style={{ fontFamily: 'var(--ms-display)', fontSize: 18, fontStyle: 'italic', color: 'var(--ms-bone)' }}>{b.title}</span>
                    <span style={{ ...caps, fontSize: 9, color: 'var(--ms-accent)' }}>{String(i + 1).padStart(2, '0')}</span>
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Meditationes: essays, type only ──────────────── */}
      {meditationes.posts.length > 0 && (
        <section className="ed-wrap" style={{ padding: '104px 40px' }}>
          <SectionHead no="V" latin={meditationes.latin} english="Reflections" href="/categories/reflections" />
          <div className="ed-essays" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0 }}>
            {meditationes.posts.slice(0, 3).map((p, i) => (
              <article key={p.id} className="ed-essay" style={{ padding: '0 36px', borderLeft: i ? '1px solid var(--ms-rule)' : 'none' }}>
                <p style={{ fontFamily: 'var(--ms-masthead)', fontSize: 96, lineHeight: 0.7, color: 'var(--ms-accent)', marginBottom: 8 }}>“</p>
                <Title post={p} size="clamp(26px, 2.4vw, 34px)" italic weight={400} />
                {p.excerpt && (
                  <p
                    style={{
                      fontFamily: 'var(--ms-serif)',
                      fontSize: 19,
                      lineHeight: 1.55,
                      color: 'var(--ms-ink-soft)',
                      marginBottom: 16,
                      display: '-webkit-box',
                      WebkitLineClamp: 5,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {p.excerpt}
                  </p>
                )}
                <Meta post={p} />
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── Ars: studio strip ────────────────────────────── */}
      <section style={{ borderTop: '1px solid var(--ms-rule)' }}>
        <div className="ed-wrap" style={{ padding: '96px 40px' }}>
          <SectionHead no="VI" latin="Ars" english="Art & Design" href="/categories/creative#gallery" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }} className="ed-studio">
            {FEATURED_ART.map(piece => (
              <Link
                key={piece.src}
                href="/categories/creative#gallery"
                className="ed-photo"
                style={{ display: 'block', position: 'relative', aspectRatio: '3/4', overflow: 'hidden', background: 'var(--ms-off)' }}
              >
                <Image src={piece.src} alt={piece.alt} fill sizes="(max-width: 900px) 33vw, 16vw" style={{ objectFit: 'cover' }} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <NewsletterForm />

      <style>{`
        .ed-wrap { max-width: 1440px; margin: 0 auto; }
        .ed-photo img { transition: transform 0.9s cubic-bezier(.2,.7,.2,1), filter 0.6s ease; }
        .ed-photo:hover img { transform: scale(1.035); }
        .ed-mono img { filter: grayscale(1) contrast(1.12); }
        .ed-mono:hover img { filter: grayscale(0) contrast(1); }
        .ed-title:hover h3, .ed-toc-item:hover span span:last-child { text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 6px; }
        .ed-more:hover { color: var(--ms-accent) !important; }
        .ed-tile .ed-photo { position: absolute !important; }
        .ed-book { transition: transform 0.4s ease; }
        .ed-book:hover { transform: translateY(-8px); }

        .ed-ticker { animation: ed-scroll 70s linear infinite; }
        @keyframes ed-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .ed-ticker { animation: none; } }

        @media (max-width: 1100px) {
          .ed-hide-sm { display: none; }
          .ed-coverlines { display: none !important; }
          .ed-contents { grid-template-columns: 1fr !important; gap: 40px !important; }
          .ed-shelf { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; row-gap: 40px !important; }
        }
        @media (max-width: 900px) {
          .ed-wrap { padding-left: 20px !important; padding-right: 20px !important; }
          .ed-dateline { padding: 10px 20px !important; }
          .ed-cover-text { left: 20px !important; right: 20px !important; bottom: 32px !important; }
          .ed-toc { grid-template-columns: 1fr !important; }
          .ed-fides, .ed-mens { grid-template-columns: 1fr !important; }
          .ed-overlap { margin-top: -60px !important; margin-right: 10% !important; }
          .ed-vita { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; grid-template-rows: none !important; grid-auto-rows: 52vw; max-height: none !important; }
          .ed-tile-0 { grid-column: 1 / -1 !important; grid-row: span 1 !important; }
          .ed-essays { grid-template-columns: 1fr !important; }
          .ed-essay { border-left: none !important; border-top: 1px solid var(--ms-rule); padding: 32px 0 !important; }
          .ed-studio { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .ed-fides-list { grid-template-columns: 1fr !important; }
          .ed-shelf { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
      `}</style>
    </div>
  )
}
