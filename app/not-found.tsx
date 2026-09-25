import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Not Found',
}

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px 24px',
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
          marginBottom: 24,
        }}
      >
        404
      </p>
      <h1
        style={{
          fontFamily: 'var(--ms-script)',
          fontSize: 'clamp(54px, 7.5vw, 84px)',
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: 0,
          color: 'var(--ms-ink)',
          marginBottom: 16,
        }}
      >
        Page Not Found
      </h1>
      <p
        style={{
          fontFamily: 'var(--ms-body)',
          fontSize: 15,
          color: 'var(--ms-ink-soft)',
          lineHeight: 1.7,
          maxWidth: 400,
          marginBottom: 40,
        }}
      >
        The essay you&apos;re looking for has moved, or perhaps it was never here to begin with.
      </p>
      <Link
        href="/"
        style={{
          fontFamily: 'var(--ms-body)',
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--ms-ink)',
          borderBottom: '1px solid var(--ms-ink)',
          paddingBottom: 2,
        }}
      >
        Return Home
      </Link>
    </div>
  )
}
