// Renders an issue's print edition to public/issues/mind-spirit-<yyyy-mm>.pdf.
//   npm run issue:pdf -- 2026-09
// Needs the dev server running (npm run dev) and Google Chrome installed.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, statSync } from 'node:fs'

const id = process.argv[2]
if (!/^\d{4}-\d{2}$/.test(id ?? '')) {
  console.error('Usage: npm run issue:pdf -- 2026-09')
  process.exit(1)
}
const base = process.env.SITE_URL ?? 'http://localhost:3000'
const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
if (!existsSync(chrome)) {
  console.error(`Chrome not found at ${chrome}. Set CHROME_PATH.`)
  process.exit(1)
}

const res = await fetch(`${base}/issue/${id}`).catch(() => null)
if (!res?.ok) {
  console.error(`Could not load ${base}/issue/${id} (${res?.status ?? 'no response'}). Is the dev server running?`)
  process.exit(1)
}

mkdirSync('public/issues', { recursive: true })
const out = `public/issues/mind-spirit-${id}.pdf`
execFileSync(chrome, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--virtual-time-budget=30000', `--print-to-pdf=${out}`, `${base}/issue/${id}`], { stdio: 'ignore' })
console.log(`${out} — ${(statSync(out).size / 1e6).toFixed(1)} MB`)
