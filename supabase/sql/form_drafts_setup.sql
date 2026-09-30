create table if not exists public.form_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  draft_key text not null,
  device_id text,
  device_label text,
  user_agent text,
  data jsonb not null default '{}'::jsonb,
  saved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, draft_key)
);

alter table public.form_drafts
  add column if not exists device_id text,
  add column if not exists device_label text,
  add column if not exists user_agent text;

create index if not exists form_drafts_user_updated_idx
  on public.form_drafts(user_id, updated_at desc);

alter table public.form_drafts enable row level security;

drop policy if exists "Usuario gestiona sus borradores" on public.form_drafts;

create policy "Usuario gestiona sus borradores"
  on public.form_drafts
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create table if not exists public.form_draft_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  draft_key text not null,
  device_id text not null,
  device_label text,
  user_agent text,
  snapshot_key text not null,
  data jsonb not null default '{}'::jsonb,
  saved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, draft_key, device_id, snapshot_key)
);

create index if not exists form_draft_snapshots_user_draft_saved_idx
  on public.form_draft_snapshots(user_id, draft_key, saved_at desc);

create index if not exists form_draft_snapshots_user_device_saved_idx
  on public.form_draft_snapshots(user_id, device_id, saved_at desc);

alter table public.form_draft_snapshots enable row level security;

drop policy if exists "Usuario gestiona historial de borradores" on public.form_draft_snapshots;

create policy "Usuario gestiona historial de borradores"
  on public.form_draft_snapshots
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
