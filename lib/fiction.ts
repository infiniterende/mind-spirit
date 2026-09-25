// Fiction lives as Markdown in /content/fiction/<collection>/<piece>.md,
// originally imported from the Squarespace "Writing" section.
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const ROOT = path.join(process.cwd(), 'content', 'fiction')

export interface FictionCollection {
  slug: string
  title: string
  description: string
  // 'serial' = numbered chapters read in order; 'collection' = standalone pieces
  kind: 'serial' | 'collection'
  cover?: string
  coverAlt?: string
}

export interface FictionPiece {
  collection: string
  slug: string
  title: string
  date: string
  order: number
  excerpt: string
  body: string
  wordCount: number
}

export function getFictionCollections(): FictionCollection[] {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'collections.json'), 'utf8'))
}

export function getFictionCollection(slug: string): FictionCollection | undefined {
  return getFictionCollections().find(c => c.slug === slug)
}

export function getFictionPieces(collection: string): FictionPiece[] {
  const dir = path.join(ROOT, collection)
  if (!fs.existsSync(dir)) return []
  const kind = getFictionCollection(collection)?.kind
  const pieces = fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => readPiece(collection, f.replace(/\.md$/, '')))
  // Serials read first-to-last; standalone collections show newest first
  return kind === 'serial'
    ? pieces.sort((a, b) => a.order - b.order)
    : pieces.sort((a, b) => b.date.localeCompare(a.date))
}

export function getFictionPiece(collection: string, slug: string): FictionPiece | null {
  if (!/^[a-z0-9-]+$/.test(collection) || !/^[a-z0-9-]+$/.test(slug)) return null
  const file = path.join(ROOT, collection, `${slug}.md`)
  if (!fs.existsSync(file)) return null
  return readPiece(collection, slug)
}

function readPiece(collection: string, slug: string): FictionPiece {
  const { data, content } = matter(fs.readFileSync(path.join(ROOT, collection, `${slug}.md`), 'utf8'))
  const body = content.trim()
  return {
    collection,
    slug,
    title: data.title,
    date: data.date,
    order: data.order,
    excerpt: data.excerpt || firstLine(body),
    body,
    wordCount: body.split(/\s+/).filter(Boolean).length,
  }
}

// First prose paragraph, trimmed to a teaser
function firstLine(body: string): string {
  const para = body
    .split('\n\n')
    .find(p => !p.startsWith('!') && !/^https?:\/\//.test(p) && p.length > 40) ?? ''
  const text = para.replace(/[*_]/g, '').replace(/\s+/g, ' ').trim()
  return text.length > 180 ? text.slice(0, 177).replace(/\s+\S*$/, '') + '…' : text
}

export function readingTime(words: number): string {
  return `${Math.max(1, Math.round(words / 230))} min read`
}
