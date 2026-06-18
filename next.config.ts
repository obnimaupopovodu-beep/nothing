import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['three'],
  eslint: {
    // eslint-config-next@15.3.x calls removed ESLint 9 options (useEslintrc, extensions).
    // Disabling lint during build; run `next lint` locally instead.
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
