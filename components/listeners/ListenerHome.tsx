'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowUpRight, ArrowRight, Play, Pause, X, InstagramLogo, TelegramLogo, TiktokLogo, DiscordLogo } from '@phosphor-icons/react/dist/ssr'
import { catalogReleases, type CatalogRelease } from '@/components/data/catalog'
import { catalogReleasePath } from '@/lib/catalogLinks'
import { catalogReturnRequested, consumeCatalogReturn } from '@/lib/catalogReturn'

const EASE = [.16, 1, .3, 1] as const
const picks = ['SUPERSTAR','HESITATE','u-think-its-over?']
const moods = [
  { name: 'All sounds', slugs: [] as string[] },
  { name: 'Energetic', slugs: ['SUPERSTAR','HESITATE','Step-Back', 'Creepers', 'NAO-BANGER'] },
  { name: 'Vibe', slugs: ['Ela-na-Sera','u-think-its-over?'] },
  { name: 'Dark', slugs: ['Naivety', 'Creepers' ] },
]
const artists = [
  { name: 'Hiderest', sound: 'trap, Hardtekk, memphis', cover: 'Naivety' },
  { name: 'FXRNVN', sound: 'Best of EDM, bass house and other bass music', cover: 'HESITATE' },
  { name: 'LaughingSkxll', sound: 'Heaviest metal beats with real guitar layers', cover: 'Step-Back' },
  { name: 's._a._t._e._n', sound: 'heavy sceam vocals mixed with everything electronic', cover: 'Step-Back' },
  { name: 'DJ NXW', sound: 'Br funk stuff', cover: 'NAO-BANGER' },
  { name: 'Malik Amer', sound: 'Impressive pop songs with live instrumentation', cover: 'Hit-and-Run' },
]
const releaseLink = (release: CatalogRelease) => catalogReleasePath(release.slug)

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion()
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ duration: .8, ease: EASE }}>{children}</motion.div>
}

// Scroll values stay outside React state so masks and depth track the viewport directly.
function ScrollTitle({ lines, id, hero = false }: { lines: string[]; id?: string; hero?: boolean }) {
  const ref = useRef<HTMLHeadingElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 92%', 'start 46%'] })
  const y = useTransform(scrollYProgress, [0, 1], ['110%', '0%'])
  const Heading = hero ? motion.h1 : motion.h2
  return <Heading ref={ref} id={id} className="listener-title">
    {lines.map((line, index) => <span className="listener-title__mask" key={line}>
      <motion.span className="listener-title__line" style={hero || reduced ? undefined : { y }}
        initial={hero && !reduced ? { y: '110%' } : false}
        animate={hero ? { y: '0%' } : undefined}
        transition={{ duration: 1.25, delay: index * .12, ease: [.65, 0, .35, 1] }}>{line}</motion.span>
    </span>)}
  </Heading>
}

function SleeveStack() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [55, -55])
  const rotate = useTransform(scrollYProgress, [0, 1], [-8, 8])
  return <motion.div ref={ref} className="listener-belief__sleeves" aria-hidden="true" style={reduced ? undefined : { y, rotate }}>
    {picks.map((slug, index) => { const track = catalogReleases.find(item => item.slug === slug)!; return <motion.img
      key={slug} src={track.artwork} alt="" loading="lazy" width={260} height={260}
      initial={reduced ? false : { rotate: 0, scale: .88 }} whileInView={{ rotate: [-13, 7, -4][index], scale: 1 }}
      viewport={{ once: true, amount: .3 }} transition={{ duration: 1.3, delay: index * .1, ease: EASE }} /> })}
  </motion.div>
}

function SoundRequest() {
  const [status, setStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'sending') return
    const data = new FormData(event.currentTarget)
    setStatus('sending'); setError('')
    try {
      const response = await fetch('/api/listener-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, email: data.get('email') || '', website: data.get('website') || '' }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to send. Please try again.')
      setStatus('sent')
    } catch (reason) { setStatus('error'); setError(reason instanceof Error ? reason.message : 'Unable to send.') }
  }
  return <section id="your-sound" className="listener-request l-section l-shell">
    <Reveal className="listener-request__intro"><ScrollTitle lines={["What’s missing", "from your rotation?"]} />
      <p>A sound you’re chasing. A genre we should explore. Tell us what you want to hear next.</p>
      <a href="/for-artists#demo">Made something yourself? Send a demo <ArrowUpRight /></a>
    </Reveal>
    <Reveal className="listener-request__form">
      {status === 'sent' ? <div className="listener-request__sent" role="status"><h3>We’re listening.</h3><p>Your suggestion is with the label. Thanks for helping shape what comes next.</p><button onClick={() => { setStatus('idle'); setMessage('') }}>Send another idea <ArrowRight /></button></div> :
        <form onSubmit={submit}>
          <label htmlFor="listener-message">The sound you want to hear</label>
          <textarea id="listener-message" name="message" rows={4} minLength={8} maxLength={1600} required value={message}
            onChange={event => setMessage(event.target.value)} placeholder="More distorted bass? Something for the late train home?" disabled={status === 'sending'} />
          <label htmlFor="listener-email">Your email <span>Optional, if you’d like a reply</span></label>
          <input id="listener-email" name="email" type="email" autoComplete="email" maxLength={254} placeholder="you@example.com" disabled={status === 'sending'} />
          <div className="listener-trap" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          {error && <p role="alert" className="listener-form-error">{error} You can also email <a href="mailto:info@uwbelieve.com">info@uwbelieve.com</a>.</p>}
          <button className="l-button l-button--light" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send your sound'}<ArrowUpRight /></button>
          <small>Your message goes to the label. Your email is only used to reply.</small>
        </form>}
    </Reveal>
  </section>
}

