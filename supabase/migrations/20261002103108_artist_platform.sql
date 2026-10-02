-- One-time, atomic setup for the existing label project.
-- Existing demo records are preserved; inbox policies are updated below.
begin;
create schema label_private;
revoke all on schema label_private from public, anon;
grant usage on schema label_private to authenticated, service_role;

create table public.label_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (length(display_name) <= 120),
  legal_first_name text not null default '' check (length(legal_first_name) <= 100),
  legal_last_name text not null default '' check (length(legal_last_name) <= 100),
  spotify_id text not null default '' check (length(spotify_id) <= 100),
  apple_music_id text not null default '' check (length(apple_music_id) <= 100),
  created_at timestamptz not null default now()
);
create table public.label_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('artist','label_manager','admin')),
  primary key (user_id, role)
);
create table public.label_releases (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.label_profiles(id),
  title text not null default '' check (length(title) <= 200),
  version text not null default '' check (length(version) <= 120),
  release_type text not null default 'single' check (release_type in ('single','ep','album')),
  release_date date,
  genre text not null default '' check (length(genre) <= 100),
  notes text not null default '' check (length(notes) <= 4000),
  status text not null default 'draft' check (status in ('draft','submitted','under_review','changes_requested','approved','delivered')),
  revision integer not null default 1 check (revision > 0),
  artwork_path text,
  artwork_sha256 text check (artwork_sha256 is null or artwork_sha256 ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index label_releases_owner_updated_idx on public.label_releases(owner_id, updated_at desc);
create index label_releases_status_updated_idx on public.label_releases(status, updated_at desc);
create table public.label_release_artists (
  id uuid primary key default gen_random_uuid(), release_id uuid not null references public.label_releases(id) on delete cascade,
  position integer not null check (position between 1 and 20),
  name text not null check (length(name) <= 120), role text not null check (role in ('primary','featured')),
  spotify_id text not null default '' check (length(spotify_id) <= 100), apple_music_id text not null default '' check (length(apple_music_id) <= 100),
  unique(release_id, position)
);
create table public.label_tracks (
  id uuid primary key default gen_random_uuid(), release_id uuid not null references public.label_releases(id) on delete cascade,
  position integer not null check (position between 1 and 40), title text not null check (length(title) <= 200),
  version text not null default '' check (length(version) <= 120), explicit boolean not null default false,
  language text not null default '' check (length(language) <= 60), unique(release_id, position)
);
create table public.label_credits (
  id uuid primary key default gen_random_uuid(), track_id uuid not null references public.label_tracks(id) on delete cascade,
  position integer not null check (position between 1 and 50),
  first_name text not null check (length(first_name) <= 100), last_name text not null check (length(last_name) <= 100),
  role text not null check (role in ('composer','lyricist','producer','mixing_engineer','mastering_engineer','performer','remixer')),
  unique(track_id, position)
);
create table public.label_release_events (
  id uuid primary key default gen_random_uuid(), release_id uuid not null references public.label_releases(id) on delete cascade,
  actor_id uuid not null references auth.users(id), kind text not null,
  message text not null default '' check (length(message) <= 4000), created_at timestamptz not null default now()
);
create index label_events_release_created_idx on public.label_release_events(release_id, created_at desc);
create index label_events_actor_idx on public.label_release_events(actor_id);
create table public.label_notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  release_id uuid not null references public.label_releases(id) on delete cascade,
  message text not null, read_at timestamptz, created_at timestamptz not null default now()
);
create index label_notifications_user_created_idx on public.label_notifications(user_id, created_at desc);
create index label_notifications_release_idx on public.label_notifications(release_id);
create table label_private.rate_limits (
  user_id uuid not null references auth.users(id) on delete cascade, window_start timestamptz not null,
  count integer not null, primary key(user_id, window_start)
);
alter table label_private.rate_limits enable row level security;

create function label_private.actor_id() returns uuid language plpgsql stable security invoker set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null or coalesce((auth.jwt()->>'is_anonymous')::boolean, false) then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  return uid;
end $$;
create function label_private.is_staff() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.label_roles where user_id = label_private.actor_id() and role in ('admin','label_manager'));
$$;
create function label_private.can_read_release(rid uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.label_releases where id = rid and (owner_id = label_private.actor_id() or (status <> 'draft' and label_private.is_staff())));
$$;
create function label_private.throttle() returns void language plpgsql security definer set search_path = '' as $$
declare hits integer; uid uuid := label_private.actor_id(); bucket timestamptz := date_trunc('minute', now());
begin
  insert into label_private.rate_limits values(uid, bucket, 1)
  on conflict(user_id, window_start) do update set count = label_private.rate_limits.count + 1 returning count into hits;
  if hits > 60 then raise exception 'Rate limit reached' using errcode = '54000'; end if;
  delete from label_private.rate_limits where user_id = uid and window_start < bucket - interval '1 day';
