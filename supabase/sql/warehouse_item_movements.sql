create extension if not exists pgcrypto;

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

create table if not exists public.warehouse_item_movements (
  id uuid primary key default gen_random_uuid(),
  item_source text not null check (item_source in ('stock', 'vehicle-reference')),
  item_id uuid not null,
  movement_type text not null check (movement_type in ('entrada', 'salida', 'reserva', 'devolucion', 'ajuste', 'uso', 'cotizacion')),
  quantity numeric(12, 2) not null default 0,
  unit_cost numeric(12, 2),
  area text,
  related_party text,
  document_ref text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists warehouse_item_movements_item_idx
  on public.warehouse_item_movements(item_source, item_id, created_at desc);

create index if not exists warehouse_item_movements_created_at_idx
  on public.warehouse_item_movements(created_at desc);

create index if not exists warehouse_item_movements_area_idx
  on public.warehouse_item_movements(area);

grant select, insert, update, delete on public.warehouse_item_movements to authenticated;

alter table public.warehouse_item_movements enable row level security;

drop policy if exists "Super admin gestiona movimientos de bodega" on public.warehouse_item_movements;
drop policy if exists "Usuario con permiso bodega consulta movimientos" on public.warehouse_item_movements;

create policy "Super admin gestiona movimientos de bodega"
  on public.warehouse_item_movements
  for all
  to authenticated
  using (public.is_super_admin_user())
  with check (public.is_super_admin_user());

create policy "Usuario con permiso bodega consulta movimientos"
  on public.warehouse_item_movements
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.record_access_permissions p
      where p.grantee_user_id = auth.uid()
        and p.active = true
        and p.can_view = true
        and (p.area = 'operaciones' or p.area = 'todos')
        and p.tipo = 'bodega'
    )
  );

-- Esta tabla registra actividad operacional. No actualiza automaticamente stock fisico.
