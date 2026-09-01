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
  using (grantee_user_id = (select auth.uid()) or (select public.is_super_admin_user()));

create policy "Super admin crea permisos de registros"
  on public.record_access_permissions
  for insert
  to authenticated
  with check ((select public.is_super_admin_user()));

create policy "Super admin actualiza permisos de registros"
  on public.record_access_permissions
  for update
  to authenticated
  using ((select public.is_super_admin_user()))
  with check ((select public.is_super_admin_user()));

create policy "Super admin elimina permisos de registros"
  on public.record_access_permissions
  for delete
  to authenticated
  using ((select public.is_super_admin_user()));