end $$;

-- Only guarded private functions write release data. Public wrappers run as the caller.
create function label_private.ensure_profile() returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := label_private.actor_id();
begin
  insert into public.label_profiles(id) values(uid) on conflict do nothing;
  insert into public.label_roles(user_id, role) values(uid, 'artist') on conflict do nothing;
end $$;
create function public.label_ensure_profile() returns void language sql security invoker set search_path = '' as $$ select label_private.ensure_profile(); $$;

create function label_private.save_release(rid uuid, expected_revision integer, payload jsonb) returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid := label_private.actor_id(); row public.label_releases; t jsonb; c jsonb; a jsonb; tid uuid; pos integer; cpos integer; saved_revision integer;
begin
  perform label_private.throttle();
  perform label_private.ensure_profile();
  if payload is null or jsonb_typeof(payload) <> 'object' or pg_column_size(payload) > 131072 or
    jsonb_typeof(payload->'artists') is distinct from 'array' or jsonb_typeof(payload->'tracks') is distinct from 'array' or
    jsonb_array_length(payload->'artists') > 20 or jsonb_array_length(payload->'tracks') not between 1 and 40 or
    payload->>'release_type' is null or payload->>'release_type' not in ('single','ep','album') then
    raise exception 'Invalid release' using errcode = '22023';
  end if;
  if expected_revision is null or expected_revision < 0 then raise exception 'Invalid revision' using errcode = '40001'; end if;
  if rid is null then
    if expected_revision <> 0 then raise exception 'Invalid revision' using errcode = '40001'; end if;
    insert into public.label_releases(owner_id) values(uid) returning * into row;
    rid := row.id;
  else
    select * into row from public.label_releases where id = rid for update;
    if not found then raise exception 'Release not found' using errcode = 'P0002'; end if;
    if row.owner_id <> uid then raise exception 'Not your release' using errcode = '42501'; end if;
    if row.status not in ('draft','changes_requested') then raise exception 'Release is locked' using errcode = '22023'; end if;
    if row.revision is distinct from expected_revision then raise exception 'Revision conflict' using errcode = '40001'; end if;
  end if;
  update public.label_releases set title = trim(coalesce(payload->>'title','')), version = trim(coalesce(payload->>'version','')),
    release_type = payload->>'release_type', release_date = nullif(payload->>'release_date','')::date,
    genre = trim(coalesce(payload->>'genre','')), notes = trim(coalesce(payload->>'notes','')),
    revision = case when expected_revision = 0 then 1 else revision + 1 end, updated_at = now() where id = rid returning revision into saved_revision;
  delete from public.label_release_artists where release_id = rid;
  pos := 0;
  for a in select value from jsonb_array_elements(payload->'artists') loop
    pos := pos + 1;
    insert into public.label_release_artists(release_id,position,name,role,spotify_id,apple_music_id)
    values(rid,pos,trim(coalesce(a->>'name','')),a->>'role',trim(coalesce(a->>'spotify_id','')),trim(coalesce(a->>'apple_music_id','')));
  end loop;
  delete from public.label_tracks where release_id = rid;
  pos := 0;
  for t in select value from jsonb_array_elements(payload->'tracks') loop
    pos := pos + 1;
    if jsonb_typeof(t->'credits') is distinct from 'array' or jsonb_array_length(t->'credits') > 50 then raise exception 'Invalid credits' using errcode = '22023'; end if;
    insert into public.label_tracks(release_id,position,title,version,explicit,language)
    values(rid,pos,trim(coalesce(t->>'title','')),trim(coalesce(t->>'version','')),coalesce((t->>'explicit')::boolean,false),trim(coalesce(t->>'language',''))) returning id into tid;
    cpos := 0;
    for c in select value from jsonb_array_elements(t->'credits') loop
      cpos := cpos + 1;
      insert into public.label_credits(track_id,position,first_name,last_name,role)
      values(tid,cpos,trim(coalesce(c->>'first_name','')),trim(coalesce(c->>'last_name','')),c->>'role');
    end loop;
  end loop;
  if expected_revision = 0 then insert into public.label_release_events(release_id,actor_id,kind) values(rid,uid,'draft'); end if;
  return jsonb_build_object('id',rid,'revision',saved_revision);
