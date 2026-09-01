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

create table if not exists public.warehouse_inventory (
  id uuid primary key default gen_random_uuid(),
  product_code text not null,
  description text not null,
  physical_stock numeric(12, 2) not null default 0,
  physical_location text,
  cutoff_date date,
  source_file text,
  area text,
  last_supplier text,
  image_url text,
  unit text,
  weight_kg numeric(12, 3),
  stock_minimum numeric(12, 2),
  brand text,
  model text,
  category text,
  system text,
  compatible_equipment text,
  technical_specs text,
  internal_notes text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.warehouse_inventory
  add column if not exists area text,
  add column if not exists last_supplier text,
  add column if not exists image_url text,
  add column if not exists unit text,
  add column if not exists weight_kg numeric(12, 3),
  add column if not exists stock_minimum numeric(12, 2),
  add column if not exists brand text,
  add column if not exists model text,
  add column if not exists category text,
  add column if not exists system text,
  add column if not exists compatible_equipment text,
  add column if not exists technical_specs text,
  add column if not exists internal_notes text;

create index if not exists warehouse_inventory_product_code_idx
  on public.warehouse_inventory(product_code);

create index if not exists warehouse_inventory_location_idx
  on public.warehouse_inventory(physical_location);

create index if not exists warehouse_inventory_area_idx
  on public.warehouse_inventory(area);

create index if not exists warehouse_inventory_description_trgm_idx
  on public.warehouse_inventory using gin (description gin_trgm_ops);

grant select, insert, update, delete on public.warehouse_inventory to authenticated;

alter table public.warehouse_inventory enable row level security;

drop policy if exists "Super admin gestiona inventario de bodega" on public.warehouse_inventory;
drop policy if exists "Usuario con permiso especial consulta inventario de bodega" on public.warehouse_inventory;
drop policy if exists "Usuario configurador consulta inventario para cotizador" on public.warehouse_inventory;
drop policy if exists "Usuario cotizador consulta inventario" on public.warehouse_inventory;
drop policy if exists "Usuarios autorizados consultan inventario de bodega" on public.warehouse_inventory;
drop policy if exists "Super admin crea inventario de bodega" on public.warehouse_inventory;
drop policy if exists "Super admin actualiza inventario de bodega" on public.warehouse_inventory;
drop policy if exists "Super admin elimina inventario de bodega" on public.warehouse_inventory;

create policy "Usuarios autorizados consultan inventario de bodega"
  on public.warehouse_inventory
  for select
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
        and p.tipo = 'bodega'
    )
    or exists (
      select 1
      from public.record_access_permissions p
      where p.grantee_user_id = (select auth.uid())
        and p.active = true
        and p.can_view = true
        and (p.area = 'vehiculos' or p.area = 'todos')
        and p.tipo = 'cotizador'
    )
  );

create policy "Super admin crea inventario de bodega"
  on public.warehouse_inventory
  for insert
  to authenticated
  with check ((select public.is_super_admin_user()));

create policy "Super admin actualiza inventario de bodega"
  on public.warehouse_inventory
  for update
  to authenticated
  using ((select public.is_super_admin_user()))
  with check ((select public.is_super_admin_user()));

create policy "Super admin elimina inventario de bodega"
  on public.warehouse_inventory
  for delete
  to authenticated
  using ((select public.is_super_admin_user()));

-- Importacion sugerida desde Excel/CSV:
-- product_code, description, physical_stock, physical_location, cutoff_date, source_file
-- CODIGO DE PRODUCTO, DESCRIPCION, STOCK FISICO 2026, UBICACION FISICA, 2026-07-17, INVENTARIO FECHA CORTE 17-7-2026.xlsx
