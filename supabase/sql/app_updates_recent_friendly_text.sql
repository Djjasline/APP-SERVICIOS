insert into public.app_updates (update_key, title, message, active, created_at, updated_at)
values
  (
    'github-push-575c618dd8a36f20cedc48264ff375f103071aec',
    'Control de cambios: carga inicial optimizada',
    'Se optimizó la carga inicial de la app con mejor carga de fuentes y caché para recursos públicos.',
    true,
    '2026-08-18T12:53:59-05:00',
    now()
  ),
  (
    'github-push-6112e0c94cc12b6baa6bf687bf9ebb5a21a809fe',
    'Control de cambios: clientes en cotizador y configurador',
    'El cotizador y el configurador ahora usan la base de clientes para seleccionar clientes de forma consistente.',
    true,
    '2026-08-18T12:18:52-05:00',
    now()
  ),
  (
    'github-push-27123efca0f94848e5680110db1d63db4082cd10',
    'Control de cambios: selección de clientes ajustada',
    'En formularios de vehículos, seleccionar un cliente ahora completa solo el nombre y no modifica dirección ni RUC/cédula.',
    true,
    '2026-08-18T12:14:27-05:00',
    now()
  ),
  (
    'github-push-8d1418c33dadfdfafa765736d5a327b8338de4d2',
    'Control de cambios: módulo de clientes',
    'Operaciones ahora cuenta con un módulo para buscar, crear, editar, activar, desactivar y eliminar clientes.',
    true,
    '2026-08-18T12:08:42-05:00',
    now()
  ),
  (
    'github-push-4cf8514623c58a721728f484c9879ab953ae9170',
    'Control de cambios: base de clientes integrada',
    'Los formularios de vehículos ahora pueden seleccionar clientes desde la base central de clientes.',
    true,
    '2026-08-18T11:58:24-05:00',
    now()
  ),
  (
    'github-push-d656634aced302b37060fd530f02d29431ca7036',
    'Control de cambios: referencia Vactor en anexos',
    'Los anexos de partes ahora permiten buscar referencias Vactor y completar descripción y número de parte.',
    true,
    '2026-08-18T11:23:08-05:00',
    now()
  ),
  (
    'github-push-e077f8bb6b556b3abbfa181a31681df3ecebd270',
    'Control de cambios: importación Vactor preparada',
    'Se agregó la importación dividida de referencias Vactor para facilitar su carga en Supabase.',
    true,
    '2026-08-18T11:02:37-05:00',
    now()
  ),
  (
    'github-push-b1e2e8ce7a29b2780750d3e3bc1ca607f0fd7562',
    'Control de cambios: importación Vactor en SQL',
    'La importación de referencias Vactor quedó organizada dentro de los archivos SQL de Supabase.',
    true,
    '2026-08-18T10:56:32-05:00',
    now()
  )
on conflict (update_key) do update
set title = excluded.title,
    message = excluded.message,
    active = excluded.active,
    created_at = excluded.created_at,
    updated_at = now();
