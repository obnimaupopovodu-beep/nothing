import { PGlite } from '@electric-sql/pglite'
import { readFile, readdir } from 'node:fs/promises'
import assert from 'node:assert/strict'
const db = new PGlite()
await db.exec(`
 create role anon; create role authenticated; create role service_role bypassrls;
 create schema auth; create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),'')::jsonb,'{}'::jsonb)$$;
 grant usage on schema auth to authenticated,service_role; grant execute on all functions in schema auth to authenticated,service_role;
 create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text); alter table storage.objects enable row level security;
 grant usage on schema storage to authenticated,service_role; grant select on storage.objects to authenticated; grant all on storage.objects,storage.buckets to service_role;
 create table public.demo_submissions(id uuid primary key default gen_random_uuid(),alias text not null,email text not null,sc_link text not null,notes text,status text not null default 'new',created_at timestamptz default now());
 alter table public.demo_submissions enable row level security;
 create policy "Allow public demo inserts" on public.demo_submissions for insert to anon with check(alias is not null and email is not null and sc_link is not null);
 grant all on public.demo_submissions to anon,authenticated,service_role;
`)
const migration = (await readdir('supabase/migrations')).find((f) =>
  f.endsWith('_artist_platform.sql')
)
await db.exec(await readFile(`supabase/migrations/${migration}`, 'utf8'))
await db.exec(await readFile('supabase/migrations/20261002213408_artist_team_access.sql', 'utf8'))
const owner = '10000000-0000-4000-8000-000000000001',
  other = '10000000-0000-4000-8000-000000000002',
  staff = '10000000-0000-4000-8000-000000000003'
await db.query("insert into auth.users(id,email,email_confirmed_at) values($1,'owner@example.com',now()),($2,'other@example.com',now()),($3,'staff@example.com',now())", [owner, other, staff])
await db.query("insert into public.label_roles values($1,'label_manager')", [staff])
async function actor(uid, role = 'authenticated') {
  await db.exec('reset role')
  await db.query(
    "select set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claims',$2,false)",
    [uid || '', JSON.stringify({ sub: uid, role, is_anonymous: false })]
  )
  await db.exec(`set role ${role}`)
}
let checks = 0
async function denies(sql, params = [], code = '42501') {
  await assert.rejects(db.query(sql, params), (e) => e.code === code)
  checks++
}
async function count(table, expected) {
  const r = await db.query(`select count(*)::int as n from public.${table}`)
  assert.equal(r.rows[0].n, expected)
  checks++
}
await actor(null, 'anon')
await denies('select public.label_ensure_profile()')
await denies('select * from public.demo_submissions')
await denies('truncate public.demo_submissions')
await db.query(
  "insert into public.demo_submissions(alias,email,sc_link) values('Artist','artist@example.com','https://soundcloud.com/artist/track')"
)
checks++
await denies(
  "insert into public.demo_submissions(alias,email,sc_link,status) values('Artist','artist@example.com','url','approved')"
)
await actor(owner)
await db.query('select public.label_ensure_profile()')
await count('label_roles', 1)
await denies("insert into public.label_roles values($1,'admin')", [owner])
const payload = {
  title: 'Test record',
  version: '',
  release_type: 'single',
  release_date: '2099-12-01',
  genre: 'House',
  notes: '',
  artists: [{ name: 'Artist', role: 'primary', spotify_id: '', apple_music_id: '' }],
  tracks: [
    {
      title: 'Track',
      version: '',
      explicit: false,
      language: 'Instrumental',
      credits: [{ first_name: 'Legal', last_name: 'Name', role: 'composer' }],
    },
  ],
}
const created = await db.query('select public.label_save_release(null,0,$1) as id', [payload])
const rid = created.rows[0].id.id
checks++
await count('label_releases', 1)
await count('label_credits', 1)
await denies('update public.label_releases set owner_id=$1 where id=$2', [other, rid])
await denies('update public.label_credits set first_name=$1', ['Fake'])
await actor(other)
await db.query('select public.label_ensure_profile()')
for (const t of [
  'label_releases',
  'label_release_artists',
  'label_tracks',
  'label_credits',
  'label_release_events',
])
  await count(t, 0)
