drop policy if exists "Super admin gestiona destinatarios de notificaciones" on public.notification_recipient_rules;
drop policy if exists "Usuarios autenticados leen destinatarios activos" on public.notification_recipient_rules;
drop policy if exists "Super admin crea destinatarios de notificaciones" on public.notification_recipient_rules;
drop policy if exists "Super admin actualiza destinatarios de notificaciones" on public.notification_recipient_rules;
drop policy if exists "Super admin elimina destinatarios de notificaciones" on public.notification_recipient_rules;

create policy "Usuarios autenticados leen destinatarios activos"
  on public.notification_recipient_rules
  for select
  to authenticated
  using (active = true or (select private.is_super_admin_user()));

create policy "Super admin crea destinatarios de notificaciones"
  on public.notification_recipient_rules
  for insert
  to authenticated
  with check ((select private.is_super_admin_user()));

create policy "Super admin actualiza destinatarios de notificaciones"
  on public.notification_recipient_rules
  for update
  to authenticated
  using ((select private.is_super_admin_user()))
  with check ((select private.is_super_admin_user()));

create policy "Super admin elimina destinatarios de notificaciones"
  on public.notification_recipient_rules
  for delete
  to authenticated
  using ((select private.is_super_admin_user()));
