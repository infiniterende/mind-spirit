import { notFound } from "next/navigation";
import { getPostsByCategory, getCategories } from "@/lib/posts";
import { PostCard } from "@/components/PostCard";
import { NewsletterForm } from "@/components/NewsletterForm";
import { ArtGallery } from "@/components/ArtGallery";
import { COLLECTIONS } from "@/lib/portfolio";
import type { Metadata } from "next";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find(
    (c: {
      slug: string;
      name: string;
      description: string | null;
      id: string;
      createdAt: Date;
      _count?: { posts: number };
    }) => c.slug === slug,
  );
  if (!category) return {};
  return {
    title: category.name,
    description: category.description ?? undefined,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find(
    (c: {
      slug: string;
      name: string;
      description: string | null;
      id: string;
      createdAt: Date;
      _count?: { posts: number };
    }) => c.slug === slug,
  );

  if (!category) notFound();

  const posts = await getPostsByCategory(slug, 200);
  const showGallery = slug === "creative";

  return (
    <>
      {/* ── Category Header ──────────────────────────────── */}
      <header
        style={{
          background: "var(--ms-off)",
          borderBottom: "1px solid var(--ms-rule)",
          padding: "56px 48px 48px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--ms-body)",
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "var(--ms-stone-dk)",
            marginBottom: 16,
          }}
        >
          Topic
        </p>
        <h1
          style={{
            fontFamily: "var(--ms-masthead)",
            fontSize: "clamp(36px, 4.5vw, 56px)",
            fontWeight: 500,
            lineHeight: 1.05,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ms-ink)",
            marginBottom: 16,
          }}
        >
          {category.name}
        </h1>
        {category.description && (
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
            {category.description}
          </p>
        )}
        <p
          style={{
            fontFamily: "var(--ms-body)",
            fontSize: 11,
            color: "var(--ms-stone)",
            letterSpacing: "0.08em",
            marginTop: 20,
          }}
        >
          {posts.length} {posts.length === 1 ? "essay" : "essays"}
        </p>
      </header>

      {/* ── Art & Design Gallery ─────────────────────────── */}
      {showGallery && (
        <section
          id="gallery"
          style={{
            padding: "56px 48px 72px",
            background: "var(--ms-white)",
            borderBottom: "1px solid var(--ms-rule)",
            scrollMarginTop: 24,
          }}
          className="gallery-section"
        >
          <h2
            style={{
              fontFamily: "var(--ms-script)",
              fontSize: "clamp(42px, 5.2vw, 60px)",
              fontWeight: 700,
              textAlign: "center",
              color: "var(--ms-ink)",
              letterSpacing: 0,
              marginBottom: 8,
            }}
          >
            Art &amp; Design
          </h2>
          <p
            style={{
              fontFamily: "var(--ms-body)",
              fontSize: 13,
              color: "var(--ms-stone-dk)",
              textAlign: "center",
              marginBottom: 32,
            }}
          >
            Illustration, lettering, and web design.
          </p>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <ArtGallery collections={COLLECTIONS} />
          </div>
        </section>
      )}

      {showGallery && posts.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            padding: "40px 48px 16px",
            background: "var(--ms-off)",
          }}
          className="section-header"
        >
          <hr
            style={{
              flex: 1,
              border: "none",
              borderTop: "1px solid var(--ms-rule)",
            }}
          />
          <span
            style={{
              fontFamily: "var(--ms-body)",
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "var(--ms-stone-dk)",
              whiteSpace: "nowrap",
            }}
          >
            Essays
          </span>
          <hr
            style={{
              flex: 1,
              border: "none",
              borderTop: "1px solid var(--ms-rule)",
            }}
          />
        </div>
      )}

      {/* ── Post Grid ────────────────────────────────────── */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 2,
          padding: "2px 0 0",
          background: "var(--ms-off)",
          minHeight: "50vh",
        }}
        className="cat-grid"
      >
        {posts.length === 0 ? (
          <div
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 24px",
              textAlign: "center",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "var(--ms-display)",
                  fontSize: 24,
                  fontStyle: "italic",
                  color: "var(--ms-ink-soft)",
                  marginBottom: 12,
                }}
              >
                Coming soon
              </p>
              <p
                style={{
                  fontFamily: "var(--ms-body)",
                  fontSize: 13,
                  color: "var(--ms-stone-dk)",
                }}
              >
                Essays in this category are being written. Check back soon.
              </p>
            </div>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </section>

      {/* ── Newsletter ───────────────────────────────────── */}
      <NewsletterForm />

      <style>{`
        @media (max-width: 768px) {
          .cat-grid { grid-template-columns: 1fr !important; }
          header { padding: 40px 20px 36px !important; }
          .gallery-section { padding: 40px 16px 56px !important; }
          .section-header { padding: 32px 16px 12px !important; }
        }
        @media (min-width: 601px) and (max-width: 1100px) {
          .cat-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </>
  );
}
