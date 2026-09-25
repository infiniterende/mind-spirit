import Link from 'next/link'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      style={{
        background: 'var(--ms-white)',
        borderTop: '1px solid var(--ms-rule)',
        padding: '36px 56px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: 24,
          maxWidth: 1400,
          margin: '0 auto',
        }}
        className="footer-grid"
      >
        {/* Left links */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Faith', href: '/categories/faith' },
            { label: 'Wellness', href: '/categories/wellness' },
            { label: 'Creative', href: '/categories/creative' },
          ].map(n => (
            <Link
              key={n.href}
              href={n.href}
              style={{
                fontFamily: 'var(--ms-body)',
                fontSize: 10,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--ms-stone-dk)',
                transition: 'color 0.2s',
              }}
            >
              {n.label}
            </Link>
          ))}
        </div>

        {/* Brand */}
        <Link
          href="/"
          style={{
            fontFamily: 'var(--ms-masthead)',
            fontSize: 16,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'var(--ms-ink)',
            whiteSpace: 'nowrap',
          }}
        >
          Mind & Spirit
        </Link>

        {/* Right — copyright */}
        <div style={{ textAlign: 'right' }}>
          <p
            style={{
              fontFamily: 'var(--ms-body)',
              fontSize: 11,
              color: 'var(--ms-stone)',
              letterSpacing: '0.04em',
            }}
          >
            © {year} Mind & Spirit
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            text-align: center !important;
          }
          .footer-grid > div:last-child { text-align: center !important; }
          .footer-grid > div:first-child { justify-content: center !important; }
        }
      `}</style>
    </footer>
  )
}
