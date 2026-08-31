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
  stock_before numeric(12, 2),
  stock_after numeric(12, 2),
  area text,
  related_party text,
  responsible text,
  service_ref text,
  equipment text,
  client text,
  document_ref text,
  evidence_url text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.warehouse_item_movements
  add column if not exists stock_before numeric(12, 2),
  add column if not exists stock_after numeric(12, 2),
  add column if not exists responsible text,
  add column if not exists service_ref text,
  add column if not exists equipment text,
  add column if not exists client text,
  add column if not exists evidence_url text;

create index if not exists warehouse_item_movements_item_idx
  on public.warehouse_item_movements(item_source, item_id, created_at desc);

create index if not exists warehouse_item_movements_created_at_idx
  on public.warehouse_item_movements(created_at desc);

create index if not exists warehouse_item_movements_area_idx
  on public.warehouse_item_movements(area);

create index if not exists warehouse_item_movements_responsible_idx
  on public.warehouse_item_movements(responsible);

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

create or replace function public.register_warehouse_item_movement(
  p_item_source text,
  p_item_id uuid,
  p_movement_type text,
  p_quantity numeric,
  p_unit_cost numeric default null,
  p_area text default null,
  p_related_party text default null,
  p_responsible text default null,
  p_service_ref text default null,
  p_equipment text default null,
  p_client text default null,
  p_document_ref text default null,
  p_evidence_url text default null,
  p_notes text default null
)
returns public.warehouse_item_movements
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quantity numeric(12, 2) := abs(coalesce(p_quantity, 0));
  v_stock_before numeric(12, 2);
  v_stock_after numeric(12, 2);
  v_row public.warehouse_item_movements;
begin
  if not public.is_super_admin_user() then
    raise exception 'No autorizado para registrar movimientos de bodega.' using errcode = '42501';
  end if;

  if p_item_source not in ('stock', 'vehicle-reference') then
    raise exception 'Fuente de bodega no soportada.' using errcode = '22023';
  end if;

  if p_movement_type not in ('entrada', 'salida', 'reserva', 'devolucion', 'ajuste', 'uso', 'cotizacion') then
    raise exception 'Tipo de movimiento no valido.' using errcode = '22023';
  end if;

  if v_quantity <= 0 then
    raise exception 'La cantidad debe ser mayor a cero.' using errcode = '22023';
  end if;

  if p_item_source = 'stock' then
    select physical_stock
      into v_stock_before
      from public.warehouse_inventory
      where id = p_item_id
      for update;

    if not found then
      raise exception 'Articulo de stock no encontrado.' using errcode = 'P0002';
    end if;

    v_stock_before := coalesce(v_stock_before, 0);

    if p_movement_type in ('salida', 'uso') then
      v_stock_after := v_stock_before - v_quantity;
      if v_stock_after < 0 then
        raise exception 'Stock insuficiente. Disponible: %, solicitado: %.', v_stock_before, v_quantity using errcode = '22003';
      end if;
    elsif p_movement_type in ('entrada', 'devolucion') then
      v_stock_after := v_stock_before + v_quantity;
    elsif p_movement_type = 'ajuste' then
      v_stock_after := v_quantity;
    else
      v_stock_after := v_stock_before;
    end if;

    if p_movement_type in ('entrada', 'salida', 'devolucion', 'ajuste', 'uso') then
      update public.warehouse_inventory
        set physical_stock = v_stock_after,
            updated_at = now()
        where id = p_item_id;
    end if;
  end if;

  insert into public.warehouse_item_movements (
    item_source,
    item_id,
    movement_type,
    quantity,
    unit_cost,
    stock_before,
    stock_after,
    area,
    related_party,
    responsible,
    service_ref,
    equipment,
    client,
    document_ref,
    evidence_url,
    notes,
    created_by
  ) values (
    p_item_source,
    p_item_id,
    p_movement_type,
    v_quantity,
    p_unit_cost,
    v_stock_before,
    v_stock_after,
    nullif(trim(coalesce(p_area, '')), ''),
    nullif(trim(coalesce(p_related_party, '')), ''),
    nullif(trim(coalesce(p_responsible, '')), ''),
    nullif(trim(coalesce(p_service_ref, '')), ''),
    nullif(trim(coalesce(p_equipment, '')), ''),
    nullif(trim(coalesce(p_client, '')), ''),
    nullif(trim(coalesce(p_document_ref, '')), ''),
    nullif(trim(coalesce(p_evidence_url, '')), ''),
    nullif(trim(coalesce(p_notes, '')), ''),
    auth.uid()
  )
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.register_warehouse_item_movement(text, uuid, text, numeric, numeric, text, text, text, text, text, text, text, text, text) to authenticated;

-- Entradas/devoluciones suman stock, salidas/usos descuentan stock y ajustes fijan el stock final.
-- Reservas y cotizaciones se auditan sin modificar el stock fisico hasta su aprobacion/salida real.
