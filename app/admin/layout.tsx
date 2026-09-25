import Link from 'next/link'
import type { Metadata } from 'next'
import { isAdmin } from '@/lib/admin-session'
import { logout } from './actions'

export const metadata: Metadata = {
  title: 'Editor',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const signedIn = await isAdmin()

  return (
    <div className="adm">
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '16px 32px',
          borderBottom: '1px solid var(--ms-rule)',
          background: 'var(--ms-white)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <Link href="/admin" style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontFamily: 'var(--ms-masthead)', fontSize: 18, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--ms-ink)' }}>
            Mind &amp; Spirit
          </span>
          <span className="adm-label" style={{ color: 'var(--ms-accent)' }}>Editor</span>
        </Link>
        {signedIn && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link href="/admin" className="adm-label adm-nav">Posts</Link>
            <Link href="/admin/posts/new" className="adm-label adm-nav">New post</Link>
            <a href="/" target="_blank" rel="noreferrer" className="adm-label adm-nav">View site ↗</a>
            <form action={logout}>
              <button className="adm-label adm-nav" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                Sign out
              </button>
            </form>
          </nav>
        )}
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 32px 80px' }} className="adm-body">
        {children}
      </div>

      <style>{`
        .adm { min-height: 100vh; background: var(--ms-off); color: var(--ms-ink); font-family: var(--ms-body); }
        .adm-label { font-family: var(--ms-body); font-size: 11px; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ms-stone-dk); }
        .adm-nav { color: var(--ms-ink-soft); }
        .adm-nav:hover { color: var(--ms-ink); }
        .adm h1 { font-family: var(--ms-masthead); font-weight: 500; font-size: 34px; letter-spacing: 0.08em; text-transform: uppercase; }
        .adm-card { background: var(--ms-white); border: 1px solid var(--ms-rule); }
        .adm-input {
          width: 100%; font: inherit; font-size: 15px; color: var(--ms-ink);
          background: var(--ms-white); border: 1px solid var(--ms-rule); padding: 10px 12px; border-radius: 2px;
        }
        .adm-input:focus { outline: 2px solid var(--ms-ink); outline-offset: -1px; }
        textarea.adm-input { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 14px; line-height: 1.7; resize: vertical; }
        .adm-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          font-family: var(--ms-body); font-size: 11px; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase;
          padding: 11px 18px; border: 1px solid var(--ms-ink); background: var(--ms-white); color: var(--ms-ink); cursor: pointer; border-radius: 2px;
        }
        .adm-btn:hover { background: var(--ms-off); }
        .adm-btn:disabled { opacity: 0.5; cursor: default; }
        .adm-btn--primary { background: var(--ms-ink); color: var(--ms-white); }
        .adm-btn--primary:hover { background: var(--ms-ink-soft); }
        .adm-btn--danger { border-color: var(--ms-accent); color: var(--ms-accent); }
        .adm-notice { padding: 12px 16px; font-size: 14px; border-left: 3px solid var(--ms-ink); background: var(--ms-white); }
        .adm-notice--error { border-color: var(--ms-accent); color: var(--ms-accent); }
        .adm-row:hover { background: var(--ms-off); }
        @media (max-width: 800px) {
          .adm header { padding: 14px 16px !important; flex-wrap: wrap; }
          .adm-body { padding: 20px 16px 60px !important; }
        }
      `}</style>
    </div>
  )
}
