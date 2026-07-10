-- Life OS (Ramu Kaka) — storage schema
-- Applied to the shared "TheSoloEntrepreneur" project as an isolated,
-- prefixed table so it never collides with the tse_* tables.

create extension if not exists "pgcrypto";

create table if not exists public.lifeos_items (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  type           text not null check (type in ('task', 'idea', 'reminder')),
  title          text not null,
  details        text,
  priority       text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  category       text not null default 'business' check (category in ('business', 'personal')),
  status         text not null default 'open' check (status in ('open', 'done', 'archived')),
  due_at         timestamptz,
  source         text not null default 'manual',
  raw_transcript text,
  reminded_at    timestamptz
);

create index if not exists lifeos_items_status_idx on public.lifeos_items (status);
create index if not exists lifeos_items_due_idx on public.lifeos_items (due_at);
create index if not exists lifeos_items_category_idx on public.lifeos_items (category);

-- The server uses the service role key, which bypasses RLS. RLS stays on so the
-- public/anon key can never read this table.
alter table public.lifeos_items enable row level security;
