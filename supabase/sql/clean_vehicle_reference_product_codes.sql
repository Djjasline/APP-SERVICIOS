update public.vehicle_reference_catalog
set
  product_code = regexp_replace(product_code, '^[`''"‘’´]+', ''),
  updated_at = now()
where product_code ~ '^[`''"‘’´]+';
