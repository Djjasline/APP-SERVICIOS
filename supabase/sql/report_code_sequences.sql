create table if not exists public.report_code_sequences (
  prefix text primary key,
  last_number integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.report_code_sequences enable row level security;

drop policy if exists "report_code_sequences_select_authenticated" on public.report_code_sequences;
create policy "report_code_sequences_select_authenticated"
on public.report_code_sequences
for select
to authenticated
using (true);

create or replace function public.normalize_report_code_prefix(input_code text)
returns text
language plpgsql
stable
as $$
declare
  normalized text;
begin
  normalized := regexp_replace(coalesce(input_code, ''), '\s+', '', 'g');
  normalized := regexp_replace(btrim(normalized), '-+$', '');
  normalized := regexp_replace(normalized, '-[0-9]{3,}$', '');

  if normalized = '' then
    return null;
  end if;

  return normalized;
end;
$$;

create or replace function public.get_existing_report_code_last_number(normalized_prefix text)
returns integer
language sql
stable
as $$
  select coalesce(max(suffix::integer), 0)
  from (
    select substring(regexp_replace(data->>'codInf', '\s+', '', 'g') from char_length(normalized_prefix) + 2) as suffix
    from public.registros
    where data ? 'codInf'
      and left(regexp_replace(data->>'codInf', '\s+', '', 'g'), char_length(normalized_prefix) + 1) = normalized_prefix || '-'
  ) codes
  where suffix ~ '^[0-9]{3,}$';
$$;

create or replace function public.peek_next_report_code(input_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_prefix text;
  current_last integer;
begin
  normalized_prefix := public.normalize_report_code_prefix(input_code);

  if normalized_prefix is null or char_length(normalized_prefix) < 5 then
    return null;
  end if;

  select greatest(
    coalesce((select last_number from public.report_code_sequences where prefix = normalized_prefix), 0),
    public.get_existing_report_code_last_number(normalized_prefix)
  ) into current_last;

  return normalized_prefix || '-' || lpad((current_last + 1)::text, 3, '0');
end;
$$;

create or replace function public.reserve_next_report_code(input_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_prefix text;
  current_last integer;
  next_number integer;
begin
  normalized_prefix := public.normalize_report_code_prefix(input_code);

  if normalized_prefix is null or char_length(normalized_prefix) < 5 then
    return input_code;
  end if;

  perform pg_advisory_xact_lock(hashtext(normalized_prefix));

  select greatest(
    coalesce((select last_number from public.report_code_sequences where prefix = normalized_prefix), 0),
    public.get_existing_report_code_last_number(normalized_prefix)
  ) into current_last;

  next_number := current_last + 1;

  insert into public.report_code_sequences(prefix, last_number, updated_at)
  values (normalized_prefix, next_number, now())
  on conflict (prefix) do update
  set last_number = excluded.last_number,
      updated_at = now();

  return normalized_prefix || '-' || lpad(next_number::text, 3, '0');
end;
$$;

create or replace function public.is_report_sequence_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(auth.email(), '')) = 'smaviles@astap.com';
$$;

create or replace function public.list_report_code_sequences()
returns table(prefix text, last_number integer, updated_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_report_sequence_admin() then
    raise exception 'No autorizado para ver secuencias de informes';
  end if;

  return query
  select s.prefix, s.last_number, s.updated_at
  from public.report_code_sequences s
  order by s.prefix asc;
end;
$$;

create or replace function public.update_report_code_sequence(input_prefix text, input_last_number integer)
returns public.report_code_sequences
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_prefix text;
  saved public.report_code_sequences;
begin
  if not public.is_report_sequence_admin() then
    raise exception 'No autorizado para editar secuencias de informes';
  end if;

  normalized_prefix := public.normalize_report_code_prefix(input_prefix);

  if normalized_prefix is null or char_length(normalized_prefix) < 5 then
    raise exception 'Prefijo inválido';
  end if;

  if input_last_number is null or input_last_number < 0 then
    raise exception 'El último número debe ser mayor o igual a cero';
  end if;

  insert into public.report_code_sequences(prefix, last_number, updated_at)
  values (normalized_prefix, input_last_number, now())
  on conflict (prefix) do update
  set last_number = excluded.last_number,
      updated_at = now()
  returning * into saved;

  return saved;
end;
$$;

grant execute on function public.normalize_report_code_prefix(text) to authenticated;
grant execute on function public.peek_next_report_code(text) to authenticated;
grant execute on function public.reserve_next_report_code(text) to authenticated;
grant execute on function public.is_report_sequence_admin() to authenticated;
grant execute on function public.list_report_code_sequences() to authenticated;
grant execute on function public.update_report_code_sequence(text, integer) to authenticated;
