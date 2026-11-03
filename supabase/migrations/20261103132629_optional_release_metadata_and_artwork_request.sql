begin;

alter table public.label_releases add column artwork_requested boolean not null default false;
comment on column public.label_releases.artwork_requested is 'Artist requests artwork creation by the label; an existing upload may be a reference.';

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
        artwork_requested = coalesce((payload->>'artwork_requested')::boolean,false),
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

create or replace function label_private.transition_release(rid uuid, expected_revision integer, target text, message text) returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := label_private.actor_id(); row public.label_releases; staff boolean := label_private.is_staff();
begin
  perform label_private.throttle();
  select * into row from public.label_releases where id = rid for update;
  if not found then raise exception 'Release not found' using errcode = 'P0002'; end if;
  if row.revision is distinct from expected_revision then raise exception 'Revision conflict' using errcode = '40001'; end if;
  if length(coalesce(message,'')) > 4000 then raise exception 'Comment too long' using errcode = '22023'; end if;
  if target = 'submitted' and (row.owner_id = uid or label_private.member_role(row.owner_id) = 'editor' or (staff and row.creation_source = 'label')) and row.status in ('draft','changes_requested') then
    if trim(row.title) = '' or (row.release_date is not null and row.release_date <= current_date and not (staff and row.creation_source = 'label')) or
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

commit;
