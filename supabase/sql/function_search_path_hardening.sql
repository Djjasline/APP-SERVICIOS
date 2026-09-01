do $$
begin
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'handle_new_user'
      and pg_get_function_identity_arguments(p.oid) = ''
  ) then
    alter function public.handle_new_user() set search_path = public;
  end if;
end;
$$;
