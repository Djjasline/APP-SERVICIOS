create table if not exists public.record_access_permissions (
  id uuid primary key default gen_random_uuid(),
  grantee_user_id uuid not null references auth.users(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  owner_email text,
  owner_name text,
  area text not null default 'vehiculos',
  tipo text not null default 'todos',
  can_view boolean not null default false,
  can_edit boolean not null default false,
  can_download boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (grantee_user_id, owner_user_id, area, tipo)
);

alter table public.record_access_permissions
  add column if not exists owner_email text;

alter table public.record_access_permissions
  add column if not exists owner_name text;

update public.record_access_permissions p
set owner_email = coalesce(p.owner_email, owner_profile.email),
    owner_name = coalesce(p.owner_name, owner_profile.full_name),
    updated_at = now()
from public.profiles owner_profile
where owner_profile.id = p.owner_user_id
  and (p.owner_email is null or p.owner_email = '' or p.owner_name is null or p.owner_name = '');

create index if not exists record_access_permissions_grantee_idx
  on public.record_access_permissions(grantee_user_id, active);

create index if not exists record_access_permissions_owner_idx
  on public.record_access_permissions(owner_user_id, active);

alter table public.record_access_permissions enable row level security;

create schema if not exists private;
grant usage on schema private to authenticated;

create or replace function private.is_super_admin_user()
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

drop policy if exists "Super admin gestiona permisos de registros" on public.record_access_permissions;
drop policy if exists "Usuario ve sus permisos recibidos" on public.record_access_permissions;
drop policy if exists "Usuarios autorizados consultan permisos de registros" on public.record_access_permissions;
drop policy if exists "Super admin crea permisos de registros" on public.record_access_permissions;
drop policy if exists "Super admin actualiza permisos de registros" on public.record_access_permissions;
drop policy if exists "Super admin elimina permisos de registros" on public.record_access_permissions;

create policy "Usuarios autorizados consultan permisos de registros"
  on public.record_access_permissions
  for select
  to authenticated
  using (grantee_user_id = (select auth.uid()) or (select private.is_super_admin_user()));

create policy "Super admin crea permisos de registros"
  on public.record_access_permissions
  for insert
  to authenticated
  with check ((select private.is_super_admin_user()));

create policy "Super admin actualiza permisos de registros"
  on public.record_access_permissions
  for update
  to authenticated
  using ((select private.is_super_admin_user()))
  with check ((select private.is_super_admin_user()));

create policy "Super admin elimina permisos de registros"
  on public.record_access_permissions
  for delete
  to authenticated
  using ((select private.is_super_admin_user()));

grant select, insert, update, delete on public.registros to authenticated;

alter table public.registros enable row level security;

drop policy if exists "Super admin gestiona todos los registros" on public.registros;
drop policy if exists "Usuario consulta sus registros" on public.registros;
drop policy if exists "Usuario crea sus registros" on public.registros;
drop policy if exists "Usuario edita sus registros" on public.registros;
drop policy if exists "Usuario elimina sus registros" on public.registros;
drop policy if exists "Usuario ve registros permitidos" on public.registros;
drop policy if exists "Usuario edita registros permitidos" on public.registros;
drop policy if exists "select own or superadmin registros" on public.registros;
drop policy if exists "insert own registros" on public.registros;
drop policy if exists "update own or superadmin registros" on public.registros;
drop policy if exists "delete own or superadmin registros" on public.registros;
drop policy if exists "Supervisor operaciones puede ver registros" on public.registros;
drop policy if exists "Supervisor proyecto puede ver informes vehiculos" on public.registros;
drop policy if exists "Usuarios autorizados consultan registros" on public.registros;
drop policy if exists "Usuarios autorizados crean registros" on public.registros;
drop policy if exists "Usuarios autorizados actualizan registros" on public.registros;
drop policy if exists "Usuarios autorizados eliminan registros" on public.registros;

create policy "Usuarios autorizados consultan registros"
  on public.registros
  for select
  to authenticated
  using (
    (select private.is_super_admin_user())
    or user_id = (select auth.uid())
    or lower(coalesce((select auth.jwt()) ->> 'email', '')) = 'kamhez@astap.com'
    or lower(coalesce((select auth.jwt()) ->> 'email', '')) = lower(coalesce(nullif(trim(data->>'tecnicoCorreo'), ''), nullif(trim(data->>'correoTecnico'), ''), ''))
    or (
      area = 'vehiculos'
      and tipo = 'informe'
      and exists (
        select 1
        from public.profiles p
        where p.id = (select auth.uid())
          and p.role = 'supervisor_proyecto'
      )
    )
    or exists (
      select 1 from public.record_access_permissions p
      where p.grantee_user_id = (select auth.uid())
        and (
          p.owner_user_id = registros.user_id
          or lower(trim(coalesce(p.owner_email, ''))) = lower(coalesce(nullif(trim(registros.data->>'tecnicoCorreo'), ''), nullif(trim(registros.data->>'correoTecnico'), ''), ''))
        )
        and p.active = true
        and (p.can_view = true or p.can_edit = true or p.can_download = true)
        and (p.area = 'todos' or p.area = coalesce(registros.area, 'vehiculos'))
        and (
          p.tipo = 'todos'
          or p.tipo = coalesce(registros.tipo, 'todos')
          or p.tipo = concat_ws(':', coalesce(registros.tipo, 'todos'), nullif(coalesce(registros.subtipo, ''), ''))
        )
    )
  );

create policy "Usuarios autorizados crean registros"
  on public.registros
  for insert
  to authenticated
  with check ((select private.is_super_admin_user()) or user_id = (select auth.uid()));

create policy "Usuarios autorizados actualizan registros"
  on public.registros
  for update
  to authenticated
  using (
    (select private.is_super_admin_user())
    or user_id = (select auth.uid())
    or lower(coalesce((select auth.jwt()) ->> 'email', '')) = lower(coalesce(nullif(trim(data->>'tecnicoCorreo'), ''), nullif(trim(data->>'correoTecnico'), ''), ''))
    or exists (
      select 1 from public.record_access_permissions p
      where p.grantee_user_id = (select auth.uid())
        and (
          p.owner_user_id = registros.user_id
          or lower(trim(coalesce(p.owner_email, ''))) = lower(coalesce(nullif(trim(registros.data->>'tecnicoCorreo'), ''), nullif(trim(registros.data->>'correoTecnico'), ''), ''))
        )
        and p.active = true
        and p.can_edit = true
        and (p.area = 'todos' or p.area = coalesce(registros.area, 'vehiculos'))
        and (
          p.tipo = 'todos'
          or p.tipo = coalesce(registros.tipo, 'todos')
          or p.tipo = concat_ws(':', coalesce(registros.tipo, 'todos'), nullif(coalesce(registros.subtipo, ''), ''))
        )
    )
  )
  with check (
    (select private.is_super_admin_user())
    or user_id = (select auth.uid())
    or lower(coalesce((select auth.jwt()) ->> 'email', '')) = lower(coalesce(nullif(trim(data->>'tecnicoCorreo'), ''), nullif(trim(data->>'correoTecnico'), ''), ''))
    or exists (
      select 1 from public.record_access_permissions p
      where p.grantee_user_id = (select auth.uid())
        and (
          p.owner_user_id = registros.user_id
          or lower(trim(coalesce(p.owner_email, ''))) = lower(coalesce(nullif(trim(registros.data->>'tecnicoCorreo'), ''), nullif(trim(registros.data->>'correoTecnico'), ''), ''))
        )
        and p.active = true
        and p.can_edit = true
        and (p.area = 'todos' or p.area = coalesce(registros.area, 'vehiculos'))
        and (
          p.tipo = 'todos'
          or p.tipo = coalesce(registros.tipo, 'todos')
          or p.tipo = concat_ws(':', coalesce(registros.tipo, 'todos'), nullif(coalesce(registros.subtipo, ''), ''))
        )
    )
  );

create policy "Usuarios autorizados eliminan registros"
  on public.registros
  for delete
  to authenticated
  using ((select private.is_super_admin_user()) or user_id = (select auth.uid()));
