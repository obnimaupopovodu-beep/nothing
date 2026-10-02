import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  distDir: process.env.NOTHING_BUILD_DIR || '.next',
  transpilePackages: ['three'],
  eslint: {
    // eslint-config-next@15.3.x calls removed ESLint 9 options (useEslintrc, extensions).
    // Disabling lint during build; run `next lint` locally instead.
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
