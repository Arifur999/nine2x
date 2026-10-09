// ============================================================
// PLAYFLIX — TMDB API Helper Functions
// ============================================================

import { CONFIG } from './config';
import { TMDBResponse, MediaItem, Genre } from './types';

async function fetchJSON<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

export const api = {
  trending: (type: 'movie' | 'tv', timeWindow: 'day' | 'week' = 'day') =>
    fetchJSON<TMDBResponse>(
      `${CONFIG.BASE}/trending/${type}/${timeWindow}?api_key=${CONFIG.API_KEY}`
    ),

  discover: (type: 'movie' | 'tv', params: Record<string, string | number> = {}) => {
    const qs = new URLSearchParams({
      api_key: CONFIG.API_KEY,
      sort_by: 'popularity.desc',
      ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
    }).toString();
    return fetchJSON<TMDBResponse>(`${CONFIG.BASE}/discover/${type}?${qs}`);
  },

  search: (query: string, page = 1) =>
    fetchJSON<TMDBResponse>(
      `${CONFIG.BASE}/search/multi?api_key=${CONFIG.API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    ),

  details: (type: 'movie' | 'tv', id: number | string) =>
    fetchJSON<MediaItem>(
      `${CONFIG.BASE}/${type}/${id}?api_key=${CONFIG.API_KEY}&append_to_response=credits,similar,videos`
    ),

  genres: async (): Promise<Genre[]> => {
    const [movies, tv] = await Promise.all([
      fetchJSON<{ genres: Genre[] }>(`${CONFIG.BASE}/genre/movie/list?api_key=${CONFIG.API_KEY}`),
      fetchJSON<{ genres: Genre[] }>(`${CONFIG.BASE}/genre/tv/list?api_key=${CONFIG.API_KEY}`),
    ]);
    const all = [...(movies?.genres || []), ...(tv?.genres || [])];
    return Array.from(new Map(all.map((g) => [g.id, g])).values());
  },

  nowPlaying: () =>
    fetchJSON<TMDBResponse>(`${CONFIG.BASE}/movie/now_playing?api_key=${CONFIG.API_KEY}`),

  topRated: (type: 'movie' | 'tv' = 'movie') =>
    fetchJSON<TMDBResponse>(`${CONFIG.BASE}/${type}/top_rated?api_key=${CONFIG.API_KEY}`),

  popular: (type: 'movie' | 'tv') =>
    fetchJSON<TMDBResponse>(`${CONFIG.BASE}/${type}/popular?api_key=${CONFIG.API_KEY}`),
};

// URL Builders for client-side use
export function buildDiscoverUrl(
  type: 'movie' | 'tv',
  page: number,
  lang: string,
  provider: string,
  region: string,
  genres: string[],
  year: string | null,
  rating: string | null
): string {
  const params = new URLSearchParams({
    api_key: CONFIG.API_KEY,
    sort_by: 'popularity.desc',
    page: String(page),
  });
  if (lang) params.set('with_original_language', lang);
  if (provider) { params.set('with_watch_providers', provider); params.set('watch_region', region); }
  if (genres.length) params.set('with_genres', genres.join(','));
  if (year) params.set(type === 'movie' ? 'primary_release_year' : 'first_air_date_year', year);
  if (rating) params.set('vote_average.gte', rating);
  return `${CONFIG.BASE}/discover/${type}?${params.toString()}`;
}

export function buildSearchUrl(query: string, page: number): string {
  return `${CONFIG.BASE}/search/multi?api_key=${CONFIG.API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
}

export async function clientFetch<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url);
    return r.json() as Promise<T>;
  } catch {
    return null;
  }
}
