-- Agrega metadatos editables para fichas de articulos de bodega.
-- Es idempotente y no modifica cantidades de stock ni saldos historicos.

alter table public.warehouse_inventory
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

create index if not exists warehouse_inventory_area_idx
  on public.warehouse_inventory(area);

create index if not exists vehicle_reference_catalog_area_idx
  on public.vehicle_reference_catalog(area);
