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

grant select, update on public.profiles to authenticated;

alter table public.profiles enable row level security;

drop policy if exists "Usuarios autenticados leen perfiles" on public.profiles;
drop policy if exists "Usuario actualiza su perfil" on public.profiles;
drop policy if exists "Super admin gestiona perfiles" on public.profiles;
drop policy if exists "Allow authenticated users to read profiles" on public.profiles;
drop policy if exists "Ver propio perfil" on public.profiles;
drop policy if exists "Editar propio perfil" on public.profiles;
drop policy if exists "Usuarios autorizados actualizan perfiles" on public.profiles;
drop policy if exists "Super admin crea perfiles" on public.profiles;
drop policy if exists "Super admin elimina perfiles" on public.profiles;

create policy "Usuarios autenticados leen perfiles"
  on public.profiles
  for select
  to authenticated
  using (true);

create policy "Usuarios autorizados actualizan perfiles"
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()) or (select public.is_super_admin_user()))
  with check (id = (select auth.uid()) or (select public.is_super_admin_user()));

create policy "Super admin crea perfiles"
  on public.profiles
  for insert
  to authenticated
  with check ((select public.is_super_admin_user()));

create policy "Super admin elimina perfiles"
  on public.profiles
  for delete
  to authenticated
  using ((select public.is_super_admin_user()));
