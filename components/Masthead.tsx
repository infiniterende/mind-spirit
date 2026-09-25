'use client'

import Link from 'next/link'
import { useState } from 'react'

const NAV_LEFT = [
  { label: 'Faith', href: '/categories/faith' },
  { label: 'Mind', href: '/categories/mind' },
  { label: 'Wellness', href: '/categories/wellness' },
  { label: 'Reflections', href: '/categories/reflections' },
]

const NAV_RIGHT = [
  { label: 'Creative', href: '/categories/creative' },
  { label: 'Fiction', href: '/fiction' },
  { label: 'About', href: '/about' },
]

export function Masthead() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header
        style={{
          background: 'var(--ms-white)',
          borderBottom: '1px solid var(--ms-rule)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            padding: '22px 48px',
            maxWidth: '100%',
          }}
          className="masthead-inner"
        >
          {/* Left nav */}
          <nav style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="mast-nav desktop-nav">
            {NAV_LEFT.map(n => (
              <Link
                key={n.href}
                href={n.href}
                style={{
                  fontFamily: 'var(--ms-body)',
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--ms-ink-soft)',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--ms-ink)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--ms-ink-soft)')}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Brand */}
          <Link
            href="/"
            style={{
              fontFamily: 'var(--ms-masthead)',
              fontSize: 22,
              fontWeight: 400,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'var(--ms-ink)',
              textAlign: 'center',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            Mind & Spirit
          </Link>

          {/* Right nav */}
          <nav
            style={{
              display: 'flex',
              gap: 28,
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
            className="mast-nav desktop-nav"
          >
            {NAV_RIGHT.map(n => (
              <Link
                key={n.href}
                href={n.href}
                style={{
                  fontFamily: 'var(--ms-body)',
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--ms-ink-soft)',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--ms-ink)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--ms-ink-soft)')}
              >
                {n.label}
              </Link>
            ))}

            {/* Mobile burger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              className="mobile-burger"
              aria-label="Toggle menu"
            >
              <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                <rect y="0" width="20" height="1.5" fill="currentColor" />
                <rect y="6" width="20" height="1.5" fill="currentColor" />
                <rect y="12" width="20" height="1.5" fill="currentColor" />
              </svg>
            </button>
          </nav>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div
            style={{
              background: 'var(--ms-white)',
              borderTop: '1px solid var(--ms-rule)',
              padding: '24px 24px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            {[...NAV_LEFT, ...NAV_RIGHT].map(n => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  fontFamily: 'var(--ms-body)',
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--ms-ink-soft)',
                }}
              >
                {n.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <style>{`
        @media (min-width: 1101px) { .mobile-burger { display: none !important; } }
        @media (max-width: 1100px) {
          .desktop-nav a { display: none !important; }
          .masthead-inner { padding: 18px 20px !important; }
        }
      `}</style>
    </>
  )
}
