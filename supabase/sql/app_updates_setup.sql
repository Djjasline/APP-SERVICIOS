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

create table if not exists public.app_updates (
  id uuid primary key default gen_random_uuid(),
  update_key text not null unique,
  title text not null,
  message text not null,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists app_updates_active_created_idx
  on public.app_updates(active, created_at desc);

alter table public.app_updates enable row level security;

drop policy if exists "Usuarios autenticados ven boletines activos" on public.app_updates;
drop policy if exists "Super admin gestiona boletines" on public.app_updates;

create policy "Usuarios autenticados ven boletines activos"
  on public.app_updates
  for select
  to authenticated
  using (active = true or public.is_super_admin_user());

create policy "Super admin gestiona boletines"
  on public.app_updates
  for all
  to authenticated
  using (public.is_super_admin_user())
  with check (public.is_super_admin_user());

create table if not exists public.app_update_reads (
  update_id uuid not null references public.app_updates(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (user_id, update_id)
);

create index if not exists app_update_reads_user_idx
  on public.app_update_reads(user_id, read_at desc);

alter table public.app_update_reads enable row level security;

drop policy if exists "Usuario gestiona sus lecturas de boletines" on public.app_update_reads;
drop policy if exists "Super admin ve lecturas de boletines" on public.app_update_reads;

create policy "Usuario gestiona sus lecturas de boletines"
  on public.app_update_reads
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Super admin ve lecturas de boletines"
  on public.app_update_reads
  for select
  to authenticated
  using (public.is_super_admin_user());

insert into public.app_updates (update_key, title, message, active, created_at)
values
  (
    '2026-07-10-vehicle-pdf-print-fixes',
    'Corrección de impresión PDF vehículos',
    'Se corrigió la numeración montada, la carga del logo ASTAP, el ancho del cuadro de conclusiones/recomendaciones y la espera de imágenes antes de imprimir PDFs.',
    true,
    '2026-07-10T18:30:00-05:00'
  ),
  (
    '2026-07-10-pdf-equipment-image-layout',
    'PDFs de vehículos más compactos',
    'Se ajustó Estado del equipo para que la imagen no se corte entre páginas, use una caja máxima de 95 mm x 70 mm y aproveche mejor la primera hoja del PDF.',
    true,
    '2026-07-10T17:30:00-05:00'
  ),
  (
    '2026-07-10-vcam-protocol',
    'Nuevo protocolo Cámara V-CAM6',
    'Ya está disponible el protocolo de mantenimiento preventivo para Cámara V-CAM6, con formulario, PDF, checklist, repuestos, pruebas finales y permisos administrativos.',
    true,
    '2026-07-10T16:30:00-05:00'
  ),
  (
    '2026-07-10-vactor-protocol-improvements',
    'Protocolo Vactor mejorado',
    'El protocolo Vactor ahora incluye pruebas previas, recambio de elementos, herramientas, instrucciones operativas, especificaciones de aceite y más verificaciones finales.',
    true,
    '2026-07-10T15:30:00-05:00'
  ),
  (
    '2026-07-09-multiple-pumps-valves',
    'Múltiples bombas y válvulas',
    'Ahora los informes de Agua, Industria y Petróleo permiten registrar varias bombas o válvulas, identificarlas individualmente y verlas completas en el PDF.',
    true,
    '2026-07-09T12:00:00-05:00'
  ),
  (
    '2026-07-09-access-all-users',
    'Acceso ampliado a áreas',
    'Todos los usuarios autenticados pueden ingresar a las áreas y submenús principales. El panel administrativo sigue reservado para superadministradores.',
    true,
    '2026-07-09T11:30:00-05:00'
  ),
  (
    '2026-07-09-road-wizard-pdf',
    'Corrección PDF Road Wizard',
    'El PDF de inspección Road Wizard ya muestra correctamente N° serie, VIN/chasis, placa, horas, kilometraje y horómetro.',
    true,
    '2026-07-09T10:30:00-05:00'
  ),
  (
    '2026-07-09-login-errors',
    'Mensajes de login mejorados',
    'El inicio de sesión ahora muestra mensajes más claros para contraseña incorrecta, correo no confirmado o problemas de conexión.',
    true,
    '2026-07-09T10:00:00-05:00'
  )
on conflict (update_key) do update
set title = excluded.title,
    message = excluded.message,
    active = excluded.active,
    created_at = excluded.created_at,
    updated_at = now();
