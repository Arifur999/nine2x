// ============================================================
// PLAYFLIX — General Utility Functions
// ============================================================

import { CONFIG } from './config';

export const Utils = {
  year: (date?: string): string => (date ? date.split('-')[0] : 'N/A'),

  runtime: (min?: number): string => {
    if (!min) return 'N/A';
    return `${Math.floor(min / 60)}h ${min % 60}m`;
  },

  stars: (rating: number): { filled: boolean }[] => {
    const n = Math.round((rating / 10) * 5);
    return Array.from({ length: 5 }, (_, i) => ({ filled: i < n }));
  },

  imgUrl: (path: string | null, size: 'w500' | 'original' = 'w500'): string => {
    if (!path) return '/placeholder.png';
    return size === 'w500' ? CONFIG.W500 + path : CONFIG.ORIG + path;
  },

  isNew: (releaseDate?: string): boolean => {
    if (!releaseDate) return false;
    return new Date().getTime() - new Date(releaseDate).getTime() < 30 * 24 * 60 * 60 * 1000;
  },

  titleOf: (item: { title?: string; name?: string }): string =>
    item.title || item.name || 'Unknown',
};
