// Back issues available as PDFs in /public/issues. Newest first.
// Build a new one with `npm run issue:pdf -- 2026-10`, then add it here.
export interface Issue {
  id: string // yyyy-mm
  label: string
  file: string
  pages: number
}

export const ISSUES: Issue[] = [
  { id: '2026-09', label: 'N° 09 — September 2026', file: '/issues/mind-spirit-2026-09.pdf', pages: 46 },
]
