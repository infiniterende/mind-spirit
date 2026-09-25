import { Fragment, type ReactNode } from 'react'

// Renders the Markdown subset produced by the Squarespace imports (posts and fiction):
// paragraphs, line breaks, ## headings, > quotes, lists, --- rules, images,
// **bold**, *italic*, [links](url) and bare URLs.
export function MarkdownBody({ source }: { source: string }) {
  const blocks = source.split(/\n{2,}/)
  return (
    <>
      {blocks.map((block, i) => {
        if (block === '---') return <hr key={i} className="scene-break" />

        const image = block.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
        if (image) {
          return (
            // Plain <img> so Markdown images keep their natural proportions
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={image[2]} alt={image[1]} loading="lazy" />
          )
        }

        if (/^- /.test(block)) {
          return (
            <ul key={i}>
              {block.split('\n').map((li, j) => <li key={j}>{inline(li.replace(/^- /, ''))}</li>)}
            </ul>
          )
        }

        if (/^\d+\. /.test(block)) {
          return (
            <ol key={i}>
              {block.split('\n').map((li, j) => <li key={j}>{inline(li.replace(/^\d+\. /, ''))}</li>)}
            </ol>
          )
        }

        const heading = block.match(/^(#{2,4}) ([\s\S]+)$/)
        if (heading) {
          const Tag = heading[1].length === 2 ? 'h2' : 'h3'
          return <Tag key={i}>{inline(heading[2])}</Tag>
        }

        if (block.startsWith('> ')) {
          return (
            <blockquote key={i}>
              <p>{lines(block.replace(/^> ?/gm, ''))}</p>
            </blockquote>
          )
        }

        return <p key={i}>{lines(block)}</p>
      })}
    </>
  )
}

function lines(text: string): ReactNode[] {
  return text.split(/ {2}\n|\n/).map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {inline(line)}
    </Fragment>
  ))
}

function inline(text: string): ReactNode {
  const out: ReactNode[] = []
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*(.+?)\*\*|\*(.+?)\*|(https?:\/\/[^\s)]+)/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const k = out.length
    if (m[1] !== undefined) out.push(<Link key={k} href={m[2]}>{inline(m[1])}</Link>)
    else if (m[3] !== undefined) out.push(<strong key={k}>{inline(m[3])}</strong>)
    else if (m[4] !== undefined) out.push(<em key={k}>{inline(m[4])}</em>)
    else out.push(<Link key={k} href={m[5]}>{linkLabel(m[5])}</Link>)
    last = re.lastIndex
  }
  if (last < text.length) out.push(text.slice(last))
  return out.length === 1 ? out[0] : <>{out}</>
}

// External links open in a new tab; internal ones stay put
function Link({ href, children }: { href: string; children: ReactNode }) {
  const external = /^https?:\/\//.test(href)
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
  ) : (
    <a href={href}>{children}</a>
  )
}

function linkLabel(url: string): string {
  if (/\.pdf(\?|$)/i.test(url)) return 'Read the PDF'
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
