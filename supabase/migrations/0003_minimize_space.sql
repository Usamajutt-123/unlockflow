-- ============================================================
-- UNLOCKFLOW — Minimize Supabase Storage
-- Run AFTER 0002. Key goal: stop storing an unbounded row per
-- completion. Replaces it with:
--   - a compact `completions` counter on links
--   - a compact daily-aggregate `link_analytics` table
--     (at most ONE row per link per day, no matter the traffic)
-- Drops the unbounded `task_completions` table.
-- ============================================================

-- 1) Compact completion counter on links
alter table public.links
  add column if not exists completions integer not null default 0;

-- 2) Daily aggregate table (bounded size)
create table if not exists public.link_analytics (
  link_id uuid not null references public.links(id) on delete cascade,
  day date not null,
  views integer not null default 0,
  clicks integer not null default 0,
  completions integer not null default 0,
  primary key (link_id, day)
);

-- 3) Unified, compact RPC: increments the right counter on links
--    AND upserts a single row into link_analytics for today.
--    One DB call handles views / clicks / completions.
create or replace function public.record_event(p_slug text, p_event text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  select id into v_id from public.links where slug = p_slug;
  if v_id is null then return; end if;

  if p_event = 'view' then
    update public.links set views = views + 1 where id = v_id;
  elsif p_event = 'click' then
    update public.links set clicks = clicks + 1 where id = v_id;
  elsif p_event = 'complete' then
    update public.links set completions = completions + 1 where id = v_id;
  end if;

  insert into public.link_analytics (link_id, day, views, clicks, completions)
  values (
    v_id,
    current_date,
    case when p_event = 'view' then 1 else 0 end,
    case when p_event = 'click' then 1 else 0 end,
    case when p_event = 'complete' then 1 else 0 end
  )
  on conflict (link_id, day) do update set
    views = public.link_analytics.views + excluded.views,
    clicks = public.link_analytics.clicks + excluded.clicks,
    completions = public.link_analytics.completions + excluded.completions;
end;
$$;

-- 4) DROP the unbounded per-completion table.
--    (Its historical rows are released; totals now live on links.)
drop table if exists public.task_completions;

-- 5) RLS for the new table (public read for the anon unlock page analytics is not needed;
--    admin uses the service role. We keep a minimal read policy to be safe.)
alter table public.link_analytics enable row level security;
create policy "link_analytics_read" on public.link_analytics
  for select using (true);

-- 6) Drop now-unused RPCs to keep the schema lean.
drop function if exists public.increment_views(text);
drop function if exists public.increment_clicks(text);
drop function if exists public.get_completions();
