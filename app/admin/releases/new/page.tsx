import Link from 'next/link'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import { PortalShell, PortalHeading } from '@/components/portal/PortalShell'
import { ReleaseEditor } from '@/components/portal/ReleaseEditor'
import { requireActor } from '@/lib/portal/auth'
import { emptyRelease } from '@/lib/portal/validation'

export default async function ManualReleasePage({ searchParams }: { searchParams: Promise<{ artist?: string }> }) {
  const actor = await requireActor('admin')
  const { artist } = await searchParams
  const { data: accounts, error } = await actor.client.rpc('label_artist_accounts')
  if (error) throw new Error('Unable to load artist accounts.')
  const artists = (accounts ?? []) as { id: string; display_name: string; email: string }[]
  const selected = artist ? artists.find(item => item.id === artist) : null
  if (artist && (!z.uuid().safeParse(artist).success || !selected)) notFound()
  const initial = structuredClone(emptyRelease)
  if (selected) initial.artists[0].name = selected.display_name || ''
  return <PortalShell actor={actor} workspace="admin">
    <PortalHeading kicker="Label / Add release" title="Add an artist’s record"
      description="For agreements made outside the platform. The draft appears in the selected artist’s account as soon as you save it." />
    {selected ? <>
      <p className="portal-muted">Assigned to {selected.display_name || selected.email} ({selected.email}). <Link href="/admin/releases/new">Choose another artist</Link></p>
      <ReleaseEditor key={selected.id} initial={initial} ownerId={selected.id} workspace="admin" />
    </> : <section className="portal-panel portal-padding">
      {artists.length ? <form className="portal-form-grid" action="/admin/releases/new" method="get">
        <label className="portal-full">Artist account
          <select className="portal-input" name="artist" required defaultValue="">
            <option value="" disabled>Choose an artist</option>
            {artists.map(item => <option key={item.id} value={item.id}>{item.display_name || 'Unnamed artist'} ({item.email})</option>)}
          </select>
        </label>
        <button className="portal-button" type="submit">Add release details</button>
      </form> : <p className="portal-muted">Ask the artist to register, confirm their email and sign in once. Their account will then appear here.</p>}
    </section>}
  </PortalShell>
}
