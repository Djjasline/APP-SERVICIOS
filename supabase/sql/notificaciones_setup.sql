create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.push_subscriptions
  drop constraint if exists push_subscriptions_user_id_key;

alter table public.push_subscriptions
  drop constraint if exists push_subscriptions_user_id_unique;

drop index if exists public.push_subscriptions_user_id_unique;

create unique index if not exists push_subscriptions_endpoint_key
  on public.push_subscriptions(endpoint);

create index if not exists push_subscriptions_user_id_idx
  on public.push_subscriptions(user_id);

grant select, insert, update, delete on public.push_subscriptions to authenticated;

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

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_email text not null,
  title text,
  message text,
  record_type text,
  record_id text,
  read boolean default false,
  created_at timestamptz default now()
);

create index if not exists notifications_recipient_read_idx
  on public.notifications(lower(recipient_email), read, created_at desc);

grant select, insert, update on public.notifications to authenticated;

alter table public.notifications enable row level security;

drop policy if exists "Usuario puede ver sus notificaciones" on public.notifications;
drop policy if exists "Usuario puede marcar sus notificaciones" on public.notifications;
drop policy if exists "Usuarios autenticados pueden crear notificaciones" on public.notifications;
drop policy if exists "Super Admin puede ver todas las notificaciones" on public.notifications;

create policy "Usuario puede ver sus notificaciones"
  on public.notifications for select
  using (lower(recipient_email) = lower(auth.jwt() ->> 'email'));

create policy "Usuario puede marcar sus notificaciones"
  on public.notifications for update
  using (lower(recipient_email) = lower(auth.jwt() ->> 'email'))
  with check (lower(recipient_email) = lower(auth.jwt() ->> 'email'));

create policy "Usuarios autenticados pueden crear notificaciones"
  on public.notifications for insert
  to authenticated
  with check (auth.uid() is not null);

create policy "Super Admin puede ver todas las notificaciones"
  on public.notifications for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'super_admin'
    )
  );
