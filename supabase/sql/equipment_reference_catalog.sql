-- Reference information only: does not change existing reports or clients.
create table if not exists public.equipment_reference_catalog (
  id uuid primary key default gen_random_uuid(),
  source_file text not null,
  source_sheet text not null,
  source_row integer not null check (source_row > 0),
  client_name text,
  equipment_type text,
  chassis_vin text,
  chassis_brand text,
  equipment_model text,
  module_serial text,
  manufacture_year text,
  auxiliary_brand text,
  auxiliary_model text,
  auxiliary_serial text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (source_file, source_sheet, source_row)
);

alter table public.equipment_reference_catalog enable row level security;
revoke all on public.equipment_reference_catalog from anon, authenticated;
grant select on public.equipment_reference_catalog to authenticated;

drop policy if exists "Usuarios de vehiculos consultan equipos" on public.equipment_reference_catalog;
create policy "Usuarios de vehiculos consultan equipos"
  on public.equipment_reference_catalog for select to authenticated
  using (
    active = true and (
      lower(trim(coalesce((select auth.jwt()) ->> 'email', ''))) in
        ('smaviles@astap.com', 'kamhez@astap.com', 'abriones@astap.com')
      or exists (
        select 1 from public.profiles p
        where p.id = (select auth.uid())
          and lower(trim(coalesce(p.role, ''))) in
            ('tecnico', 'supervisor_operaciones', 'supervisor_proyecto', 'proveedor_vehiculos')
      )
    )
  );
