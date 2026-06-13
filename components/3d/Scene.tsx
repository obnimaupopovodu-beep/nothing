'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Monolith } from './Monolith'
import { Particles } from './Particles'
import * as THREE from 'three'

interface SceneProps {
  mouseX: number
  mouseY: number
}

export function Scene({ mouseX, mouseY }: SceneProps) {
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
        <ambientLight intensity={0.02} />

        {/* Primary blue volumetric light */}
        <pointLight position={[-2, 3, 2]} intensity={10} color="#1a4aff" distance={14} decay={2} />

        {/* Rim light */}
        <pointLight position={[3, 1, -2]} intensity={5} color="#4080ff" distance={10} decay={2} />

        {/* Subtle deep fill */}
        <pointLight position={[0, -3.5, 1]} intensity={2} color="#080d2a" distance={8} decay={2} />

        <fog attach="fog" args={['#030308', 8, 22]} />

        <Monolith mouseX={mouseX} mouseY={mouseY} />
        <Particles />
      </Suspense>
    </Canvas>
  )
}
