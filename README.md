# UNLOCKFLOW — Premium Link Unlock Platform

A premium, no-login link-unlock website. Creators build "unlock links" where visitors complete a list of tasks
(subscribe, follow, like, join…) and then unlock a reward link.

Built with **Next.js 14 (App Router)**, **Tailwind CSS**, and **Supabase**, ready to deploy on **Vercel**.

---

## ✨ Features

- **Premium hero + full marketing page** (Why Choose Us, How It Works, FAQ, CTA, Footer)
- **20+ smart tasks** with official platform logos:
  - YouTube: Subscribe, Add 2nd Channel, Subscribe & Like, Subscribe & Bell, Add Channel, Like, Comment, Like & Comment
  - Instagram: Followers, Post Like, Story View
  - Facebook: Followers, Like Post, Group Join
  - Telegram: Member · WhatsApp: Channel Join
  - TikTok: Follow, Like · Discord: Join · Twitter: Follow · Custom Link
- **Link Generator**:
  - Select any task → premium URL input appears (pre-filled with the platform's placeholder)
  - Add unlimited tasks per link
  - **Advanced options** (all optional, in a dropdown): banner upload, icon upload, title, description, password, expiry date, custom slug
  - **Generate Link** → creates a short link **+ QR code** with copy & share buttons
- **Unlock page** (`/unlock/[slug]`):
  - Shows the creator's tasks; each task tap opens the creator's link and marks it done
  - When **all tasks complete**, the destination (reward) link unlocks
  - **Password-protected** links require the password before the reward opens
  - Progress bar + completion tracking
- **Supabase database** (links, tasks, task_completions + storage for uploads)
- **Vercel-ready** deploy configuration

---

## 🛠️ Admin Dashboard (private, `/admin`)

A private dashboard for the site owner. No public link points to it — access it directly at `/admin`.

Features:
- **Overview** — stat cards (Total Links, Views, Clicks, Completions) + charts (completions over time, top links)
- **Links** — manage every unlock link: activate/deactivate, delete, and **Task Placement** (reorder tasks ↑↓, add, remove)
- **Analytics** — per-link views, clicks, and click-rate table

### Setting up admin access

1. **Supabase Auth** is used for login. In Supabase → Authentication → Users, create a user with the email/password you want to use.
2. Add that email to the `admins` table (run the migration `0002_admin_analytics.sql`, then insert the row):
   ```sql
   insert into public.admins (email) values ('you@example.com');
   ```
3. Set `SUPABASE_SERVICE_ROLE_KEY` and `SUPERADMIN_EMAIL` in your `.env.local` (see `.env.local.example`).
4. Open `/admin`, sign in, and you're in. (The `SUPERADMIN_EMAIL` also grants access without needing the `admins` row.)

> **Important:** `SUPABASE_SERVICE_ROLE_KEY` is a privileged key. It is only used server-side in API routes and is never exposed to the browser.

### Run the migrations

```bash
# 1) 0001_init.sql — core tables
# 2) 0002_admin_analytics.sql — views/clicks counters, admins table
# 3) 0003_minimize_space.sql — compact analytics: drops unbounded task_completions,
#    adds completions counter + daily link_analytics aggregate, unified record_event() RPC
# 4) 0004_blog.sql — blog_posts table (posts & guides) for the Blog/Guide section
```

### Blog & Guides

A full blog + guide CMS is included:

- **Public section:** `/blog` lists all published posts (filter by All / Posts / Guides) and `/blog/[slug]` renders a single article with rich HTML (headings, lists, quotes, tables, images, videos) plus cover image, gallery, and featured video.
- **Admin:** the **Blog** tab in `/admin` lets you create/edit/delete posts & guides with a professional **rich-text editor** — toolbar includes Paragraph, H1–H4, Bold, Italic, Underline, Strikethrough, bullet & numbered lists, Quote, Code, Link, Image, Video, and Table.
- Each post supports **multiple gallery images**, **SEO title & meta description**, **category**, **type (Post/Guide)**, cover image, featured video, author, and publish/draft toggle.
- When you save a post, the public site immediately reflects it.

### Minimal-storage design

UNLOCKFLOW is optimized to use as little Supabase storage as possible:

- **No unbounded event rows.** Individual views / clicks / completions are **not** stored as rows.
  Instead each event increments a counter and folds into **one `link_analytics` row per link per day**.
- That means storage stays flat no matter how much traffic you get.
- `record_event(slug, event)` does it all in a single database call (`view` / `click` / `complete`).
- Totals are derived from the `links` table counters, so admin analytics is a single lightweight query.
- **Minimal images.** We use a single **icon** per link (no banner). Icons are **auto-compressed client-side**
  to a tiny ~64KB WebP/JPEG before upload, so the 1 GB free storage lasts for tens of thousands of links.

---

## 🚀 Getting started

### 1. Install

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run the migration at `supabase/migrations/0001_init.sql` (SQL Editor) — this creates the `links`, `tasks`,
   `task_completions` tables, the `uploads` storage bucket, and RLS policies.
3. Copy `.env.local.example` to `.env.local` and fill in your project URL + anon key:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

> **Security note:** The RLS policies allow public (anon) insert so anyone can create links, since this is a no-login
> site. If you want to restrict creation, replace the insert policies with a service-role check and call the
> DB from a serverless function instead.

### 3. Run locally

```bash
npm run dev
```

Open http://localhost:3000

### 4. Build for production

```bash
npm run build
npm start
```

---

## ☁️ Deploy to Vercel

1. Push this repo to GitHub/GitLab.
2. Import the project in [vercel.com](https://vercel.com) → it auto-detects Next.js.
3. Add the two environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Deploy! 🎉

---

## 🗄️ Database schema

- **links** — `id`, `slug` (unique), `title`, `description`, `destination_url`, `banner_url`, `icon_url`,
  `has_password`, `password_hash`, `expiry_date`, `active`, `created_at`
- **tasks** — `id`, `link_id` (FK), `task_type`, `label`, `task_url`, `position`
- **task_completions** — `id`, `link_id` (FK), `fingerprint`, `created_at`

---

## 📁 Project structure

```
src/
  app/
    page.tsx               # home page
    unlock/[slug]/page.tsx # unlock page
    globals.css, layout.tsx
  components/              # Navbar, Hero, TaskSection, LinkGenerator, etc.
  lib/                     # supabase client, types, tasks, helpers
supabase/migrations/0001_init.sql
```

---

Made with care for creators. © UNLOCKFLOW
