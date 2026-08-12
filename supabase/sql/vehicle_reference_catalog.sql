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

create table if not exists public.vehicle_reference_catalog (
  id uuid primary key default gen_random_uuid(),
  product_code text not null,
  description text not null,
  sheet_name text,
  reference_stock numeric(12, 2) not null default 0,
  last_cost numeric(12, 2),
  last_supplier text,
  last_purchase_date date,
  last_sale_date date,
  last_client text,
  last_comment text,
  source_file text,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vehicle_reference_catalog_product_code_idx
  on public.vehicle_reference_catalog(product_code);

create index if not exists vehicle_reference_catalog_active_idx
  on public.vehicle_reference_catalog(active);

create index if not exists vehicle_reference_catalog_description_trgm_idx
  on public.vehicle_reference_catalog using gin (description gin_trgm_ops);

grant select, insert, update, delete on public.vehicle_reference_catalog to authenticated;

alter table public.vehicle_reference_catalog enable row level security;

drop policy if exists "Super admin gestiona referencia historica vehiculos" on public.vehicle_reference_catalog;
drop policy if exists "Usuario con permiso bodega consulta referencia historica vehiculos" on public.vehicle_reference_catalog;

create policy "Super admin gestiona referencia historica vehiculos"
  on public.vehicle_reference_catalog
  for all
  to authenticated
  using (public.is_super_admin_user())
  with check (public.is_super_admin_user());

create policy "Usuario con permiso bodega consulta referencia historica vehiculos"
  on public.vehicle_reference_catalog
  for select
  to authenticated
  using (
    active = true
    and exists (
      select 1
      from public.record_access_permissions p
      where p.grantee_user_id = auth.uid()
        and p.active = true
        and p.can_view = true
        and (p.area = 'operaciones' or p.area = 'todos')
        and p.tipo = 'bodega'
    )
  );

-- Importacion sugerida desde INVENTARIO referencial vehiculos.XLSX:
-- product_code, description, sheet_name, reference_stock, last_cost, last_supplier,
-- last_purchase_date, last_sale_date, last_client, last_comment, source_file
-- Esta tabla es solo referencial historica para Vehiculos Especiales y no afecta warehouse_inventory.
