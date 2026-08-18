drop policy if exists "Usuario formularios vehiculos consulta referencia" on public.vehicle_reference_catalog;

create policy "Usuario formularios vehiculos consulta referencia"
  on public.vehicle_reference_catalog
  for select
  to authenticated
  using (
    active = true
    and (
      exists (
        select 1
        from public.profiles pr
        where pr.id = auth.uid()
          and pr.role in ('admin', 'tecnico', 'supervisor_operaciones', 'supervisor_proyecto', 'proveedor_vehiculos')
      )
      or exists (
        select 1
        from public.record_access_permissions p
        where p.grantee_user_id = auth.uid()
          and p.active = true
          and (p.can_view = true or p.can_edit = true or p.can_download = true)
          and (p.area = 'vehiculos' or p.area = 'todos')
          and p.tipo in ('todos', 'informe', 'inspeccion', 'mantenimiento')
      )
    )
  );
