-- Only the designated account is an administrator. This migration does not
-- change existing profile rows or other permissions.
begin;

create or replace function private.is_super_admin_user()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select lower(trim(coalesce(auth.jwt() ->> 'email', ''))) = 'smaviles@astap.com';
$$;

create or replace function private.protect_profile_admin_role()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  if tg_op = 'UPDATE'
     and new.role is distinct from old.role
     and auth.uid() is not null
     and lower(trim(coalesce(auth.jwt() ->> 'email', ''))) <> 'smaviles@astap.com' then
    raise exception 'Solo la cuenta administradora puede cambiar roles.'
      using errcode = '42501';
  end if;

  if lower(trim(coalesce(new.role, ''))) in ('admin', 'super_admin')
     and not exists (
       select 1 from auth.users u
       where u.id = new.id
         and lower(trim(coalesce(u.email, ''))) = 'smaviles@astap.com'
     ) then
    raise exception 'El rol administrativo está reservado a la cuenta autorizada.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function private.protect_profile_admin_role() from public, anon, authenticated;

drop trigger if exists protect_profile_admin_role on public.profiles;
create trigger protect_profile_admin_role
before insert or update on public.profiles
for each row execute function private.protect_profile_admin_role();

-- Exercise the trigger against temporary rows only; no real profile is edited.
create temporary table audit_profile_role_check (
  id uuid primary key,
  role text,
  full_name text
) on commit drop;
create trigger audit_profile_role_check
before insert or update on audit_profile_role_check
for each row execute function private.protect_profile_admin_role();

do $$
declare
  test_user constant uuid := '00000000-0000-4000-8000-000000000001';
  admin_user uuid;
  rejected boolean;
begin
  select id into strict admin_user from auth.users
    where lower(trim(email)) = 'smaviles@astap.com';

  perform set_config('request.jwt.claims',
    json_build_object('sub', test_user, 'role', 'authenticated', 'email', 'auditoria@example.invalid')::text, true);
  insert into audit_profile_role_check values (test_user, 'tecnico', 'Inicial');
  update audit_profile_role_check set full_name = 'Actualizado' where id = test_user;
  rejected := false;
  begin
    update audit_profile_role_check set role = 'super_admin' where id = test_user;
  exception when insufficient_privilege then
    rejected := true;
  end;
  if not rejected then raise exception 'Prueba fallida: cambio de rol propio permitido'; end if;
  if private.is_super_admin_user() then raise exception 'Prueba fallida: administrador incorrecto'; end if;

  perform set_config('request.jwt.claims',
    json_build_object('sub', admin_user, 'role', 'authenticated', 'email', 'smaviles@astap.com')::text, true);
  if not private.is_super_admin_user() then raise exception 'Prueba fallida: falta acceso administrador'; end if;
  update audit_profile_role_check set role = 'supervisor_proyecto' where id = test_user;
  rejected := false;
  begin
    update audit_profile_role_check set role = 'admin' where id = test_user;
  exception when insufficient_privilege then
    rejected := true;
  end;
  if not rejected then raise exception 'Prueba fallida: administrador adicional permitido'; end if;
  insert into audit_profile_role_check values (admin_user, 'super_admin', 'Cuenta autorizada');
end;
$$;

commit;
