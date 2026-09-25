import Link from "next/link";
import type { Metadata } from "next";
import {
  getFictionCollections,
  getFictionPieces,
  readingTime,
} from "@/lib/fiction";
import { BookCover } from "@/components/BookCover";
import { NewsletterForm } from "@/components/NewsletterForm";

export const metadata: Metadata = {
  title: "Fiction",
  description: "Serialized novels and short stories.",
};

const label: React.CSSProperties = {
  fontFamily: "var(--ms-body)",
  fontSize: 9,
  fontWeight: 500,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "var(--ms-stone-dk)",
};

const button: React.CSSProperties = {
  display: "inline-block",
  fontFamily: "var(--ms-body)",
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  padding: "13px 24px",
};

export default function FictionPage() {
  const books = getFictionCollections().map((c) => {
    const pieces = getFictionPieces(c.slug);
    const words = pieces.reduce((n, p) => n + p.wordCount, 0);
    return { ...c, pieces, words };
  });

  return (
    <>
      {/* ── Header ───────────────────────────────────────── */}
      <header
        style={{
          background: "var(--ms-off)",
          borderBottom: "1px solid var(--ms-rule)",
          padding: "56px 48px 48px",
          textAlign: "center",
        }}
      >
        <p style={{ ...label, letterSpacing: "0.24em", marginBottom: 16 }}>
          Writing
        </p>
        <h1
          style={{
            fontFamily: "var(--ms-script)",
            fontSize: "clamp(60px)",
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: 0,
            color: "var(--ms-ink)",
            marginBottom: 16,
          }}
        >
          Fiction
        </h1>
        <p
          style={{
            fontFamily: "var(--ms-body)",
            fontSize: 15,
            color: "var(--ms-ink-soft)",
            lineHeight: 1.7,
            maxWidth: 500,
            margin: "0 auto",
          }}
        >
          Serialized novels and short stories.
        </p>
      </header>

      {/* ── Books ────────────────────────────────────────── */}
      {books.map((book, i) => {
        const serial = book.kind === "serial";
        const first = book.pieces[0];
        const blurb = book.description || (serial ? first?.excerpt : "");
        return (
          <section
            key={book.slug}
            style={{
              borderBottom: "1px solid var(--ms-rule)",
              background: i % 2 ? "var(--ms-off)" : "var(--ms-white)",
            }}
          >
            <div
              className={`book-row${i % 2 ? " book-row--flip" : ""}`}
              style={{
                maxWidth: 1100,
                margin: "0 auto",
                padding: "80px 48px",
                display: "grid",
                gridTemplateColumns: "minmax(0, 400px) minmax(0, 1fr)",
                gap: 72,
                alignItems: "center",
              }}
            >
              <Link
                href={`/fiction/${book.slug}`}
                className="book-cover"
                style={{ display: "block" }}
              >
                <BookCover
                  collection={book}
                  sizes="(max-width: 800px) 80vw, 400px"
                  priority={i === 0}
                />
              </Link>

              <div>
                <p style={{ ...label, marginBottom: 18 }}>
                  {serial ? "Novel" : "Collection"} · {book.pieces.length}{" "}
                  {serial
                    ? book.pieces.length === 1
                      ? "chapter"
                      : "chapters"
                    : "stories"}{" "}
                  · {readingTime(book.words)}
                </p>
                <h2
                  style={{
                    fontFamily: "var(--ms-script)",
                    fontSize: "clamp(56px, 6.5vw, 88px)",
                    fontWeight: 700,
                    lineHeight: 0.95,
                    color: "var(--ms-ink)",
                    marginBottom: 24,
                  }}
                >
                  <Link href={`/fiction/${book.slug}`}>{book.title}</Link>
                </h2>

                {blurb && (
                  <p
                    style={{
                      fontFamily: "var(--ms-serif)",
                      fontSize: 21,
                      lineHeight: 1.6,
                      color: "var(--ms-ink-soft)",
                      maxWidth: 520,
                      marginBottom: 32,
                    }}
                  >
                    {blurb}
                  </p>
                )}

                {serial ? (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: "16px 28px",
                    }}
                  >
                    {first && (
                      <Link
                        href={`/fiction/${book.slug}/${first.slug}`}
                        style={{
                          ...button,
                          background: "var(--ms-ink)",
                          color: "var(--ms-white)",
                        }}
                      >
                        Start Reading
                      </Link>
                    )}
                    {book.pieces.length > 1 && (
                      <Link
                        href={`/fiction/${book.slug}`}
                        style={{
                          ...label,
                          fontSize: 10,
                          letterSpacing: "0.16em",
                          color: "var(--ms-ink)",
                          borderBottom: "1px solid var(--ms-ink)",
                          paddingBottom: 2,
                        }}
                      >
                        All {book.pieces.length} Chapters
                      </Link>
                    )}
                  </div>
                ) : (
                  <ol
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      columns: "2 220px",
                      columnGap: 32,
                      borderTop: "1px solid var(--ms-ink)",
                      paddingTop: 12,
                    }}
                  >
                    {book.pieces.map((p) => (
                      <li key={p.slug} style={{ breakInside: "avoid" }}>
                        <Link
                          href={`/fiction/${book.slug}/${p.slug}`}
                          className="story-link"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                            gap: 12,
                            padding: "7px 0",
                            borderBottom: "1px solid var(--ms-rule)",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--ms-serif)",
                              fontSize: 20,
                              fontStyle: "italic",
                              fontWeight: 500,
                              color: "var(--ms-ink)",
                            }}
                          >
                            {p.title}
                          </span>
                          <span
                            style={{
                              fontFamily: "var(--ms-body)",
                              fontSize: 10,
                              color: "var(--ms-stone)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {readingTime(p.wordCount)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </section>
        );
      })}

      <NewsletterForm />

      <style>{`
        .book-cover { transition: transform 0.4s ease; }
        .book-cover:hover { transform: translateY(-4px); }
        .book-row h2 a:hover { opacity: 0.75; }
        .story-link:hover span:first-child { text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 4px; }
        @media (min-width: 801px) {
          .book-row--flip { grid-template-columns: minmax(0, 1fr) minmax(0, 400px) !important; }
          .book-row--flip > .book-cover { order: 2; }
        }
        @media (max-width: 800px) {
          .book-row { grid-template-columns: 1fr !important; gap: 40px !important; padding: 56px 24px !important; }
          .book-row > .book-cover { width: min(80vw, 340px); margin: 0 auto; }
        }
        @media (max-width: 768px) {
          header { padding: 40px 20px 36px !important; }
        }
      `}</style>
    </>
  );
}
