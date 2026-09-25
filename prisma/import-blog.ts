// Imports the Squarespace blog export (content/blog/squarespace-blog.json) into the database.
// Safe to re-run: posts are upserted by slug.
//   npx tsx prisma/import-blog.ts            (dry run: prints the plan)
//   npx tsx prisma/import-blog.ts --write    (writes to the database)
import fs from 'node:fs'
import { PrismaClient } from '@prisma/client'

interface ExportedPost {
  title: string
  slug: string
  date: string
  categories: string[]
  starred: boolean
  excerpt: string
  localCover: string | null
  body: string
  embed?: string
}

const CATEGORIES = {
  faith: { name: 'Faith', description: 'Prayer, scripture, the saints, and the life of the Church.' },
  mind: { name: 'Mind', description: 'Neuroscience, focus, habits, money, and the work of a well-ordered mind.' },
  wellness: { name: 'Wellness', description: 'Body, food, routines, and the small comforts that restore us.' },
  reflections: { name: 'Reflections', description: 'Personal essays, memories, and books worth talking about.' },
  creative: { name: 'Creative', description: 'Writing, illustration, and artistic expression.' },
} as const
type CategorySlug = keyof typeof CATEGORIES

// Squarespace slug → category. Every post is listed explicitly.
const ASSIGN: Record<string, CategorySlug | 'skip'> = {
  // Faith
  'angels-demons-and-spiritual-warfare-a-catholic-guide-to-spiritual-protection': 'faith',
  'how-to-romanticize-your-life': 'faith',
  'finding-perfect-strength-in-imperfect-weakness': 'faith',
  'where-is-the-human-heart-on-magnifica-humanitas-pope-leo-xivs-encyclical-on-ai-and-human-dignity': 'faith',
  'holy-week-good-friday-the-cost-of-love': 'faith',
  'welcome-to-holy-week-holy-maundy-thursday': 'faith',
  'welcome-to-holy-week-palm-sunday': 'faith',
  'catholic-prayer-guide': 'faith',
  'step-by-step-guide-to-the-holy-rosary': 'faith',
  'sin-conscience-and-redemption-a-catholic-analysis-of-crime-and-punishment': 'faith',
  'how-to-schedule-your-week-with-god': 'faith',
  'wisdom-for-everyday-life-thebook-of-proverbs': 'faith',
  '12-christian-books-to-read-during-lent-to-deepen-faith': 'faith',
  'a-christian-morning-routine': 'faith',
  'lent-a-40-day-devotional-journey': 'faith',
  'thomas-aquinas-a-restless-relentless-pursuit': 'faith',
  'freedom-with-fear-of-the-lord': 'faith',
  'christian-journaling-a-sacred-practice-for-spiritual-growth-healing-and-hearing-god': 'faith',
  'the-journey-of-the-soul-stages-of-salvation': 'faith',
  '10-ways-to-pray': 'faith',
  '17-rituals-in-christianity-the-sacred-rhythms-of-daily-life': 'faith',
  'liturgy-of-the-hour': 'faith',
  'the-catholic-life': 'faith',
  'the-book-of-wisdom-proverbs-bible-study': 'faith',
  'take-me-to-church': 'faith',
  'bible-study-hebrews': 'faith',
  'stepping-into-sanctification': 'faith',
  'fighting-for-eternity': 'faith',
  'the-renewing-of-the-mind': 'faith',
  'meditating-on-the-word-psalms': 'faith',
  'a-time-for-healing-after-the-war': 'faith',
  'the-bible-reading-plan-structure-and-methods': 'faith',
  'where-do-i-begin-to-end-where-do-i-end-to-begin': 'faith',
  'the-ultimate-act-of-sacrifice-and-self-control': 'faith',
  'a-perishable-gold-that-is-tested-by-fire': 'faith',
  'chasing-eternity-a-changing-light': 'faith',
  'to-be-loved-by-those-who-love': 'faith',
  'the-power-of-words-in-praise-and-prayer': 'faith',
  // Mind
  '10-financial-tips-to-master-your-money': 'mind',
  'the-neuroscience-behind-programming-what-happens-in-the-brain-when-you-code': 'mind',
  '10-habits-that-changed-my-life-and-can-change-yours-too': 'mind',
  '921wliu21zndo76xquoa2ucuj52sqe': 'mind', // Neuroscience of Budgeting
  'the-neuroscience-behind-discipline-why-it-matters-to-christians': 'mind',
  'changing-careers-in-midlife-the-neuroscience-of-reinvention': 'mind',
  'you-can-change-your-brain-': 'mind',
  'the-hijacked-mind-how-social-media-rewires-the-brain-and-how-to-reclaim-your-attention': 'mind',
  'financial-stability-and-the-science-of-human-well-being': 'mind',
  'how-to-focus-in-a-distracted-world': 'mind',
  'faith-productivity-and-the-spiritual-brain-in-modern-life': 'mind',
  'how-to-achieve-your-dream-life': 'mind',
  'beyond-resolutions-building-systems-for-the-new-year-that-actually-work': 'mind',
  'building-hipaa-compliant-healthcare-applications-with-nextjs': 'mind',
  'study-techniques-that-work': 'mind',
  'breaking-old-habits-making-new-ones': 'mind',
  'time-management-tactics-for-busy-people': 'mind',
  'how-to-find-the-right-career-core-principles-that-work': 'mind',
  'the-power-of-action-combat-procrastination-and-unlock-success': 'mind',
  'my-productivity-system': 'mind',
  'how-to-hack-habits': 'mind',
  'begin-again-3-ways-to-optimize-your-day': 'mind',
  'world-rounded-the-importance-of-news-outlets': 'mind',
  // Wellness
  'bgx78wybx7cg54f0dx5a79pkcs96f4': 'wellness', // Neuroscience Behind Eating Disorders
  'strengthening-body-and-spirit-a-christian-perspective-on-pilates': 'wellness',
  'the-art-of-journaling-5-effective-journaling-techniques-to-reduce-stress-and-anxiety': 'wellness',
  'rk63q4s6hjuuh3t509pkmww9iow4wd': 'wellness', // Hidden Cost of Junk Food
  'practical-techniques-to-manage-anxiety': 'wellness',
  '4usd8lfu9xe7tynexhk5rvkhp4mg3q': 'wellness', // 7 Cozy Games For Fall Therapy
  'more-room-for-hygge-finding-joy-in-simplicity-and-comfort': 'wellness',
  'brown-butter-matcha-white-chocolate-chip-cookies': 'wellness',
  'my-skincare-routine-the-science-and-tea-behind-skincare-products': 'wellness',
  'what-i-think-about-when-i-think-about-running': 'wellness',
  '7-sandwich-recipes': 'wellness',
  'hobbies-to-try-in-2025': 'wellness',
  'healthy-girl-habits': 'wellness',
  'my-coffee-obsession': 'wellness',
  'meditation-for-dummies': 'wellness',
  'the-yogi-life': 'wellness',
  'benefits-of-boxing': 'wellness',
  'the-ideal-evening-routine': 'wellness',
  'the-5am-morning-routine': 'wellness',
  'my-running-journey': 'wellness',
  'morning-routine-for-christians-and-the-non-huberman': 'wellness',
  // Reflections
  'an-introduction': 'reflections',
  'books-of-the-month-march-book-reviews-on-genius-humanity-and-the-search-for-meaning': 'reflections',
  '10-life-lessons-from-my-20s': 'reflections',
  'wfluqcgxiduf9ltp73iqb3n067ndj7': 'reflections', // the beginning of a rockstar legend
  'dancing-for-the-devil-B6iSp': 'reflections',
  'the-best-pen-goes-to': 'reflections',
  'fixing-broken-hearts-meet-my-mother': 'reflections',
  'thirty-foodie-question-game': 'reflections',
  '75-favorite-things-the-game': 'reflections',
  // Creative
  'when-we-were-catholics-chapter-1-gloria': 'creative',
  'the-legacy-of-hours-prologue': 'creative',
  'age-of-atheos-excerpt': 'creative',
  'space-and-sky-entwined-ebook': 'creative',
  'a-day-at-the-met': 'creative',
  // Already on the Fiction page
  'world-of-eden-immersion-chapter-16-oceans-archangels': 'skip',
  'normatives-chapter-1': 'skip',
  'for-all-of-eternity-chapter-4': 'skip',
  'for-all-of-eternity-chapter-5': 'skip',
}

