// ============================================================
// PLAYFLIX — Central Configuration
// ============================================================

export const CONFIG = {
  SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || 'Playflix',
  SITE_TAGLINE: 'Stream Movies & TV Shows Online Free',
  LOGO_ICON: 'fa-play',
  LOGO_IMAGE: process.env.NEXT_PUBLIC_LOGO_IMAGE || '', // URL if image logo is desired
  API_KEY: process.env.NEXT_PUBLIC_TMDB_API_KEY || '05902896074695709d7763505bb88b4d',
  BASE: '/api/tmdb?path=',
  W500: process.env.NEXT_PUBLIC_TMDB_W500 || 'https://image.tmdb.org/t/p/w500',
  ORIG: process.env.NEXT_PUBLIC_TMDB_ORIG || 'https://image.tmdb.org/t/p/original',

  SERVERS: [
    {
      name: 'VidAPI',
      icon: 'fa-bolt',
      movie: (id: number | string) => `https://vidapi.xyz/embed/movie/${id}`,
      tv: (id: number | string, s: number | string, e: number | string) =>
        `https://vidapi.xyz/embed/tv/${id}&s=${s}&e=${e}`,
    },
    {
      name: 'VidSrc',
      icon: 'fa-server',
      movie: (id: number | string) => `https://vidsrc.xyz/embed/movie/${id}`,
      tv: (id: number | string, s: number | string, e: number | string) =>
        `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}`,
    },
    {
      name: '2Embed',
      icon: 'fa-play-circle',
      movie: (id: number | string) => `https://www.2embed.cc/embed/${id}`,
      tv: (id: number | string, s: number | string, e: number | string) =>
        `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
    },
  ],

  PLATFORMS: [
    { id: '', name: 'All', code: 'all', region: 'IN' },
    {
      id: '8',
      name: 'Netflix',
      code: 'netflix',
      region: 'IN',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
    },
    {
      id: '119',
      name: 'Prime',
      code: 'prime',
      region: 'IN',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png',
    },
    {
      id: '337',
      name: 'Disney+',
      code: 'disney',
      region: 'IN',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg',
    },
    {
      id: '350',
      name: 'Apple TV+',
      code: 'apple',
      region: 'US',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg',
      invert: true,
    },
    {
      id: '531',
      name: 'Max',
      code: 'max',
      region: 'US',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Max_logo.svg',
    },
    {
      id: '15',
      name: 'Hulu',
      code: 'hulu',
      region: 'US',
      logo: 'https://www.svgrepo.com/download/354004/hulu.svg',
    },
    { id: '232', name: 'ZEE5', code: 'zee5', region: 'IN', color: '#9B30FF' },
    { id: '315', name: 'hoichoi', code: 'hoichoi', region: 'IN', color: '#E91E63' },
    { id: '611', name: 'ULLU', code: 'ullu', region: 'IN', color: '#FF6B00' },
    { id: '300', name: 'ALTBalaji', code: 'alt', region: 'IN', color: '#FF0055' },
  ],

  MOOD_GENRES: {
    action: '28',
    comedy: '35',
    romance: '10749',
    horror: '27',
    scifi: '878',
    thriller: '53',
    animation: '16',
    documentary: '99',
    family: '10751',
  } as Record<string, string>,
};
