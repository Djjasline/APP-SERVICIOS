create table if not exists public.form_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  draft_key text not null,
  data jsonb not null default '{}'::jsonb,
  saved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, draft_key)
);

create index if not exists form_drafts_user_updated_idx
  on public.form_drafts(user_id, updated_at desc);

alter table public.form_drafts enable row level security;

drop policy if exists "Usuario gestiona sus borradores" on public.form_drafts;

create policy "Usuario gestiona sus borradores"
  on public.form_drafts
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
