import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Playflix — Free HD Movie & TV Streaming',
    short_name: 'Playflix',
    description:
      'Watch movies and TV shows online free in HD & 4K quality. No subscription needed.',
    start_url: '/',
    display: 'standalone',
    background_color: '#060608',
    theme_color: '#050507',
    orientation: 'portrait',
    scope: '/',
    lang: 'en-US',
    categories: ['entertainment'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
