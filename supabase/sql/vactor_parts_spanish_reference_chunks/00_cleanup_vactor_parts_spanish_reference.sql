-- Ejecuta este archivo una sola vez antes de cargar las partes.
-- Limpia solo la fuente Vactor traducida; no toca warehouse_inventory.
delete from public.vehicle_reference_catalog where source_file = '2014-03 Price File - Vactor Parts espanol.xlsx';
