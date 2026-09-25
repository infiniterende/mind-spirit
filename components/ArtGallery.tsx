'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import type { Artwork, Collection } from '@/lib/portfolio'

interface ArtGalleryProps {
  collections: Collection[]
}

export function ArtGallery({ collections }: ArtGalleryProps) {
  const [active, setActive] = useState(collections[0].slug)
  const [open, setOpen] = useState<number | null>(null)

  const collection = collections.find(c => c.slug === active) ?? collections[0]
  const pieces = collection.pieces
  const isDesign = collection.kind === 'design'

  const close = useCallback(() => setOpen(null), [])
  const step = useCallback(
    (dir: 1 | -1) => setOpen(i => (i === null ? i : (i + dir + pieces.length) % pieces.length)),
    [pieces.length],
  )

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, close, step])

  return (
    <div>
      {/* Collection tabs */}
      <div
        role="tablist"
        aria-label="Collections"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '8px 32px',
          marginBottom: 36,
        }}
      >
        {collections.map(c => {
          const selected = c.slug === active
          return (
            <button
              key={c.slug}
              role="tab"
              aria-selected={selected}
              onClick={() => { setActive(c.slug); setOpen(null) }}
              style={{
                fontFamily: 'var(--ms-serif)',
                fontSize: 20,
                fontStyle: 'italic',
                fontWeight: 500,
                color: selected ? 'var(--ms-ink)' : 'var(--ms-stone-dk)',
                background: 'none',
                border: 'none',
                borderBottom: `1px solid ${selected ? 'var(--ms-ink)' : 'transparent'}`,
                padding: '2px 0',
                cursor: 'pointer',
                transition: 'color 0.2s, border-color 0.2s',
              }}
            >
              {c.name}
              <span
                style={{
                  fontFamily: 'var(--ms-body)',
                  fontStyle: 'normal',
                  fontSize: 10,
                  letterSpacing: '0.08em',
                  color: 'var(--ms-stone)',
                  marginLeft: 6,
                  verticalAlign: 'super',
                }}
              >
                {c.pieces.length}
              </span>
            </button>
          )
        })}
      </div>

      {/* Grid */}
      <div
        className={isDesign ? 'art-grid art-grid--design' : 'art-grid'}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${isDesign ? 3 : 4}, 1fr)`,
          gap: isDesign ? 24 : 16,
        }}
      >
        {pieces.map((piece, i) => (
          <figure key={piece.src} style={{ margin: 0 }}>
            <button
              onClick={() => setOpen(i)}
              aria-label={`View ${piece.title ?? piece.alt}`}
              className="art-tile"
              style={{
                display: 'block',
                width: '100%',
                padding: 0,
                border: '1px solid var(--ms-rule)',
                background: 'var(--ms-white)',
                cursor: 'zoom-in',
                aspectRatio: isDesign ? '4/5' : '1/1',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Image
                src={piece.src}
                alt={piece.alt}
                fill
                sizes={isDesign ? '(max-width: 768px) 100vw, 33vw' : '(max-width: 768px) 50vw, 25vw'}
                style={{ objectFit: 'cover', objectPosition: 'top', transition: 'transform 0.6s ease' }}
              />
            </button>
            {piece.title && (
              <figcaption
                style={{
                  fontFamily: 'var(--ms-serif)',
                  fontSize: 18,
                  fontStyle: 'italic',
                  color: 'var(--ms-ink)',
                  marginTop: 10,
                }}
              >
                {piece.title}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {open !== null && (
        <Lightbox piece={pieces[open]} tall={isDesign} onClose={close} onStep={step} />
      )}

      <style>{`
        .art-tile:hover img { transform: scale(1.04); }
        @media (max-width: 900px) {
          .art-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .art-grid--design { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
      `}</style>
    </div>
  )
}

interface LightboxProps {
  piece: Artwork
  tall: boolean
  onClose: () => void
  onStep: (dir: 1 | -1) => void
}

function Lightbox({ piece, tall, onClose, onStep }: LightboxProps) {
  const navButton: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: 'var(--ms-white)',
    fontFamily: 'var(--ms-serif)',
    fontSize: 44,
    lineHeight: 1,
    padding: 16,
    cursor: 'pointer',
    zIndex: 2,
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={piece.title ?? piece.alt}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(20, 18, 16, 0.92)',
        overflowY: tall ? 'auto' : 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: tall ? 'flex-start' : 'center',
        padding: tall ? '64px 16px' : '48px 72px',
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        style={{ ...navButton, top: 12, right: 12, transform: 'none', fontSize: 32 }}
      >
        ×
      </button>
      <button
        onClick={e => { e.stopPropagation(); onStep(-1) }}
        aria-label="Previous"
        style={{ ...navButton, left: 4 }}
      >
        ‹
      </button>
      <button
        onClick={e => { e.stopPropagation(); onStep(1) }}
        aria-label="Next"
        style={{ ...navButton, right: 4 }}
      >
        ›
      </button>

      <div onClick={e => e.stopPropagation()} style={{ maxWidth: tall ? 1100 : undefined, width: tall ? '100%' : undefined }}>
        <Image
          key={piece.src}
          src={piece.src}
          alt={piece.alt}
          width={piece.width}
          height={piece.height}
          sizes={tall ? '(max-width: 1100px) 100vw, 1100px' : '90vw'}
          style={
            tall
              ? { width: '100%', height: 'auto', display: 'block' }
              : { maxWidth: '100%', maxHeight: 'calc(100vh - 96px)', width: 'auto', height: 'auto', display: 'block' }
          }
        />
      </div>
    </div>
  )
}
