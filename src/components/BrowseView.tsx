'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp, useWatchlist, useToast } from '@/context/AppContext';
import { CONFIG } from '@/lib/config';
import { MediaItem, Genre } from '@/lib/types';
import { Utils } from '@/lib/utils';
import { buildDiscoverUrl, buildSearchUrl } from '@/lib/api';

interface Props {
  onOpenQuick: (id: number, type: string) => void;
  onOpenFull: (id: number, type: string) => void;
}

const MOODS = [
  { emoji: '🎬', label: 'All', mood: '' },
  { emoji: '💥', label: 'Action', mood: 'action' },
  { emoji: '😂', label: 'Comedy', mood: 'comedy' },
  { emoji: '❤️', label: 'Romance', mood: 'romance' },
  { emoji: '👻', label: 'Horror', mood: 'horror' },
  { emoji: '🚀', label: 'Sci-Fi', mood: 'scifi' },
  { emoji: '🔪', label: 'Thriller', mood: 'thriller' },
  { emoji: '🎨', label: 'Animation', mood: 'animation' },
  { emoji: '📽️', label: 'Documentary', mood: 'documentary' },
  { emoji: '👨‍👩‍👧', label: 'Family', mood: 'family' },
];

const LANGS = [
  { label: 'All', code: '' },
  { label: 'English', code: 'en' },
  { label: 'Hindi', code: 'hi' },
  { label: 'Bengali', code: 'bn' },
  { label: 'Korean', code: 'ko' },
];

