// ============================================================
// PLAYFLIX — TypeScript Types
// ============================================================

export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  media_type?: 'movie' | 'tv' | 'person';
  genre_ids?: number[];
  genres?: Genre[];
  runtime?: number;
  number_of_seasons?: number;
  credits?: { cast: CastMember[]; crew: CrewMember[] };
  similar?: { results: MediaItem[] };
  videos?: { results: VideoResult[] };
  original_language?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface VideoResult {
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface WatchlistItem {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  vote_average: number;
  year: string;
  overview?: string;
}

export interface ContinueWatchItem {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  poster: string | null;
  progress: number;
}

export interface Platform {
  id: string;
  name: string;
  code: string;
  region: string;
  logo?: string;
  invert?: boolean;
  color?: string;
}

export interface AppFilters {
  genres: string[];
  year: string | null;
  rating: string | null;
}

export type ViewMode = 'grid' | 'list';
export type MediaType = 'movie' | 'tv';

export interface TMDBResponse {
  page: number;
  results: MediaItem[];
  total_pages: number;
  total_results: number;
}
