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

grant execute on function public.normalize_report_code_prefix(text) to authenticated;
grant execute on function public.peek_next_report_code(text) to authenticated;
grant execute on function public.reserve_next_report_code(text) to authenticated;
