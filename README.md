# Mind & Spirit — Next.js Magazine Site

A high-end magazine editorial website built with Next.js 16, Prisma, and Supabase.

## Stack

- **Next.js 16** (App Router, ISR)
- **Prisma 8** ORM
- **Supabase** (PostgreSQL + Auth)
- **Tailwind CSS 4**
- **TypeScript**

## Quick Start

### 1. Clone and install

```bash
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** and copy your Project URL and anon key
3. Go to **Settings → Database → Connection String** and copy the pooling URL

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# From Supabase → Database → Connection String → Transaction mode (port 6543)
DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# From Supabase → Database → Connection String → Session mode (port 5432)
DIRECT_URL=postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### 4. Push the database schema

```bash
npm run db:push
```

### 5. Seed with sample content

```bash
npm run db:seed
```

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
  page.tsx                    # Homepage — hero + card grid
  layout.tsx                  # Root layout with Masthead + Footer
  globals.css                 # Design tokens + base styles
  posts/[slug]/page.tsx       # Article detail page
  categories/[slug]/page.tsx  # Category listing page
  api/
    subscribe/route.ts        # Newsletter subscription endpoint
    posts/route.ts            # Public posts API

components/
  Masthead.tsx                # Sticky 3-column navigation
  Footer.tsx                  # Footer with links + wordmark
  PostCard.tsx                # Reusable article card
  NewsletterForm.tsx          # Subscribe form with API integration

lib/
  prisma.ts                   # Prisma client singleton
  supabase.ts                 # Supabase client
  posts.ts                    # Data access layer

prisma/
  schema.prisma               # Database schema
  seed.ts                     # Sample content seed
```

## Database Schema

| Model        | Purpose                              |
|-------------|--------------------------------------|
| `Post`       | Articles with MDX content            |
| `Author`     | Writer profiles                      |
| `Category`   | Faith, Wellness, Creative, Reflections |
| `Tag`        | Freeform tags on posts               |
| `Subscriber` | Newsletter subscribers               |

## Adding Content

### Via Prisma Studio (visual UI)

```bash
npx prisma studio
```

Opens a browser UI at `localhost:5555` where you can create and edit posts.

### Via the seed file

Edit `prisma/seed.ts` and re-run:

```bash
npm run db:seed
```

### Via Supabase Dashboard

Go to your Supabase project → **Table Editor** to manage records directly.

## Deployment (Vercel)

1. Push to GitHub
2. Connect to [Vercel](https://vercel.com)
3. Add all environment variables in Vercel's project settings
4. Deploy — Vercel handles the build automatically

> **Note:** Use the **Transaction** pooling URL (port 6543) for `DATABASE_URL` in production (PgBouncer compatible), and the **Direct** connection URL for `DIRECT_URL` (used by Prisma migrations).

## Design System

The site uses CSS custom properties defined in `globals.css`:

| Token          | Value     | Usage                    |
|---------------|-----------|--------------------------|
| `--ms-white`  | `#FFFFFF` | Page background          |
| `--ms-off`    | `#F5F4F2` | Section backgrounds      |
| `--ms-stone`  | `#C8BFB4` | Muted elements           |
| `--ms-ink`    | `#0D0D0D` | Primary text             |
| `--ms-ink-soft`| `#4A4642` | Body text                |
| `--ms-rule`   | `#E2DFDC` | Dividers, borders        |

Fonts: **Bodoni Moda** (masthead), **Playfair Display** (headlines), **DM Sans** (body).
Dark mode is fully supported via `prefers-color-scheme` and `data-theme` attribute.
