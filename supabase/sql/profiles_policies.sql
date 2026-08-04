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

create policy "Usuarios autenticados leen perfiles"
  on public.profiles
  for select
  to authenticated
  using (true);

create policy "Usuario actualiza su perfil"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Super admin gestiona perfiles"
  on public.profiles
  for all
  to authenticated
  using (public.is_super_admin_user())
  with check (public.is_super_admin_user());
