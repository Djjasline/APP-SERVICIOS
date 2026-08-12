-- Regla operacional:
-- Todo articulo cuya descripcion diga Piquersa corresponde a Vehiculos Especiales y proveedor Piquersa.

alter table public.warehouse_inventory
  add column if not exists last_supplier text;

update public.warehouse_inventory
set
  area = 'Vehículos Especiales',
  last_supplier = 'Piquersa',
  updated_at = now()
where coalesce(description, '') ~* 'piquersa'
  and (
    coalesce(nullif(trim(area), ''), '') <> 'Vehículos Especiales'
    or coalesce(nullif(trim(last_supplier), ''), '') <> 'Piquersa'
  );

update public.vehicle_reference_catalog
set
  area = 'Vehículos Especiales',
  last_supplier = 'Piquersa',
  updated_at = now()
where coalesce(description, '') ~* 'piquersa'
  and (
    coalesce(nullif(trim(area), ''), '') <> 'Vehículos Especiales'
    or coalesce(nullif(trim(last_supplier), ''), '') <> 'Piquersa'
  );