export function ListenerHome() {
  const reduced = useReducedMotion()
  const [mood, setMood] = useState(0)
  const [artist, setArtist] = useState<string | null>(null)
  const [current, setCurrent] = useState<CatalogRelease | null>(null)
  const [playing, setPlaying] = useState(false)
  const [audioError, setAudioError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const audio = useRef<HTMLAudioElement>(null)
  const playRequest = useRef(0)
  const heroTrack = catalogReleases.find(item => item.slug === 'SUPERSTAR') || catalogReleases[0]
  const filtered = catalogReleases.filter(item => artist ? item.artist.split(',').map(name => name.trim()).includes(artist) : !mood || moods[mood].slugs.includes(item.slug))

  useEffect(() => {
    if (catalogReturnRequested()) {
      consumeCatalogReturn()
      requestAnimationFrame(() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'instant' }))
    }
    const element = audio.current
    const requestTracker = playRequest
    return () => { requestTracker.current++; element?.pause() }
  }, [])

  async function preview(release: CatalogRelease) {
    const element = audio.current
    if (!element || !release.audioUrl) return
    if (current?.slug === release.slug && !element.paused) {
      playRequest.current++; element.pause(); setPlaying(false); return
    }
    const request = ++playRequest.current
    setAudioError(''); setCurrent(release)
    if (current?.slug !== release.slug) { element.src = release.audioUrl; element.volume = .7 }
    try { await element.play(); if (playRequest.current === request) setPlaying(true) }
    catch { if (playRequest.current === request) { setPlaying(false); setAudioError('Audio is unavailable right now. Open the release to try again.') } }
  }
  const closePlayer = () => { playRequest.current++; audio.current?.pause(); audio.current?.removeAttribute('src'); audio.current?.load(); setCurrent(null); setPlaying(false) }
  const goArtist = (name: string) => { setArtist(name); setMood(0) }

  return <main className="listener-page" id="listener-top">
    <a className="listener-skip" href="#catalog">Skip to the music</a>
    <header className="listener-nav l-shell">
      <Link className="l-brand" href="/">uwbelieve<span>.</span></Link>
      <nav id="listener-navigation" aria-label="Listener navigation" className={menuOpen ? 'listener-nav__links is-open' : 'listener-nav__links'}>
        <a href="#discover" onClick={() => setMenuOpen(false)}>The artists</a>
        <a href="#catalog" onClick={() => setMenuOpen(false)}>The music</a>
        <a href="#community" onClick={() => setMenuOpen(false)}>The community</a>
        <Link href="/for-artists" className="listener-nav__artist">For artists <ArrowUpRight /></Link>
      </nav>
      <button className="listener-nav__toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="listener-navigation" onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X /> : <span>Menu</span>}</button>
    </header>

    <section className="listener-hero l-shell" aria-labelledby="listener-hero-title">
      <div className="listener-hero__image"><Image src="/images/listener-speaker.webp" alt="" fill priority sizes="100vw" /></div>
      <motion.div className="listener-hero__copy" initial={reduced ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE }}>
        <ScrollTitle hero id="listener-hero-title" lines={["You won’t", "believe."]} />
        <p>New artists. Unexpected sounds.<br />Your next favourite record is in here.</p>
        <a className="l-button l-button--light" href="#catalog">Find your next track <ArrowUpRight /></a>
      </motion.div>
      <motion.button className="listener-hero__pick" type="button" onClick={() => void preview(heroTrack)} disabled={!heroTrack.audioUrl}
        initial={reduced ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .3, ease: EASE }}
        aria-label={`${current?.slug === heroTrack.slug && playing ? 'Pause' : 'Play'} ${heroTrack.title} preview`}>
        <Image unoptimized src={heroTrack.artwork} alt={`${heroTrack.title} artwork`} width={72} height={72} />
        <span><small>Start with this one</small><strong>{heroTrack.title}</strong><span>{heroTrack.artist}</span></span>
        {current?.slug === heroTrack.slug && playing ? <Pause weight="fill" /> : <Play weight="fill" />}
      </motion.button>
    </section>

    <section id="discover" className="listener-discover l-section l-shell">
      <Reveal><ScrollTitle lines={["Different artists.", "Same instinct."]} /><p className="l-lede">A good record makes you feel something. Meet the people making ours.</p></Reveal>
      <div className="listener-artists">
        {artists.map(item => { const release = catalogReleases.find(track => track.slug === item.cover)!; return <Reveal key={item.name}>
          <a href="#catalog" onClick={() => goArtist(item.name)} className="listener-artist">
            <Image unoptimized src={release.artwork} alt="" width={90} height={90} loading="lazy" />
            <h3>{item.name}</h3><span>{item.sound}</span><ArrowUpRight aria-hidden="true" />
          </a></Reveal> })}
      </div>
    </section>

    <section className="listener-belief l-section l-shell">
      <Reveal><p className="listener-belief__opening">Not made to fit in.</p><ScrollTitle lines={["Good songs", "deserve to be", "heard."]} />
        <p className="listener-belief__body">From hardtekk and Brazilian funk to heavy bass and late-night beats. We follow the record, wherever it takes us.</p>
        <a className="l-text-link" href="#catalog">Hear what we mean <ArrowRight /></a>
      </Reveal>
      <SleeveStack />
    </section>

    <section id="catalog" className="listener-catalog l-section l-shell">
      <Reveal><div className="listener-catalog__heading"><ScrollTitle lines={["Find your", "new repeat."]} /><a className="l-text-link" href="/playlists">Or take the playlist route <ArrowUpRight /></a></div></Reveal>
      <div className="listener-catalog__filters" aria-label="Filter releases">
        {moods.map((item,index)=><button type="button" key={item.name} aria-pressed={!artist && mood===index} onClick={()=>{setMood(index);setArtist(null)}}>{item.name}</button>)}
        {artist && <button type="button" className="listener-catalog__artist-filter" onClick={()=>setArtist(null)} aria-label={`Clear ${artist} filter`}>{artist}<X /></button>}
      </div>
      <div className="listener-records">
        {filtered.map((release,index)=><motion.article key={release.slug} className="listener-record" initial={reduced ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ duration: .6, delay: Math.min(index%4*.05,.15), ease: EASE }}>
          <div className="listener-record__sleeve">
            <Link href={releaseLink(release)} prefetch={false} aria-label={`Open ${release.title} by ${release.artist}`}><Image unoptimized src={release.artwork} alt={`${release.title} cover`} width={500} height={500} loading="lazy" /></Link>
            {release.audioUrl && <button type="button" onClick={()=>void preview(release)} aria-label={`${current?.slug===release.slug && playing ? 'Pause' : 'Play'} ${release.title} preview`}>{current?.slug===release.slug && playing ? <Pause weight="fill" /> : <Play weight="fill" />}</button>}
          </div>
          <Link className="listener-record__name" href={releaseLink(release)} prefetch={false}><h3>{release.title}</h3><ArrowUpRight aria-hidden="true" /></Link><p>{release.artist}</p>
        </motion.article>)}
      </div>
      {!filtered.length && <p className="l-lede">No releases in this selection yet. Try another sound.</p>}
    </section>

    <SoundRequest />

    <section id="community" className="listener-community l-section l-shell">
      <Reveal><ScrollTitle lines={["Good taste.", "Better company."]} /><p className="l-lede">New releases, shared discoveries and people who get it. Come hang out.</p></Reveal>
      <div className="listener-community__links">
        <a href="https://discord.gg/pt8V9prdd" target="_blank" rel="noopener noreferrer"><DiscordLogo /><span>Join us on Discord</span><ArrowUpRight /></a>
        <a href="https://instagram.com/uwbelieve_records" target="_blank" rel="noopener noreferrer"><InstagramLogo /><span>Follow on Instagram</span><ArrowUpRight /></a>
      </div>
    </section>
    <footer className="listener-footer l-shell"><Link className="l-brand" href="/">uwbelieve<span>.</span></Link><p>Independent music. Open ears.</p><nav aria-label="Footer"><a href="/for-artists">For artists</a><a href="https://artists.uwbelieve.com">Artist login</a><a href="mailto:info@uwbelieve.com">Say hello</a></nav><small>© {new Date().getFullYear()} uwbelieve</small></footer>
    <audio ref={audio} preload="none" onEnded={()=>setPlaying(false)} onError={()=>{setPlaying(false);setAudioError('Unable to load the audio. Open the release to try again.')}} />
    {current && <aside className="listener-now" aria-label="Now playing"><Image unoptimized src={current.artwork} alt="" width={44} height={44} /><div><strong>{current.title}</strong><span>{audioError || current.artist}</span></div><button type="button" onClick={()=>void preview(current)} aria-label={playing ? 'Pause preview' : 'Resume preview'}>{playing ? <Pause weight="fill" /> : <Play weight="fill" />}</button><Link href={releaseLink(current)} prefetch={false} aria-label="Open full record"><ArrowUpRight /></Link><button type="button" aria-label="Close audio player" onClick={closePlayer}><X /></button></aside>}
  </main>
}
