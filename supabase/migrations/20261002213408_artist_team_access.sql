-- Run after 20261002103108_artist_platform.sql in the same Supabase project.
begin;

create table public.label_team_members (
  owner_id uuid not null references public.label_profiles(id) on delete cascade,
  member_id uuid not null references public.label_profiles(id) on delete cascade,
  email text not null check (length(email) between 3 and 254),
  role text not null check (role in ('editor', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (owner_id, member_id),
  check (owner_id <> member_id)
);
create index label_team_members_member_idx on public.label_team_members(member_id, owner_id);
alter table public.label_team_members enable row level security;
revoke all on public.label_team_members from public, anon, authenticated;
grant select on public.label_team_members to authenticated;
grant all on public.label_team_members to service_role;
create policy label_team_members_read on public.label_team_members for select to authenticated
using (owner_id = (select label_private.actor_id()) or member_id = (select label_private.actor_id()));

create function label_private.member_role(artist_id uuid) returns text language sql stable security definer set search_path = '' as $$
  select role from public.label_team_members where owner_id = artist_id and member_id = label_private.actor_id();
$$;
create function label_private.can_edit_release(rid uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.label_releases r where r.id = rid and
    (r.owner_id = label_private.actor_id() or label_private.member_role(r.owner_id) = 'editor'));
$$;
create or replace function label_private.can_read_release(rid uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.label_releases r where r.id = rid and
    (r.owner_id = label_private.actor_id() or label_private.member_role(r.owner_id) is not null or
     (r.status <> 'draft' and label_private.is_staff())));
$$;

drop policy label_releases_read on public.label_releases;
create policy label_releases_read on public.label_releases for select to authenticated using (
  owner_id = (select label_private.actor_id()) or label_private.member_role(owner_id) is not null or
  (status <> 'draft' and (select label_private.is_staff()))
);
drop policy label_profiles_read on public.label_profiles;
create policy label_profiles_read on public.label_profiles for select to authenticated using (
  id = (select label_private.actor_id()) or (select label_private.is_staff()) or
  exists(select 1 from public.label_team_members m where m.owner_id = id and m.member_id = (select label_private.actor_id()))
);

create function label_private.add_team_member(member_email text, member_role text)
returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := label_private.actor_id(); target uuid;
begin
  perform label_private.throttle();
  if member_email is null or length(member_email) > 254 or member_role not in ('editor','viewer') then
    raise exception 'Invalid team member' using errcode = '22023';
  end if;
  select id into target from auth.users
  where lower(email) = lower(trim(member_email)) and email_confirmed_at is not null;
  if target is null or target = uid then
    raise exception 'Ask this person to create and confirm an account first' using errcode = '22023';
  end if;
  perform label_private.ensure_profile();
  insert into public.label_profiles(id) values(target) on conflict do nothing;
  perform 1 from public.label_profiles where id = uid for update;
  if (select count(*) from public.label_team_members where owner_id = uid) >= 25 and
    not exists(select 1 from public.label_team_members where owner_id = uid and member_id = target) then
    raise exception 'Team limit reached' using errcode = '54000';
  end if;
  insert into public.label_team_members(owner_id,member_id,email,role)
  values(uid,target,lower(trim(member_email)),member_role)
  on conflict(owner_id,member_id) do update set email = excluded.email, role = excluded.role;
end $$;
create function public.label_add_team_member(member_email text, member_role text)
returns void language sql security invoker set search_path = '' as $$ select label_private.add_team_member(member_email,member_role); $$;

create function label_private.remove_team_member(target uuid) returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := label_private.actor_id();
begin
  perform label_private.throttle();
  delete from public.label_team_members where owner_id = uid and member_id = target;
end $$;
create function public.label_remove_team_member(target uuid)
returns void language sql security invoker set search_path = '' as $$ select label_private.remove_team_member(target); $$;

revoke all on function label_private.member_role(uuid), label_private.can_edit_release(uuid),
  label_private.add_team_member(text,text), label_private.remove_team_member(uuid),
  public.label_add_team_member(text,text), public.label_remove_team_member(uuid) from public, anon, authenticated, service_role;
grant execute on function label_private.member_role(uuid), label_private.can_edit_release(uuid),
  label_private.add_team_member(text,text), label_private.remove_team_member(uuid) to authenticated;
grant execute on function public.label_add_team_member(text,text), public.label_remove_team_member(uuid) to authenticated;

create or replace function label_private.save_release(rid uuid, expected_revision integer, payload jsonb) returns jsonb language plpgsql security definer set search_path = '' as $$
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
    if row.owner_id <> uid and label_private.member_role(row.owner_id) is distinct from 'editor' then raise exception 'Not your release' using errcode = '42501'; end if;
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

create or replace function label_private.transition_release(rid uuid, expected_revision integer, target text, message text) returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := label_private.actor_id(); row public.label_releases; staff boolean := label_private.is_staff();
begin
  perform label_private.throttle();
  select * into row from public.label_releases where id = rid for update;
  if not found then raise exception 'Release not found' using errcode = 'P0002'; end if;
  if row.revision is distinct from expected_revision then raise exception 'Revision conflict' using errcode = '40001'; end if;
  if length(coalesce(message,'')) > 4000 then raise exception 'Comment too long' using errcode = '22023'; end if;
  if target = 'submitted' and (row.owner_id = uid or label_private.member_role(row.owner_id) = 'editor') and row.status in ('draft','changes_requested') then
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

create or replace function label_private.begin_artwork(rid uuid, expected_revision integer, mime text) returns text language plpgsql security definer set search_path = '' as $$
declare uid uuid := label_private.actor_id(); row public.label_releases; path text;
begin
  perform label_private.throttle();
  -- Serialize the per-user quota, including simultaneous requests to different releases.
  perform 1 from public.label_profiles where id = uid for update;
  select * into row from public.label_releases where id = rid for update;
  if not found then raise exception 'Release not found' using errcode = 'P0002'; end if;
  if (row.owner_id <> uid and label_private.member_role(row.owner_id) is distinct from 'editor') or row.status not in ('draft','changes_requested') then raise exception 'Artwork edit denied' using errcode = '42501'; end if;
  if row.revision is distinct from expected_revision then raise exception 'Revision conflict' using errcode = '40001'; end if;
  if mime is null or mime not in ('image/jpeg','image/png') then raise exception 'Invalid MIME' using errcode = '22023'; end if;
  if (select count(*) from public.label_artwork_uploads where owner_id = uid and expires_at > now()) >= 5 then raise exception 'Too many pending uploads' using errcode = '54000'; end if;
  path := uid::text || '/' || rid::text || '/' || gen_random_uuid()::text || case when mime = 'image/png' then '.png' else '.jpg' end;
  insert into public.label_artwork_uploads(path,release_id,owner_id) values(path,rid,uid);
  return path;
end $$;

create or replace function label_private.attach_artwork(rid uuid, expected_revision integer, owner uuid, path text, sha text) returns void language plpgsql security definer set search_path = '' as $$
declare row public.label_releases;
begin
  -- Explicitly service-only; owner must come from a verified Auth user in the backend.
  if current_setting('request.jwt.claims',true)::jsonb->>'role' is distinct from 'service_role' then raise exception 'Service access required' using errcode = '42501'; end if;
  select * into row from public.label_releases where id = rid for update;
  if not found then raise exception 'Release not found' using errcode = 'P0002'; end if;
  if (row.owner_id <> owner and not exists(select 1 from public.label_team_members m where m.owner_id = row.owner_id and m.member_id = owner and m.role = 'editor')) or row.status not in ('draft','changes_requested') then raise exception 'Artwork edit denied' using errcode = '42501'; end if;
  if row.revision is distinct from expected_revision then raise exception 'Revision conflict' using errcode = '40001'; end if;
  if path not like owner::text || '/' || rid::text || '/%' or sha !~ '^[a-f0-9]{64}$' or
    not exists(select 1 from storage.objects where bucket_id = 'label-artwork' and name = path) or
    not exists(select 1 from public.label_artwork_uploads u where u.path = attach_artwork.path and u.release_id = rid and u.owner_id = owner and u.expires_at > now()) then raise exception 'Invalid artwork' using errcode = '22023'; end if;
  delete from public.label_artwork_uploads u where u.path = attach_artwork.path;
  update public.label_releases set artwork_path = path, artwork_sha256 = sha, revision = revision + 1, updated_at = now() where id = rid;
end $$;

-- The first admin is assigned in SQL Editor; afterwards admins manage label access in the UI.
create function label_private.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.label_roles where user_id = label_private.actor_id() and role = 'admin');
$$;
create function label_private.list_staff()
returns table(user_id uuid, email text, role text) language plpgsql stable security definer set search_path = '' as $$
begin
  if not label_private.is_admin() then raise exception 'Admin access required' using errcode = '42501'; end if;
  return query select r.user_id, u.email::text, r.role from public.label_roles r
    join auth.users u on u.id = r.user_id where r.role in ('admin','label_manager') order by u.email, r.role;
end $$;
create function public.label_list_staff()
returns table(user_id uuid, email text, role text) language sql security invoker set search_path = '' as $$
  select * from label_private.list_staff();
$$;
create function label_private.add_staff(member_email text, member_role text)
returns void language plpgsql security definer set search_path = '' as $$
declare target uuid;
begin
  if not label_private.is_admin() then raise exception 'Admin access required' using errcode = '42501'; end if;
  perform label_private.throttle();
  if member_role not in ('admin','label_manager') or member_email is null or length(member_email) > 254 then
    raise exception 'Invalid team member' using errcode = '22023';
  end if;
  select id into target from auth.users where lower(email) = lower(trim(member_email)) and email_confirmed_at is not null;
  if target is null then raise exception 'Ask this person to create and confirm an account first' using errcode = '22023'; end if;
  insert into public.label_profiles(id) values(target) on conflict do nothing;
  insert into public.label_roles(user_id,role) values(target,member_role) on conflict do nothing;
end $$;
create function public.label_add_staff(member_email text, member_role text)
returns void language sql security invoker set search_path = '' as $$ select label_private.add_staff(member_email,member_role); $$;
create function label_private.remove_staff(target uuid, member_role text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not label_private.is_admin() then raise exception 'Admin access required' using errcode = '42501'; end if;
  perform label_private.throttle();
  if target = label_private.actor_id() or member_role not in ('admin','label_manager') then
    raise exception 'Cannot remove this role' using errcode = '22023';
  end if;
  delete from public.label_roles where user_id = target and role = member_role;
end $$;
create function public.label_remove_staff(target uuid, member_role text)
returns void language sql security invoker set search_path = '' as $$ select label_private.remove_staff(target,member_role); $$;
revoke all on function label_private.is_admin(), label_private.list_staff(), label_private.add_staff(text,text),
  label_private.remove_staff(uuid,text), public.label_list_staff(), public.label_add_staff(text,text),
  public.label_remove_staff(uuid,text) from public, anon, authenticated, service_role;
grant execute on function label_private.is_admin(), label_private.list_staff(), label_private.add_staff(text,text),
  label_private.remove_staff(uuid,text), public.label_list_staff(), public.label_add_staff(text,text),
  public.label_remove_staff(uuid,text) to authenticated;

commit;
