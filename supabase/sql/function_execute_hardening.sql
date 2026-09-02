create schema if not exists private;
grant usage on schema private to authenticated;

revoke execute on function private.can_manage_customer_satisfaction_survey(uuid) from public, anon;
revoke execute on function public.get_customer_satisfaction_survey_by_token(text) from public;
revoke execute on function public.submit_customer_satisfaction_survey(text, jsonb, jsonb, jsonb, text) from public;

revoke execute on function public.get_or_create_direct_conversation(uuid) from public, anon;
revoke execute on function private.is_chat_participant(uuid) from public, anon;

revoke execute on function public.is_report_sequence_admin() from public, anon;
revoke execute on function public.list_report_code_sequences() from public, anon;
revoke execute on function public.peek_next_report_code(text) from public, anon;
revoke execute on function public.reserve_next_report_code(text) from public, anon;
revoke execute on function public.update_existing_report_code(text, text) from public, anon;
revoke execute on function public.update_report_code_sequence(text, integer) from public, anon;

revoke execute on function public.register_warehouse_item_movement(text, uuid, text, numeric, numeric, text, text, text, text, text, text, text, text, text) from public, anon;

revoke execute on function private.is_super_admin_user() from public, anon;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

grant execute on function private.can_manage_customer_satisfaction_survey(uuid) to authenticated;
grant execute on function public.get_customer_satisfaction_survey_by_token(text) to anon, authenticated;
grant execute on function public.submit_customer_satisfaction_survey(text, jsonb, jsonb, jsonb, text) to anon, authenticated;

grant execute on function public.get_or_create_direct_conversation(uuid) to authenticated;
grant execute on function private.is_chat_participant(uuid) to authenticated;

grant execute on function public.is_report_sequence_admin() to authenticated;
grant execute on function public.list_report_code_sequences() to authenticated;
grant execute on function public.peek_next_report_code(text) to authenticated;
grant execute on function public.reserve_next_report_code(text) to authenticated;
grant execute on function public.update_existing_report_code(text, text) to authenticated;
grant execute on function public.update_report_code_sequence(text, integer) to authenticated;

grant execute on function public.register_warehouse_item_movement(text, uuid, text, numeric, numeric, text, text, text, text, text, text, text, text, text) to authenticated;
grant execute on function private.is_super_admin_user() to authenticated;

drop function if exists public.can_manage_customer_satisfaction_survey(uuid);
drop function if exists public.is_chat_participant(uuid);
drop function if exists public.is_super_admin_user();
