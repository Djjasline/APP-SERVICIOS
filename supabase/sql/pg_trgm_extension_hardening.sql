create schema if not exists extensions;
grant usage on schema extensions to anon, authenticated;
alter extension pg_trgm set schema extensions;
