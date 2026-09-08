update public.warehouse_inventory
set
  product_code = regexp_replace(regexp_replace(product_code, '^[`''"‘’´]+', ''), '^0-(.+-30)$', '\1', 'i'),
  updated_at = now()
where product_code ~ '^[`''"‘’´]+'
  or product_code ~* '^0-.+-30$';

update public.vehicle_reference_catalog
set
  product_code = regexp_replace(regexp_replace(product_code, '^[`''"‘’´]+', ''), '^0-(.+-30)$', '\1', 'i'),
  updated_at = now()
where product_code ~ '^[`''"‘’´]+'
  or product_code ~* '^0-.+-30$';
