-- Run after the platform, team access and demo release flow migrations.
begin;
create index demo_submissions_unlinked_email_idx on public.demo_submissions(lower(trim(email)))
where artist_user_id is null;

-- Resolve only verified Auth email addresses, never a user-editable profile name.
-- AFTER INSERT keeps the existing anon INSERT policy (artist_user_id IS NULL) intact.
create function label_private.link_public_demo() returns trigger
language plpgsql security definer set search_path = '' as $$
declare matched uuid;
begin
  if new.artist_user_id is null then
    select (array_agg(id))[1] into matched from auth.users
      where lower(trim(email)) = lower(trim(new.email)) and email_confirmed_at is not null
      having count(*) = 1;
    if matched is not null then
      update public.demo_submissions set artist_user_id = matched
      where id = new.id and artist_user_id is null;
    end if;
  end if;
  return new;
end $$;
create trigger label_link_public_demo after insert on public.demo_submissions
for each row execute function label_private.link_public_demo();
revoke all on function label_private.link_public_demo() from public, anon, authenticated, service_role;

create function label_private.claim_demo_submissions() returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := label_private.actor_id(); verified_email text;
begin
  select lower(trim(email)) into verified_email from auth.users
    where id = uid and email_confirmed_at is not null;
  if verified_email is null then return; end if;
  -- Do not claim an ambiguous address or transfer an already owned demo.
  if (select count(*) from auth.users where lower(trim(email)) = verified_email
      and email_confirmed_at is not null) <> 1 then return; end if;
  update public.demo_submissions set artist_user_id = uid
    where artist_user_id is null and lower(trim(email)) = verified_email;
end $$;
create function public.label_claim_demo_submissions() returns void
language sql security invoker set search_path = '' as $$ select label_private.claim_demo_submissions(); $$;
revoke all on function label_private.claim_demo_submissions(), public.label_claim_demo_submissions()
from public, anon, authenticated, service_role;
grant execute on function label_private.claim_demo_submissions(), public.label_claim_demo_submissions() to authenticated;

-- Reconnect existing submissions immediately, including approved ones.
update public.demo_submissions d set artist_user_id = u.id
from auth.users u where d.artist_user_id is null and u.email_confirmed_at is not null
and lower(trim(d.email)) = lower(trim(u.email))
and (select count(*) from auth.users x where x.email_confirmed_at is not null
  and lower(trim(x.email)) = lower(trim(u.email))) = 1;

alter table public.label_releases add column creation_source text not null default 'artist'
check (creation_source in ('artist','label'));
alter table public.label_releases add column created_by uuid references auth.users(id) on delete set null;

create or replace function label_private.can_read_release(rid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.label_releases r where r.id = rid and
 (r.owner_id = label_private.actor_id() or label_private.member_role(r.owner_id) is not null or
 ((r.status <> 'draft' or r.creation_source = 'label') and label_private.is_staff())));
$$;
create or replace function label_private.can_edit_release(rid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.label_releases r where r.id = rid and r.status in ('draft','changes_requested') and
 (r.owner_id = label_private.actor_id() or label_private.member_role(r.owner_id) = 'editor' or
 (r.creation_source = 'label' and label_private.is_staff())));
$$;
drop policy label_releases_read on public.label_releases;
create policy label_releases_read on public.label_releases for select to authenticated using (
 owner_id = (select label_private.actor_id()) or label_private.member_role(owner_id) is not null or
 ((status <> 'draft' or creation_source = 'label') and (select label_private.is_staff()))
);
create or replace function label_private.save_release(rid uuid, expected_revision integer, payload jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := label_private.actor_id();
  row public.label_releases;
  t jsonb; c jsonb; a jsonb; tid uuid; pos integer; cpos integer;
  saved_revision integer; source_demo uuid; target_owner uuid;
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
      if source_demo is null or not exists (
        select 1 from public.demo_submissions
        where id = source_demo and artist_user_id = uid and status = 'approved'
      ) then raise exception 'An approved demo is required' using errcode = '42501'; end if;
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
create or replace function label_private.transition_release(rid uuid, expected_revision integer, target text, message text) returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := label_private.actor_id(); row public.label_releases; staff boolean := label_private.is_staff();
begin
  perform label_private.throttle();
  select * into row from public.label_releases where id = rid for update;
  if not found then raise exception 'Release not found' using errcode = 'P0002'; end if;
  if row.revision is distinct from expected_revision then raise exception 'Revision conflict' using errcode = '40001'; end if;
  if length(coalesce(message,'')) > 4000 then raise exception 'Comment too long' using errcode = '22023'; end if;
  if target = 'submitted' and (row.owner_id = uid or label_private.member_role(row.owner_id) = 'editor' or (staff and row.creation_source = 'label')) and row.status in ('draft','changes_requested') then
    if trim(row.title) = '' or trim(row.genre) = '' or row.release_date is null or (row.release_date <= current_date and not (staff and row.creation_source = 'label')) or
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
  if not label_private.can_edit_release(rid) then raise exception 'Artwork edit denied' using errcode = '42501'; end if;
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
  if (row.owner_id <> owner and not exists(select 1 from public.label_team_members m where m.owner_id = row.owner_id and m.member_id = owner and m.role = 'editor') and not (row.creation_source = 'label' and exists(select 1 from public.label_roles where user_id = owner and role in ('admin','label_manager')))) or row.status not in ('draft','changes_requested') then raise exception 'Artwork edit denied' using errcode = '42501'; end if;
  if row.revision is distinct from expected_revision then raise exception 'Revision conflict' using errcode = '40001'; end if;
  if path not like owner::text || '/' || rid::text || '/%' or sha !~ '^[a-f0-9]{64}$' or
    not exists(select 1 from storage.objects where bucket_id = 'label-artwork' and name = path) or
    not exists(select 1 from public.label_artwork_uploads u where u.path = attach_artwork.path and u.release_id = rid and u.owner_id = owner and u.expires_at > now()) then raise exception 'Invalid artwork' using errcode = '22023'; end if;
  delete from public.label_artwork_uploads u where u.path = attach_artwork.path;
  update public.label_releases set artwork_path = path, artwork_sha256 = sha, revision = revision + 1, updated_at = now() where id = rid;
end $$;
create function label_private.artist_accounts()
returns table(id uuid, display_name text, email text)
language plpgsql stable security definer set search_path = '' as $$
begin
 if not label_private.is_staff() then raise exception 'Staff access required' using errcode = '42501'; end if;
 return query select p.id,p.display_name,u.email::text from public.label_profiles p
 join auth.users u on u.id = p.id where u.email_confirmed_at is not null order by p.display_name,u.email;
end $$;
create function public.label_artist_accounts() returns table(id uuid,display_name text,email text)
language sql security invoker set search_path = '' as $$ select * from label_private.artist_accounts(); $$;
revoke all on function label_private.artist_accounts(), public.label_artist_accounts() from public,anon,authenticated,service_role;
grant execute on function label_private.artist_accounts(), public.label_artist_accounts() to authenticated;
commit;
