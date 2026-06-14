'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from '@phosphor-icons/react'

const platforms = [
  {
    name: 'Spotify',
    desc: 'Stream our full catalog',
    href: 'https://spotify.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
    ),
  },
  {
    name: 'Apple Music',
    desc: 'Lossless and Spatial Audio',
    href: 'https://music.apple.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
        <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026C4.786.07 4.043.15 3.34.428 2.004.958 1.04 1.88.475 3.208c-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.802.42.127.848.187 1.286.218.476.035.952.05 1.43.05h11.5c.452 0 .903-.017 1.353-.049.745-.053 1.479-.166 2.163-.487 1.225-.57 2.112-1.47 2.656-2.705.247-.563.364-1.16.435-1.766.067-.57.079-1.146.088-1.72.003-.062.01-.124.013-.185V6.35c-.013-.076-.02-.15-.025-.227zM17.5 9.8v5.064c0 .54-.054 1.076-.31 1.57-.396.76-1.006 1.22-1.853 1.37-.406.07-.617.112-.617.112-.955.012-1.795-.657-1.98-1.6a1.98 1.98 0 011.59-2.323c.376-.073.745-.124 1.12-.177.418-.06.622-.27.622-.694V8.076c0-.485.272-.757.752-.684l2.403.39c.41.065.672.345.672.764V9.8z" />
      </svg>
    ),
  },
  {
    name: 'SoundCloud',
    desc: 'Bootlegs and exclusive mixes',
    href: 'https://soundcloud.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
        <path d="M1.175 12.225c-.016 0-.023.011-.029.027l-.314 2.223.314 2.18c.006.016.013.027.029.027.015 0 .023-.011.029-.027l.356-2.18-.356-2.223c-.006-.016-.014-.027-.029-.027zm.554-.37c-.018 0-.028.013-.033.031l-.267 2.593.267 2.509c.005.018.015.031.033.031.017 0 .027-.013.033-.031l.303-2.509-.303-2.593c-.006-.018-.016-.031-.033-.031zm.586-.155c-.021 0-.033.015-.038.037l-.221 2.748.221 2.651c.005.022.017.037.038.037.02 0 .033-.015.038-.037l.251-2.651-.251-2.748c-.005-.022-.018-.037-.038-.037zm.592.07c-.023 0-.038.017-.043.041l-.178 2.678.178 2.579c.005.024.02.041.043.041.023 0 .038-.017.043-.041l.203-2.579-.203-2.678c-.005-.024-.02-.041-.043-.041zm.603-.12c-.026 0-.042.019-.047.046l-.136 2.798.136 2.695c.005.027.021.046.047.046.026 0 .042-.019.047-.046l.155-2.695-.155-2.798c-.005-.027-.021-.046-.047-.046zm9.194-4.803c-.33 0-.645.066-.94.186C11.564 5.28 9.696 3.5 7.4 3.5c-1.004 0-1.921.341-2.653.903-.295.229-.372.461-.375.686v8.287c.003.233.184.424.416.441h7.948c.227-.017.408-.197.416-.441V7.507c-.136-2.411-2.095-4.347-4.42-4.347z" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    desc: 'Visual releases and sessions',
    href: 'https://youtube.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: 'Beatport',
    desc: 'Electronic music charts',
    href: 'https://beatport.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.707 17.172a5.17 5.17 0 01-5.172-5.172 5.17 5.17 0 015.172-5.172 5.17 5.17 0 015.172 5.172 5.17 5.17 0 01-5.172 5.172zm0-8.276a3.104 3.104 0 100 6.208 3.104 3.104 0 000-6.208z" />
      </svg>
    ),
  },
  {
    name: 'Tidal',
    desc: 'High-fidelity streaming',
    href: 'https://tidal.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
        <path d="M12.012 3.992L8.008 7.996 4.004 3.992 0 7.996l4.004 4.004L8.008 7.996l4.004 4.004 4.004-4.004L12.012 3.992zm4.008 4.004l-4.004 4.004 4.004 4.004L20.024 12 16.02 7.996zm-8.016 4.004L3.998 16.004 8.004 20.01l4.004-4.006-4.004-4.004z" />
      </svg>
    ),
  },
]

export function PlatformsSection() {
  return (
    <section
      id="platforms"
      className="border-t border-white/[0.06] py-24 md:py-32"
      aria-label="Streaming platforms"
    >
      <div className="section-shell">
        <div className="flex flex-col md:flex-row md:items-start md:gap-16">
          {/* Left: heading */}
          <motion.div
            className="mb-10 md:mb-0 md:w-56 md:shrink-0"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="label-caps mb-3">Distribution</p>
            <h2
              className="font-extralight tracking-[-0.04em] text-white"
              style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', lineHeight: 1.15 }}
            >
              Everywhere
              <br />your audience is.
            </h2>
            <p className="mt-4 text-[13px] leading-6 text-white/38">
              We distribute your music to all major platforms simultaneously.
            </p>
          </motion.div>

          {/* Right: platform rows */}
          <div className="flex-1 min-w-0">
            {platforms.map((platform, index) => (
              <motion.a
                key={platform.name}
                href={platform.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 border-b border-white/[0.06] py-4 transition-colors duration-200 hover:bg-white/[0.02]"
                style={{ textDecoration: 'none', marginInline: '-12px', paddingInline: '12px', borderRadius: '8px' }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: index * 0.05 + 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/50 transition-colors group-hover:text-white/80">
                  {platform.icon}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[13px] font-medium text-white/80 transition-colors group-hover:text-white">
                    {platform.name}
                  </span>
                  <span className="block text-[11px] text-white/35">{platform.desc}</span>
                </span>
                <ArrowUpRight
                  size={14}
                  weight="regular"
                  className="shrink-0 text-white/20 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#7fb0ff]/60"
                />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
