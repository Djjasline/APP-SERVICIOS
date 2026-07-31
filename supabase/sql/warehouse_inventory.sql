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
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists warehouse_inventory_product_code_idx
  on public.warehouse_inventory(product_code);

create index if not exists warehouse_inventory_location_idx
  on public.warehouse_inventory(physical_location);

create index if not exists warehouse_inventory_description_trgm_idx
  on public.warehouse_inventory using gin (description gin_trgm_ops);

grant select, insert, update, delete on public.warehouse_inventory to authenticated;

alter table public.warehouse_inventory enable row level security;

drop policy if exists "Super admin gestiona inventario de bodega" on public.warehouse_inventory;

create policy "Super admin gestiona inventario de bodega"
  on public.warehouse_inventory
  for all
  to authenticated
  using (public.is_super_admin_user())
  with check (public.is_super_admin_user());

-- Importacion sugerida desde Excel/CSV:
-- product_code, description, physical_stock, physical_location, cutoff_date, source_file
-- CODIGO DE PRODUCTO, DESCRIPCION, STOCK FISICO 2026, UBICACION FISICA, 2026-07-17, INVENTARIO FECHA CORTE 17-7-2026.xlsx
