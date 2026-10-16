import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  distDir: process.env.NOTHING_BUILD_DIR || '.next',
  transpilePackages: ['three'],
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/',
          has: [{ type: 'host', value: 'playlists\\.(uwbelieve\\.com|localhost)' }],
          destination: '/playlists',
        },
      ],
      afterFiles: [],
      fallback: [],
    }
  },
  async redirects() {
    return [
      {
        source: '/playlists',
        has: [{ type: 'host', value: '(www\\.)?(uwbelieve\\.com|nothingrecords\\.site)' }],
        destination: 'https://playlists.uwbelieve.com/',
        permanent: true,
      },
      {
        source: '/playlists',
        has: [{ type: 'host', value: 'playlists\\.(uwbelieve\\.com|localhost)' }],
        destination: '/',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
