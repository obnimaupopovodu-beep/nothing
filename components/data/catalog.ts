export type CatalogRelease = {
  slug: string
  title: string
  artist: string
  year: string
  artwork: string
  href: string
  description: string
  audioUrl?: string
}

// Demonstration catalog. Replace these records and hrefs when the label's
// published releases and their destinations are available.
export const catalogReleases: CatalogRelease[] = [
  { slug: 'Ela-na-Sera', audioUrl: 'https://bflrxqshhhqezqyafuoh.supabase.co/storage/v1/object/public/catalog-audio/ELA-NA-SERA/preview-c60157c3440f.mp3', title: 'Ela na Sera', artist: 'DJ NXW', year: '2026', artwork: 'https://i.scdn.co/image/ab67616d0000aa54a57a64703a0f44f46444b5ad', href: '/catalog/Ela-na-Sera', description: 'Smooth and unique brazilinan funk song' },
  { slug: 'u-think-its-over?', audioUrl: 'https://bflrxqshhhqezqyafuoh.supabase.co/storage/v1/object/public/catalog-audio/UTHINKITSOVER/preview-b3edb2eef98b.mp3',  title: 'u think its over?', artist: 'Hiderest', year: '2026', artwork: 'https://i.scdn.co/image/ab67616d0000aa5452324d0e502b33ff7d00cc0e', href: '/catalog/in-other-rooms', description: 'Smooth hoodtrap beat' },
  { slug: 'Step-Back', audioUrl: 'https://bflrxqshhhqezqyafuoh.supabase.co/storage/v1/object/public/catalog-audio/STEP-BACK/preview-c9415bcdde1d.mp3', title: 'Step Back', artist: 'Hiderest, s_.a_.t_.e_.n, Laughing skxll', year: '2026', artwork: 'https://toolost.s3.us-east-2.amazonaws.com/convertedArtwork/77519924102e41e9b1cb07077fc81850.jpg', href: '/catalog/Step-Back', description: 'Icredible electronic/metal that blends heavy riffs with massive synths' },
  { slug: 'HESITATE', audioUrl: 'https://bflrxqshhhqezqyafuoh.supabase.co/storage/v1/object/public/catalog-audio/HESITATE/preview-5958d9038357.mp3', title: 'HESITATE', artist: 'FXRNVN', year: '2026', artwork: 'https://toolost.s3.us-east-2.amazonaws.com/convertedArtwork/dfb88dff07474e21ad80c60ad5d8a524.jpg', href: '/catalog/HESITATE', description: 'Hard and smooth dubstep song that makes you hesitating' },
  { slug: 'SUPERSTAR', audioUrl: 'https://bflrxqshhhqezqyafuoh.supabase.co/storage/v1/object/public/catalog-audio/SUPERSTAR/preview-018f834f86b2.mp3', title: 'SUPERSTAR', artist: 'FXRNVN', year: '2026', artwork: 'https://toolost.s3.us-east-2.amazonaws.com/convertedArtwork/e450129bb5794974b6ff4dcb7fad9e03.jpg', href: '/catalog/SUPERSTAR', description: 'Just best one for MVP sound in cs2(upcoming release)' },
  { slug: 'Creepers', audioUrl: 'https://bflrxqshhhqezqyafuoh.supabase.co/storage/v1/object/public/catalog-audio/comeagain/preview-c07fd5ba69b6.mp3', title: 'Creepers', artist: 'Hiderest, Kootmane', year: '2026', artwork: 'https://toolost.s3.us-east-2.amazonaws.com/convertedArtwork/qlHdaYYvk42vwwkO5Jl0-edited.jpg', href: '/catalog/Creepers', description: 'Dark memphis bass beat' },
  { slug: 'Naivety', audioUrl: 'https://bflrxqshhhqezqyafuoh.supabase.co/storage/v1/object/public/catalog-audio/NAIVETY/preview-535aefbad607.mp3', title: 'Naivety', artist: 'Hiderest', year: '2026', artwork: 'https://i.scdn.co/image/ab67616d0000aa54d9d9fce38376476a49d0af42', href: '/catalog/Naivety', description: 'Hardtekk song with brazilian vibes' },
  { slug: 'FN-SLP', audioUrl: 'https://bflrxqshhhqezqyafuoh.supabase.co/storage/v1/object/public/catalog-audio/fnslp/preview-1890037696b0.mp3', title: 'FN SLP', artist: 'Hiderest', year: '2026', artwork: 'https://i.scdn.co/image/ab67616d0000aa54b8fdd67a6369c2c819e2a9e5', href: '/catalog/FN-SLP', description: 'you know what fn slp is?' },
  { slug: 'NAO-BANGER', audioUrl: 'https://bflrxqshhhqezqyafuoh.supabase.co/storage/v1/object/public/catalog-audio/naobanger/preview-8caff7ba90b4.mp3', title: 'NAO BANGER', artist: 'DJ NXW', year: '2026', artwork: 'https://i.scdn.co/image/ab67616d0000aa54f2129e2f8af16da25252d30e', href: '/catalog/NAO-BANGER', description: 'Is it hardtekk or br funk? let figure it out' },
  { slug: 'Hit-and-Run', title: 'Hit and Run', artist: 'Malik Amer, Sam Adler', year: '2026', artwork: 'https://toolost.s3.us-east-2.amazonaws.com/convertedArtwork/e67ce765cd694ea282b4b38bd9787a80.jpg', href: '/catalog/Hit-and-Run', description: 'country/Pop song with huge story' },
]
