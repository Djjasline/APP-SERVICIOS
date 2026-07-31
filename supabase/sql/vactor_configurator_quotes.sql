create extension if not exists pgcrypto;

create table if not exists public.vactor_configurator_quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quote_number text not null,
  customer text,
  end_customer text,
  sales_person text,
  model_id text not null,
  model_name text not null,
  model_family text not null default 'Vactor',
  price_summary jsonb not null default '{}'::jsonb,
  config jsonb not null default '{}'::jsonb,
  toggles jsonb not null default '{}'::jsonb,
  items jsonb not null default '[]'::jsonb,
  pdf_url text,
  pdf_path text,
  status text not null default 'guardada' check (status in ('guardada', 'enviada', 'anulada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vactor_configurator_quotes_user_created_idx
  on public.vactor_configurator_quotes(user_id, created_at desc);

create index if not exists vactor_configurator_quotes_quote_number_idx
  on public.vactor_configurator_quotes(quote_number);

alter table public.vactor_configurator_quotes enable row level security;

create or replace function public.is_super_admin_user()
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

drop policy if exists "Usuario gestiona sus cotizaciones Vactor" on public.vactor_configurator_quotes;
drop policy if exists "Usuario o super admin gestiona cotizaciones Vactor" on public.vactor_configurator_quotes;

create policy "Usuario o super admin gestiona cotizaciones Vactor"
  on public.vactor_configurator_quotes
  for all
  to authenticated
  using (user_id = auth.uid() or public.is_super_admin_user())
  with check (user_id = auth.uid() or public.is_super_admin_user());

insert into storage.buckets (id, name, public)
values ('informe', 'informe', true)
on conflict (id) do update set public = true;

drop policy if exists "Usuarios autenticados gestionan PDFs configurador" on storage.objects;
drop policy if exists "Usuario gestiona PDFs de sus cotizaciones Vactor" on storage.objects;
drop policy if exists "Usuario o super admin gestiona PDFs Vactor" on storage.objects;

create policy "Usuario o super admin gestiona PDFs Vactor"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'informe'
    and (storage.foldername(name))[1] = 'configurador'
    and exists (
      select 1
      from public.vactor_configurator_quotes q
      where q.id::text = (storage.foldername(name))[2]
        and (q.user_id = auth.uid() or public.is_super_admin_user())
    )
  )
  with check (
    bucket_id = 'informe'
    and (storage.foldername(name))[1] = 'configurador'
    and exists (
      select 1
      from public.vactor_configurator_quotes q
      where q.id::text = (storage.foldername(name))[2]
        and (q.user_id = auth.uid() or public.is_super_admin_user())
    )
  );
