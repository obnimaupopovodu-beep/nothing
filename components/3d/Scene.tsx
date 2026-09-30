'use client'

import { Suspense, useRef } from 'react'
import type { RefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import type { MousePosition } from '@/hooks/useMouse'
import { Monolith } from './Monolith'
import { Particles } from './Particles'
import * as THREE from 'three'

interface SceneProps {
  mouse: RefObject<MousePosition>
}

function PointerLight({ mouse }: SceneProps) {
  const light = useRef<THREE.PointLight>(null!)

  useFrame((_, delta) => {
    const blend = 1 - Math.exp(-delta * 5)
    light.current.position.x += (mouse.current.x * 1.8 - light.current.position.x) * blend
    light.current.position.y += (mouse.current.y * 1.5 + 0.7 - light.current.position.y) * blend
  })

  return <pointLight ref={light} position={[0, 0.7, 3]} intensity={9} color="#829cff" distance={7} decay={2} />
}

export function Scene({ mouse }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      shadows
      dpr={[1, 1.5]}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.12} />
        <directionalLight position={[2, 2, 5]} intensity={2.2} color="#c9d7ff" />

        {/* Primary blue volumetric light */}
        <pointLight position={[-2, 3, 2]} intensity={10} color="#1a4aff" distance={14} decay={2} />

        {/* Rim light */}
        <pointLight position={[3, 1, -2]} intensity={5} color="#4080ff" distance={10} decay={2} />

        {/* Subtle deep fill */}
        <pointLight position={[0, -3.5, 1]} intensity={2} color="#080d2a" distance={8} decay={2} />
        <PointerLight mouse={mouse} />

        <fog attach="fog" args={['#030308', 8, 22]} />

        <Monolith mouse={mouse} />
        <Particles />
      </Suspense>
    </Canvas>
  )
}
