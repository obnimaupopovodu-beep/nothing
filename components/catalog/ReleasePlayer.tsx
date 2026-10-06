'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { SpeakerHigh, SpeakerSlash, Play, Pause } from '@phosphor-icons/react/dist/ssr'
import type { CatalogRelease } from '@/components/data/catalog'

export const VINYL_CONFIG = { rpm: 16, secondsPerTurn: 10, wheelSecondsPerPixel: .025, fadeSeconds: .65, volume: .7 }
type Phase = 'idle' | 'loading' | 'playing' | 'paused' | 'stopping' | 'error'
const timeLabel = (time: number) => `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}`
const bound = (n: number, max: number) => Math.max(0, Math.min(max, n))

export function ReleasePlayer({ release }: { release: CatalogRelease }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const spinRef = useRef<HTMLDivElement>(null)
  const vinylRef = useRef<HTMLDivElement>(null)
  const seekRef = useRef<(delta: number) => void>(() => {})
  const timelineTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const contextRef = useRef<AudioContext | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intent = useRef(0)
  const pauseToggleRef = useRef<() => void>(() => {})
  const resumePending = useRef(false)
  const rotation = useRef(0)
  const spinSpeed = useRef(0)
  const drag = useRef<{ id: number; angle: number; x: number; y: number } | null>(null)
  const phaseRef = useRef<Phase>('idle')
  const volumeRef = useRef(VINYL_CONFIG.volume)
  const lastVolume = useRef(VINYL_CONFIG.volume)
  const [phase, setPhase] = useState<Phase>('idle')
  const [volume, setVolume] = useState(VINYL_CONFIG.volume)
  const [duration, setDuration] = useState(0)
  const [position, setPosition] = useState(0)
  const [scrubbing, setScrubbing] = useState(false)
  const [error, setError] = useState('')
  const [timelineVisible, setTimelineVisible] = useState(false)
  const reduced = Boolean(useReducedMotion())
  const engaged = ['loading', 'playing', 'paused'].includes(phase)
  const recordVisible = phase === 'playing' || phase === 'paused'
  const available = Boolean(release.audioUrl)
  const transition = { duration: reduced ? 0 : .85, ease: [.65, 0, .25, 1] as const }

  function changePhase(next: Phase) {
    phaseRef.current = next; setPhase(next)
    if (!['playing', 'paused', 'loading'].includes(next)) {
      setTimelineVisible(false)
      if (timelineTimer.current) clearTimeout(timelineTimer.current)
    }
  }
  function revealTimeline() {
    setTimelineVisible(true)
    if (timelineTimer.current) clearTimeout(timelineTimer.current)
    timelineTimer.current = setTimeout(() => {
      if (!drag.current) setTimelineVisible(false)
    }, 1000)
  }
  function fade(target: number, seconds = VINYL_CONFIG.fadeSeconds) {
    const gain = gainRef.current, context = contextRef.current
    if (!gain || !context) return
    const now = context.currentTime, current = gain.gain.value
    if (typeof gain.gain.cancelAndHoldAtTime === 'function') gain.gain.cancelAndHoldAtTime(now)
    else { gain.gain.cancelScheduledValues(now); gain.gain.setValueAtTime(current, now) }
    gain.gain.linearRampToValueAtTime(target, now + seconds)
  }
  async function toggle() {
    const audio = audioRef.current
    if (!available || !audio || phaseRef.current === 'stopping') return
    if (['playing', 'paused', 'loading'].includes(phaseRef.current)) {
      intent.current++; changePhase('stopping'); fade(0)
      stopTimer.current = setTimeout(() => {
        audio.pause(); audio.currentTime = 0; setPosition(0); changePhase('idle'); stopTimer.current = null
      }, VINYL_CONFIG.fadeSeconds * 1000)
      return
    }
    const request = ++intent.current
    if (phaseRef.current === 'error') audio.load()
    setError(''); changePhase('loading')
    try {
      if (!contextRef.current) {
        const context = new AudioContext(), gain = context.createGain()
        context.createMediaElementSource(audio).connect(gain); gain.connect(context.destination)
        contextRef.current = context; gainRef.current = gain
      }
      fade(0, 0)
      // Both calls originate in the user's click, including on mobile Safari.
      await Promise.all([contextRef.current.resume(), audio.play()])
      if (intent.current !== request) return
      changePhase('playing'); fade(volumeRef.current)
    } catch {
      if (intent.current !== request) return
      audio.pause(); changePhase('error'); setError('Unable to play this track. Tap the cover to try again.')
    }
  }
  async function togglePause() {
    const audio = audioRef.current
    if (!audio || resumePending.current) return
    if (phaseRef.current === 'playing') {
      intent.current++
      audio.pause()
      spinSpeed.current = 0
      changePhase('paused')
      setPosition(audio.currentTime)
      return
    }
    if (phaseRef.current !== 'paused') return
    const request = ++intent.current
    resumePending.current = true
    try {
      await Promise.all([contextRef.current?.resume(), audio.play()])
      if (intent.current === request) {
        setError('')
        changePhase('playing')
        fade(volumeRef.current, .12)
      }
    } catch {
      if (intent.current === request) {
        audio.pause()
        setError('Unable to resume. Press Space to try again.')
      }
    } finally { resumePending.current = false }
  }
  pauseToggleRef.current = () => { void togglePause() }
  function seek(delta: number) {
    const audio = audioRef.current
    if (!audio || !Number.isFinite(audio.duration)) return
    audio.currentTime = bound(audio.currentTime + delta, audio.duration)
    setPosition(audio.currentTime)
    revealTimeline()
  }
  seekRef.current = seek
  function endDrag() {
    if (!drag.current) return
    drag.current = null; setScrubbing(false); revealTimeline()
    if (phaseRef.current === 'playing') fade(volumeRef.current, .12)
  }
  function changeVolume(next: number) {
    volumeRef.current = next; setVolume(next)
    if (next > 0) lastVolume.current = next
    if (phaseRef.current === 'playing') fade(drag.current ? next * .2 : next, .08)
  }
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.defaultPrevented) return
      const target = event.target instanceof Element ? event.target : null
      if (target?.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return
      // The cover retains keyboard stop via Enter; Space always pauses playback.
      if (target?.closest('a, button, [role="button"]') && !target.closest('.release-player__cover')) return
      if (!['playing','paused'].includes(phaseRef.current)) {
        if (target?.closest('.release-player__cover') && ['loading','stopping'].includes(phaseRef.current)) event.preventDefault()
        return
      }
      event.preventDefault()
      pauseToggleRef.current()
    }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  }, [])
  useEffect(() => {
    const vinyl = vinylRef.current
    if (!vinyl) return
    const wheel = (event: WheelEvent) => {
      if (!['playing','paused'].includes(phaseRef.current) || event.ctrlKey || event.metaKey) return
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      if (!delta) return
      event.preventDefault()
      event.stopPropagation()
      const pixels = delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? vinyl.clientHeight : 1)
      // Clamp exceptional wheel bursts, retaining both gesture directions.
      const seconds = Math.max(-5, Math.min(5, pixels * VINYL_CONFIG.wheelSecondsPerPixel))
      seekRef.current(seconds)
      rotation.current += seconds / VINYL_CONFIG.secondsPerTurn * 360
      if (spinRef.current) spinRef.current.style.transform = `rotate(${rotation.current}deg)`
    }
    vinyl.addEventListener('wheel', wheel, { passive: false })
    return () => vinyl.removeEventListener('wheel', wheel)
  }, [])
  useEffect(() => {
    if (!['playing', 'stopping'].includes(phase) || reduced) return
    let frame = 0, last = 0
    const spin = (now: number) => {
      const audio = audioRef.current
      const seconds = last ? Math.min((now - last) / 1000, .05) : 0; last = now
      const running = phaseRef.current === 'playing' && audio && !audio.paused && !audio.seeking && audio.readyState >= 3
      spinSpeed.current += ((running ? VINYL_CONFIG.rpm * 6 : 0) - spinSpeed.current) * (1 - Math.exp(-seconds * 8))
      if (!drag.current) {
        rotation.current += seconds * spinSpeed.current
        if (spinRef.current) spinRef.current.style.transform = `rotate(${rotation.current}deg)`
      }
      frame = requestAnimationFrame(spin)
    }
    frame = requestAnimationFrame(spin)
    return () => cancelAnimationFrame(frame)
  }, [phase, reduced])
  useEffect(() => {
    const audio = audioRef.current
    return () => {
      intent.current++
      if (stopTimer.current) clearTimeout(stopTimer.current)
      if (timelineTimer.current) clearTimeout(timelineTimer.current)
      audio?.pause()
      if (contextRef.current) void contextRef.current.close()
    }
  }, [])

  return <>
    <div className="catalog-detail__backdrop" aria-hidden="true"><img src={release.artwork} alt="" /></div>
    <div className={`release-player ${engaged ? 'is-playing' : ''}`}>
      <motion.div className="release-player__timeline" aria-hidden="true" initial={false}
        animate={{ opacity: timelineVisible ? .7 : 0, y: timelineVisible ? 0 : -6 }}
        transition={{ duration: reduced ? 0 : .3 }}>
        <div className="release-player__timeline-times"><span>{timeLabel(position)}</span><span>{timeLabel(duration)}</span></div>
        <div className="release-player__timeline-track"><div style={{ transform: `scaleX(${duration ? position / duration : 0})` }} /></div>
      </motion.div>
      <div className="release-player__media">
        <motion.div className="release-player__disc" initial={false}
          animate={{ x: recordVisible ? '0%' : '-36%', opacity: recordVisible ? 1 : 0 }} transition={transition}>
          <div ref={vinylRef} className={`release-player__vinyl ${scrubbing ? 'is-scrubbing' : ''}`} role="slider"
            tabIndex={recordVisible ? 0 : -1} aria-label="Rotate the record to seek. Clockwise moves forward."
            aria-valuemin={0} aria-valuemax={Math.round(duration)} aria-valuenow={Math.round(position)}
            aria-valuetext={`${timeLabel(position)} of ${timeLabel(duration)}`} aria-orientation="horizontal"
            aria-disabled={!recordVisible}
            onKeyDown={event => {
              if (!recordVisible) return
              if (['ArrowRight','ArrowUp','ArrowLeft','ArrowDown','Home','End'].includes(event.key)) {
                event.preventDefault()
                if (event.key === 'Home') seek(-duration)
                else if (event.key === 'End') seek(duration)
                else seek(['ArrowRight','ArrowUp'].includes(event.key) ? 5 : -5)
              }
            }}
            onPointerDown={event => {
              if (!recordVisible || event.button !== 0) return
              const rect = event.currentTarget.getBoundingClientRect(), x = rect.left + rect.width / 2, y = rect.top + rect.height / 2
              if (Math.hypot(event.clientX-x,event.clientY-y) < rect.width * .13) return
              event.currentTarget.setPointerCapture(event.pointerId)
              drag.current = { id: event.pointerId, angle: Math.atan2(event.clientY-y,event.clientX-x), x, y }
              setScrubbing(true); if (phaseRef.current === 'playing') fade(volumeRef.current * .2, .08)
            }}
            onPointerMove={event => {
              const gesture = drag.current
              if (!gesture || gesture.id !== event.pointerId) return
              if (Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y) < 20) return
              const angle = Math.atan2(event.clientY-gesture.y,event.clientX-gesture.x)
              const delta = Math.atan2(Math.sin(angle-gesture.angle),Math.cos(angle-gesture.angle))
              gesture.angle = angle; rotation.current += delta * 180 / Math.PI
              if (spinRef.current) spinRef.current.style.transform = `rotate(${rotation.current}deg)`
              seek(delta / (Math.PI * 2) * VINYL_CONFIG.secondsPerTurn)
            }} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag}>
            <div ref={spinRef} className="release-player__grooves">
              <div className="release-player__label"><img src={release.artwork} alt="" draggable={false} /></div>
              <i className="release-player__spindle" />
            </div>
          </div>
        </motion.div>
        <motion.button type="button" className="release-player__cover" disabled={!available}
          aria-label={engaged ? `Stop ${release.title}` : `Play ${release.title}`} aria-pressed={engaged}
          initial={false} animate={{ scale: engaged ? 1.035 : 1, rotateX: 0, rotateY: 0 }}
          whileTap={available ? { scale: .96, rotateX: reduced ? 0 : 7, rotateY: reduced ? 0 : -4, transition: { duration: reduced ? 0 : .12 } } : undefined}
          transition={{ duration: reduced ? 0 : .45, ease: [.22, 1, .36, 1] }} onClick={() => void toggle()}>
          <img src={release.artwork} alt={`${release.title} cover`} draggable={false} />
          {available && <span className="release-player__cover-action" aria-hidden="true">{engaged ? <Pause /> : <Play weight="fill" />}</span>}
        </motion.button>
      </div>
      <div className="catalog-detail__info">
        <h1>{release.title}</h1><h2>{release.artist}</h2><span>{release.year}</span>
        <div className="release-player__controls">
          <div className="release-player__volume">
            <button type="button" aria-label={volume ? 'Mute' : 'Unmute'} disabled={!available} onClick={() => changeVolume(volume ? 0 : lastVolume.current)}>{volume ? <SpeakerHigh /> : <SpeakerSlash />}</button>
            <input type="range" aria-label="Volume" min="0" max="1" step="0.01" value={volume} disabled={!available} onChange={event => changeVolume(Number(event.target.value))} />
            <span className="release-player__volume-value">{Math.round(volume * 100)}%</span>
          </div>
          <div className="release-player__time"><span>{timeLabel(position)}</span><span>{timeLabel(duration)}</span></div>
          <p className="release-player__hint" aria-live="polite">{error || (!available ? 'Audio coming soon.' : phase === 'loading' ? 'Loading the record…' : phase === 'stopping' ? 'Fading out…' : phase === 'paused' ? 'Paused. Press Space to resume.' : phase === 'playing' ? 'Turn the record to seek. Space to pause.' : 'Press the cover to listen.')}</p>
        </div>
        <p className="catalog-detail__note">{release.description}</p>
      </div>
    </div>
    {available && <audio ref={audioRef} src={release.audioUrl} crossOrigin="anonymous" preload="none"
      onLoadedMetadata={event => { if (Number.isFinite(event.currentTarget.duration)) setDuration(event.currentTarget.duration) }}
      onTimeUpdate={event => setPosition(event.currentTarget.currentTime)}
      onEnded={() => { intent.current++; if(stopTimer.current) clearTimeout(stopTimer.current); changePhase('idle'); setPosition(0); if(audioRef.current) audioRef.current.currentTime = 0 }}
      onError={() => { intent.current++; if(stopTimer.current) clearTimeout(stopTimer.current); fade(0,.1); changePhase('error'); setError('Unable to load the audio. Tap the cover to try again.') }} />}
  </>
}
