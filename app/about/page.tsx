import type { Metadata } from 'next'
import { NewsletterForm } from '@/components/NewsletterForm'

export const metadata: Metadata = {
  title: 'About',
  description: 'About Mind & Spirit — a space for faith, wellness, creative writing, and illustration.',
}

export default function AboutPage() {
  return (
    <>
      {/* Header */}
      <header
        style={{
          background: 'var(--ms-off)',
          borderBottom: '1px solid var(--ms-rule)',
          padding: '64px 48px 56px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--ms-body)',
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: 'var(--ms-stone-dk)',
            marginBottom: 16,
          }}
        >
          The Publication
        </p>
        <h1
          style={{
            fontFamily: 'var(--ms-script)',
            fontSize: 'clamp(60px, 9vw, 96px)',
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: 0,
            color: 'var(--ms-ink)',
          }}
        >
          About Mind & Spirit
        </h1>
      </header>

      {/* Content */}
      <article
        className="prose-editorial"
        style={{ padding: '64px 24px 80px' }}
      >
        <p>
          Mind & Spirit is a personal magazine covering faith, wellness, creative writing, and illustration.
          It is a space for slow thinking, careful attention, and the kind of writing that sits with
          difficult questions rather than rushing past them.
        </p>

        <p>
          The essays here are personal without being confessional, spiritual without being sectarian.
          They are written for people who are paying attention to their inner lives — to the practices
          that sustain them, the questions that return, the quiet work of becoming more fully themselves.
        </p>

        <blockquote>
          <p>
            The examined life is not just worth living. It is the only life worth writing about.
          </p>
        </blockquote>

        <h2>What You'll Find Here</h2>

        <p>
          <strong style={{ color: 'var(--ms-ink)' }}>Faith</strong> — Reflections on prayer,
          scripture, doubt, and what it means to hold belief with both conviction and humility.
        </p>

        <p>
          <strong style={{ color: 'var(--ms-ink)' }}>Wellness</strong> — The practices that tend
          to body and mind: movement, rest, attention, and the slow cultivation of resilience.
        </p>

        <p>
          <strong style={{ color: 'var(--ms-ink)' }}>Creative</strong> — On writing, drawing,
          making things by hand, and why creative expression is not a luxury but a necessity.
        </p>

        <p>
          <strong style={{ color: 'var(--ms-ink)' }}>Reflections</strong> — The harder-to-categorize
          pieces: essays about ordinary days, quiet seasons, what we notice when we slow down.
        </p>

        <h2>About the Writer</h2>

        <p>
          Shirley Xu is a writer and illustrator based in New York. She writes at the intersection
          of faith and everyday life, and believes that paying close attention to small things
          is one of the most radical acts available to us.
        </p>

        <p>
          When she's not writing, she's usually drawing, walking, or looking for a very good cup of tea.
        </p>
      </article>

      <NewsletterForm />
    </>
  )
}
