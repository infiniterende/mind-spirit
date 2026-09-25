// Art and design portfolio, originally from the Squarespace site.
// Images live in /public/images/art.

export interface Artwork {
  src: string
  alt: string
  width: number
  height: number
  title?: string
}

export interface Collection {
  slug: string
  name: string
  kind: 'art' | 'design'
  pieces: Artwork[]
}

const art = (file: string, alt: string, width = 1500, height = 1500): Artwork => ({
  src: `/images/art/${file}.webp`,
  alt,
  width,
  height,
})

const design = (file: string, title: string, width: number, height: number): Artwork => ({
  src: `/images/art/website-designs-${file}.webp`,
  alt: `${title} website design`,
  title,
  width,
  height,
})

export const COLLECTIONS: Collection[] = [
  {
    slug: 'portraits',
    name: 'Portraits',
    kind: 'art',
    pieces: [
      art('portraits-untitled-artwork-13-2', 'Line-drawn profile against a lavender watercolor wash', 1466, 1696),
      art('portraits-untitled-artwork-9-2', 'Woman with dark wavy hair, eyes lowered'),
      art('portraits-untitled-artwork-10', 'Woman with long blue-black hair weeping blue tears'),
      art('portraits-untitled-artwork-12', 'Woman with auburn hair and a floral circlet, in profile'),
      art('portraits-untitled-artwork-14', 'Woman with long dark hair beside the words “shadow of my soul”'),
      art('portraits-untitled-artwork-11', 'Woman in profile wearing a crown of leaves'),
      art('portraits-untitled-artwork-2', 'Silhouette of a dancer in a black dress'),
      art('portraits-untitled-artwork-3', 'Short-haired woman in a black top with red lips'),
      art('portraits-untitled-artwork', 'Line drawing of a woman with curly hair, hand to her face'),
      art('portraits-untitled-artwork-5', 'Woman with dark hair pulled back and red lips'),
      art('portraits-untitled-artwork-6', 'Woman with a black bob in an off-shoulder top'),
      art('portraits-untitled-artwork-16', 'Woman with violet hair'),
      art('portraits-untitled-artwork-17', 'Woman in a yellow gown seen from behind'),
      art('portraits-untitled-artwork-18', 'Minimal line drawing of a face with closed eyes'),
      art('portraits-untitled-artwork-28', 'Line drawing of a woman with an updo'),
      art('portraits-untitled-artwork-27', 'Line portrait of a woman with long hair'),
      art('portraits-untitled-artwork-31', 'Line portrait of a man with wavy hair'),
    ],
  },
  {
    slug: 'flora-and-fauna',
    name: 'Flora & Fauna',
    kind: 'art',
    pieces: [
      art('flora-and-fauna-untitled-artwork-8', 'Two birds on a branch above the words “home sweet home”'),
      art('flora-and-fauna-untitled-artwork-7', 'Watercolor floral wreath around the word “hello”'),
      art('flora-and-fauna-untitled-artwork-20', 'Pink rose wreath around the word “love”'),
      art('flora-and-fauna-untitled-artwork-19', 'Bouquet of pink and red wildflowers'),
      art('flora-and-fauna-untitled-artwork-21', 'Row of pink and blue wildflower stems'),
      art('flora-and-fauna-untitled-artwork-22', 'Row of muted wildflower stems'),
      art('flora-and-fauna-untitled-artwork-23', 'Coral flowers in a grey vase'),
    ],
  },
  {
    slug: 'bible-verses',
    name: 'Bible Verses',
    kind: 'art',
    pieces: [
      art('bible-verses-untitled-artwork-24', 'Hand-lettered verse inside a floral wreath on deep green'),
      art('bible-verses-untitled-artwork-25', 'Hand-lettered verse framed by blue and white flowers'),
      art('bible-verses-untitled-artwork-26', 'Hand-lettered verse inside a pink rose wreath'),
    ],
  },
  {
    slug: 'website-designs',
    name: 'Website Designs',
    kind: 'design',
    pieces: [
      design('luxierge', 'Luxierge', 1200, 1693),
      design('kidcare', 'KidCare', 1200, 1295),
      design('jewelry-site-homepage-1', 'Jewelry Boutique', 1440, 4657),
      design('product-page', 'Product Page', 1440, 3151),
      design('products', 'Product Listing', 1280, 1171),
      design('shopping-cart', 'Shopping Cart', 1280, 968),
      design('home-page-1', 'Skincare Homepage', 1440, 4156),
      design('hillbilly-thomists-homepage', 'Hillbilly Thomists', 1440, 9822),
      design('agilance-homepage', 'Agilance', 1440, 5858),
      design('acai-homepage', 'Acai', 1440, 8552),
      design('shelby-sacco-homepage', 'Shelby Sacco', 1440, 9397),
    ],
  },
]

// A mixed selection for the homepage
export const FEATURED_ART: Artwork[] = [
  COLLECTIONS[0].pieces[2],
  COLLECTIONS[1].pieces[0],
  COLLECTIONS[0].pieces[3],
  COLLECTIONS[2].pieces[0],
  COLLECTIONS[0].pieces[10],
  COLLECTIONS[1].pieces[2],
]
