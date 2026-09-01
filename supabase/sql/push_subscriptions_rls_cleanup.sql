drop policy if exists "Usuario puede ver su suscripcion" on public.push_subscriptions;
drop policy if exists "Usuario puede insertar su suscripcion" on public.push_subscriptions;
drop policy if exists "Usuario puede actualizar su suscripcion" on public.push_subscriptions;
drop policy if exists "Usuario puede eliminar su suscripcion" on public.push_subscriptions;
drop policy if exists "Super Admin puede ver todas las suscripciones" on public.push_subscriptions;
drop policy if exists "Users can view own subscriptions" on public.push_subscriptions;
drop policy if exists "Users can insert own subscriptions" on public.push_subscriptions;
drop policy if exists "Users can update own subscriptions" on public.push_subscriptions;
drop policy if exists "Users can delete own subscriptions" on public.push_subscriptions;
drop policy if exists "Usuarios autorizados ven suscripciones" on public.push_subscriptions;

create policy "Usuarios autorizados ven suscripciones"
  on public.push_subscriptions
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1
      from public.profiles
      where id = (select auth.uid())
        and role = 'super_admin'
    )
  );

create policy "Usuario puede insertar su suscripcion"
  on public.push_subscriptions
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "Usuario puede actualizar su suscripcion"
  on public.push_subscriptions
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Usuario puede eliminar su suscripcion"
  on public.push_subscriptions
  for delete
  to authenticated
  using (user_id = (select auth.uid()));
