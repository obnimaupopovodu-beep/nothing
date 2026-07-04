export type Platform = {
  name: string
  desc: string
  href: string
  squareBg: string
  iconPath: string
}

export const platforms: Platform[] = [
  {
    name: 'Spotify',
    desc: 'Stream our full catalog',
    href: 'https://spotify.com',
    squareBg: '#1DB954',
    iconPath:
      'M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z',
  },
  {
    name: 'Apple Music',
    desc: 'Lossless and Spatial Audio',
    href: 'https://music.apple.com',
    squareBg: '#FA243C',
    iconPath:
      'M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026C4.786.07 4.043.15 3.34.428 2.004.958 1.04 1.88.475 3.208c-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.802.42.127.848.187 1.286.218.476.035.952.05 1.43.05h11.5c.452 0 .903-.017 1.353-.049.745-.053 1.479-.166 2.163-.487 1.225-.57 2.112-1.47 2.656-2.705.247-.563.364-1.16.435-1.766.067-.57.079-1.146.088-1.72.003-.062.01-.124.013-.185V6.35c-.013-.076-.02-.15-.025-.227zM17.5 9.8v5.064c0 .54-.054 1.076-.31 1.57-.396.76-1.006 1.22-1.853 1.37-.406.07-.617.112-.617.112-.955.012-1.795-.657-1.98-1.6a1.98 1.98 0 011.59-2.323c.376-.073.745-.124 1.12-.177.418-.06.622-.27.622-.694V8.076c0-.485.272-.757.752-.684l2.403.39c.41.065.672.345.672.764V9.8z',
  },
  {
    name: 'SoundCloud',
    desc: 'Bootlegs and exclusive mixes',
    href: 'https://soundcloud.com',
    squareBg: '#FF5500',
    iconPath:
      'M1.175 12.225c-.016 0-.023.011-.029.027l-.314 2.223.314 2.18c.006.016.013.027.029.027.015 0 .023-.011.029-.027l.356-2.18-.356-2.223c-.006-.016-.014-.027-.029-.027zm.554-.37c-.018 0-.028.013-.033.031l-.267 2.593.267 2.509c.005.018.015.031.033.031.017 0 .027-.013.033-.031l.303-2.509-.303-2.593c-.006-.018-.016-.031-.033-.031zm9.484-4.458c-.33 0-.645.066-.94.186C9.564 5.28 7.696 3.5 5.4 3.5c-1.004 0-1.921.341-2.653.903-.295.229-.372.461-.375.686v8.287c.003.233.184.424.416.441h7.948c.227-.017.408-.197.416-.441V7.507c-.136-2.411-2.095-4.347-4.42-4.347z',
  },
  {
    name: 'YouTube',
    desc: 'Visual releases and sessions',
    href: 'https://youtube.com',
    squareBg: '#FF0000',
    iconPath:
      'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
  {
    name: 'Beatport',
    desc: 'Electronic music charts',
    href: 'https://beatport.com',
    squareBg: '#01FF95',
    iconPath:
      'M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.707 17.172a5.17 5.17 0 01-5.172-5.172 5.17 5.17 0 015.172-5.172 5.17 5.17 0 015.172 5.172 5.17 5.17 0 01-5.172 5.172zm0-8.276a3.104 3.104 0 100 6.208 3.104 3.104 0 000-6.208z',
  },
  {
    name: 'Tidal',
    desc: 'High-fidelity streaming',
    href: 'https://tidal.com',
    squareBg: '#000000',
    iconPath:
      'M12.012 3.992L8.008 7.996 4.004 3.992 0 7.996l4.004 4.004L8.008 7.996l4.004 4.004 4.004-4.004L12.012 3.992zm4.008 4.004l-4.004 4.004 4.004 4.004L20.024 12 16.02 7.996zm-8.016 4.004L3.998 16.004 8.004 20.01l4.004-4.006-4.004-4.004z',
  },
  {
    name: 'Amazon Music',
    desc: 'Voice and HD streaming',
    href: 'https://music.amazon.com',
    squareBg: '#25D1DA',
    iconPath:
      'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-5l4.5 2.5L11 16.5z',
  },
  {
    name: 'Deezer',
    desc: 'Global catalog reach',
    href: 'https://deezer.com',
    squareBg: '#A238FF',
    iconPath:
      'M18 4h3v16h-3V4zm-5 4h3v12h-3V8zm-5 4h3v8H8v-8zm-5 4h3v4H3v-4z',
  },
  {
    name: 'Bandcamp',
    desc: 'Direct fan support',
    href: 'https://bandcamp.com',
    squareBg: '#1DA0C3',
    iconPath:
      'M6 18L18 6H13.5L6 13.5V18zm0-12L18 18h-4.5L6 10.5V6z',
  },
  {
    name: 'YouTube Music',
    desc: 'YouTube Music streaming',
    href: 'https://music.youtube.com',
    squareBg: '#FF0000',
    iconPath:
      'M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm-2 16.5v-9l7 4.5-7 4.5z',
  },
  {
    name: 'Pandora',
    desc: 'Internet radio',
    href: 'https://pandora.com',
    squareBg: '#3668FF',
    iconPath:
      'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.85 0 3.58-.5 5.06-1.38L12 12l5.06-1.38A9.96 9.96 0 0022 12c0-5.52-4.48-10-10-10zm1 14H9V8h4c1.66 0 3 1.34 3 3s-1.34 3-3 3z',
  },
  {
    name: 'iHeartRadio',
    desc: 'Live radio and podcasts',
    href: 'https://iheart.com',
    squareBg: '#C6002B',
    iconPath:
      'M12 2a10 10 0 100 20A10 10 0 0012 2zm-1 14V8l6 4-6 4z',
  },
  {
    name: 'Napster',
    desc: 'Music streaming',
    href: 'https://napster.com',
    squareBg: '#1CAAD9',
    iconPath:
      'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
  },
  {
    name: 'Audiomack',
    desc: 'Free music uploads',
    href: 'https://audiomack.com',
    squareBg: '#FFA200',
    iconPath:
      'M12 3a9 9 0 100 18A9 9 0 0012 3zm-1 13V8l7 4-7 4z',
  },
  {
    name: 'Qobuz',
    desc: 'Hi-res music streaming',
    href: 'https://qobuz.com',
    squareBg: '#00AEEF',
    iconPath:
      'M12 2a10 10 0 100 20 10 10 0 000-20zm0 4a4 4 0 110 8 4 4 0 010-8zm0 10c1.1 0 2.1-.3 3-.8l3 3-1.4 1.4-3-3A5.9 5.9 0 0112 18z',
  },
  {
    name: 'Boomplay',
    desc: 'African music platform',
    href: 'https://boomplay.com',
    squareBg: '#86C232',
    iconPath:
      'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14V8l6 4-6 4z',
  },
  {
    name: 'Anghami',
    desc: 'Middle East streaming',
    href: 'https://anghami.com',
    squareBg: '#F73F52',
    iconPath:
      'M12 2a10 10 0 100 20 10 10 0 000-20zm1 5a3 3 0 00-3 3v6H8v-6a5 5 0 1110 0v4h-2v-4a3 3 0 00-3-3z',
  },
  {
    name: 'KKBOX',
    desc: 'Asian music streaming',
    href: 'https://kkbox.com',
    squareBg: '#00C300',
    iconPath:
      'M12 2a10 10 0 100 20 10 10 0 000-20zm-2 6l6 4-6 4V8z',
  },
  {
    name: 'JioSaavn',
    desc: 'Indian music catalog',
    href: 'https://jiosaavn.com',
    squareBg: '#2BC5B4',
    iconPath:
      'M12 2a10 10 0 100 20 10 10 0 000-20zm1 4v7.2a2.8 2.8 0 11-2-2.68V7l5-1v6.2a2.8 2.8 0 11-2-2.68V6z',
  },
  {
    name: 'Gaana',
    desc: 'India streaming and radio',
    href: 'https://gaana.com',
    squareBg: '#E72C30',
    iconPath:
      'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14V8l6 4-6 4z',
  },
  {
    name: 'Tencent Music',
    desc: 'China music ecosystem',
    href: 'https://tme.com',
    squareBg: '#1E88E5',
    iconPath:
      'M12 2a10 10 0 100 20 10 10 0 000-20zm-2 14V8l7 4-7 4z',
  },
  {
    name: 'Joox',
    desc: 'Streaming across Asia',
    href: 'https://joox.com',
    squareBg: '#00B8A9',
    iconPath:
      'M12 2a10 10 0 100 20 10 10 0 000-20zm0 4a4 4 0 014 4v4a4 4 0 11-8 0V8h2v6a2 2 0 104 0v-4a2 2 0 10-4 0H8a4 4 0 014-4z',
  },
  {
    name: 'Mixcloud',
    desc: 'Radio shows and DJ mixes',
    href: 'https://mixcloud.com',
    squareBg: '#5000FF',
    iconPath:
      'M7 15a3 3 0 010-6 4.5 4.5 0 018.72 1.5A2.75 2.75 0 1116.5 16H7z',
  },
  {
    name: 'Shazam',
    desc: 'Music discovery links',
    href: 'https://shazam.com',
    squareBg: '#0088FF',
    iconPath:
      'M13.2 2L6.6 8.4h4L4 15l6.6-6.4h-4L13.2 2zm-2.4 20l6.6-6.4h-4L20 9l-6.6 6.4h4L10.8 22z',
  },
  {
    name: 'Last.fm',
    desc: 'Scrobbling and discovery',
    href: 'https://last.fm',
    squareBg: '#D51007',
    iconPath:
      'M17.6 17.2l-.8-2.2c-.3.4-.9.7-1.6.7-1 0-1.7-.5-2.1-1.7l-.4-1.2c-.5-1.5-1.5-2.1-3-2.1-1.8 0-3 1.1-3 2.9 0 1.7 1.1 2.8 2.9 2.8 1.2 0 2-.6 2.4-1.4l.8 2.2c-.7.7-1.8 1.2-3.2 1.2-2.9 0-4.9-1.8-4.9-4.8 0-3 2.1-4.8 5.1-4.8 2.6 0 4 1.2 4.8 3.5l.4 1.2c.2.6.5.9 1 .9.4 0 .7-.2.9-.5l-.8-2.1h2.2l1.8 4.9h-2.5z',
  },
  {
    name: 'TikTok Music',
    desc: 'Short-form music discovery',
    href: 'https://music.tiktok.com',
    squareBg: '#111111',
    iconPath:
      'M14 3c.4 1.6 1.6 2.9 3 3.6V9a6.4 6.4 0 01-3-1v5.2A4.8 4.8 0 119.2 8h1.6v2.4H9.2a2.4 2.4 0 102.4 2.4V3H14z',
  },
]

/** First 9 platforms , one per gap between letters in "everywhere" */
export const everywherePlatforms = platforms.slice(0, 9)