export default function BrowseView({ onOpenQuick, onOpenFull }: Props) {
  const { state, dispatch } = useApp();
  const { isInWatchlist, toggle } = useWatchlist();
  const toast = useToast();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [activeMood, setActiveMood] = useState('');
  const [yearVal, setYearVal] = useState('2024');
  const [ratingVal, setRatingVal] = useState('5');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(1);
  const isLoadingRef = useRef(false);

  // Load genres
  useEffect(() => {
    Promise.all([
      fetch(`${CONFIG.BASE}/genre/movie/list?api_key=${CONFIG.API_KEY}`).then(r => r.json()),
      fetch(`${CONFIG.BASE}/genre/tv/list?api_key=${CONFIG.API_KEY}`).then(r => r.json()),
    ]).then(([m, t]) => {
      const all = [...(m.genres || []), ...(t.genres || [])];
      const uniq = Array.from(new Map(all.map((g: Genre) => [g.id, g])).values()) as Genre[];
      setGenres(uniq);
    }).catch(() => {});
  }, []);

  const fetchContent = useCallback(async (targetPage = 1, append = false) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setLoading(true);

    if (state.isWatchlistView) {
      const mapped: MediaItem[] = state.watchlist.map((w) => ({
        id: w.id,
        title: w.title,
        overview: w.overview || '',
        poster_path: w.poster_path,
        backdrop_path: null,
        vote_average: w.vote_average,
        vote_count: 0,
        media_type: w.type,
      }));
      setItems(mapped);
      setHasMore(false);
      setLoading(false);
      isLoadingRef.current = false;
      return;
    }

    const isSearchMode = state.isSearch && state.query.trim().length > 0;
    const url = isSearchMode
      ? buildSearchUrl(state.query.trim(), targetPage)
      : buildDiscoverUrl(
          state.mediaType,
          targetPage,
          state.lang,
          state.provider,
          state.region,
          state.filters.genres,
          state.filters.year,
          state.filters.rating
        );

    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      const rawResults = isSearchMode
        ? data.results?.filter((i: MediaItem) => i.media_type === 'movie' || i.media_type === 'tv') || []
        : data.results || [];

      setItems(prev => append ? [...prev, ...rawResults] : rawResults);
      setCurrentPage(data.page || targetPage);
      const total = Math.min(data.total_pages || 1, 500);
      setTotalPages(total);
      setHasMore(targetPage < total && rawResults.length > 0);
      pageRef.current = targetPage;
    } catch (err) {
      console.error('Fetch browse content failed:', err);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [state.isWatchlistView, state.watchlist, state.isSearch, state.query, state.mediaType, state.lang, state.provider, state.region, state.filters]);

  // Refetch when browse state changes
  useEffect(() => {
    if (state.isBrowseView) {
      fetchContent(1, false);
    }
  }, [state.isBrowseView, state.isWatchlistView, state.watchlist, state.mediaType, state.lang, state.provider, state.filters, state.isSearch, state.query]);

  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && hasMore && items.length > 0) {
          fetchContent(currentPage + 1, true);
        }
      },
      { rootMargin: '300px' }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [loading, hasMore, fetchContent, currentPage, items.length]);

  const setMood = (mood: string) => {
    setActiveMood(mood);
    const g = mood && CONFIG.MOOD_GENRES[mood] ? [CONFIG.MOOD_GENRES[mood]] : [];
    dispatch({ type: 'SET_FILTERS', payload: { ...state.filters, genres: g } });
    dispatch({ type: 'SET_IS_SEARCH', payload: false });
  };

  const applyFilters = () => {
    dispatch({ type: 'SET_FILTERS', payload: { genres: selectedGenres, year: yearVal, rating: ratingVal } });
    dispatch({ type: 'SET_IS_SEARCH', payload: false });
    setFilterOpen(false);
  };

  const resetFilters = () => {
    setSelectedGenres([]);
    setYearVal('2024');
    setRatingVal('5');
    dispatch({ type: 'SET_FILTERS', payload: { genres: [], year: null, rating: null } });
  };

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages || p === currentPage || loading) return;
    fetchContent(p, false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  const loadMore = () => {
    if (currentPage >= totalPages || loading) return;
    fetchContent(currentPage + 1, true);
  };

  const getPaginationNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div>
      {/* Mood Bar - hide for watchlist */}
      {!state.isWatchlistView && (
        <div style={{ padding: '0 4% 20px', display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {MOODS.map(m => (
            <div
              key={m.mood}
              onClick={() => setMood(m.mood)}
              style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7,
                background: activeMood === m.mood ? 'rgba(229,9,20,0.12)' : 'var(--bg-surface-2)',
                border: activeMood === m.mood ? '1px solid rgba(229,9,20,0.4)' : '1px solid rgba(255,255,255,0.09)',
                color: activeMood === m.mood ? 'var(--brand-primary)' : 'var(--text-secondary)',
                padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.22s ease',
              }}
            >
              <span style={{ fontSize: 16 }}>{m.emoji}</span> {m.label}
            </div>
          ))}
        </div>
      )}

      {/* Controls Bar */}
      {!state.isWatchlistView && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16, padding: '0 4%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 26, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10, letterSpacing: -0.5 }}>
              <i className={`fas ${state.browseIcon}`} style={{ color: 'var(--brand-primary)' }} /> {state.browseHeading}
            </div>
            <div style={{ display: 'flex', background: 'var(--bg-surface-2)', borderRadius: 999, padding: 4, gap: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
              {LANGS.map(l => (
                <button
                  key={l.code}
                  onClick={() => dispatch({ type: 'SET_LANG', payload: l.code })}
                  style={{
                    background: state.lang === l.code ? 'var(--bg-surface-3)' : 'transparent',
                    border: 'none', color: state.lang === l.code ? 'white' : 'var(--text-secondary)',
                    padding: '6px 16px', borderRadius: 999, cursor: 'pointer',
                    fontSize: 13, fontWeight: 600, transition: 'all 0.22s ease',
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setFilterOpen(!filterOpen)} style={{ width: 42, height: 42, borderRadius: 10, background: filterOpen ? 'rgba(229,9,20,0.12)' : 'var(--bg-surface-2)', border: filterOpen ? '1px solid rgba(229,9,20,0.3)' : '1px solid rgba(255,255,255,0.05)', color: filterOpen ? 'var(--brand-primary)' : 'var(--text-secondary)', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.22s' }}><i className='fas fa-sliders-h' /></button>
            {(['grid', 'list'] as const).map(v => (
              <button key={v} onClick={() => dispatch({ type: 'SET_VIEW', payload: v })} style={{ width: 42, height: 42, borderRadius: 10, background: state.view === v ? 'rgba(229,9,20,0.12)' : 'var(--bg-surface-2)', border: state.view === v ? '1px solid rgba(229,9,20,0.3)' : '1px solid rgba(255,255,255,0.05)', color: state.view === v ? 'var(--brand-primary)' : 'var(--text-secondary)', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.22s' }}>
                <i className={`fas ${v === 'grid' ? 'fa-th-large' : 'fa-list'}`} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {filterOpen && (
        <div className='animate-slide-down' style={{ padding: '28px 4% 32px', background: 'var(--bg-surface-2)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 36 }}>
            <div>
              <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-tertiary)', marginBottom: 16 }}>Genre</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {genres.map(g => (
                  <span key={g.id} onClick={() => setSelectedGenres(prev => prev.includes(String(g.id)) ? prev.filter(x => x !== String(g.id)) : [...prev, String(g.id)])}
                    style={{ background: selectedGenres.includes(String(g.id)) ? 'rgba(229,9,20,0.12)' : 'var(--bg-surface-3)', border: selectedGenres.includes(String(g.id)) ? '1px solid rgba(229,9,20,0.4)' : '1px solid rgba(255,255,255,0.09)', color: selectedGenres.includes(String(g.id)) ? 'var(--brand-primary)' : 'var(--text-secondary)', padding: '6px 14px', borderRadius: 999, fontSize: 13, cursor: 'pointer', transition: 'all 0.22s' }}
                  >{g.name}</span>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-tertiary)', marginBottom: 16 }}>Release Year</h4>
              <input type='range' min='1990' max='2030' value={yearVal} onChange={e => setYearVal(e.target.value)} style={{ width: '100%', accentColor: 'var(--brand-primary)', cursor: 'pointer', height: 4 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                <span>1990</span><span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>{yearVal}</span>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-tertiary)', marginBottom: 16 }}>Min Rating</h4>
              <input type='range' min='0' max='10' step='0.5' value={ratingVal} onChange={e => setRatingVal(e.target.value)} style={{ width: '100%', accentColor: 'var(--brand-primary)', cursor: 'pointer', height: 4 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                <span>0</span><span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>{ratingVal}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button onClick={resetFilters} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.16)', color: 'var(--text-secondary)', padding: '9px 22px', borderRadius: 999, cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.22s' }}>Reset Filters</button>
            <button onClick={applyFilters} style={{ background: 'var(--brand-primary)', color: 'white', border: 'none', padding: '9px 24px', borderRadius: 999, cursor: 'pointer', fontSize: 14, fontWeight: 700, transition: 'all 0.22s' }}>Apply Filters</button>
          </div>
        </div>
      )}

      {/* Media Grid */}
      <div style={{ padding: '0 4%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: state.view === 'list' ? '1fr' : 'repeat(auto-fill, minmax(190px, 1fr))', gap: state.view === 'list' ? 12 : 16, paddingBottom: 40 }}>
          {loading && items.length === 0
            ? Array(16).fill(0).map((_, i) => <div key={i} style={{ borderRadius: 10, aspectRatio: '2/3' }} className='skeleton' />)
            : items.length === 0
            ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'var(--bg-surface-2)', border: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: 'var(--text-muted)' }}><i className='fas fa-ghost' /></div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-secondary)' }}>No Results Found</div>
                  <div style={{ fontSize: 15, color: 'var(--text-tertiary)' }}>Try different filters, categories, or search terms.</div>
                </div>
              )
            : items.map((item, idx) => {
                const posterUrl = item.poster_path
                  ? CONFIG.W342 + item.poster_path
                  : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=342&auto=format&fit=crop&q=80';
                const type = item.media_type || state.mediaType;
                const title = Utils.titleOf(item);
                const year = Utils.year(item.release_date || item.first_air_date);
                const rating = item.vote_average?.toFixed(1) || 'NR';
                const inWL = isInWatchlist(item.id);
                const isNew = Utils.isNew(item.release_date);

                if (state.view === 'list') return (
                  <div key={`${item.id}-${idx}`} onClick={() => onOpenQuick(item.id, type)}
                    style={{ display: 'flex', height: 185, background: 'var(--bg-surface-2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.22s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.55)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ width: 120, height: '100%', flexShrink: 0, overflow: 'hidden' }}>
                      <img src={posterUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading='lazy' />
                    </div>
                    <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
                      <div style={{ fontSize: 14, color: 'var(--text-secondary)', display: 'flex', gap: 14, marginBottom: 10 }}>
                        <span>{year}</span><span style={{ textTransform: 'uppercase' }}>{type}</span><span>⭐ {rating}</span>
                      </div>
                      <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{item.overview || 'No overview available.'}</div>
                      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                        <button onClick={e => { e.stopPropagation(); onOpenFull(item.id, type); }} style={{ padding: '7px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', background: 'var(--brand-primary)', color: 'white', display: 'flex', alignItems: 'center', gap: 6 }}><i className='fas fa-play' /> Watch</button>
                        <button onClick={e => { e.stopPropagation(); onOpenQuick(item.id, type); }} style={{ padding: '7px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.09)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><i className='fas fa-info-circle' /> Details</button>
                      </div>
                    </div>
                  </div>
                );

                return (
                  <div
                    key={`${item.id}-${idx}`}
                    onClick={() => onOpenQuick(item.id, type)}
                    style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', background: 'var(--bg-card)', transition: 'all 0.32s cubic-bezier(0.4,0,0.2,1)' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-10px) scale(1.04)'; e.currentTarget.style.zIndex = '10'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.8)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.zIndex = '1'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden', borderRadius: 10 }}>
                      <img src={posterUrl} alt={title} loading='lazy' style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease, filter 0.3s ease', display: 'block' }}
                        onMouseEnter={e => { (e.target as HTMLImageElement).style.transform = 'scale(1.06)'; (e.target as HTMLImageElement).style.filter = 'brightness(0.45)'; }}
                        onMouseLeave={e => { (e.target as HTMLImageElement).style.transform = 'scale(1)'; (e.target as HTMLImageElement).style.filter = 'brightness(1)'; }}
                      />
                      {idx < 3 && <span style={{ position: 'absolute', top: 10, left: 10, zIndex: 4, background: 'var(--brand-primary)', color: 'white', borderRadius: 4, fontSize: 10, fontWeight: 900, padding: '2px 8px', letterSpacing: 0.5 }}>#{idx + 1}</span>}
                      {isNew && <span style={{ position: 'absolute', top: 10, right: 10, zIndex: 4, background: 'var(--brand-green)', color: 'white', borderRadius: 4, fontSize: 10, fontWeight: 900, padding: '2px 8px', letterSpacing: 0.5 }}>NEW</span>}
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,6,8,0.96) 0%, rgba(6,6,8,0.25) 45%, rgba(6,6,8,0.05) 100%)', opacity: 0, transition: 'opacity 0.28s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 12 }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <button onClick={e => { e.stopPropagation(); const added = toggle({ id: item.id, type: type as 'movie'|'tv', title, poster_path: item.poster_path, vote_average: item.vote_average, year }); toast(added ? 'Added to My List' : 'Removed', added ? 'success' : 'info'); }}
                            style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.15)', color: inWL ? 'var(--brand-primary)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 11, zIndex: 5 }}>
                            <i className={`fas ${inWL ? 'fa-check' : 'fa-heart'}`} />
                          </button>
                          <span style={{ background: 'rgba(0,0,0,0.7)', color: 'var(--brand-gold)', borderRadius: 5, fontSize: 11, fontWeight: 700, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4, border: '1px solid rgba(255,193,7,0.2)' }}>
                            <i className='fas fa-star' /> {rating}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                          <div onClick={e => { e.stopPropagation(); onOpenFull(item.id, type); }}
                            style={{ width: 52, height: 52, background: 'rgba(229,9,20,0.92)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'white', boxShadow: '0 0 28px rgba(229,9,20,0.7)', cursor: 'pointer' }}>
                            <i className='fas fa-play' style={{ marginLeft: 3 }} />
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500, marginTop: 2 }}>{year} · {type.toUpperCase()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
          }
        </div>

        {/* Numbered Pagination & Load More Controls */}
        {!state.isWatchlistView && totalPages > 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '10px 0 60px' }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
              Page <span style={{ color: 'white', fontWeight: 800 }}>{currentPage}</span> of <span style={{ color: 'white', fontWeight: 800 }}>{totalPages}</span>
            </div>

            {/* Pagination Button Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
              {/* Prev Button */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
                style={{
                  padding: '9px 18px', borderRadius: 8,
                  background: currentPage <= 1 ? 'rgba(255,255,255,0.03)' : 'var(--bg-surface-2)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: currentPage <= 1 ? 'var(--text-muted)' : 'white',
                  fontSize: 13, fontWeight: 700,
                  cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s',
                }}
              >
                <i className='fas fa-chevron-left' /> Prev
              </button>

              {/* Number Buttons */}
              {getPaginationNumbers().map((p, idx) => (
                typeof p === 'number' ? (
                  <button
                    key={idx}
                    onClick={() => goToPage(p)}
                    disabled={loading}
                    style={{
                      minWidth: 42, height: 42, borderRadius: 8,
                      background: currentPage === p ? 'var(--brand-primary)' : 'var(--bg-surface-2)',
                      border: currentPage === p ? '1px solid var(--brand-primary)' : '1px solid rgba(255,255,255,0.08)',
                      color: 'white', fontSize: 14, fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: currentPage === p ? '0 0 16px rgba(229,9,20,0.5)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    {p}
                  </button>
                ) : (
                  <span key={idx} style={{ padding: '0 6px', color: 'var(--text-muted)', fontSize: 14, userSelect: 'none' }}>
                    •••
                  </span>
                )
              ))}

              {/* Next Button */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
                style={{
                  padding: '9px 18px', borderRadius: 8,
                  background: currentPage >= totalPages ? 'rgba(255,255,255,0.03)' : 'var(--bg-surface-2)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: currentPage >= totalPages ? 'var(--text-muted)' : 'white',
                  fontSize: 13, fontWeight: 700,
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s',
                }}
              >
                Next <i className='fas fa-chevron-right' />
              </button>
            </div>

            {/* Optional Load More Button */}
            {hasMore && !loading && (
              <button
                onClick={loadMore}
                style={{
                  marginTop: 6,
                  background: 'rgba(255,255,255,0.05)',
                  color: 'var(--text-secondary)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '10px 28px', borderRadius: 999,
                  cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.2s',
                }}
              >
                <i className='fas fa-sync-alt' /> Load More (+20)
              </button>
            )}

            {loading && (
              <div style={{ color: 'var(--brand-accent)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className='fas fa-spinner fa-spin' /> Loading movies...
              </div>
            )}
          </div>
        )}

        <div ref={sentinelRef} style={{ height: 1 }} />
      </div>
    </div>
  );
}
