'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { savePost, deletePost } from '@/app/admin/actions'
import { MarkdownBody } from '@/components/MarkdownBody'

export interface EditablePost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  categoryId: string
  published: boolean
  featured: boolean
  publishedAt: string // yyyy-mm-dd
}

interface Props {
  post: EditablePost
  categories: { id: string; name: string }[]
  uploadsEnabled: boolean
  justSaved?: boolean
}

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

async function upload(file: File): Promise<string> {
  const body = new FormData()
  body.append('file', file)
  const res = await fetch('/api/admin/upload', { method: 'POST', body })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json.url) throw new Error(json.error ?? 'Upload failed.')
  return json.url
}

export function PostEditor({ post, categories, uploadsEnabled, justSaved = false }: Props) {
  const [state, action, saving] = useActionState(savePost, undefined)
  const [p, setP] = useState(post)
  const [slugTouched, setSlugTouched] = useState(Boolean(post.slug))
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const [busy, setBusy] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const coverInput = useRef<HTMLInputElement>(null)
  const inlineInput = useRef<HTMLInputElement>(null)

  const set = <K extends keyof EditablePost>(key: K, value: EditablePost[K]) => {
    setP(prev => ({ ...prev, [key]: value }))
    setDirty(true)
  }

  // Warn before leaving with unsaved edits
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  async function runUpload(file: File, label: string): Promise<string | null> {
    setUploadError(null)
    setBusy(label)
    try {
      return await upload(file)
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed.')
      return null
    } finally {
      setBusy(null)
    }
  }

  // Insert text at the cursor in the body textarea
  function insert(before: string, after = '', placeholder = '') {
    const el = bodyRef.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e, value } = el
    const selected = value.slice(s, e) || placeholder
    const next = value.slice(0, s) + before + selected + after + value.slice(e)
    set('content', next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(s + before.length, s + before.length + selected.length)
    })
  }

  // Start a new block (blank line before) for headings, quotes, lists, images
  function insertBlock(prefix: string, placeholder: string) {
    const el = bodyRef.current
    if (!el) return
    const needsGap = el.selectionStart > 0 && !el.value.slice(0, el.selectionStart).endsWith('\n\n')
    insert((needsGap ? '\n\n' : '') + prefix, '\n\n', placeholder)
  }

  async function addInlineImage(file: File) {
    const url = await runUpload(file, 'Uploading image…')
    if (!url) return
    const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/[[\]]/g, '')
    insertBlock(`![${alt}](${url})`, '')
  }

  const viewHref = p.id && post.published && post.slug ? `/posts/${post.slug}` : null

  return (
    <form action={action} onSubmit={() => setDirty(false)}>
      {/* Values sent to the server action */}
      <input type="hidden" name="id" value={p.id} />
      <input type="hidden" name="content" value={p.content} />
      <input type="hidden" name="coverImage" value={p.coverImage} />

      {/* ── Top bar ─────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/admin" className="adm-label adm-nav">← All posts</Link>
          <h1 style={{ fontSize: 26 }}>{p.id ? 'Edit post' : 'New post'}</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {viewHref && (
            <a href={viewHref} target="_blank" rel="noreferrer" className="adm-btn">View ↗</a>
          )}
          <button className="adm-btn adm-btn--primary" disabled={saving || Boolean(busy)}>
            {saving ? 'Saving…' : p.published ? 'Save & publish' : 'Save draft'}
          </button>
        </div>
      </div>

      {state?.error && <p className="adm-notice adm-notice--error" style={{ marginBottom: 20 }}>{state.error}</p>}
      {justSaved && !state?.error && !dirty && <p className="adm-notice" style={{ marginBottom: 20 }}>Saved. Changes are live on the site.</p>}
      {uploadError && <p className="adm-notice adm-notice--error" style={{ marginBottom: 20 }}>{uploadError}</p>}

      <div className="adm-editor" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 24, alignItems: 'start' }}>
        {/* ── Main column ───────────────────────────── */}
        <div style={{ display: 'grid', gap: 18 }}>
          <input
            className="adm-input"
            name="title"
            value={p.title}
            onChange={e => {
              set('title', e.target.value)
              if (!slugTouched) set('slug', slugify(e.target.value))
            }}
            placeholder="Title"
            required
            style={{ fontFamily: 'var(--ms-display)', fontWeight: 700, fontSize: 28, padding: '14px 16px' }}
          />

          <label style={{ display: 'grid', gap: 6 }}>
            <span className="adm-label">Excerpt — shown on the homepage and topic pages</span>
            <textarea
              className="adm-input"
              name="excerpt"
              rows={2}
              value={p.excerpt}
              onChange={e => set('excerpt', e.target.value)}
              style={{ fontFamily: 'var(--ms-body)', fontSize: 15 }}
            />
          </label>

          {/* Body editor */}
          <div className="adm-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--ms-rule)', padding: '6px 8px', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {tab === 'write' && (
                  <>
                    <Tool label="Bold" onClick={() => insert('**', '**', 'bold text')}><b>B</b></Tool>
                    <Tool label="Italic" onClick={() => insert('*', '*', 'italic text')}><i>I</i></Tool>
                    <Tool label="Heading" onClick={() => insertBlock('## ', 'Heading')}>H</Tool>
                    <Tool label="Quote" onClick={() => insertBlock('> ', 'Quote')}>“ ”</Tool>
                    <Tool label="Bulleted list" onClick={() => insertBlock('- ', 'List item')}>• List</Tool>
                    <Tool label="Link" onClick={() => insert('[', '](https://)', 'link text')}>Link</Tool>
                    <Tool label="Divider" onClick={() => insertBlock('---', '')}>—</Tool>
                    <Tool
                      label="Insert image"
                      disabled={!uploadsEnabled || Boolean(busy)}
                      onClick={() => inlineInput.current?.click()}
                    >
                      + Image
                    </Tool>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', gap: 2 }}>
                <Tool label="Write" active={tab === 'write'} onClick={() => setTab('write')}>Write</Tool>
                <Tool label="Preview" active={tab === 'preview'} onClick={() => setTab('preview')}>Preview</Tool>
              </div>
            </div>

            {tab === 'write' ? (
              <textarea
                ref={bodyRef}
                className="adm-input"
                value={p.content}
                onChange={e => set('content', e.target.value)}
                onDragOver={e => uploadsEnabled && e.preventDefault()}
                onDrop={e => {
                  const file = e.dataTransfer.files?.[0]
                  if (uploadsEnabled && file?.type.startsWith('image/')) {
                    e.preventDefault()
                    addInlineImage(file)
                  }
                }}
                rows={28}
                placeholder="Write in Markdown. Leave a blank line between paragraphs. Drag an image here to insert it."
                style={{ border: 'none', minHeight: 520 }}
              />
            ) : (
              <div style={{ padding: '32px 24px', minHeight: 520 }}>
                <article className="prose-editorial">
                  <MarkdownBody source={p.content.replace(/^# .*\n+/, '')} />
                </article>
              </div>
            )}
          </div>
          <p style={{ fontSize: 12, color: 'var(--ms-stone-dk)', marginTop: -8 }}>
            Formatting: **bold**, *italic*, ## Heading, &gt; quote, - list, [text](link), ![description](image link). {busy && <strong>{busy}</strong>}
          </p>
          <input
            ref={inlineInput}
            type="file"
            accept="image/*"
            hidden
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) addInlineImage(f)
              e.target.value = ''
            }}
          />
        </div>

        {/* ── Sidebar ───────────────────────────────── */}
        <aside style={{ display: 'grid', gap: 18, position: 'sticky', top: 84 }} className="adm-side">
          <Panel title="Cover image">
            <div style={{ position: 'relative', aspectRatio: '3/2', background: 'var(--ms-off)', border: '1px solid var(--ms-rule)', overflow: 'hidden', marginBottom: 12 }}>
              {p.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.coverImage} alt="Cover preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 12, color: 'var(--ms-stone-dk)', textAlign: 'center', padding: 16 }}>
                  No cover. The site will pick a default image.
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <button
                type="button"
                className="adm-btn"
                style={{ flex: 1 }}
                disabled={!uploadsEnabled || Boolean(busy)}
                onClick={() => coverInput.current?.click()}
                title={uploadsEnabled ? undefined : 'Add SUPABASE_SERVICE_ROLE_KEY to .env to enable uploads'}
              >
                {busy === 'Uploading cover…' ? 'Uploading…' : p.coverImage ? 'Replace' : 'Upload'}
              </button>
              {p.coverImage && (
                <button type="button" className="adm-btn" onClick={() => set('coverImage', '')}>Remove</button>
              )}
            </div>
            <input
              className="adm-input"
              value={p.coverImage}
              onChange={e => set('coverImage', e.target.value.trim())}
              placeholder="…or paste an images.unsplash.com link"
              style={{ fontSize: 12, padding: '8px 10px' }}
            />
            <input
              ref={coverInput}
              type="file"
              accept="image/*"
              hidden
              onChange={async e => {
                const f = e.target.files?.[0]
                e.target.value = ''
                if (!f) return
                const url = await runUpload(f, 'Uploading cover…')
                if (url) set('coverImage', url)
              }}
            />
          </Panel>

          <Panel title="Publishing">
            <Toggle name="published" checked={p.published} onChange={v => set('published', v)} label="Published" hint="Visible on the site" />
            <Toggle name="featured" checked={p.featured} onChange={v => set('featured', v)} label="Featured" hint="Eligible for the homepage cover" />
            <label style={{ display: 'grid', gap: 6, marginTop: 6 }}>
              <span className="adm-label">Date</span>
              <input className="adm-input" type="date" name="publishedAt" value={p.publishedAt} onChange={e => set('publishedAt', e.target.value)} />
            </label>
          </Panel>

          <Panel title="Details">
            <label style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
              <span className="adm-label">Topic</span>
              <select className="adm-input" name="categoryId" value={p.categoryId} onChange={e => set('categoryId', e.target.value)}>
                <option value="">No topic</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span className="adm-label">URL</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--ms-stone-dk)' }}>
                /posts/
                <input
                  className="adm-input"
                  name="slug"
                  value={p.slug}
                  onChange={e => {
                    setSlugTouched(true)
                    set('slug', slugify(e.target.value))
                  }}
                  style={{ fontSize: 13, padding: '8px 10px' }}
                />
              </div>
              {post.published && p.slug !== post.slug && p.id && (
                <span style={{ fontSize: 12, color: 'var(--ms-accent)' }}>Changing the URL breaks old links to this post.</span>
              )}
            </label>
          </Panel>
        </aside>
      </div>

      {/* ── Delete ──────────────────────────────────── */}
      {p.id && (
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--ms-rule)' }}>
          <button
            type="submit"
            formAction={deletePost}
            formNoValidate
            className="adm-btn adm-btn--danger"
            onClick={e => {
              if (!confirm(`Delete “${post.title}” permanently? This can't be undone. To hide it instead, turn off “Published”.`)) e.preventDefault()
              else setDirty(false)
            }}
          >
            Delete post
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 960px) {
          .adm-editor { grid-template-columns: 1fr !important; }
          .adm-side { position: static !important; }
        }
      `}</style>
    </form>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="adm-card" style={{ padding: 16 }}>
      <p className="adm-label" style={{ color: 'var(--ms-ink)', marginBottom: 12 }}>{title}</p>
      {children}
    </section>
  )
}

function Toggle({ name, checked, onChange, label, hint }: { name: string; checked: boolean; onChange: (v: boolean) => void; label: string; hint: string }) {
  return (
    <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '6px 0', cursor: 'pointer' }}>
      <input type="checkbox" name={name} checked={checked} onChange={e => onChange(e.target.checked)} style={{ marginTop: 3, accentColor: 'var(--ms-ink)' }} />
      <span>
        <span style={{ fontSize: 14, display: 'block' }}>{label}</span>
        <span style={{ fontSize: 12, color: 'var(--ms-stone-dk)' }}>{hint}</span>
      </span>
    </label>
  )
}

function Tool({
  children,
  onClick,
  label,
  active = false,
  disabled = false,
}: {
  children: React.ReactNode
  onClick: () => void
  label: string
  active?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      disabled={disabled}
      style={{
        font: 'inherit',
        fontSize: 13,
        padding: '6px 10px',
        border: 'none',
        borderRadius: 2,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        background: active ? 'var(--ms-ink)' : 'transparent',
        color: active ? 'var(--ms-white)' : 'var(--ms-ink)',
      }}
    >
      {children}
    </button>
  )
}
