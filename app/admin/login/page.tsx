'use client'

import { useActionState } from 'react'
import { login } from '../actions'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <div style={{ maxWidth: 380, margin: '10vh auto 0' }}>
      <h1 style={{ marginBottom: 8 }}>Sign in</h1>
      <p style={{ fontSize: 14, color: 'var(--ms-ink-soft)', marginBottom: 28 }}>Enter the editor password to manage posts and images.</p>
      <form action={action} className="adm-card" style={{ padding: 28, display: 'grid', gap: 16 }}>
        <label style={{ display: 'grid', gap: 8 }}>
          <span className="adm-label">Password</span>
          <input className="adm-input" type="password" name="password" autoComplete="current-password" required autoFocus />
        </label>
        {state?.error && <p className="adm-notice adm-notice--error">{state.error}</p>}
        <button className="adm-btn adm-btn--primary" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