end $$;
create function public.label_save_release(rid uuid, expected_revision integer, payload jsonb) returns jsonb language sql security invoker set search_path = '' as $$ select label_private.save_release(rid,expected_revision,payload); $$;

create function label_private.transition_release(rid uuid, expected_revision integer, target text, message text) returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := label_private.actor_id(); row public.label_releases; staff boolean := label_private.is_staff();
begin
  perform label_private.throttle();
  select * into row from public.label_releases where id = rid for update;
  if not found then raise exception 'Release not found' using errcode = 'P0002'; end if;
  if row.revision is distinct from expected_revision then raise exception 'Revision conflict' using errcode = '40001'; end if;
  if length(coalesce(message,'')) > 4000 then raise exception 'Comment too long' using errcode = '22023'; end if;
  if target = 'submitted' and row.owner_id = uid and row.status in ('draft','changes_requested') then
    if trim(row.title) = '' or trim(row.genre) = '' or row.release_date is null or row.release_date <= current_date or
      not exists(select 1 from public.label_release_artists where release_id = rid and role = 'primary' and trim(name) <> '') or
      exists(select 1 from public.label_release_artists where release_id = rid and trim(name) = '') or
      not exists(select 1 from public.label_tracks where release_id = rid) or
      (row.release_type = 'single' and (select count(*) from public.label_tracks where release_id = rid) <> 1) or
      exists(select 1 from public.label_tracks t where release_id = rid and (trim(title) = '' or trim(language) = '' or
        not exists(select 1 from public.label_credits c where c.track_id = t.id and role = 'composer' and trim(first_name) <> '' and trim(last_name) <> ''))) or
      exists(select 1 from public.label_credits c join public.label_tracks t on t.id = c.track_id where t.release_id = rid and (trim(first_name) = '' or trim(last_name) = '')) then
      raise exception 'Complete release details' using errcode = '22023';
    end if;
  elsif staff and ((row.status = 'submitted' and target = 'under_review') or
    (row.status = 'under_review' and target in ('changes_requested','approved')) or (row.status = 'approved' and target = 'delivered')) then
    if target = 'changes_requested' and trim(coalesce(message,'')) = '' then raise exception 'Describe required changes' using errcode = '22023'; end if;
  else
    raise exception 'Transition denied' using errcode = '42501';
  end if;
  update public.label_releases set status = target, revision = revision + 1, updated_at = now() where id = rid;
  insert into public.label_release_events(release_id,actor_id,kind,message) values(rid,uid,target,trim(coalesce(message,'')));
  insert into public.label_notifications(user_id,release_id,message) values(row.owner_id,rid,'Release status: ' || replace(target,'_',' ') || case when trim(coalesce(message,'')) = '' then '' else '. ' || trim(message) end);
end $$;
create function public.label_transition_release(rid uuid, expected_revision integer, target text, message text) returns void language sql security invoker set search_path = '' as $$ select label_private.transition_release(rid,expected_revision,target,message); $$;

create function label_private.save_profile(payload jsonb) returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := label_private.actor_id();
begin
  perform label_private.throttle(); perform label_private.ensure_profile();
  update public.label_profiles set display_name = trim(coalesce(payload->>'display_name','')), legal_first_name = trim(coalesce(payload->>'legal_first_name','')),
    legal_last_name = trim(coalesce(payload->>'legal_last_name','')), spotify_id = trim(coalesce(payload->>'spotify_id','')), apple_music_id = trim(coalesce(payload->>'apple_music_id','')) where id = uid;
