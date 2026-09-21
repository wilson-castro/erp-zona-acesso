import type { NextConfig } from 'next'

const config: NextConfig = {
  poweredByHeader: false,
  // Prefixo exclusivo de assets (limitação 5). O shell reencaminha /acesso-static/* para cá.
  assetPrefix: '/acesso-static',
  experimental: {
    // A Server Action chega pelo shell: a origem do navegador é a do shell, não a da zona.
    serverActions: { allowedOrigins: (process.env.SHELL_HOSTS ?? 'localhost:3000').split(',') },
  },
}

export default config
