create extension if not exists pgcrypto;

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

create table if not exists public.warehouse_item_audit_logs (
  id uuid primary key default gen_random_uuid(),
  item_source text not null,
  item_id uuid not null,
  product_code text,
  field_name text not null,
  old_value text,
  new_value text,
  changed_by uuid references auth.users(id) on delete set null,
  changed_at timestamptz not null default now()
);

create index if not exists warehouse_item_audit_logs_item_idx
  on public.warehouse_item_audit_logs(item_source, item_id, changed_at desc);

grant select, insert on public.warehouse_item_audit_logs to authenticated;

alter table public.warehouse_item_audit_logs enable row level security;

drop policy if exists "Usuarios autorizados consultan auditoria de bodega" on public.warehouse_item_audit_logs;
drop policy if exists "Super admin registra auditoria de bodega" on public.warehouse_item_audit_logs;

create policy "Usuarios autorizados consultan auditoria de bodega"
  on public.warehouse_item_audit_logs
  for select
  to authenticated
  using (
    (select private.is_super_admin_user())
    or exists (
      select 1
      from public.record_access_permissions p
      where p.grantee_user_id = (select auth.uid())
        and p.active = true
        and p.can_view = true
        and (p.area = 'operaciones' or p.area = 'todos')
        and p.tipo = 'bodega'
    )
  );

create policy "Super admin registra auditoria de bodega"
  on public.warehouse_item_audit_logs
  for insert
  to authenticated
  with check ((select private.is_super_admin_user()));
