create extension if not exists pgcrypto;
create schema if not exists extensions;
create extension if not exists pg_trgm with schema extensions;

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

create table if not exists public.client_reference_catalog (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tax_id text,
  address text,
  source_file text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_reference_catalog_name_trgm_idx
  on public.client_reference_catalog using gin (name extensions.gin_trgm_ops);

create index if not exists client_reference_catalog_tax_id_idx
  on public.client_reference_catalog(tax_id);

create index if not exists client_reference_catalog_active_idx
  on public.client_reference_catalog(active);

grant select, insert, update, delete on public.client_reference_catalog to authenticated;

alter table public.client_reference_catalog enable row level security;

drop policy if exists "Super admin gestiona clientes referencia" on public.client_reference_catalog;
drop policy if exists "Usuario modulo clientes gestiona clientes referencia" on public.client_reference_catalog;
drop policy if exists "Usuarios formularios consultan clientes referencia" on public.client_reference_catalog;
drop policy if exists "Usuarios autenticados consultan clientes referencia" on public.client_reference_catalog;
drop policy if exists "Usuarios autorizados consultan clientes referencia" on public.client_reference_catalog;
drop policy if exists "Usuarios autorizados crean clientes referencia" on public.client_reference_catalog;
drop policy if exists "Usuarios autorizados actualizan clientes referencia" on public.client_reference_catalog;
drop policy if exists "Usuarios autorizados eliminan clientes referencia" on public.client_reference_catalog;

create policy "Usuarios autorizados consultan clientes referencia"
  on public.client_reference_catalog
  for select
  to authenticated
  using (
    active = true
    or (select public.is_super_admin_user())
    or exists (
      select 1
      from public.record_access_permissions p
      where p.grantee_user_id = (select auth.uid())
        and p.active = true
        and p.can_view = true
        and (p.area = 'operaciones' or p.area = 'todos')
        and p.tipo = 'clientes'
    )
  );

create policy "Usuarios autorizados crean clientes referencia"
  on public.client_reference_catalog
  for insert
  to authenticated
  with check (
    (select public.is_super_admin_user())
    or exists (
      select 1
      from public.record_access_permissions p
      where p.grantee_user_id = (select auth.uid())
        and p.active = true
        and p.can_view = true
        and (p.area = 'operaciones' or p.area = 'todos')
        and p.tipo = 'clientes'
    )
  );

create policy "Usuarios autorizados actualizan clientes referencia"
  on public.client_reference_catalog
  for update
  to authenticated
  using (
    (select public.is_super_admin_user())
    or exists (
      select 1
      from public.record_access_permissions p
      where p.grantee_user_id = (select auth.uid())
        and p.active = true
        and p.can_view = true
        and (p.area = 'operaciones' or p.area = 'todos')
        and p.tipo = 'clientes'
    )
  )
  with check (
    (select public.is_super_admin_user())
    or exists (
      select 1
      from public.record_access_permissions p
      where p.grantee_user_id = (select auth.uid())
        and p.active = true
        and p.can_view = true
        and (p.area = 'operaciones' or p.area = 'todos')
        and p.tipo = 'clientes'
    )
  );

create policy "Usuarios autorizados eliminan clientes referencia"
  on public.client_reference_catalog
  for delete
  to authenticated
  using (
    (select public.is_super_admin_user())
    or exists (
      select 1
      from public.record_access_permissions p
      where p.grantee_user_id = (select auth.uid())
        and p.active = true
        and p.can_view = true
        and (p.area = 'operaciones' or p.area = 'todos')
        and p.tipo = 'clientes'
    )
  );
