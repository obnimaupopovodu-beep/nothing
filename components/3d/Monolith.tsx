'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface MonolithProps {
  mouseX: number
  mouseY: number
}

export function Monolith({ mouseX, mouseY }: MonolithProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const timeRef = useRef(0)

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const verts = new Float32Array([
      // Bottom ring
      -0.5, -1.4,  0.25,
       0.5, -1.4,  0.25,
       0.6, -1.4, -0.2,
      -0.4, -1.4, -0.3,
      // Mid-low ring
      -0.55, -0.3,  0.28,
       0.52, -0.2,  0.3,
       0.58,  0.0, -0.25,
      -0.48,  0.1, -0.28,
      // Mid-high ring
      -0.35,  0.8,  0.18,
       0.38,  0.9,  0.22,
       0.42,  0.85,-0.18,
      -0.3,   0.75,-0.2,
      // Apex
       0.0,   1.55, 0.0,
    ])
    const idx = [
      0,1,2, 0,2,3,
      0,1,5, 0,5,4,  1,2,6, 1,6,5,  2,3,7, 2,7,6,  3,0,4, 3,4,7,
      4,5,9, 4,9,8,  5,6,10,5,10,9, 6,7,11,6,11,10, 7,4,8, 7,8,11,
      8,9,12, 9,10,12, 10,11,12, 11,8,12,
    ]
    geo.setIndex(idx)
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    geo.computeVertexNormals()
    return geo
  }, [])

  useFrame((_, delta) => {
    timeRef.current += delta
    if (!groupRef.current) return
    groupRef.current.rotation.y += delta * 0.07
    groupRef.current.position.y = Math.sin(timeRef.current * 0.38) * 0.13
    groupRef.current.rotation.x += (mouseY * 0.14 - groupRef.current.rotation.x) * 0.035
    groupRef.current.rotation.z += (-mouseX * 0.09 - groupRef.current.rotation.z) * 0.035
  })

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={new THREE.Color('#090912')}
          roughness={0.1}
          metalness={0.96}
          envMapIntensity={1.4}
        />
      </mesh>
      <mesh geometry={geometry} scale={[1.006, 1.006, 1.006]}>
        <meshStandardMaterial
          color="#1230a0"
          transparent
          opacity={0.05}
          roughness={0.4}
          metalness={0.1}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  )
}
