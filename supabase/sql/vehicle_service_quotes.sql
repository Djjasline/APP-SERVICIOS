create extension if not exists pgcrypto;

create schema if not exists private;
grant usage on schema private to authenticated;

create or replace function private.is_super_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'smaviles@astap.com'
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'super_admin'
    );
$$;

create table if not exists public.vehicle_service_quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quote_number text,
  client text,
  reference text,
  offer jsonb not null default '{}'::jsonb,
  lines jsonb not null default '[]'::jsonb,
  totals jsonb not null default '{}'::jsonb,
  pdf_url text,
  pdf_path text,
  pdf_error text,
  status text not null default 'borrador' check (status in ('borrador', 'enviada', 'aprobada', 'anulada', 'pdf_pendiente')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vehicle_service_quotes
  add column if not exists pdf_url text,
  add column if not exists pdf_path text,
  add column if not exists pdf_error text;

alter table public.vehicle_service_quotes
  drop constraint if exists vehicle_service_quotes_status_check;

alter table public.vehicle_service_quotes
  add constraint vehicle_service_quotes_status_check
  check (status in ('borrador', 'enviada', 'aprobada', 'anulada', 'pdf_pendiente'));

create index if not exists vehicle_service_quotes_user_created_idx
  on public.vehicle_service_quotes(user_id, created_at desc);

create index if not exists vehicle_service_quotes_quote_number_idx
  on public.vehicle_service_quotes(quote_number);

grant select, insert, update, delete on public.vehicle_service_quotes to authenticated;

alter table public.vehicle_service_quotes enable row level security;

drop policy if exists "Usuario o super admin gestiona cotizaciones de servicios" on public.vehicle_service_quotes;

create policy "Usuario o super admin gestiona cotizaciones de servicios"
  on public.vehicle_service_quotes
  for all
  to authenticated
  using (user_id = (select auth.uid()) or (select private.is_super_admin_user()))
  with check (user_id = (select auth.uid()) or (select private.is_super_admin_user()));
