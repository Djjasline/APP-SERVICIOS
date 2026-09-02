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
  area text,
  image_url text,
  unit text,
  weight_kg numeric(12, 3),
  brand text,
  model text,
  category text,
  system text,
  compatible_equipment text,
  technical_specs text,
  internal_notes text,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vehicle_reference_catalog
  add column if not exists area text,
  add column if not exists image_url text,
  add column if not exists unit text,
  add column if not exists weight_kg numeric(12, 3),
  add column if not exists brand text,
  add column if not exists model text,
  add column if not exists category text,
  add column if not exists system text,
  add column if not exists compatible_equipment text,
  add column if not exists technical_specs text,
  add column if not exists internal_notes text;

create index if not exists vehicle_reference_catalog_product_code_idx
  on public.vehicle_reference_catalog(product_code);

create index if not exists vehicle_reference_catalog_active_idx
  on public.vehicle_reference_catalog(active);

create index if not exists vehicle_reference_catalog_area_idx
  on public.vehicle_reference_catalog(area);

create index if not exists vehicle_reference_catalog_description_trgm_idx
  on public.vehicle_reference_catalog using gin (description extensions.gin_trgm_ops);

grant select, insert, update, delete on public.vehicle_reference_catalog to authenticated;

alter table public.vehicle_reference_catalog enable row level security;

drop policy if exists "Super admin gestiona referencia historica vehiculos" on public.vehicle_reference_catalog;
drop policy if exists "Usuario con permiso bodega consulta referencia historica vehiculos" on public.vehicle_reference_catalog;
drop policy if exists "Usuario configurador consulta referencia para cotizador" on public.vehicle_reference_catalog;
drop policy if exists "Usuario cotizador consulta referencia" on public.vehicle_reference_catalog;
drop policy if exists "Usuario formularios vehiculos consulta referencia" on public.vehicle_reference_catalog;
drop policy if exists "Usuarios autorizados consultan referencia historica vehiculos" on public.vehicle_reference_catalog;
drop policy if exists "Super admin crea referencia historica vehiculos" on public.vehicle_reference_catalog;
drop policy if exists "Super admin actualiza referencia historica vehiculos" on public.vehicle_reference_catalog;
drop policy if exists "Super admin elimina referencia historica vehiculos" on public.vehicle_reference_catalog;

create policy "Usuarios autorizados consultan referencia historica vehiculos"
  on public.vehicle_reference_catalog
  for select
  to authenticated
  using (
    (select public.is_super_admin_user())
    or (
      active = true
      and (
        exists (
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
        or exists (
          select 1
          from public.profiles pr
          where pr.id = (select auth.uid())
            and pr.role in ('admin', 'tecnico', 'supervisor_operaciones', 'supervisor_proyecto', 'proveedor_vehiculos')
        )
        or exists (
          select 1
          from public.record_access_permissions p
          where p.grantee_user_id = (select auth.uid())
            and p.active = true
            and (p.can_view = true or p.can_edit = true or p.can_download = true)
            and (p.area = 'vehiculos' or p.area = 'todos')
            and p.tipo in ('todos', 'informe', 'inspeccion', 'mantenimiento')
        )
      )
    )
  );

create policy "Super admin crea referencia historica vehiculos"
  on public.vehicle_reference_catalog
  for insert
  to authenticated
  with check ((select public.is_super_admin_user()));

create policy "Super admin actualiza referencia historica vehiculos"
  on public.vehicle_reference_catalog
  for update
  to authenticated
  using ((select public.is_super_admin_user()))
  with check ((select public.is_super_admin_user()));

create policy "Super admin elimina referencia historica vehiculos"
  on public.vehicle_reference_catalog
  for delete
  to authenticated
  using ((select public.is_super_admin_user()));

-- Importacion sugerida desde INVENTARIO referencial vehiculos.XLSX:
-- product_code, description, sheet_name, reference_stock, last_cost, last_supplier,
-- last_purchase_date, last_sale_date, last_client, last_comment, source_file
-- Esta tabla es solo referencial historica para Vehiculos Especiales y no afecta warehouse_inventory.
