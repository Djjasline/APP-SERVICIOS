# Import Vactor Parts Spanish Reference

Ejecuta los archivos en Supabase SQL Editor en este orden:

1. 00_cleanup_vactor_parts_spanish_reference.sql
2. 01_vactor_parts_spanish_reference.sql
3. Continua con todas las partes numeradas hasta la ultima.

Cada parte borra primero sus propios codigos para evitar duplicados si necesitas repetir una parte.
No modifica warehouse_inventory; solo inserta en vehicle_reference_catalog con source_file = '2014-03 Price File - Vactor Parts espanol.xlsx'.

Total de registros: 14196
Tamano de lote: 250
