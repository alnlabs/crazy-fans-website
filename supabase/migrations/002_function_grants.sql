-- The first migration revoked execute on is_admin, but row level security calls it
-- for every public read. Callers need execute; the function stays security definer.

grant execute on function public.is_admin() to anon, authenticated, service_role;
grant execute on function public.protect_profile() to authenticated, service_role;
grant execute on function public.touch_vote() to authenticated, service_role;
grant execute on function public.handle_new_user() to supabase_auth_admin, service_role;
