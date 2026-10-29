-- Crazy Fans community schema and row level security.
-- Apply in the Supabase SQL editor before any public write UI uses these tables.
-- The Next.js beta currently stores data locally. These policies are the production contract:
-- the app must use the signed-in user's JWT, never the service-role key in the browser.

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name text not null check (char_length(display_name) between 2 and 40),
  bio text not null default '' check (char_length(bio) <= 280),
  avatar_color text not null default '#c43228',
  industries text[] not null default '{}',
  role text not null default 'member' check (role in ('member', 'admin')),
  status text not null default 'active' check (status in ('active', 'suspended')),
  notify_replies boolean not null default true,
  notify_challenges boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.discussions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  slug text not null unique,
  title text not null check (char_length(title) between 8 and 120),
  body text not null check (char_length(body) between 20 and 4000),
  industry text not null,
  category text not null,
  status text not null default 'visible' check (status in ('visible', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.battles (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  slug text not null unique,
  title text not null check (char_length(title) between 8 and 120),
  prompt text not null check (char_length(prompt) between 20 and 500),
  industry text not null,
  category text not null,
  featured boolean not null default false,
  status text not null default 'visible' check (status in ('visible', 'removed')),
  created_at timestamptz not null default now(),
  closes_at timestamptz
);

create table public.battle_options (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.battles (id) on delete cascade,
  label text not null check (char_length(label) between 2 and 80),
  position integer not null check (position between 0 and 3),
  unique (battle_id, position)
);

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.battles (id) on delete cascade,
  option_id uuid not null references public.battle_options (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (battle_id, user_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  discussion_id uuid references public.discussions (id) on delete cascade,
  battle_id uuid references public.battles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  status text not null default 'visible' check (status in ('visible', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comments_one_parent check (
    (discussion_id is not null and battle_id is null)
    or (discussion_id is null and battle_id is not null)
  )
);

create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('discussion', 'comment', 'battle')),
  target_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('discussion', 'comment', 'battle', 'profile')),
  target_id uuid not null,
  reason text not null check (reason in ('harassment', 'hate', 'spam', 'impersonation', 'copyright', 'other')),
  details text not null default '' check (char_length(details) <= 1000),
  status text not null default 'open' check (status in ('open', 'dismissed', 'actioned')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  moderator_id uuid not null references public.profiles (id),
  report_id uuid references public.reports (id),
  action text not null,
  note text not null default '',
  target_type text not null,
  target_id uuid not null,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null default 'reply',
  target_type text not null check (target_type in ('discussion', 'battle')),
  target_slug text not null,
  excerpt text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  type text not null,
  created_at timestamptz not null default now()
);

create index discussions_feed_idx on public.discussions (status, created_at desc);
create index comments_discussion_idx on public.comments (discussion_id);
create index comments_battle_idx on public.comments (battle_id);
create index votes_battle_idx on public.votes (battle_id);
create index reports_status_idx on public.reports (status, created_at desc);
create index notifications_user_idx on public.notifications (user_id, read);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and status = 'active'
  );
$$;

revoke all on function public.is_admin() from public, anon, authenticated;

create or replace function public.protect_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if not public.is_admin() then
      new.role := 'member';
      new.status := 'active';
    end if;
    return new;
  end if;
  new.id := old.id;
  if not public.is_admin() then
    new.role := old.role;
    new.status := old.status;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_protect
before insert or update on public.profiles
for each row execute function public.protect_profile();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  desired text;
  display text;
begin
  desired := lower(coalesce(new.raw_user_meta_data->>'username', ''));
  if desired !~ '^[a-z0-9_]{3,20}$' or desired in ('admin', 'administrator', 'moderator', 'support', 'crazyfans', 'null', 'undefined', 'system') then
    desired := 'fan_' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;
  while exists (select 1 from public.profiles where username = desired) loop
    desired := 'fan_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
  end loop;
  display := left(btrim(coalesce(
    nullif(new.raw_user_meta_data->>'display_name', ''),
    nullif(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'name', ''),
    'Fan'
  )), 40);
  if char_length(display) < 2 then
    display := 'Fan';
  end if;
  insert into public.profiles (id, username, display_name)
  values (new.id, desired, display);
  insert into public.analytics_events (user_id, type) values (new.id, 'signup');
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.touch_vote()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.id := old.id;
  new.user_id := old.user_id;
  new.battle_id := old.battle_id;
  new.created_at := old.created_at;
  new.updated_at := now();
  return new;
end;
$$;

create trigger votes_touch
before update on public.votes
for each row execute function public.touch_vote();

alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.discussions enable row level security;
alter table public.discussions force row level security;
alter table public.battles enable row level security;
alter table public.battles force row level security;
alter table public.battle_options enable row level security;
alter table public.battle_options force row level security;
alter table public.votes enable row level security;
alter table public.votes force row level security;
alter table public.comments enable row level security;
alter table public.comments force row level security;
alter table public.reactions enable row level security;
alter table public.reactions force row level security;
alter table public.reports enable row level security;
alter table public.reports force row level security;
alter table public.moderation_actions enable row level security;
alter table public.moderation_actions force row level security;
alter table public.notifications enable row level security;
alter table public.notifications force row level security;
alter table public.blocks enable row level security;
alter table public.blocks force row level security;
alter table public.analytics_events enable row level security;
alter table public.analytics_events force row level security;

create policy profiles_select on public.profiles
for select to anon, authenticated
using (true);

create policy profiles_insert_own on public.profiles
for insert to authenticated
with check (id = auth.uid());

create policy profiles_update_own on public.profiles
for update to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy discussions_select on public.discussions
for select to anon, authenticated
using (status = 'visible' or author_id = auth.uid() or public.is_admin());

create policy discussions_insert on public.discussions
for insert to authenticated
with check (
  author_id = auth.uid()
  and status = 'visible'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.status = 'active')
);

create policy discussions_update on public.discussions
for update to authenticated
using (author_id = auth.uid() or public.is_admin())
with check (author_id = auth.uid() or public.is_admin());

create policy battles_select on public.battles
for select to anon, authenticated
using (status = 'visible' or author_id = auth.uid() or public.is_admin());

create policy battles_insert on public.battles
for insert to authenticated
with check (
  author_id = auth.uid()
  and status = 'visible'
  and featured = false
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.status = 'active')
);

