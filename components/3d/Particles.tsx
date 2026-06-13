'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COUNT = 300

export function Particles() {
  const ref = useRef<THREE.Points>(null!)
  const t = useRef(0)

  const { basePos, speeds, phases } = useMemo(() => {
    const basePos = new Float32Array(COUNT * 3)
    const speeds = new Float32Array(COUNT)
    const phases = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 2.8 + Math.random() * 3.2
      basePos[i*3]   = r * Math.sin(phi) * Math.cos(theta)
      basePos[i*3+1] = r * Math.sin(phi) * Math.sin(theta) * 0.65
      basePos[i*3+2] = r * Math.cos(phi)
      speeds[i] = 0.08 + Math.random() * 0.18
      phases[i] = Math.random() * Math.PI * 2
    }
    return { basePos, speeds, phases }
  }, [])

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(basePos.slice(), 3))
    return g
  }, [basePos])

  useFrame((_, delta) => {
    t.current += delta
    if (!ref.current) return
    const pos = ref.current.geometry.attributes.position
    for (let i = 0; i < COUNT; i++) {
      pos.array[i*3+1] = basePos[i*3+1] + Math.sin(t.current * speeds[i] + phases[i]) * 0.09
    }
    pos.needsUpdate = true
    ref.current.rotation.y += delta * 0.01
  })

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.016} color="#2F6DFF" transparent opacity={0.45} sizeAttenuation depthWrite={false} />
    </points>
  )
}
