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
    (select public.is_super_admin_user())
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
  with check ((select public.is_super_admin_user()) or user_id = (select auth.uid()));

create policy "Usuarios autorizados actualizan registros"
  on public.registros
  for update
  to authenticated
  using (
    (select public.is_super_admin_user())
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
    (select public.is_super_admin_user())
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
  using ((select public.is_super_admin_user()) or user_id = (select auth.uid()));
