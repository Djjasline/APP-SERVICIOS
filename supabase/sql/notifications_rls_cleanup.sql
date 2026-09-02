drop policy if exists "Usuario puede ver sus notificaciones" on public.notifications;
drop policy if exists "Usuario puede marcar sus notificaciones" on public.notifications;
drop policy if exists "Usuarios autenticados pueden crear notificaciones" on public.notifications;
drop policy if exists "Super Admin puede ver todas las notificaciones" on public.notifications;

create policy "Usuario puede ver sus notificaciones"
  on public.notifications
  for select
  to authenticated
  using (
    lower(recipient_email) = lower((select auth.jwt()) ->> 'email')
    or (select public.is_super_admin_user())
  );

create policy "Usuario puede marcar sus notificaciones"
  on public.notifications
  for update
  to authenticated
  using (lower(recipient_email) = lower((select auth.jwt()) ->> 'email'))
  with check (lower(recipient_email) = lower((select auth.jwt()) ->> 'email'));

create policy "Usuarios autenticados pueden crear notificaciones"
  on public.notifications
  for insert
  to authenticated
  with check (
    lower(recipient_email) = lower((select auth.jwt()) ->> 'email')
    or (select public.is_super_admin_user())
  );
