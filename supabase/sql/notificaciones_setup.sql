create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint push_subscriptions_user_id_key unique (user_id)
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "Usuario puede ver su suscripcion" on public.push_subscriptions;
drop policy if exists "Usuario puede insertar su suscripcion" on public.push_subscriptions;
drop policy if exists "Usuario puede actualizar su suscripcion" on public.push_subscriptions;
drop policy if exists "Usuario puede eliminar su suscripcion" on public.push_subscriptions;
drop policy if exists "Super Admin puede ver todas las suscripciones" on public.push_subscriptions;

create policy "Usuario puede ver su suscripcion"
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

create policy "Usuario puede insertar su suscripcion"
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Usuario puede actualizar su suscripcion"
  on public.push_subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Usuario puede eliminar su suscripcion"
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);

create policy "Super Admin puede ver todas las suscripciones"
  on public.push_subscriptions for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'super_admin'
    )
  );
