export type CatalogRelease = {
  slug: string
  title: string
  artist: string
  year: string
  artwork: string
  href: string
  description: string
  /** Public smart link with the release’s DSP destinations. */
  streamingUrl?: string
  audioUrl?: string
}

// Demonstration catalog. Replace these records and hrefs when the label's
// published releases and their destinations are available.
export const catalogReleases: CatalogRelease[] = [
  { slug: 'Ela-na-Sera', streamingUrl: 'https://too.fm/nqqle47',audioUrl: 'https://bflrxqshhhqezqyafuoh.supabase.co/storage/v1/object/public/catalog-audio/ELA-NA-SERA/preview-c60157c3440f.mp3', title: 'Ela na Sera', artist: 'DJ NXW', year: '2026', artwork: 'https://i.scdn.co/image/ab67616d0000aa54a57a64703a0f44f46444b5ad', href: '/catalog/Ela-na-Sera', description: 'Smooth and unique brazilian funk song' },
  { slug: 'u-think-its-over?', streamingUrl: 'https://too.fm/kvbkxm8',audioUrl: 'https://bflrxqshhhqezqyafuoh.supabase.co/storage/v1/object/public/catalog-audio/U/preview-d776b0906d63.mp3',  title: 'u think its over?', artist: 'Hiderest', year: '2026', artwork: 'https://i.scdn.co/image/ab67616d0000aa5452324d0e502b33ff7d00cc0e', href: '/catalog/in-other-rooms', description: 'Smooth hoodtrap beat' },
  { slug: 'Step-Back', streamingUrl: 'https://too.fm/x0x6dm1',audioUrl: 'https://bflrxqshhhqezqyafuoh.supabase.co/storage/v1/object/public/catalog-audio/STEPBACK/preview-5f9d7fbee6f0.mp3', title: 'Step Back', artist: 'Hiderest, s_.a_.t_.e_.n, Laughing skxll', year: '2026', artwork: 'https://toolost.s3.us-east-2.amazonaws.com/convertedArtwork/77519924102e41e9b1cb07077fc81850.jpg', href: '/catalog/Step-Back', description: 'Icredible electronic/metal that blends heavy riffs with massive synths' },
  { slug: 'HESITATE', streamingUrl: 'https://too.fm/lrn2rjm',audioUrl: 'https://bflrxqshhhqezqyafuoh.supabase.co/storage/v1/object/public/catalog-audio/HESITATE/preview-f8a6603460dc.mp3', title: 'HESITATE', artist: 'FXRNVN', year: '2026', artwork: 'https://toolost.s3.us-east-2.amazonaws.com/convertedArtwork/dfb88dff07474e21ad80c60ad5d8a524.jpg', href: '/catalog/HESITATE', description: 'Hard and smooth dubstep song that makes you hesitating' },
  { slug: 'SUPERSTAR', streamingUrl: 'https://too.fm/e0ao0y7', audioUrl: 'https://bflrxqshhhqezqyafuoh.supabase.co/storage/v1/object/public/catalog-audio/SUPERSTAR/preview-f6e1cf8b1980.mp3', title: 'SUPERSTAR', artist: 'FXRNVN', year: '2026', artwork: 'https://toolost.s3.us-east-2.amazonaws.com/convertedArtwork/e450129bb5794974b6ff4dcb7fad9e03.jpg', href: '/catalog/SUPERSTAR', description: 'Just best one for MVP sound in cs2(upcoming release)' },
  { slug: 'Creepers', streamingUrl: 'https://too.fm/l0n4yqg', audioUrl: 'https://bflrxqshhhqezqyafuoh.supabase.co/storage/v1/object/public/catalog-audio/CMGN/preview-f481ffe438a1.mp3', title: 'Creepers', artist: 'Hiderest, Kootmane', year: '2026', artwork: 'https://toolost.s3.us-east-2.amazonaws.com/convertedArtwork/qlHdaYYvk42vwwkO5Jl0-edited.jpg', href: '/catalog/Creepers', description: 'Dark memphis bass beat' },
  { slug: 'Naivety', streamingUrl: 'https://open.spotify.com/album/4d3yuV6SVh8n7L0h81L2TO?si=kaS6P4_1QtG75unVtS2E_A', audioUrl: 'https://bflrxqshhhqezqyafuoh.supabase.co/storage/v1/object/public/catalog-audio/NAIVETY/preview-535aefbad607.mp3', title: 'Naivety', artist: 'Hiderest', year: '2026', artwork: 'https://i.scdn.co/image/ab67616d0000aa54d9d9fce38376476a49d0af42', href: '/catalog/Naivety', description: 'Hardtekk song with brazilian vibes' },
  { slug: 'FN-SLP', streamingUrl: 'https://open.spotify.com/album/6scPPHjpg0RycVwP46O90N?si=BwEGEpYxTlOMat5wOLx5Xw', audioUrl: 'https://bflrxqshhhqezqyafuoh.supabase.co/storage/v1/object/public/catalog-audio/FN/preview-4a7523023dd1.mp3', title: 'FN SLP', artist: 'Hiderest', year: '2026', artwork: 'https://i.scdn.co/image/ab67616d0000aa54b8fdd67a6369c2c819e2a9e5', href: '/catalog/FN-SLP', description: 'you know what fn slp is?' },
  { slug: 'NAO-BANGER', streamingUrl: 'https://open.spotify.com/album/3PlekZvKqOobDAOX2gqmC0?si=niaqvNGtS72bfbvfpjeYfg',audioUrl: 'https://bflrxqshhhqezqyafuoh.supabase.co/storage/v1/object/public/catalog-audio/NAO/preview-9db11f8fd6bd.mp3', title: 'NAO BANGER', artist: 'DJ NXW', year: '2026', artwork: 'https://i.scdn.co/image/ab67616d0000aa54f2129e2f8af16da25252d30e', href: '/catalog/NAO-BANGER', description: 'Is it hardtekk or br funk? let figure it out' },
  { slug: 'Hit-and-Run', title: 'Hit and Run', artist: 'Malik Amer, Sam Adler', year: '2026', artwork: 'https://toolost.s3.us-east-2.amazonaws.com/convertedArtwork/e67ce765cd694ea282b4b38bd9787a80.jpg', href: '/catalog/Hit-and-Run', description: 'country/Pop song with huge story' },
]
