'use client'

import { useState } from 'react'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })
      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setMessage(data.message || 'You\'re subscribed. Welcome.')
        setEmail('')
        setName('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <section
      style={{
        background: 'var(--ms-off)',
        padding: '64px 48px',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        {/* Eyebrow */}
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
          Newsletter
        </p>

        <h2
          style={{
            fontFamily: 'var(--ms-script)',
            fontSize: 'clamp(36px, 4.5vw, 54px)',
            fontWeight: 700,
            color: 'var(--ms-ink)',
            lineHeight: 1,
            marginBottom: 12,
            letterSpacing: 0,
          }}
        >
          Words for the quiet moments
        </h2>

        <p
          style={{
            fontFamily: 'var(--ms-body)',
            fontSize: 14,
            color: 'var(--ms-ink-soft)',
            lineHeight: 1.7,
            marginBottom: 36,
          }}
        >
          A letter from Mind & Spirit, delivered occasionally — new essays, reflections, and what's been nourishing lately.
        </p>

        {status === 'success' ? (
          <p
            style={{
              fontFamily: 'var(--ms-body)',
              fontSize: 14,
              color: 'var(--ms-ink)',
              fontStyle: 'italic',
              padding: '20px 0',
            }}
          >
            {message}
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 20,
                marginBottom: 20,
              }}
              className="form-grid"
            >
              <div style={{ textAlign: 'left' }}>
                <label
                  style={{
                    fontFamily: 'var(--ms-body)',
                    fontSize: 9,
                    fontWeight: 500,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--ms-stone-dk)',
                    display: 'block',
                    marginBottom: 4,
                  }}
                >
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  style={{
                    width: '100%',
                    border: 'none',
                    borderBottom: '1px solid var(--ms-stone)',
                    background: 'transparent',
                    fontFamily: 'var(--ms-body)',
                    fontSize: 14,
                    color: 'var(--ms-ink)',
                    padding: '10px 0',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ textAlign: 'left' }}>
                <label
                  style={{
                    fontFamily: 'var(--ms-body)',
                    fontSize: 9,
                    fontWeight: 500,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--ms-stone-dk)',
                    display: 'block',
                    marginBottom: 4,
                  }}
                >
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  style={{
                    width: '100%',
                    border: 'none',
                    borderBottom: '1px solid var(--ms-stone)',
                    background: 'transparent',
                    fontFamily: 'var(--ms-body)',
                    fontSize: 14,
                    color: 'var(--ms-ink)',
                    padding: '10px 0',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {message && status === 'error' && (
              <p style={{ color: '#c0392b', fontSize: 13, marginBottom: 16 }}>{message}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                fontFamily: 'var(--ms-body)',
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                background: 'var(--ms-ink)',
                color: 'var(--ms-white)',
                border: 'none',
                borderRadius: 0,
                padding: '15px 48px',
                cursor: status === 'loading' ? 'wait' : 'pointer',
                transition: 'background 0.25s ease',
                opacity: status === 'loading' ? 0.7 : 1,
              }}
            >
              {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
            </button>
          </form>
        )}
      </div>

      <style>{`
        @media (max-width: 600px) {
          .form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
