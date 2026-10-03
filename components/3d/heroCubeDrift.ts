// A closed spatial route visits every face. Unwrapped yaw preserves complete
// revolutions; Catmull–Rom interpolation keeps velocity continuous at each stop.
export const HERO_CUBE_DRIFT = { secondsPerSegment: 7.2 } as const
const poses = [
  { x: -7, y: 14, z: 0 },
  { x: -18, y: 100, z: 12 },
  { x: 12, y: 190, z: -10 },
  { x: 92, y: 205, z: 16 },
  { x: 12, y: 280, z: -16 },
  { x: -92, y: 320, z: 10 },
] as const

function poseAt(index: number) {
  const cycle = Math.floor(index / poses.length)
  const pose = poses[((index % poses.length) + poses.length) % poses.length]
  return { ...pose, y: pose.y + cycle * 360 }
}

function spline(a: number, b: number, c: number, d: number, t: number) {
  return .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t)
}

export function heroCubePose(seconds: number) {
  const position = seconds / HERO_CUBE_DRIFT.secondsPerSegment
  const index = Math.floor(position)
  const t = position - index
  const a = poseAt(index - 1)
  const b = poseAt(index)
  const c = poseAt(index + 1)
  const d = poseAt(index + 2)
  return {
    x: spline(a.x, b.x, c.x, d.x, t),
    y: spline(a.y, b.y, c.y, d.y, t),
    z: spline(a.z, b.z, c.z, d.z, t),
  }
}
