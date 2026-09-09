update public.warehouse_inventory
set
  last_supplier = 'FS-DEPOT',
  updated_at = now()
where regexp_replace(upper(coalesce(last_supplier, '')), '[^A-Z0-9]+', '', 'g') = 'FSDEPOT'
  and coalesce(last_supplier, '') <> 'FS-DEPOT';

update public.vehicle_reference_catalog
set
  last_supplier = 'FS-DEPOT',
  updated_at = now()
where regexp_replace(upper(coalesce(last_supplier, '')), '[^A-Z0-9]+', '', 'g') = 'FSDEPOT'
  and coalesce(last_supplier, '') <> 'FS-DEPOT';

update public.warehouse_inventory
set
  last_supplier = 'USA BLUEBOOK',
  updated_at = now()
where regexp_replace(upper(coalesce(last_supplier, '')), '[^A-Z0-9]+', '', 'g') = 'USABLUEBOOK'
  and coalesce(last_supplier, '') <> 'USA BLUEBOOK';

update public.vehicle_reference_catalog
set
  last_supplier = 'USA BLUEBOOK',
  updated_at = now()
where regexp_replace(upper(coalesce(last_supplier, '')), '[^A-Z0-9]+', '', 'g') = 'USABLUEBOOK'
  and coalesce(last_supplier, '') <> 'USA BLUEBOOK';