await denies('select public.label_save_release($1,1,$2)', [rid, payload])
await denies("select public.label_transition_release($1,1,'submitted','')", [rid])
await actor(owner)
await denies('select public.label_save_release($1,7,$2)', [rid, payload], '40001')
const bad = { ...payload, tracks: [{ ...payload.tracks[0], credits: [] }] }
await db.query('select public.label_save_release($1,1,$2)', [rid, bad])
await denies("select public.label_transition_release($1,2,'submitted','')", [rid], '22023')
await db.query('select public.label_save_release($1,2,$2)', [rid, payload])
await db.query("select public.label_transition_release($1,3,'submitted','')", [rid])
checks++
await denies('select public.label_save_release($1,4,$2)', [rid, payload], '22023')
await denies("select public.label_transition_release($1,4,'approved','')", [rid])
await actor(staff)
await db.query('select public.label_ensure_profile()')
await count('label_releases', 1)
await count('label_tracks', 1)
await count('label_credits', 1)
await count('demo_submissions', 1)
await db.query("update public.demo_submissions set status='approved'")
await denies("update public.demo_submissions set email='stolen@example.com'")
await db.query("select public.label_transition_release($1,4,'under_review','Checking credits')", [
  rid,
])
await denies("select public.label_transition_release($1,5,'changes_requested','')", [rid], '22023')
await db.query(
  "select public.label_transition_release($1,5,'changes_requested','Please update artwork')",
  [rid]
)
await actor(owner)
const feedback = await db.query(
  "select message from public.label_release_events where kind='changes_requested'"
)
assert.equal(feedback.rows[0].message, 'Please update artwork')
checks++
await db.query('select public.label_save_release($1,6,$2)', [rid, payload])
await db.query("select public.label_transition_release($1,7,'submitted','')", [rid])
await denies('select public.label_attach_artwork($1,8,$2,$3,$4)', [
  rid,
  owner,
  `${owner}/${rid}/fake.jpg`,
  '0'.repeat(64),
])
await actor(staff)
await db.query("select public.label_transition_release($1,8,'under_review','')", [rid])
await db.query("select public.label_transition_release($1,9,'approved','Ready')", [rid])
await db.query("select public.label_transition_release($1,10,'delivered','Delivery confirmed')", [
  rid,
])
await actor(other)
await count('label_notifications', 0)
await denies("select public.label_transition_release($1,11,'draft','')", [rid])
await actor(owner)
const row = await db.query('select status,revision from public.label_releases where id=$1', [rid])
assert.deepEqual(row.rows[0], { status: 'delivered', revision: 11 })
checks++
await db.query('select public.label_read_notifications()')
const unread = await db.query(
  'select count(*)::int as n from public.label_notifications where read_at is null'
)
assert.equal(unread.rows[0].n, 0)
checks++
const draft = await db.query('select public.label_save_release(null,0,$1) as id', [payload])
await actor(staff)
const hidden = await db.query('select id from public.label_releases where id=$1', [
  draft.rows[0].id.id,
])
assert.equal(hidden.rows.length, 0)
checks++
await actor(owner)
for (let i = 0; i < 5; i++) {
  await db.query("select public.label_begin_artwork($1,1,'image/jpeg')", [draft.rows[0].id.id])
}
await denies("select public.label_begin_artwork($1,1,'image/jpeg')", [draft.rows[0].id.id], '54000')
await actor(other)
await denies("select public.label_begin_artwork($1,1,'image/jpeg')", [draft.rows[0].id.id])
await actor(owner)
const uploadPath = `${owner}/${draft.rows[0].id.id}/image.jpg`
await actor(null, 'service_role')
await db.query(
  'insert into public.label_artwork_uploads(path,release_id,owner_id) values($1,$2,$3)',
  [uploadPath, draft.rows[0].id.id, owner]
)
await db.query("insert into storage.objects(bucket_id,name) values('label-artwork',$1)", [
  uploadPath,
])
await db.query('select public.label_attach_artwork($1,1,$2,$3,$4)', [
  draft.rows[0].id.id,
  owner,
  uploadPath,
  'a'.repeat(64),
])
checks++
await actor(other)
const privateArt = await db.query('select * from storage.objects')
assert.equal(privateArt.rows.length, 0)
checks++
await actor(owner)
const ownArt = await db.query('select * from storage.objects')
assert.equal(ownArt.rows.length, 1)
checks++
const teamDraft = await db.query('select public.label_save_release(null,0,$1) as result', [payload])
const teamRid = teamDraft.rows[0].result.id
await db.query("select public.label_add_team_member('other@example.com','viewer')")
await actor(other)
const visible = await db.query('select id from public.label_releases where id=$1', [teamRid])
assert.equal(visible.rows.length, 1)
checks++
await denies('select public.label_save_release($1,1,$2)', [teamRid, payload])
await denies("select public.label_begin_artwork($1,1,'image/jpeg')", [teamRid])
await actor(owner)
await db.query("select public.label_add_team_member('other@example.com','editor')")
await actor(other)
await db.query('select public.label_save_release($1,1,$2)', [teamRid, payload])
const editorUpload = await db.query("select public.label_begin_artwork($1,2,'image/jpeg') as path", [teamRid])
assert(editorUpload.rows[0].path.startsWith(`${other}/${teamRid}/`))
checks++
await db.query("select public.label_transition_release($1,2,'submitted','')", [teamRid])
checks += 2
await actor(owner)
await db.query('select public.label_remove_team_member($1)', [other])
await actor(other)
const revoked = await db.query('select id from public.label_releases where id=$1', [teamRid])
assert.equal(revoked.rows.length, 0)
checks++
await denies('select * from public.label_list_staff()')
await actor(null, 'service_role')
await db.query("insert into public.label_roles values($1,'admin')", [owner])
await actor(owner)
await db.query("select public.label_add_staff('other@example.com','label_manager')")
const staffList = await db.query('select * from public.label_list_staff()')
assert(staffList.rows.some((row) => row.user_id === other && row.role === 'label_manager'))
checks++
await actor(other)
await denies("select public.label_add_staff('staff@example.com','admin')")
await actor(owner)
await db.query("select public.label_remove_staff($1,'label_manager')", [other])
await denies("select public.label_remove_staff($1,'admin')", [owner], '22023')
const removed = await db.query("select count(*)::int as n from public.label_roles where user_id=$1 and role='label_manager'", [other])
assert.equal(removed.rows[0].n, 0)
checks++
await db.close()
console.log(`Artist platform: ${checks} database security and workflow checks passed.`)
