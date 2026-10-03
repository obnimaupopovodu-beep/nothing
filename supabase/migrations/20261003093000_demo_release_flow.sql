-- A signed-in artist submits a demo first. An approved demo unlocks one release draft.
begin;

alter table public.demo_submissions
  add column artist_user_id uuid references auth.users(id) on delete set null;
create index demo_submissions_artist_created_idx
  on public.demo_submissions(artist_user_id, created_at desc)
  where artist_user_id is not null;

alter table public.label_releases
  add column demo_submission_id uuid unique references public.demo_submissions(id) on delete restrict;

alter table public.label_tracks
  add column audio_url text not null default ''
  check (length(audio_url) <= 2048 and (audio_url = '' or audio_url ~* '^https://[^[:space:]]+$'));

grant insert on public.demo_submissions to authenticated;
create policy label_demo_public_unlinked on public.demo_submissions
  as restrictive for insert to anon with check (artist_user_id is null);
create policy label_demo_artist_insert on public.demo_submissions
  for insert to authenticated with check (
    artist_user_id = label_private.actor_id() and status = 'new' and
    lower(email) = lower(coalesce(auth.jwt()->>'email', '')) and
    length(alias) between 1 and 120 and length(email) between 3 and 254 and
    length(sc_link) between 1 and 2048 and
    sc_link ~* '^https?://(www\.)?(soundcloud\.com|on\.soundcloud\.com)/.+' and
    coalesce(length(notes), 0) <= 4000
  );
create policy label_demo_artist_read on public.demo_submissions
  for select to authenticated using (artist_user_id = (select auth.uid()));

create or replace function label_private.save_release(rid uuid, expected_revision integer, payload jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := label_private.actor_id();
  row public.label_releases;
  t jsonb; c jsonb; a jsonb; tid uuid; pos integer; cpos integer;
  saved_revision integer; source_demo uuid;
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
    source_demo := nullif(payload->>'demo_submission_id', '')::uuid;
    if source_demo is null or not exists (
      select 1 from public.demo_submissions
      where id = source_demo and artist_user_id = uid and status = 'approved'
    ) then
      raise exception 'An approved demo is required' using errcode = '42501';
    end if;
    insert into public.label_releases(owner_id, demo_submission_id)
    values(uid, source_demo) returning * into row;
    rid := row.id;
  else
    select * into row from public.label_releases where id = rid for update;
    if not found then raise exception 'Release not found' using errcode = 'P0002'; end if;
    if row.owner_id <> uid and label_private.member_role(row.owner_id) is distinct from 'editor' then
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

-- Keep existing drafts valid; every track of a newly submitted release needs an audio link.
create function label_private.require_audio_links() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if new.status = 'submitted' and old.status is distinct from 'submitted' and
    exists(select 1 from public.label_tracks where release_id = new.id and audio_url = '') then
    raise exception 'Add a WAV or FLAC link for every track' using errcode = '22023';
  end if;
  return new;
end $$;
create trigger label_release_audio_required
  before update of status on public.label_releases
  for each row execute function label_private.require_audio_links();
revoke all on function label_private.require_audio_links() from public, anon, authenticated, service_role;

commit;
