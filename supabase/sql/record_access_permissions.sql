create table if not exists public.record_access_permissions (
  id uuid primary key default gen_random_uuid(),
  grantee_user_id uuid not null references auth.users(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
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

create index if not exists record_access_permissions_grantee_idx
  on public.record_access_permissions(grantee_user_id, active);

create index if not exists record_access_permissions_owner_idx
  on public.record_access_permissions(owner_user_id, active);

alter table public.record_access_permissions enable row level security;

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

drop policy if exists "Super admin gestiona permisos de registros" on public.record_access_permissions;
drop policy if exists "Usuario ve sus permisos recibidos" on public.record_access_permissions;

create policy "Super admin gestiona permisos de registros"
  on public.record_access_permissions
  for all
  using (public.is_super_admin_user())
  with check (public.is_super_admin_user());

create policy "Usuario ve sus permisos recibidos"
  on public.record_access_permissions
  for select
  using (grantee_user_id = auth.uid());

drop policy if exists "Usuario ve registros permitidos" on public.registros;
drop policy if exists "Usuario edita registros permitidos" on public.registros;

create policy "Usuario ve registros permitidos"
  on public.registros
  for select
  using (
    exists (
      select 1 from public.record_access_permissions p
      where p.grantee_user_id = auth.uid()
        and p.owner_user_id = registros.user_id
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

create policy "Usuario edita registros permitidos"
  on public.registros
  for update
  using (
    exists (
      select 1 from public.record_access_permissions p
      where p.grantee_user_id = auth.uid()
        and p.owner_user_id = registros.user_id
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
    exists (
      select 1 from public.record_access_permissions p
      where p.grantee_user_id = auth.uid()
        and p.owner_user_id = registros.user_id
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
