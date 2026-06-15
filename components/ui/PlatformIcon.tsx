import type { Platform } from '@/components/data/platforms'

export function PlatformIcon({
  platform,
  size = 16,
  color = 'currentColor',
}: {
  platform: Platform
  size?: number
  color?: string
}) {
  return (
    <svg viewBox="0 0 24 24" fill={color} width={size} height={size} aria-hidden="true">
      <path d={platform.iconPath} />
    </svg>
  )
}
