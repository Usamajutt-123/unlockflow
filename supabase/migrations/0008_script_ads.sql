-- ============================================================
-- UNLOCKFLOW — Migration 0008: Script ads + new placements
-- Upgrades the `ads` table so the admin can paste Adsterra /
-- Monetag (or any ad network) script code directly, and adds
-- new placements on the unlock page:
--
--   banner       -> below the unlock-page header        (existing)
--   task         -> inline inside the task list         (existing)
--   task_center  -> center (middle) of the task list    (new)
--   above_unlock -> right above the unlock button       (new)
--   faq          -> inside the FAQ section              (new)
--   social       -> fixed bottom social bar             (renamed from "bottom")
-- ============================================================

-- 1) Ad type: "image" (banner image + link) or "script" (raw ad-network HTML/JS).
alter table public.ads
  add column if not exists type text not null default 'image'
  check (type in ('image', 'script'));

-- 2) Raw ad script code (Adsterra / Monetag / etc.), used when type = 'script'.
alter table public.ads
  add column if not exists script text not null default '';

-- 3) Rename the old "bottom" slot to the new "social" slot.
update public.ads set slot = 'social' where slot = 'bottom';

-- 4) Replace the slot check constraint with the expanded slot list.
do $$
declare c text;
begin
  select conname into c
  from pg_constraint
  where conrelid = 'public.ads'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%slot%';
  if c is not null then
    execute format('alter table public.ads drop constraint %I', c);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'ads_slot_check' and conrelid = 'public.ads'::regclass
  ) then
    alter table public.ads add constraint ads_slot_check check (
      slot in ('banner', 'task', 'task_center', 'above_unlock', 'faq', 'social')
    );
  end if;
end $$;
