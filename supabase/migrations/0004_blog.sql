-- ============================================================
-- UNLOCKFLOW — Blog & Guides (Migration 0004)
-- Run AFTER 0003. Adds posts table for blog/guide content.
-- ============================================================

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  type text not null default 'post',          -- 'post' or 'guide'
  category text not null default 'General',
  excerpt text not null default '',
  content text not null default '',           -- HTML (headings, p, lists, tables, etc.)
  cover_image text not null default '',
  gallery jsonb not null default '[]'::jsonb, -- array of extra image URLs
  video_url text not null default '',
  seo_title text not null default '',
  seo_description text not null default '',
  author text not null default 'UNLOCKFLOW',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_blog_posts_slug on public.blog_posts(slug);
create index if not exists idx_blog_posts_published on public.blog_posts(published);
create index if not exists idx_blog_posts_type on public.blog_posts(type);

-- updated_at auto-update trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_blog_posts_updated on public.blog_posts;
create trigger trg_blog_posts_updated
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

-- RLS: public can read published posts; admin (service role) bypasses RLS.
alter table public.blog_posts enable row level security;
create policy "blog_read_published" on public.blog_posts
  for select using (published = true);
create policy "blog_insert" on public.blog_posts
  for insert with check (true);
create policy "blog_update" on public.blog_posts
  for update using (true) with check (true);
create policy "blog_delete" on public.blog_posts
  for delete using (true);
