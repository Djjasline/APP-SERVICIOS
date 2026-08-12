-- Regla operacional:
-- Todo codigo terminado en -30 corresponde a Vehiculos Especiales y proveedor FS-DEPOT.

update public.warehouse_inventory
set
  area = 'Vehículos Especiales',
  updated_at = now()
where regexp_replace(coalesce(product_code, ''), '^[`''"‘’´]+', '') ~* '-30$'
  and coalesce(nullif(trim(area), ''), '') <> 'Vehículos Especiales';

update public.vehicle_reference_catalog
set
  area = 'Vehículos Especiales',
  last_supplier = 'FS-DEPOT',
  updated_at = now()
where regexp_replace(coalesce(product_code, ''), '^[`''"‘’´]+', '') ~* '-30$'
  and (
    coalesce(nullif(trim(area), ''), '') <> 'Vehículos Especiales'
    or coalesce(nullif(trim(last_supplier), ''), '') <> 'FS-DEPOT'
  );
