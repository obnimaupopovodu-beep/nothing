-- Apply after the unified demo and manual release workflow migration.
begin;

create table public.label_artist_release_permissions (
  artist_id uuid primary key references public.label_profiles(id) on delete cascade,
  direct_release_mode text not null default 'submission_required'
    check (direct_release_mode in ('submission_required', 'once', 'unlimited')),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
alter table public.label_artist_release_permissions enable row level security;
revoke all on public.label_artist_release_permissions from public, anon, authenticated, service_role;
grant select on public.label_artist_release_permissions to authenticated;
create policy label_artist_release_permissions_read
  on public.label_artist_release_permissions for select to authenticated
  using (artist_id = (select label_private.actor_id()) or (select label_private.is_staff()));

create function label_private.set_artist_release_mode(target_artist uuid, new_mode text)
returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := label_private.actor_id();
begin
  if not label_private.is_staff() then
    raise exception 'Staff access required' using errcode = '42501';
  end if;
  perform label_private.throttle();
  if new_mode is null or new_mode not in ('submission_required', 'once', 'unlimited') then
    raise exception 'Invalid release permission' using errcode = '22023';
  end if;
  if target_artist is null or not exists(select 1 from public.label_profiles where id = target_artist) then
    raise exception 'Artist not found' using errcode = 'P0002';
  end if;
  if new_mode <> 'submission_required' and not exists(
    select 1 from auth.users where id = target_artist and email_confirmed_at is not null
  ) then
    raise exception 'Artist email is not confirmed' using errcode = '22023';
  end if;
  insert into public.label_artist_release_permissions(artist_id, direct_release_mode, updated_by)
    values(target_artist, new_mode, uid)
    on conflict(artist_id) do update
      set direct_release_mode = excluded.direct_release_mode,
          updated_by = excluded.updated_by, updated_at = now();
end $$;
create function public.label_set_artist_release_mode(target_artist uuid, new_mode text)
returns void language sql security invoker set search_path = '' as $$
  select label_private.set_artist_release_mode(target_artist, new_mode);
$$;
revoke all on function label_private.set_artist_release_mode(uuid, text),
  public.label_set_artist_release_mode(uuid, text) from public, anon, authenticated, service_role;
grant execute on function label_private.set_artist_release_mode(uuid, text),
  public.label_set_artist_release_mode(uuid, text) to authenticated;

-- Preserve the existing release validation, ownership, staff-created releases,
-- revision checks and edit flow. Only the new artist-draft gate changes.

create or replace function label_private.save_release(rid uuid, expected_revision integer, payload jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := label_private.actor_id();
  row public.label_releases;
  t jsonb; c jsonb; a jsonb; tid uuid; pos integer; cpos integer;
  saved_revision integer; source_demo uuid; target_owner uuid; direct_mode text;
begin
  perform label_private.throttle();
  perform label_private.ensure_profile();
  if payload is null or jsonb_typeof(payload) <> 'object' or pg_column_size(payload) > 131072 or
    jsonb_typeof(payload->'artists') is distinct from 'array' or jsonb_typeof(payload->'tracks') is distinct from 'array' or
    jsonb_array_length(payload->'artists') > 20 or jsonb_array_length(payload->'tracks') not between 1 and 40 or
    payload->>'release_type' is null or payload->>'release_type' not in ('single','ep','album') then
    raise exception 'Invalid release' using errcode = '22023';
  end if;
  if expected_revision is null or expected_revision < 0 then
    raise exception 'Invalid revision' using errcode = '40001';
  end if;
  if rid is null then
    if expected_revision <> 0 then raise exception 'Invalid revision' using errcode = '40001'; end if;
    target_owner := nullif(payload->>'owner_id', '')::uuid;
    if target_owner is not null then
      if not label_private.is_staff() then raise exception 'Staff access required' using errcode = '42501'; end if;
      if not exists(select 1 from public.label_profiles p join auth.users u on u.id = p.id
        where p.id = target_owner and u.email_confirmed_at is not null) then
        raise exception 'Artist account not found or unverified' using errcode = '22023';
      end if;
      insert into public.label_releases(owner_id,creation_source,created_by)
      values(target_owner,'label',uid) returning * into row;
      insert into public.label_notifications(user_id,release_id,message)
      values(target_owner,row.id,'The label added a release to your account.');
    else
      source_demo := nullif(payload->>'demo_submission_id', '')::uuid;
      if source_demo is null then
        -- Lock until the entire save commits; failed metadata writes roll back
        -- both the draft and the single-use permission consumption.
        select p.direct_release_mode into direct_mode
          from public.label_artist_release_permissions p
          where p.artist_id = uid for update;
        if direct_mode is null or direct_mode = 'submission_required' then
          raise exception 'An approved demo or direct release permission is required' using errcode = '42501';
        end if;
        if direct_mode = 'once' then
          update public.label_artist_release_permissions
            set direct_release_mode = 'submission_required', updated_by = uid, updated_at = now()
            where artist_id = uid;
        end if;
      elsif not exists (
        select 1 from public.demo_submissions
        where id = source_demo and artist_user_id = uid and status = 'approved'
      ) then
        raise exception 'An approved demo is required' using errcode = '42501';
      end if;
      insert into public.label_releases(owner_id,demo_submission_id,created_by)
      values(uid,source_demo,uid) returning * into row;
    end if;
    rid := row.id;
  else
    select * into row from public.label_releases where id = rid for update;
    if not found then raise exception 'Release not found' using errcode = 'P0002'; end if;
    if not label_private.can_edit_release(rid) then
      raise exception 'Not your release' using errcode = '42501';
    end if;
    if row.status not in ('draft','changes_requested') then
      raise exception 'Release is locked' using errcode = '22023';
    end if;
    if row.revision is distinct from expected_revision then
      raise exception 'Revision conflict' using errcode = '40001';
    end if;
  end if;
  update public.label_releases
    set title = trim(coalesce(payload->>'title','')),
        version = trim(coalesce(payload->>'version','')),
        release_type = payload->>'release_type',
        release_date = nullif(payload->>'release_date','')::date,
        genre = trim(coalesce(payload->>'genre','')),
        notes = trim(coalesce(payload->>'notes','')),
        revision = case when expected_revision = 0 then 1 else revision + 1 end,
        updated_at = now()
    where id = rid returning revision into saved_revision;
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
    if jsonb_typeof(t->'credits') is distinct from 'array' or jsonb_array_length(t->'credits') > 50 then
      raise exception 'Invalid credits' using errcode = '22023';
    end if;
    insert into public.label_tracks(release_id,position,title,version,explicit,language,audio_url)
    values(rid,pos,trim(coalesce(t->>'title','')),trim(coalesce(t->>'version','')),
      coalesce((t->>'explicit')::boolean,false),trim(coalesce(t->>'language','')),
      trim(coalesce(t->>'audio_url',''))) returning id into tid;
    cpos := 0;
    for c in select value from jsonb_array_elements(t->'credits') loop
      cpos := cpos + 1;
      insert into public.label_credits(track_id,position,first_name,last_name,role)
      values(tid,cpos,trim(coalesce(c->>'first_name','')),trim(coalesce(c->>'last_name','')),c->>'role');
    end loop;
  end loop;
  if expected_revision = 0 then
    insert into public.label_release_events(release_id,actor_id,kind) values(rid,uid,'draft');
  end if;
  return jsonb_build_object('id',rid,'revision',saved_revision);
end $$;

commit;
