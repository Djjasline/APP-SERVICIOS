create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

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
  on public.client_reference_catalog using gin (name gin_trgm_ops);

create index if not exists client_reference_catalog_tax_id_idx
  on public.client_reference_catalog(tax_id);

create index if not exists client_reference_catalog_active_idx
  on public.client_reference_catalog(active);

grant select, insert, update, delete on public.client_reference_catalog to authenticated;

alter table public.client_reference_catalog enable row level security;

drop policy if exists "Super admin gestiona clientes referencia" on public.client_reference_catalog;
drop policy if exists "Usuario modulo clientes gestiona clientes referencia" on public.client_reference_catalog;
drop policy if exists "Usuarios formularios consultan clientes referencia" on public.client_reference_catalog;

create policy "Super admin gestiona clientes referencia"
  on public.client_reference_catalog
  for all
  to authenticated
  using (public.is_super_admin_user())
  with check (public.is_super_admin_user());

create policy "Usuario modulo clientes gestiona clientes referencia"
  on public.client_reference_catalog
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.record_access_permissions p
      where p.grantee_user_id = auth.uid()
        and p.active = true
        and p.can_view = true
        and (p.area = 'operaciones' or p.area = 'todos')
        and p.tipo = 'clientes'
    )
  )
  with check (
    exists (
      select 1
      from public.record_access_permissions p
      where p.grantee_user_id = auth.uid()
        and p.active = true
        and p.can_view = true
        and (p.area = 'operaciones' or p.area = 'todos')
        and p.tipo = 'clientes'
    )
  );

create policy "Usuarios formularios consultan clientes referencia"
  on public.client_reference_catalog
  for select
  to authenticated
  using (
    active = true
    and (
      exists (
        select 1
        from public.profiles pr
        where pr.id = auth.uid()
          and pr.role in ('admin', 'tecnico', 'supervisor_operaciones', 'supervisor_proyecto', 'proveedor_vehiculos')
      )
      or exists (
        select 1
        from public.record_access_permissions p
        where p.grantee_user_id = auth.uid()
          and p.active = true
          and (p.can_view = true or p.can_edit = true or p.can_download = true)
          and (p.area = 'vehiculos' or p.area = 'todos')
      )
    )
  );
