'use client'

import { forwardRef } from 'react'
import type { CubeArtwork, CubeFace } from './catalogMotion'

type GlassCubeProps = {
  faces: CubeArtwork
  className?: string
}

const sides: CubeFace[] = ['front', 'right', 'back', 'left', 'top', 'bottom']

export const GlassCube = forwardRef<HTMLDivElement, GlassCubeProps>(function GlassCube(
  { faces, className = '' }, ref
) {
  return (
    <div className={`glass-cube-scene ${className}`} aria-hidden="true">
      <div ref={ref} className="glass-cube">
        {sides.map((side) => (
          <div className={`glass-cube__face glass-cube__face--${side}`} data-face={side} key={side}>
            {faces[side] && <img src={faces[side]} alt="" draggable={false} />}
            <span className="glass-cube__shine" />
          </div>
        ))}
      </div>
    </div>
  )
})
