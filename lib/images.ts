// Local cover images in /public/images, used when a post has no coverImage set.
const IMAGES = [
  '/images/monstrance-closeup.jpg',
  '/images/rosary-bible.jpg',
  '/images/rosary-spanish-bible.jpg',
  '/images/adoration-candles.jpg',
  '/images/st-joseph-window.jpg',
  '/images/baroque-nave.jpg',
  '/images/gothic-sanctuary.jpg',
]

// Hand-picked images for the seeded posts
const BY_SLUG: Record<string, string> = {
  'morning-stillness': '/images/rosary-bible.jpg',
  'rest-without-guilt': '/images/gothic-sanctuary.jpg',
  'sketchbook-not-artist': '/images/st-joseph-window.jpg',
  'letter-difficult-seasons': '/images/rosary-spanish-bible.jpg',
  'walking-spiritual-practice': '/images/baroque-nave.jpg',
}

export function getCoverImage(post: { slug: string; coverImage: string | null }): string {
  if (post.coverImage) return post.coverImage
  if (BY_SLUG[post.slug]) return BY_SLUG[post.slug]
  // Stable fallback so a post always gets the same image
  let hash = 0
  for (const ch of post.slug) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return IMAGES[hash % IMAGES.length]
}
