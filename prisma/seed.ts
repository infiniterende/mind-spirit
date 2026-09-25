import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed authors
  const shirley = await prisma.author.upsert({
    where: { slug: 'shirley-xu' },
    update: {},
    create: {
      name: 'Shirley Xu',
      slug: 'shirley-xu',
      bio: 'Writer exploring the intersection of faith, wellness, and creative living.',
      email: 'shirley.xu.com@gmail.com',
    },
  })

  // Seed categories
  const faith = await prisma.category.upsert({
    where: { slug: 'faith' },
    update: {},
    create: { name: 'Faith', slug: 'faith', description: 'Reflections on spirituality and belief.' },
  })
  const wellness = await prisma.category.upsert({
    where: { slug: 'wellness' },
    update: {},
    create: { name: 'Wellness', slug: 'wellness', description: 'Mind and body practices for a balanced life.' },
  })
  const creative = await prisma.category.upsert({
    where: { slug: 'creative' },
    update: {},
    create: { name: 'Creative', slug: 'creative', description: 'Writing, illustration, and artistic expression.' },
  })
  const reflections = await prisma.category.upsert({
    where: { slug: 'reflections' },
    update: {},
    create: { name: 'Reflections', slug: 'reflections', description: 'Quiet moments and contemplative essays.' },
  })

  // Seed tags
  const tags = ['mindfulness', 'prayer', 'journaling', 'art', 'nature', 'community', 'rest']
  const tagRecords = await Promise.all(
    tags.map(name =>
      prisma.tag.upsert({
        where: { slug: name },
        update: {},
        create: { name: name.charAt(0).toUpperCase() + name.slice(1), slug: name },
      })
    )
  )

  // Seed sample posts
  const posts = [
    {
      title: 'The Quiet Practice of Morning Stillness',
      slug: 'morning-stillness',
      excerpt: 'How I learned to carve out silence in the first hour of the day — and why it changed everything.',
      content: `# The Quiet Practice of Morning Stillness

There is a particular quality of light that belongs only to early morning. Before the notifications arrive, before the demands of the day take shape, the world holds its breath for just a moment.

I came to this practice slowly, reluctantly. I am not, by nature, a morning person. But I found that the mornings I skipped my quiet time were the mornings I felt scattered, reactive — as if I'd started a long journey without consulting the map.

## What Morning Stillness Looks Like

It doesn't have to be elaborate. Some mornings it's ten minutes with a cup of tea and a single passage. Some mornings it's longer — journaling, prayer, sitting with an intention for the day.

> "In returning and rest you shall be saved; in quietness and trust shall be your strength." — Isaiah 30:15

The key is consistency over length. A daily five minutes does more than an occasional hour.

## Starting Small

If you've never kept a morning practice, begin with this: before you look at your phone, make yourself a warm drink and sit with it for five minutes. No agenda. Just presence.

That's it. That's the whole practice, at first.

From that small beginning, something larger tends to grow.`,
      featured: true,
      published: true,
      publishedAt: new Date('2025-03-15'),
      authorId: shirley.id,
      categoryId: faith.id,
    },
    {
      title: 'On Learning to Rest Without Guilt',
      slug: 'rest-without-guilt',
      excerpt: 'Rest is not laziness. It is the ground from which everything else grows.',
      content: `# On Learning to Rest Without Guilt

We live in a culture that has made productivity a virtue and rest a liability. I absorbed this without realizing it — measuring my worth in output, apologizing for slow days, filling every hour with something justifiable.

It took a burnout to teach me otherwise.

## The Sabbath Principle

Every major spiritual tradition has something to say about rest. The Jewish concept of Sabbath — Shabbat — is one of the most radical ideas in human history: one full day each week when work stops, completely.

Not "work a little." Not "check in once." Stop.

I'm not arguing for a strict religious observance here. I'm pointing at what that practice understands: that human beings are not machines, and that the rhythm of work and rest is sacred.

## What Rest Actually Is

Rest is not doing nothing. It is doing what replenishes you rather than depletes you.

For some people, that's sleep. For others, it's movement in nature, or cooking slowly, or reading fiction, or spending time with people you love without an agenda.

The question to ask is: does this activity leave me feeling more like myself, or less?

## Practical Experiment

For one weekend this month, try choosing one activity that you've been postponing because it doesn't feel "productive" — and do it without apologizing.

Notice what happens.`,
      featured: false,
      published: true,
      publishedAt: new Date('2025-04-02'),
      authorId: shirley.id,
      categoryId: wellness.id,
    },
    {
      title: 'Keeping a Sketchbook When You\'re Not an Artist',
      slug: 'sketchbook-not-artist',
      excerpt: 'You don\'t have to be good at drawing to benefit from keeping a visual journal.',
      content: `# Keeping a Sketchbook When You're Not an Artist

I am not a trained artist. My figures are wobbly. My perspective is approximate. My proportions are charitably described as "expressive."

I have kept a sketchbook for three years, and it has changed how I see.

## What a Sketchbook Is For

Most people think a sketchbook is for producing drawings. It isn't — or at least, it doesn't have to be.

A sketchbook is for *looking*. It is a tool for paying attention.

When you draw something — even badly — you have to look at it longer than you would otherwise. You notice the way light falls on a coffee cup. You observe that a leaf is not just green but forty shades of green.

This kind of attention is, I believe, a form of prayer.

## Getting Started

Buy the cheapest sketchbook you can find. Use whatever pen is in your bag. Spend five minutes drawing something in front of you — your keys, your hand, the view from your window.

Don't show anyone. This is not for an audience.

Do it again tomorrow.

## The Accumulation

After six months, you'll have a record of your days unlike any photograph can offer — slower, more particular, traced with your own attention.

That record, those small accumulated acts of looking, will have taught you something that is very hard to teach any other way: how to be present.`,
      featured: true,
      published: true,
      publishedAt: new Date('2025-04-18'),
      authorId: shirley.id,
      categoryId: creative.id,
    },
    {
      title: 'A Letter to Myself in Difficult Seasons',
      slug: 'letter-difficult-seasons',
      excerpt: 'Written during a winter that stretched too long. For anyone in a season that won\'t seem to turn.',
      content: `# A Letter to Myself in Difficult Seasons

Dear you,

I know the particular quality of this exhaustion. Not the tired that comes from a hard day's work — that kind is almost satisfying. This is the tired that wakes you at 3am with the familiar weight pressing on your chest.

I know the way the days have been bleeding together, the way the things that used to delight you have gone a little flat.

I know you are wondering whether this is who you are now.

It isn't.

Seasons change. You have been through other winters — not this exact one, but ones that felt equally final. You are still here.

## What To Do With the Hard Days

On the days you can manage only small things, do only small things. Make your bed. Eat something warm. Go outside for ten minutes.

These are not failure. These are foundation.

## On Asking for Help

You are not good at this. I know. The asking feels like an admission of something you are afraid to admit.

But people who love you want to be let in. Their care is not conditional on your being fine. You are allowed to not be fine.

## What I Want You to Hold

This will not last forever. The ground will shift again. New things will begin to interest you; you will look forward to something.

Until then: be gentle with yourself. You are doing better than you know.

With love,
Your future self`,
      featured: false,
      published: true,
      publishedAt: new Date('2025-05-01'),
      authorId: shirley.id,
      categoryId: reflections.id,
    },
    {
      title: 'Walking as a Spiritual Practice',
      slug: 'walking-spiritual-practice',
      excerpt: 'The ancients knew something we have forgotten: the body and the soul move together.',
      content: `# Walking as a Spiritual Practice

The philosophers walked. Aristotle's followers were called the Peripatetics — the walkers. Søren Kierkegaard walked the streets of Copenhagen, working through his ideas on foot. Wordsworth walked obsessively; Coleridge estimated he covered 180,000 miles in his lifetime.

There is something about walking that the thinkers and mystics have always known.

## What Happens When We Walk

The body moves at a pace the mind can match. Unlike driving or scrolling, walking doesn't overwhelm the senses — it engages them gently: the quality of the light, the temperature of the air, the sound of your own footsteps.

In this sensory middle ground, something in the mind relaxes its grip. Ideas arrive sideways. Problems resolve themselves.

## Walking With Intention

A walking practice can be as simple as this: leave your phone at home, and walk for thirty minutes with no destination or goal.

You will feel the urge to be productive. Let it pass.

You will notice things: a tree you have walked past a hundred times, a smell you cannot identify, the quality of afternoon light against a wall.

This noticing is enough. This is the practice.

## The Prayer Walk

For those inclined toward prayer: walking prayer is one of the oldest forms. The labyrinth, the pilgrimage, the rosary — all involve movement as part of devotion.

Try this: on your next walk, hold one word or question in mind, loosely. Not as something to solve, but as something to carry.

See what the walk does with it.`,
      featured: false,
      published: true,
      publishedAt: new Date('2025-05-20'),
      authorId: shirley.id,
      categoryId: wellness.id,
    },
  ]

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    })
  }

  // Add tags to posts
  const morningPost = await prisma.post.findUnique({ where: { slug: 'morning-stillness' } })
  const mindfulnessTag = tagRecords.find(t => t.slug === 'mindfulness')!
  const prayerTag = tagRecords.find(t => t.slug === 'prayer')!

  if (morningPost) {
    await prisma.postTag.upsert({
      where: { postId_tagId: { postId: morningPost.id, tagId: mindfulnessTag.id } },
      update: {},
      create: { postId: morningPost.id, tagId: mindfulnessTag.id },
    })
    await prisma.postTag.upsert({
      where: { postId_tagId: { postId: morningPost.id, tagId: prayerTag.id } },
      update: {},
      create: { postId: morningPost.id, tagId: prayerTag.id },
    })
  }

  console.log('✅ Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
