-- ============================================================
-- UNLOCKFLOW — Supabase Database Migration
-- Run this migration in Supabase SQL Editor (or via `supabase db push`)
-- ============================================================

-- Enable required extensions
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1) LINKS — the main "unlock link" created by the creator
-- ------------------------------------------------------------
create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,                 -- short public slug e.g. abc123xy
  title text not null default 'Your reward is ready',
  description text not null default '',
  destination_url text not null,             -- final reward URL
  banner_url text not null default '',       -- banner image (storage url)
  icon_url text not null default '',         -- icon image (storage url)
  has_password boolean not null default false,
  password_hash text default null,           -- hash of the access password
  expiry_date timestamptz default null,      -- null = never expires
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2) TASKS — the list of actions the visitor must complete
-- ------------------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.links(id) on delete cascade,
  task_type text not null,                   -- e.g. youtube, instagram, custom
  label text not null,                       -- display label, e.g. "Subscribe"
  task_url text not null,                    -- the URL the visitor is redirected to
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_tasks_link_id on public.tasks(link_id);

-- ------------------------------------------------------------
-- 3) TASK_COMPLETIONS — tracks that a visitor finished all tasks
-- ------------------------------------------------------------
create table if not exists public.task_completions (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.links(id) on delete cascade,
  fingerprint text not null,                 -- browser fingerprint / token of visitor
  completed boolean not null default true,
  created_at timestamptz not null default now(),
  unique (link_id, fingerprint)
);

-- ------------------------------------------------------------
-- Storage bucket for banner / icon uploads
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- Row Level Security
-- NOTE: This is a NO-LOGIN public site, so anon (public) users
-- get read + write on links/tasks. If you want to lock creation,
-- replace the insert policies with a service-role check.
-- ------------------------------------------------------------
alter table public.links enable row level security;
alter table public.tasks enable row level security;
alter table public.task_completions enable row level security;

-- links: public can read active links, and (creator) insert new ones
create policy "public_read_links" on public.links
  for select using (true);
create policy "public_insert_links" on public.links
  for insert with check (true);
create policy "public_update_links" on public.links
  for update using (true) with check (true);

-- tasks: public can read + insert
create policy "public_read_tasks" on public.tasks
  for select using (true);
create policy "public_insert_tasks" on public.tasks
  for insert with check (true);

-- task_completions: public can read + insert
create policy "public_read_completions" on public.task_completions
  for select using (true);
create policy "public_insert_completions" on public.task_completions
  for insert with check (true);

-- storage: allow anon to read & upload to 'uploads' bucket
create policy "public_read_uploads" on storage.objects
  for select using (bucket_id = 'uploads');
create policy "public_insert_uploads" on storage.objects
  for insert with check (bucket_id = 'uploads');
