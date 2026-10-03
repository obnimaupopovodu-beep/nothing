'use client'

import { Canvas } from '@react-three/fiber'
import { PATH_BEAD_DIAMETER } from '@/components/animations/ReleasePathMotion'

// The same apparent diameter as the bead emitted by the word "path".
export function ReturnBead3D() {
  return <Canvas
    aria-hidden="true"
    orthographic
    camera={{ position: [0, 0, 4], zoom: PATH_BEAD_DIAMETER / 2 }}
    dpr={[1, 2]}
    gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
    frameloop="demand"
  >
    <ambientLight intensity={0.45} />
    <directionalLight position={[-2, 3, 5]} intensity={2.2} color="#ffffff" />
    <directionalLight position={[3, -2, 1]} intensity={0.9} color="#789aff" />
    <mesh>
      <sphereGeometry args={[1, 32, 24]} />
      <meshPhysicalMaterial color="#d6dfff" metalness={0.28} roughness={0.19} clearcoat={1} clearcoatRoughness={0.12} />
    </mesh>
  </Canvas>
}
