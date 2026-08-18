-- UNLOCKFLOW — Migration 0005: Link themes
-- Adds a `theme` column to links (unlock page visual theme).

alter table public.links
  add column if not exists theme text not null default 'midnight';

-- Valid themes: midnight, clean, neon, minimal, creator, gaming
