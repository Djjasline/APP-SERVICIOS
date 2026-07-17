create extension if not exists pgcrypto;

create table if not exists public.customer_satisfaction_surveys (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default gen_random_uuid()::text,
  record_id uuid not null references public.registros(id) on delete cascade,
  area text not null,
  tipo text not null,
  subtipo text,
  report_code text,
  client_name text,
  technician_name text,
  service_date timestamptz,
  status text not null default 'pendiente' check (status in ('pendiente', 'enviada', 'respondida', 'revisada', 'requiere_seguimiento')),
  respondent jsonb not null default '{}'::jsonb,
  ratings jsonb not null default '{}'::jsonb,
  answers jsonb not null default '{}'::jsonb,
  comments text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint customer_satisfaction_surveys_record_unique unique (record_id)
);

create index if not exists customer_satisfaction_surveys_record_idx
  on public.customer_satisfaction_surveys(record_id);

create index if not exists customer_satisfaction_surveys_status_idx
  on public.customer_satisfaction_surveys(status, created_at desc);

alter table public.customer_satisfaction_surveys enable row level security;

drop policy if exists "Usuarios autenticados gestionan encuestas" on public.customer_satisfaction_surveys;
drop policy if exists "Anonimo no accede directo a encuestas" on public.customer_satisfaction_surveys;

create policy "Usuarios autenticados gestionan encuestas"
  on public.customer_satisfaction_surveys
  for all
  to authenticated
  using (true)
  with check (true);

revoke all on public.customer_satisfaction_surveys from anon;
grant select, insert, update, delete on public.customer_satisfaction_surveys to authenticated;

create or replace function public.get_customer_satisfaction_survey_by_token(p_token text)
returns table (
  id uuid,
  area text,
  tipo text,
  subtipo text,
  report_code text,
  client_name text,
  technician_name text,
  service_date timestamptz,
  status text,
  responded_at timestamptz,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    s.id,
    s.area,
    s.tipo,
    s.subtipo,
    s.report_code,
    s.client_name,
    s.technician_name,
    s.service_date,
    s.status,
    s.responded_at,
    s.created_at
  from public.customer_satisfaction_surveys s
  where s.token = p_token
  limit 1;
$$;

create or replace function public.submit_customer_satisfaction_survey(
  p_token text,
  p_respondent jsonb,
  p_ratings jsonb,
  p_answers jsonb,
  p_comments text
)
returns table (
  status text,
  responded_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.customer_satisfaction_surveys
  set
    respondent = coalesce(p_respondent, '{}'::jsonb),
    ratings = coalesce(p_ratings, '{}'::jsonb),
    answers = coalesce(p_answers, '{}'::jsonb),
    comments = nullif(trim(coalesce(p_comments, '')), ''),
    status = 'respondida',
    responded_at = now(),
    updated_at = now()
  where token = p_token
    and status <> 'respondida';

  return query
  select s.status, s.responded_at
  from public.customer_satisfaction_surveys s
  where s.token = p_token
  limit 1;
end;
$$;

grant execute on function public.get_customer_satisfaction_survey_by_token(text) to anon, authenticated;
grant execute on function public.submit_customer_satisfaction_survey(text, jsonb, jsonb, jsonb, text) to anon, authenticated;