// Lead stories for the magazine homepage
const FEATURED = new Set([
  'where-is-the-human-heart-on-magnifica-humanitas-pope-leo-xivs-encyclical-on-ai-and-human-dignity',
  'angels-demons-and-spiritual-warfare-a-catholic-guide-to-spiritual-protection',
  'the-hijacked-mind-how-social-media-rewires-the-brain-and-how-to-reclaim-your-attention',
  'how-to-romanticize-your-life',
  'my-skincare-routine-the-science-and-tea-behind-skincare-products',
])

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// Squarespace auto-generated slugs are random strings; derive one from the title instead
function cleanSlug(p: ExportedPost): string {
  if (/^[a-z0-9]{25,}$/.test(p.slug)) return slugify(p.title)
  return p.slug.replace(/-[A-Za-z0-9]{5}$/, m => (/[A-Z]/.test(m) ? '' : m)).replace(/-+$/, '').toLowerCase()
}

function makeExcerpt(p: ExportedPost): string {
  if (p.excerpt) return p.excerpt
  const para = p.body
    .split('\n\n')
    .map(b => b.replace(/^>\s*/, ''))
    .find(b => !/^(!\[|#|- |1\. |---)/.test(b) && b.replace(/[*_]/g, '').length > 60) ?? ''
  const text = para.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_]/g, '').replace(/\s+/g, ' ').trim()
  return text.length > 200 ? text.slice(0, 197).replace(/\s+\S*$/, '') + '…' : text
}

async function main() {
  const write = process.argv.includes('--write')
  const { posts } = JSON.parse(fs.readFileSync('content/blog/squarespace-blog.json', 'utf8')) as { posts: ExportedPost[] }

  const missing = posts.filter(p => !(p.slug in ASSIGN))
  if (missing.length) throw new Error(`No category for: ${missing.map(p => p.slug).join(', ')}`)

  const plan = posts
    .filter(p => ASSIGN[p.slug] !== 'skip')
    .map(p => ({
      slug: cleanSlug(p),
      category: ASSIGN[p.slug] as CategorySlug,
      data: {
        title: p.title,
        excerpt: makeExcerpt(p),
        content: p.embed ? `${p.body}\n\n[Open the flipbook](${p.embed})` : p.body,
        coverImage: p.localCover,
        featured: FEATURED.has(p.slug),
        published: true,
        publishedAt: new Date(p.date),
      },
    }))

  const counts = plan.reduce<Record<string, number>>((m, p) => ((m[p.category] = (m[p.category] ?? 0) + 1), m), {})
  console.log(`${plan.length} posts (${posts.length - plan.length} skipped as fiction duplicates)`, counts)
  const dupes = plan.map(p => p.slug).filter((s, i, a) => a.indexOf(s) !== i)
  if (dupes.length) throw new Error(`Duplicate slugs: ${dupes.join(', ')}`)
  if (!write) {
    console.log('Dry run. Re-run with --write to import.')
    return
  }

  const prisma = new PrismaClient()
  try {
    const author = await prisma.author.findUniqueOrThrow({ where: { slug: 'shirley-xu' } })
    const categoryIds: Record<string, string> = {}
    for (const [slug, c] of Object.entries(CATEGORIES)) {
      const row = await prisma.category.upsert({
        where: { slug },
        update: {},
        create: { slug, ...c },
      })
      categoryIds[slug] = row.id
    }
    for (const p of plan) {
      await prisma.post.upsert({
        where: { slug: p.slug },
        update: { ...p.data, categoryId: categoryIds[p.category] },
        create: { ...p.data, slug: p.slug, authorId: author.id, categoryId: categoryIds[p.category] },
      })
    }
    console.log(`Imported ${plan.length} posts.`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
