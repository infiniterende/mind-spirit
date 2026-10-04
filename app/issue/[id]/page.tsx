// Print edition of a monthly issue, e.g. /issue/2026-09.
// Laid out for US Letter and rendered to PDF with `npm run issue:pdf`.
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { format } from 'date-fns'
import { prisma } from '@/lib/prisma'
import type { PostWithRelations } from '@/lib/posts'
import { getCoverImage } from '@/lib/images'
import { getFictionCollections } from '@/lib/fiction'
import { MarkdownBody } from '@/components/MarkdownBody'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = { robots: { index: false, follow: false } }

const VERSE = {
  text: 'Now faith is the substance of things to be hoped for, the evidence of things that appear not.',
  reference: 'Hebrews 11:1',
}

const include = { author: true, category: true, tags: { include: { tag: true } } } as const

// An issue is the homepage line-up as it stood at the end of that month:
// the five newest featured stories, then the four newest of everything else.
async function getIssue(year: number, month: number) {
  const cutoff = new Date(year, month, 1) // first day of the following month
  const featured = (await prisma.post.findMany({
    where: { published: true, featured: true, publishedAt: { lt: cutoff } },
    include,
    orderBy: { publishedAt: 'desc' },
    take: 5,
  })) as PostWithRelations[]
  const latest = (await prisma.post.findMany({
    where: { published: true, publishedAt: { lt: cutoff }, id: { notIn: featured.map(p => p.id) } },
    include,
    orderBy: { publishedAt: 'desc' },
    take: 4,
  })) as PostWithRelations[]
  return [...featured, ...latest]
}

// When building the PDF locally, route images through the JPEG helper so the file stays small
const img = (src: string, w: number) =>
  process.env.NODE_ENV === 'development' ? `/api/issue-image?src=${encodeURIComponent(src)}&w=${w}` : src

const minutes = (p: PostWithRelations) => Math.max(1, Math.round(p.content.split(/\s+/).length / 230))

