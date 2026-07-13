create table if not exists public.notification_recipient_rules (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  recipient_email text,
  recipient_name text,
  area text not null default 'todos',
  tipo text not null default 'todos',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (recipient_user_id, area, tipo)
);

create index if not exists notification_recipient_rules_scope_idx
  on public.notification_recipient_rules(area, tipo, active);

create index if not exists notification_recipient_rules_user_idx
  on public.notification_recipient_rules(recipient_user_id, active);

alter table public.notification_recipient_rules enable row level security;

grant select, insert, update, delete on public.notification_recipient_rules to authenticated;

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

drop policy if exists "Super admin gestiona destinatarios de notificaciones" on public.notification_recipient_rules;
drop policy if exists "Usuarios autenticados leen destinatarios activos" on public.notification_recipient_rules;

create policy "Super admin gestiona destinatarios de notificaciones"
  on public.notification_recipient_rules
  for all
  using (public.is_super_admin_user())
  with check (public.is_super_admin_user());

create policy "Usuarios autenticados leen destinatarios activos"
  on public.notification_recipient_rules
  for select
  using (active = true or public.is_super_admin_user());

update public.notification_recipient_rules r
set recipient_email = coalesce(nullif(r.recipient_email, ''), p.email),
    recipient_name = coalesce(nullif(r.recipient_name, ''), p.full_name),
    updated_at = now()
from public.profiles p
where p.id = r.recipient_user_id
  and (r.recipient_email is null or r.recipient_email = '' or r.recipient_name is null or r.recipient_name = '');

-- Destinatarios iniciales equivalentes a la configuración anterior.
-- Se insertan solo si los usuarios existen en public.profiles.
insert into public.notification_recipient_rules (recipient_user_id, recipient_email, recipient_name, area, tipo, active)
select id, email, full_name, 'vehiculos', 'todos', true
from public.profiles
where lower(email) = 'abriones@astap.com'
on conflict (recipient_user_id, area, tipo) do update
set recipient_email = excluded.recipient_email,
    recipient_name = excluded.recipient_name,
    active = true,
    updated_at = now();

insert into public.notification_recipient_rules (recipient_user_id, recipient_email, recipient_name, area, tipo, active)
select id, email, full_name, 'operaciones', 'todos', true
from public.profiles
where lower(email) = 'kamhez@astap.com'
on conflict (recipient_user_id, area, tipo) do update
set recipient_email = excluded.recipient_email,
    recipient_name = excluded.recipient_name,
    active = true,
    updated_at = now();
