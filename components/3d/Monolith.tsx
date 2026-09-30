'use client'

import { useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { useReducedMotion } from 'framer-motion'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import * as THREE from 'three'
import type { MousePosition } from '@/hooks/useMouse'

interface MonolithProps {
  mouse: RefObject<MousePosition>
}

const EXTRUSION = 230
const FACE_SIZE = 3.2

export function Monolith({ mouse }: MonolithProps) {
  const groupRef = useRef<THREE.Group>(null)
  const reduceMotion = useReducedMotion()
  const vector = useLoader(SVGLoader, '/uwb-outline.svg')

  const sculpture = useMemo(() => {
    const pieces = vector.paths.map((path) => {
      const geometry = new THREE.ExtrudeGeometry(SVGLoader.createShapes(path), {
        depth: EXTRUSION,
        steps: 1,
        curveSegments: 14,
        bevelEnabled: true,
        bevelThickness: 15,
        bevelSize: 15,
        bevelSegments: 3,
      })
      geometry.computeBoundingBox()
      return geometry
    })

    const bounds = new THREE.Box3()
    for (const geometry of pieces) {
      if (geometry.boundingBox) bounds.union(geometry.boundingBox)
    }

    const center = bounds.getCenter(new THREE.Vector3())
    const size = bounds.getSize(new THREE.Vector3())
    for (const geometry of pieces) {
      geometry.translate(-center.x, -center.y, -EXTRUSION / 2)
    }

    return { pieces, scale: FACE_SIZE / size.y }
  }, [vector])

  const materials = useMemo(() => [
    new THREE.MeshPhysicalMaterial({
      color: '#050505',
      metalness: 0.55,
      roughness: 0.34,
      clearcoat: 0.35,
      clearcoatRoughness: 0.28,
      side: THREE.DoubleSide,
    }),
    new THREE.MeshStandardMaterial({
      color: '#0a0a0a',
      metalness: 0.68,
      roughness: 0.29,
      side: THREE.DoubleSide,
    }),
  ], [])

  useFrame((state, delta) => {
    const group = groupRef.current
    if (!group) return

    const ease = 1 - Math.exp(-delta * 3.8)
    const time = state.clock.elapsedTime
    const x = reduceMotion ? 0 : mouse.current.x
    const y = reduceMotion ? 0 : mouse.current.y

    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, -y * 0.28, ease)
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, 0.16 + x * 0.42 + (reduceMotion ? 0 : Math.sin(time * 0.28) * 0.035), ease)
    group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, -x * 0.155, ease)
    group.position.y = reduceMotion ? 0 : Math.sin(time * 0.55) * 0.07
  })

  return (
    <group ref={groupRef}>
      <group scale={[sculpture.scale, -sculpture.scale, sculpture.scale]}>
        {sculpture.pieces.map((geometry, index) => (
          <mesh
            key={index}
            geometry={geometry}
            material={materials}
            position-z={(index - 1) * 4}
            castShadow
            receiveShadow
          />
        ))}
      </group>
    </group>
  )
}