export default async function IssuePage({ params }: Props) {
  const { id } = await params
  const m = id.match(/^(\d{4})-(\d{2})$/)
  if (!m || +m[2] < 1 || +m[2] > 12) notFound()
  const year = +m[1]
  const month = +m[2]

  const stories = await getIssue(year, month)
  if (stories.length === 0) notFound()

  const [cover, ...rest] = stories
  const issueDate = new Date(year, month - 1, 1)
  const label = `N° ${m[2]} — ${format(issueDate, 'MMMM yyyy')}`
  const books = getFictionCollections().filter(c => c.cover)

  return (
    <div className="issue">
      {/* ── Cover ──────────────────────────────────────── */}
      <section className="pg pg-cover">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="bleed" src={img(getCoverImage(cover), 1800)} alt="" />
        <div className="shade" />
        <header className="cover-top">
          <p className="mast">Mind &amp; Spirit</p>
          <p className="caps cover-issue">
            <span>{label}</span>
            <span>Faith · Mind · Life · Fiction · Art</span>
            <span>A.M.D.G.</span>
          </p>
        </header>
        <ul className="cover-lines">
          {rest.slice(0, 4).map(p => (
            <li key={p.id}>
              <span className="caps">{p.category?.name}</span>
              {p.title}
            </li>
          ))}
        </ul>
        <div className="cover-story">
          <p className="caps"><span className="flag">Cover Story</span> {cover.category?.name}</p>
          <h1>{cover.title}</h1>
        </div>
      </section>

      {/* ── Contents ───────────────────────────────────── */}
      <section className="pg pg-contents">
        <p className="caps accent">In This Issue</p>
        <h2 className="display">Contents</h2>
        <p className="standfirst">Essays on faith, the mind, and a well-ordered life — written for the modern believer.</p>
        <ol className="toc">
          {stories.map((p, i) => (
            <li key={p.id}>
              <span className="num">{String(i + 1).padStart(2, '0')}</span>
              <span>
                <span className="caps muted">{p.category?.name} · {minutes(p)} min read</span>
                <span className="toc-title">{p.title}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Scripture ──────────────────────────────────── */}
      <section className="pg pg-verse">
        <p className="caps accent">✝ Fides</p>
        <blockquote>“{VERSE.text}”</blockquote>
        <p className="caps">{VERSE.reference}</p>
      </section>

      {/* ── Stories ────────────────────────────────────── */}
      {stories.map((p, i) => (
        <article key={p.id} className="story">
          <header className="story-head">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img(getCoverImage(p), 1400)} alt="" />
            <p className="caps">
              <span className="accent">{String(i + 1).padStart(2, '0')}</span> — {p.category?.name}
            </p>
            <h2>{p.title}</h2>
            {p.excerpt && <p className="dek">{p.excerpt}</p>}
            <p className="caps muted">
              By {p.author.name} · {p.publishedAt ? format(p.publishedAt, 'd MMMM yyyy') : ''} · {minutes(p)} min read
            </p>
          </header>
          <div className="story-body">
            <MarkdownBody source={p.content.replace(/^# .*\n+/, '')} />
          </div>
          <p className="endmark">✝</p>
        </article>
      ))}

      {/* ── Fiction ────────────────────────────────────── */}
      {books.length > 0 && (
        <section className="pg pg-fiction">
          <p className="caps accent">✝ Fabulae</p>
          <h2 className="display">Fiction</h2>
          <p className="standfirst">Serialized novels and short stories, free to read online.</p>
          <div className="shelf">
            {books.map(b => (
              <figure key={b.slug}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img(b.cover!, 500)} alt={b.coverAlt ?? ''} />
                <figcaption>{b.title}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ── Back cover ─────────────────────────────────── */}
      <section className="pg pg-back">
        <p className="mast">Mind &amp; Spirit</p>
        <p className="caps">{label}</p>
        <p className="amdg">Ad Majorem Dei Gloriam</p>
      </section>

      <style>{`
        @page { size: Letter; margin: 0.9in 0.85in 1in; @bottom-center { content: counter(page); font-family: 'DM Sans', sans-serif; font-size: 8pt; letter-spacing: 0.2em; color: #9A9088; } }
        @page full { margin: 0; @bottom-center { content: none; } }

        .issue { --ink: #0D0D0D; --soft: #4A4642; --muted: #9A9088; --rule: #E2DFDC; --accent: #A3161A; --bone: #F4F1EC; --noir: #0B0B0B;
          background: #fff; color: var(--ink); font-family: var(--ms-body); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .issue .caps { font-family: var(--ms-body); font-size: 7.5pt; font-weight: 500; letter-spacing: 0.24em; text-transform: uppercase; }
        .issue .accent { color: var(--accent); }
        .issue .muted { color: var(--muted); }
        .issue .mast { font-family: var(--ms-masthead); text-transform: uppercase; letter-spacing: 0.28em; }
        .issue .display { font-family: var(--ms-masthead); font-style: italic; font-weight: 400; font-size: 54pt; line-height: 0.85; letter-spacing: -0.04em; }
        .issue .standfirst { font-family: var(--ms-serif); font-style: italic; font-size: 16pt; line-height: 1.4; color: var(--soft); max-width: 4.6in; margin-top: 0.25in; }

        /* Full-bleed pages */
        .pg-cover, .pg-verse, .pg-back { page: full; width: 8.5in; height: 11in; position: relative; overflow: hidden; break-after: page; }
        .pg-contents, .pg-fiction { break-after: page; }
        .pg-fiction { break-before: page; }

        /* Cover */
        .pg-cover { background: var(--noir); color: var(--bone); }
        .pg-cover .bleed { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .pg-cover .shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.05) 42%, rgba(0,0,0,0.86) 100%); }
        .cover-top { position: absolute; top: 0.55in; left: 0.6in; right: 0.6in; text-align: center; }
        .cover-top .mast { font-size: 44pt; line-height: 1; letter-spacing: 0.2em; margin-right: -0.2em; }
        .cover-issue { display: flex; justify-content: space-between; border-top: 1px solid rgba(244,241,236,0.6); margin-top: 0.2in; padding-top: 0.12in; }
        .cover-lines { position: absolute; right: 0.6in; top: 2.5in; width: 2.5in; list-style: none; padding: 0.18in 0.2in; background: rgba(11,11,11,0.6); font-family: var(--ms-display); font-weight: 700; font-size: 11pt; line-height: 1.25; }
        .cover-lines li { border-top: 1px solid rgba(244,241,236,0.35); padding: 0.1in 0 0.12in; }
        .cover-lines li:first-child { border-top: none; padding-top: 0; }
        .cover-lines .caps { display: block; font-size: 6.5pt; opacity: 0.8; margin-bottom: 0.04in; }
        .cover-story { position: absolute; left: 0.6in; right: 0.6in; bottom: 0.65in; }
        .cover-story .flag { background: var(--accent); padding: 4pt 8pt; margin-right: 8pt; }
        .cover-story h1 { font-family: var(--ms-masthead); font-weight: 600; font-size: 50pt; line-height: 0.95; letter-spacing: -0.03em; margin-top: 0.22in; text-wrap: balance; }

        /* Contents */
        .toc { list-style: none; margin-top: 0.26in; }
        .toc li { display: grid; grid-template-columns: 0.6in 1fr; gap: 0.12in; border-top: 1px solid var(--ink); padding: 0.07in 0 0.08in; break-inside: avoid; }
        .toc .num { font-family: var(--ms-masthead); font-size: 22pt; line-height: 0.95; color: var(--accent); }
        .toc-title { display: block; font-family: var(--ms-display); font-weight: 700; font-size: 11.5pt; line-height: 1.22; margin-top: 2pt; }

        /* Scripture */
        .pg-verse { background: var(--noir); color: var(--bone); display: flex; flex-direction: column; justify-content: center; padding: 0 1.1in; }
        .pg-verse blockquote { font-family: var(--ms-display); font-style: italic; font-size: 34pt; line-height: 1.22; margin: 0.35in 0 0.4in; border-left: 3px solid var(--accent); padding-left: 0.3in; }

        /* Stories */
        .story { break-before: page; }
        .story-head img { width: 100%; height: 3.9in; object-fit: cover; display: block; margin-bottom: 0.28in; }
        .story-head h2 { font-family: var(--ms-masthead); font-weight: 600; font-size: 32pt; line-height: 1; letter-spacing: -0.025em; margin: 0.12in 0 0.14in; text-wrap: balance; }
        .story-head .dek { font-family: var(--ms-serif); font-style: italic; font-size: 15pt; line-height: 1.35; color: var(--soft); margin-bottom: 0.14in; }
        .story-head { border-bottom: 1px solid var(--ink); padding-bottom: 0.18in; margin-bottom: 0.26in; }
        .story-body { columns: 2; column-gap: 0.32in; font-family: var(--ms-serif); font-size: 11.5pt; line-height: 1.42; color: #1c1a18; text-align: left; hyphens: auto; orphans: 2; widows: 2; }
        .story-body p { margin-bottom: 0.11in; }
        .story-body > p:first-of-type::first-letter { font-family: var(--ms-masthead); font-weight: 600; font-size: 46pt; float: left; line-height: 0.8; padding: 4pt 5pt 0 0; color: var(--accent); }
        .story-body h2, .story-body h3 { font-family: var(--ms-display); font-weight: 700; font-size: 12.5pt; line-height: 1.2; margin: 0.18in 0 0.07in; break-after: avoid; color: var(--ink); }
        .story-body blockquote { border-left: 2px solid var(--accent); padding-left: 0.12in; margin: 0.14in 0; font-style: italic; break-inside: avoid; }
        .story-body ul, .story-body ol { margin: 0 0 0.11in 0.2in; }
        .story-body ul { list-style: disc; } .story-body ol { list-style: decimal; }
        .story-body li { margin-bottom: 0.04in; }
        .story-body img { max-width: 100%; height: auto; display: block; margin: 0.1in 0; break-inside: avoid; }
        .story-body a { color: inherit; text-decoration: underline; text-decoration-color: var(--muted); text-underline-offset: 2pt; overflow-wrap: anywhere; }
        .story-body hr { border: none; border-top: 1px solid var(--rule); margin: 0.16in 0; }
        .endmark { text-align: center; color: var(--accent); font-size: 12pt; margin-top: 0.2in; }

        /* Fiction */
        .shelf { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.18in; margin-top: 0.45in; }
        .shelf figure { margin: 0; break-inside: avoid; }
        .shelf img { width: 100%; aspect-ratio: 16/25; object-fit: cover; display: block; box-shadow: 0 6px 18px rgba(0,0,0,0.25); }
        .shelf figcaption { font-family: var(--ms-display); font-style: italic; font-size: 9pt; line-height: 1.25; margin-top: 0.1in; }

        /* Back cover */
        .pg-back { background: var(--noir); color: var(--bone); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.22in; break-before: page; break-after: auto; }
        .pg-back .mast { font-size: 30pt; }
        .pg-back .amdg { font-family: var(--ms-display); font-style: italic; font-size: 13pt; color: var(--accent); margin-top: 0.3in; }

        /* On screen: show the pages as a centred stack */
        @media screen {
          body { background: #6f6a65; }
          .issue { width: 8.5in; margin: 24px auto; box-shadow: 0 10px 40px rgba(0,0,0,0.4); }
          .pg-contents, .pg-fiction, .story { padding: 0.9in 0.85in 1in; }
        }
      `}</style>
    </div>
  )
}
