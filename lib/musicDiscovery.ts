import { artistProfileDetails } from '@/components/data/artistProfiles'
import { catalogReleases, type CatalogRelease } from '@/components/data/catalog'
import { catalogReleasePath } from '@/lib/catalogLinks'
import { SITE_URL } from '@/lib/site'

export const artistKey = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '')
export const releaseArtists = (release: CatalogRelease) => release.artist.split(',').map(name => name.trim()).filter(Boolean)
const names = [...new Map(catalogReleases.flatMap(releaseArtists).map(name => [artistKey(name), name])).values()]
export const publicArtists = names.map(name => ({
  name,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  // Add verified biography and official artist profile URLs here when supplied.
  biography: artistProfileDetails[artistKey(name)]?.biography || '',
  sameAs: artistProfileDetails[artistKey(name)]?.sameAs || [],
  aliases: artistProfileDetails[artistKey(name)]?.aliases || [],
}))
export const artistPath = (slug: string) => `/music/artists/${encodeURIComponent(slug)}`
export const findArtist = (name: string) => publicArtists.find(artist => artistKey(artist.name) === artistKey(name))
export const artistReleases = (name: string) => catalogReleases.filter(release => releaseArtists(release).some(value => artistKey(value) === artistKey(name)))
export function artistDescription(name: string) {
  const biography = findArtist(name)?.biography
  if (biography) return biography
  const titles = artistReleases(name).map(release => release.title).join(', ')
  return `Explore ${name} in the uwbelieve music catalog. Releases include ${titles}. Find track details, available audio previews and streaming links.`
}
export const artistEntity = (name: string) => {
  const artist = findArtist(name)
  const url = artist ? `${SITE_URL}${artistPath(artist.slug)}` : undefined
  return { '@type': 'MusicGroup', '@id': url ? `${url}#artist` : undefined, name, url, ...(artist?.aliases.length ? { alternateName: artist.aliases } : {}) }
}
export const recordingEntity = (release: CatalogRelease) => ({
  '@type': 'MusicRecording', '@id': `${SITE_URL}${catalogReleasePath(release.slug)}#recording`,
  name: release.title, url: `${SITE_URL}${catalogReleasePath(release.slug)}`,
  description: release.description, image: release.artwork,
  byArtist: releaseArtists(release).map(artistEntity),
  ...(release.streamingUrl ? { sameAs: [release.streamingUrl] } : {}),
})
export const jsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c')