create policy battles_update on public.battles
for update to authenticated
using (author_id = auth.uid() or public.is_admin())
with check (author_id = auth.uid() or public.is_admin());

create policy options_select on public.battle_options
for select to anon, authenticated
using (
  exists (
    select 1 from public.battles b
    where b.id = battle_id
      and (b.status = 'visible' or b.author_id = auth.uid() or public.is_admin())
  )
);

create policy options_insert on public.battle_options
for insert to authenticated
with check (
  exists (
    select 1 from public.battles b
    where b.id = battle_id and b.author_id = auth.uid() and b.status = 'visible'
  )
);

create policy votes_select on public.votes
for select to anon, authenticated
using (true);

create policy votes_insert on public.votes
for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.status = 'active')
  and exists (
    select 1 from public.battles b
    where b.id = battle_id
      and b.status = 'visible'
      and (b.closes_at is null or b.closes_at > now())
  )
  and exists (
    select 1 from public.battle_options o
    where o.id = option_id and o.battle_id = votes.battle_id
  )
);

create policy votes_update_own on public.votes
for update to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.battle_options o
    where o.id = option_id and o.battle_id = votes.battle_id
  )
);

create policy comments_select on public.comments
for select to anon, authenticated
using (status = 'visible' or author_id = auth.uid() or public.is_admin());

create policy comments_insert on public.comments
for insert to authenticated
with check (
  author_id = auth.uid()
  and status = 'visible'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.status = 'active')
);

create policy comments_update on public.comments
for update to authenticated
using (author_id = auth.uid() or public.is_admin())
with check (author_id = auth.uid() or public.is_admin());

create policy reactions_select on public.reactions
for select to anon, authenticated
using (true);

create policy reactions_insert on public.reactions
for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.status = 'active')
);

create policy reactions_delete_own on public.reactions
for delete to authenticated
using (user_id = auth.uid());

create policy reports_select on public.reports
for select to authenticated
using (reporter_id = auth.uid() or public.is_admin());

create policy reports_insert on public.reports
for insert to authenticated
with check (
  reporter_id = auth.uid()
  and status = 'open'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.status = 'active')
);

create policy reports_update_admin on public.reports
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy moderation_admin on public.moderation_actions
for all to authenticated
using (public.is_admin())
with check (public.is_admin() and moderator_id = auth.uid());

create policy notifications_insert on public.notifications
for insert to authenticated
with check (actor_id = auth.uid());

create policy notifications_select on public.notifications
for select to authenticated
using (user_id = auth.uid());

create policy notifications_update on public.notifications
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy blocks_select on public.blocks
for select to authenticated
using (blocker_id = auth.uid());

create policy blocks_insert on public.blocks
for insert to authenticated
with check (blocker_id = auth.uid());

create policy blocks_delete on public.blocks
for delete to authenticated
using (blocker_id = auth.uid());

create policy analytics_admin_select on public.analytics_events
for select to authenticated
using (public.is_admin());

-- Members cannot insert analytics rows directly. track_events records the
-- signed-in member. Signup is recorded by handle_new_user.

create or replace function public.track_events(event_types text[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  event_type text;
begin
  if auth.uid() is null then
    return;
  end if;
  foreach event_type in array event_types loop
    if event_type in ('login', 'active', 'vote', 'comment', 'discussion', 'battle', 'reaction', 'report') then
      insert into public.analytics_events (user_id, type) values (auth.uid(), event_type);
    end if;
  end loop;
end;
$$;

revoke all on function public.track_events(text[]) from public, anon;
grant execute on function public.track_events(text[]) to authenticated;

create table public.rate_buckets (
  key text primary key,
  hits jsonb not null default '[]'::jsonb
);

alter table public.rate_buckets enable row level security;
alter table public.rate_buckets force row level security;

create or replace function public.load_rate_buckets()
returns table (key text, hits jsonb)
language sql
security definer
set search_path = public
as $$
  select rate_buckets.key, rate_buckets.hits from public.rate_buckets;
$$;

create or replace function public.save_rate_buckets(buckets jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
begin
  if auth.uid() is null or buckets is null then
    return;
  end if;
  for item in select value from jsonb_array_elements(buckets) loop
    insert into public.rate_buckets (key, hits)
    values (item->>'key', coalesce(item->'hits', '[]'::jsonb))
    on conflict (key) do update set hits = excluded.hits;
  end loop;
end;
$$;

revoke all on function public.load_rate_buckets() from public, anon;
revoke all on function public.save_rate_buckets(jsonb) from public, anon;
grant execute on function public.load_rate_buckets() to authenticated;
grant execute on function public.save_rate_buckets(jsonb) to authenticated;

create or replace function public.admin_profile_emails()
returns table (id uuid, email text)
language sql
security definer
set search_path = public, auth
as $$
  select profiles.id, users.email::text
  from public.profiles
  join auth.users on users.id = profiles.id
  where public.is_admin();
$$;

revoke all on function public.admin_profile_emails() from public, anon;
grant execute on function public.admin_profile_emails() to authenticated;
