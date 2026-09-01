alter policy "select own or superadmin registros"
  on public.registros
  using (
    (select auth.uid()) = user_id
    or ((select auth.jwt()) ->> 'email') = 'smaviles@astap.com'
  );

alter policy "insert own registros"
  on public.registros
  with check ((select auth.uid()) = user_id);

alter policy "update own or superadmin registros"
  on public.registros
  using (
    (select auth.uid()) = user_id
    or ((select auth.jwt()) ->> 'email') = 'smaviles@astap.com'
  )
  with check (
    (select auth.uid()) = user_id
    or ((select auth.jwt()) ->> 'email') = 'smaviles@astap.com'
  );

alter policy "delete own or superadmin registros"
  on public.registros
  using (
    (select auth.uid()) = user_id
    or ((select auth.jwt()) ->> 'email') = 'smaviles@astap.com'
  );

alter policy "Supervisor operaciones puede ver registros"
  on public.registros
  using (
    ((select auth.jwt()) ->> 'email') = 'kamhez@astap.com'
    or ((select auth.jwt()) ->> 'email') = 'smaviles@astap.com'
    or user_id = (select auth.uid())
  );

alter policy "Supervisor proyecto puede ver informes vehiculos"
  on public.registros
  using (
    area = 'vehiculos'
    and tipo = 'informe'
    and exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'supervisor_proyecto'
    )
  );

alter policy "Usuario consulta sus registros"
  on public.registros
  using (
    user_id = (select auth.uid())
    or lower(coalesce((select auth.jwt()) ->> 'email', '')) = lower(coalesce(nullif(trim(data->>'tecnicoCorreo'), ''), nullif(trim(data->>'correoTecnico'), ''), ''))
  );

alter policy "Usuario crea sus registros"
  on public.registros
  with check (user_id = (select auth.uid()));

alter policy "Usuario edita sus registros"
  on public.registros
  using (
    user_id = (select auth.uid())
    or lower(coalesce((select auth.jwt()) ->> 'email', '')) = lower(coalesce(nullif(trim(data->>'tecnicoCorreo'), ''), nullif(trim(data->>'correoTecnico'), ''), ''))
  )
  with check (
    user_id = (select auth.uid())
    or lower(coalesce((select auth.jwt()) ->> 'email', '')) = lower(coalesce(nullif(trim(data->>'tecnicoCorreo'), ''), nullif(trim(data->>'correoTecnico'), ''), ''))
  );

alter policy "Usuario elimina sus registros"
  on public.registros
  using (user_id = (select auth.uid()));

alter policy "Usuario ve registros permitidos"
  on public.registros
  using (
    exists (
      select 1
      from public.record_access_permissions p
      where p.grantee_user_id = (select auth.uid())
        and (
          p.owner_user_id = registros.user_id
          or lower(trim(coalesce(p.owner_email, ''))) = lower(coalesce(nullif(trim(registros.data->>'tecnicoCorreo'), ''), nullif(trim(registros.data->>'correoTecnico'), ''), ''))
        )
        and p.active = true
        and (p.can_view = true or p.can_edit = true or p.can_download = true)
        and (p.area = 'todos' or p.area = coalesce(registros.area, 'vehiculos'))
        and (
          p.tipo = 'todos'
          or p.tipo = coalesce(registros.tipo, 'todos')
          or p.tipo = concat_ws(':', coalesce(registros.tipo, 'todos'), nullif(coalesce(registros.subtipo, ''), ''))
        )
    )
  );

alter policy "Usuario edita registros permitidos"
  on public.registros
  using (
    exists (
      select 1
      from public.record_access_permissions p
      where p.grantee_user_id = (select auth.uid())
        and (
          p.owner_user_id = registros.user_id
          or lower(trim(coalesce(p.owner_email, ''))) = lower(coalesce(nullif(trim(registros.data->>'tecnicoCorreo'), ''), nullif(trim(registros.data->>'correoTecnico'), ''), ''))
        )
        and p.active = true
        and p.can_edit = true
        and (p.area = 'todos' or p.area = coalesce(registros.area, 'vehiculos'))
        and (
          p.tipo = 'todos'
          or p.tipo = coalesce(registros.tipo, 'todos')
          or p.tipo = concat_ws(':', coalesce(registros.tipo, 'todos'), nullif(coalesce(registros.subtipo, ''), ''))
        )
    )
  )
  with check (
    exists (
      select 1
      from public.record_access_permissions p
      where p.grantee_user_id = (select auth.uid())
        and (
          p.owner_user_id = registros.user_id
          or lower(trim(coalesce(p.owner_email, ''))) = lower(coalesce(nullif(trim(registros.data->>'tecnicoCorreo'), ''), nullif(trim(registros.data->>'correoTecnico'), ''), ''))
        )
        and p.active = true
        and p.can_edit = true
        and (p.area = 'todos' or p.area = coalesce(registros.area, 'vehiculos'))
        and (
          p.tipo = 'todos'
          or p.tipo = coalesce(registros.tipo, 'todos')
          or p.tipo = concat_ws(':', coalesce(registros.tipo, 'todos'), nullif(coalesce(registros.subtipo, ''), ''))
        )
    )
  );
