import { catalogReleases } from '@/components/data/catalog'

export type CubeFace = 'front' | 'right' | 'back' | 'left' | 'top' | 'bottom'
export type CubeArtwork = Record<CubeFace, string | null>

export const CATALOG_MOTION = {
  heroExit: 0.82,
  center: 1.08,
  pitch: 1.28,
  pitchDegrees: 90,
  firstReveal: 0.6,
  minimumReveal: 0,
  speedBoost: 3,
  speedExponent: 2,
  firstLandingPause: 0.0,
  minimumLandingPause: 0,
  settleShare: 0.014,
  finalSpread: 1,
  finalRoll: 0.27,
  marqueeGapDesktop: 26,
  marqueeGapMobile: 18,
  marqueeSecondsPerBatch: 27,
  artworkOpacity: 0.84,
} as const

const art = (index: number) => catalogReleases[index]?.artwork ?? null

// The scene pitches +90°, so the cube's bottom face is seen from below.
// Each -90° roll around the front-to-back edge brings the next face down.
const rollingFaces: CubeFace[] = ['bottom', 'left', 'top', 'right']

export function faceForRelease(index: number): CubeFace {
  return rollingFaces[index % rollingFaces.length]
}

export function revealDuration(index: number): number {
  const progress = Math.min(1, index / Math.max(1, catalogReleases.length - 2))
  const speed = 1 + CATALOG_MOTION.speedBoost * progress ** CATALOG_MOTION.speedExponent
  return Math.max(CATALOG_MOTION.minimumReveal, CATALOG_MOTION.firstReveal / speed)
}

export function landingPause(index: number): number {
  const progress = Math.min(1, index / Math.max(1, catalogReleases.length - 1))
  const range = CATALOG_MOTION.firstLandingPause - CATALOG_MOTION.minimumLandingPause
  return CATALOG_MOTION.minimumLandingPause + range * (1 - progress) ** 2.3
}

export function settleDuration(index: number): number {
  return Math.max(0.055, revealDuration(index) * CATALOG_MOTION.settleShare)
}

export function initialCubeArtwork(): CubeArtwork {
  return {
    bottom: art(0),
    left: art(1),
    top: art(2),
    right: art(3),
    front: art(4),
    back: art(5),
  }
}

// Refill a face while it points away from the viewer, two stops before it
// reaches the bottom again. This also frees the duplicate art on front/back.
export function prepareHiddenIncomingFace(faces: CubeArtwork, nextIndex: number): CubeArtwork {
  if (nextIndex < rollingFaces.length || !catalogReleases[nextIndex]) return faces
  const nextArtwork = catalogReleases[nextIndex].artwork
  const updated = { ...faces }
  for (const face of Object.keys(updated) as CubeFace[]) {
    if (updated[face] === nextArtwork) updated[face] = null
  }
  updated[faceForRelease(nextIndex)] = nextArtwork
  return updated
}
