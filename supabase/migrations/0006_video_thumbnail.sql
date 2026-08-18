-- UNLOCKFLOW — Migration 0006: video thumbnail (zero-storage images)
-- Adds a video_url column to links. The thumbnail is fetched automatically
-- from the video host's CDN (YouTube/Vimeo) — no file is uploaded to storage.

alter table public.links
  add column if not exists video_url text not null default '';

-- When video_url is set, the unlock page shows that video's thumbnail as the
-- cover image. Storage stays at ~0 because we never store an image file.