end $$;
create function public.label_save_profile(payload jsonb) returns void language sql security invoker set search_path = '' as $$ select label_private.save_profile(payload); $$;
create function label_private.read_notifications() returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := label_private.actor_id();
begin perform label_private.throttle(); update public.label_notifications set read_at = now() where user_id = uid and read_at is null; end $$;
create function public.label_read_notifications() returns void language sql security invoker set search_path = '' as $$ select label_private.read_notifications(); $$;

create table public.label_artwork_uploads (
  path text primary key, release_id uuid not null references public.label_releases(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade, expires_at timestamptz not null default now() + interval '2 hours'
);
create index label_uploads_release_idx on public.label_artwork_uploads(release_id);
create index label_uploads_owner_idx on public.label_artwork_uploads(owner_id);
alter table public.label_artwork_uploads enable row level security;
revoke all on public.label_artwork_uploads from public, anon, authenticated;
grant select on public.label_artwork_uploads to authenticated;
grant all on public.label_artwork_uploads to service_role;
create policy label_uploads_read on public.label_artwork_uploads for select to authenticated using (owner_id = (select label_private.actor_id()));

create function label_private.begin_artwork(rid uuid, expected_revision integer, mime text) returns text language plpgsql security definer set search_path = '' as $$
declare uid uuid := label_private.actor_id(); row public.label_releases; path text;
begin
  perform label_private.throttle();
  -- Serialize the per-user quota, including simultaneous requests to different releases.
  perform 1 from public.label_profiles where id = uid for update;
  select * into row from public.label_releases where id = rid for update;
  if not found then raise exception 'Release not found' using errcode = 'P0002'; end if;
  if row.owner_id <> uid or row.status not in ('draft','changes_requested') then raise exception 'Artwork edit denied' using errcode = '42501'; end if;
  if row.revision is distinct from expected_revision then raise exception 'Revision conflict' using errcode = '40001'; end if;
  if mime is null or mime not in ('image/jpeg','image/png') then raise exception 'Invalid MIME' using errcode = '22023'; end if;
  if (select count(*) from public.label_artwork_uploads where owner_id = uid and expires_at > now()) >= 5 then raise exception 'Too many pending uploads' using errcode = '54000'; end if;
  path := uid::text || '/' || rid::text || '/' || gen_random_uuid()::text || case when mime = 'image/png' then '.png' else '.jpg' end;
  insert into public.label_artwork_uploads(path,release_id,owner_id) values(path,rid,uid);
  return path;
end $$;
create function public.label_begin_artwork(rid uuid, expected_revision integer, mime text) returns text language sql security invoker set search_path = '' as $$ select label_private.begin_artwork(rid,expected_revision,mime); $$;

-- Artwork is immutable after upload. Only the backend can attach a verified file.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('label-artwork','label-artwork',false,20971520,array['image/jpeg','image/png']);
create function label_private.attach_artwork(rid uuid, expected_revision integer, owner uuid, path text, sha text) returns void language plpgsql security definer set search_path = '' as $$
declare row public.label_releases;
begin
  -- Explicitly service-only; owner must come from a verified Auth user in the backend.
  if current_setting('request.jwt.claims',true)::jsonb->>'role' is distinct from 'service_role' then raise exception 'Service access required' using errcode = '42501'; end if;
  select * into row from public.label_releases where id = rid for update;
  if not found then raise exception 'Release not found' using errcode = 'P0002'; end if;
  if row.owner_id <> owner or row.status not in ('draft','changes_requested') then raise exception 'Artwork edit denied' using errcode = '42501'; end if;
  if row.revision is distinct from expected_revision then raise exception 'Revision conflict' using errcode = '40001'; end if;
  if path not like owner::text || '/' || rid::text || '/%' or sha !~ '^[a-f0-9]{64}$' or
    not exists(select 1 from storage.objects where bucket_id = 'label-artwork' and name = path) or
    not exists(select 1 from public.label_artwork_uploads u where u.path = attach_artwork.path and u.release_id = rid and u.owner_id = owner and u.expires_at > now()) then raise exception 'Invalid artwork' using errcode = '22023'; end if;
  delete from public.label_artwork_uploads u where u.path = attach_artwork.path;
  update public.label_releases set artwork_path = path, artwork_sha256 = sha, revision = revision + 1, updated_at = now() where id = rid;
end $$;
create function public.label_attach_artwork(rid uuid, expected_revision integer, owner uuid, path text, sha text) returns void language sql security invoker set search_path = '' as $$ select label_private.attach_artwork(rid,expected_revision,owner,path,sha); $$;
create policy label_artwork_read on storage.objects for select to authenticated using (
  bucket_id = 'label-artwork' and exists(select 1 from public.label_releases r where r.artwork_path = name and label_private.can_read_release(r.id))
);

-- Never grant direct mutations: clients must use the checked, atomic RPCs above.
do $$ declare t text; begin
  foreach t in array array['label_profiles','label_roles','label_releases','label_release_artists','label_tracks','label_credits','label_release_events','label_notifications'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from public, anon, authenticated', t);
    execute format('grant select on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end $$;
create policy label_profiles_read on public.label_profiles for select to authenticated using (id = (select label_private.actor_id()) or (select label_private.is_staff()));
create policy label_roles_read on public.label_roles for select to authenticated using (user_id = (select label_private.actor_id()));
create policy label_releases_read on public.label_releases for select to authenticated using (owner_id = (select label_private.actor_id()) or (status <> 'draft' and (select label_private.is_staff())));
create policy label_artists_read on public.label_release_artists for select to authenticated using (label_private.can_read_release(release_id));
create policy label_tracks_read on public.label_tracks for select to authenticated using (label_private.can_read_release(release_id));
create policy label_credits_read on public.label_credits for select to authenticated using (exists(select 1 from public.label_tracks t where t.id = track_id));
create policy label_events_read on public.label_release_events for select to authenticated using (label_private.can_read_release(release_id));
create policy label_notifications_read on public.label_notifications for select to authenticated using (user_id = (select label_private.actor_id()));

revoke all on all functions in schema label_private from public, anon, authenticated, service_role;
grant execute on function label_private.actor_id(), label_private.is_staff(), label_private.can_read_release(uuid), label_private.ensure_profile(), label_private.save_release(uuid,integer,jsonb), label_private.transition_release(uuid,integer,text,text), label_private.save_profile(jsonb), label_private.read_notifications(), label_private.begin_artwork(uuid,integer,text) to authenticated;
grant execute on function label_private.attach_artwork(uuid,integer,uuid,text,text) to service_role;
revoke all on function public.label_ensure_profile(), public.label_save_release(uuid,integer,jsonb), public.label_transition_release(uuid,integer,text,text), public.label_save_profile(jsonb), public.label_read_notifications(), public.label_begin_artwork(uuid,integer,text), public.label_attach_artwork(uuid,integer,uuid,text,text) from public, anon, authenticated, service_role;
grant execute on function public.label_ensure_profile(), public.label_save_release(uuid,integer,jsonb), public.label_transition_release(uuid,integer,text,text), public.label_save_profile(jsonb), public.label_read_notifications(), public.label_begin_artwork(uuid,integer,text) to authenticated;
grant execute on function public.label_attach_artwork(uuid,integer,uuid,text,text) to service_role;

-- Restrict inherited default privileges on the existing demo inbox.
revoke all on public.demo_submissions from anon, authenticated;
grant insert on public.demo_submissions to anon;
grant select, delete on public.demo_submissions to authenticated;
grant update(status) on public.demo_submissions to authenticated;
create policy label_demo_public_validation on public.demo_submissions as restrictive for insert to anon with check (
  status = 'new' and length(alias) between 1 and 120 and length(email) between 3 and 254 and
  length(sc_link) between 1 and 2048 and sc_link ~* '^https?://(www\.)?(soundcloud\.com|on\.soundcloud\.com)/.+' and
  email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' and coalesce(length(notes),0) <= 4000
);
create policy label_demo_staff_read on public.demo_submissions for select to authenticated using ((select label_private.is_staff()));
create policy label_demo_staff_update on public.demo_submissions for update to authenticated using ((select label_private.is_staff())) with check ((select label_private.is_staff()) and status in ('new','approved','rejected'));
create policy label_demo_staff_delete on public.demo_submissions for delete to authenticated using ((select label_private.is_staff()));

commit;
