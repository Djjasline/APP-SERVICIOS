-- Chat interno ASTAP
-- Ejecutar en Supabase SQL Editor.

create schema if not exists private;
grant usage on schema private to authenticated;

create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'direct' check (type in ('direct', 'group')),
  title text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_participants (
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  primary key (conversation_id, user_id)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (length(trim(body)) > 0),
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);

alter table public.chat_messages
  add column if not exists attachments jsonb not null default '[]'::jsonb;

create index if not exists chat_participants_user_id_idx
on public.chat_participants(user_id);

create index if not exists chat_messages_conversation_created_idx
on public.chat_messages(conversation_id, created_at);

alter table public.chat_conversations enable row level security;
alter table public.chat_participants enable row level security;
alter table public.chat_messages enable row level security;

create or replace function private.is_chat_participant(conv_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.chat_participants cp
    where cp.conversation_id = conv_id
      and cp.user_id = auth.uid()
  );
$$;

revoke execute on function private.is_chat_participant(uuid) from public, anon;
grant execute on function private.is_chat_participant(uuid) to authenticated;

create or replace function private.get_or_create_direct_conversation(other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  conv_id uuid;
begin
  if current_user_id is null then
    raise exception 'No autorizado';
  end if;

  if other_user_id is null or other_user_id = current_user_id then
    raise exception 'Usuario destino inválido';
  end if;

  select c.id into conv_id
  from public.chat_conversations c
  join public.chat_participants p1 on p1.conversation_id = c.id and p1.user_id = current_user_id
  join public.chat_participants p2 on p2.conversation_id = c.id and p2.user_id = other_user_id
  where c.type = 'direct'
  limit 1;

  if conv_id is null then
    insert into public.chat_conversations(type, created_by)
    values ('direct', current_user_id)
    returning id into conv_id;

    insert into public.chat_participants(conversation_id, user_id)
    values (conv_id, current_user_id), (conv_id, other_user_id);
  end if;

  return conv_id;
end;
$$;

create or replace function public.get_or_create_direct_conversation(other_user_id uuid)
returns uuid
language sql
security invoker
set search_path = public
as $$
  select private.get_or_create_direct_conversation(other_user_id);
$$;

revoke execute on function public.get_or_create_direct_conversation(uuid) from public, anon;
revoke execute on function private.get_or_create_direct_conversation(uuid) from public, anon;
grant execute on function public.get_or_create_direct_conversation(uuid) to authenticated;
grant execute on function private.get_or_create_direct_conversation(uuid) to authenticated;

drop policy if exists "chat_conversations_select_participants" on public.chat_conversations;
drop policy if exists "chat_conversations_insert_auth" on public.chat_conversations;
drop policy if exists "chat_participants_select_own_conversations" on public.chat_participants;
drop policy if exists "chat_participants_update_own" on public.chat_participants;
drop policy if exists "chat_messages_select_participants" on public.chat_messages;
drop policy if exists "chat_messages_insert_participants" on public.chat_messages;

create policy "chat_conversations_select_participants"
on public.chat_conversations
for select
to authenticated
using (private.is_chat_participant(id));

create policy "chat_conversations_insert_auth"
on public.chat_conversations
for insert
to authenticated
with check (created_by = (select auth.uid()));

create policy "chat_participants_select_own_conversations"
on public.chat_participants
for select
to authenticated
using (private.is_chat_participant(conversation_id));

create policy "chat_participants_update_own"
on public.chat_participants
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "chat_messages_select_participants"
on public.chat_messages
for select
to authenticated
using (private.is_chat_participant(conversation_id));

create policy "chat_messages_insert_participants"
on public.chat_messages
for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and private.is_chat_participant(conversation_id)
);

drop function if exists public.is_chat_participant(uuid);

-- Realtime: después de ejecutar el SQL, activa Realtime para chat_messages desde:
-- Supabase > Database > Replication > activa public.chat_messages
