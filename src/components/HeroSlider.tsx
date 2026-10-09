'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { CONFIG } from '@/lib/config';
import { Utils } from '@/lib/utils';
import { MediaItem } from '@/lib/types';
import { useWatchlist, useToast } from '@/context/AppContext';

interface Props {
  onOpenFull: (id: number, type: string) => void;
  onOpenQuick: (id: number, type: string) => void;
}

export default function HeroSlider({ onOpenFull, onOpenQuick }: Props) {
  const [slides, setSlides] = useState<MediaItem[]>([]);
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const { isInWatchlist, toggle } = useWatchlist();
  const toast = useToast();

  useEffect(() => {
    fetch(`${CONFIG.BASE}/trending/movie/day?api_key=${CONFIG.API_KEY}`)
      .then((r) => r.json())
      .then((d) => setSlides(d.results?.slice(0, 6) || []));
  }, []);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setIdx((i) => (i + 1) % 6), 7000);
  }, []);

  useEffect(() => {
    if (slides.length) startTimer();
    return () => clearInterval(timerRef.current);
  }, [slides, startTimer]);

  const goTo = (i: number) => { setIdx(i); startTimer(); };

  if (!slides.length) return (
    <div style={{ width: '100%', height: '72vh', minHeight: 560, borderRadius: 24, background: 'var(--bg-surface-2)' }} className='skeleton' />
  );

  const item = slides[idx];
  if (!item) return null;
  const type = item.media_type || 'movie';
  const inWL = isInWatchlist(item.id);
  const stars = Utils.stars(item.vote_average);

  return (
    <section style={{ padding: '0 4%', marginBottom: 50 }}>
      <div style={{
        position: 'relative', width: '100%', height: '72vh',
        minHeight: 560, maxHeight: 860, borderRadius: 24, overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.9)',
      }}>
        {/* Background & LCP Image */}
        {slides.map((s, i) => (
          <div
            key={s.id}
            style={{
              position: 'absolute', inset: 0,
              opacity: i === idx ? 1 : 0,
              transition: 'opacity 0.8s ease',
              overflow: 'hidden',
            }}
          >
            {s.backdrop_path && (
              <img
                src={CONFIG.ORIG + s.backdrop_path}
                alt={s.title || s.name || 'Hero Banner'}
                // @ts-expect-error - fetchPriority is modern HTML spec for LCP
                fetchPriority={i === 0 ? 'high' : 'auto'}
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding={i === 0 ? 'sync' : 'async'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 15%',
                  display: 'block',
                }}
              />
            )}
          </div>
        ))}
        {/* Gradient overlays */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(100deg, rgba(6,6,8,0.97) 0%, rgba(6,6,8,0.5) 45%, rgba(6,6,8,0.05) 100%)', zIndex: 1 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(6,6,8,1) 0%, rgba(6,6,8,0.2) 35%, transparent 70%)', zIndex: 1 }} />

        {/* Content */}
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', maxWidth: 700, zIndex: 2 }}>
          {/* Badges */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ background: 'var(--brand-primary)', color: 'white', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>#{idx + 1} Trending</span>
            <span style={{ background: 'rgba(255,255,255,0.12)', color: '#ddd', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{type === 'movie' ? 'Movie' : 'TV Show'}</span>
            <span style={{ border: '1px solid rgba(255,215,0,0.5)', color: 'var(--brand-gold)', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>4K HDR</span>
          </div>

          {/* Title */}
          <h2 style={{ fontSize: 'clamp(2.2rem, 5vw, 4.8rem)', fontWeight: 900, lineHeight: 1.05, marginBottom: 16, color: 'white', textShadow: '0 4px 24px rgba(0,0,0,0.7)', letterSpacing: -1 }}>
            {item.title || item.name}
          </h2>

          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18, fontSize: 15, color: '#d0d0d8', fontWeight: 500, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {stars.map((s, i) => (
                  <i key={i} className={`${s.filled ? 'fas' : 'far'} fa-star`} style={{ color: s.filled ? 'var(--brand-gold)' : 'var(--text-muted)', fontSize: 12 }} />
                ))}
              </div>
              <span>{item.vote_average.toFixed(1)}</span>
            </div>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-tertiary)', display: 'inline-block' }} />
            <span>{Utils.year(item.release_date || item.first_air_date)}</span>
          </div>

          {/* Overview */}
          <p style={{
            fontSize: 16, color: '#b8b8c8', lineHeight: 1.65, marginBottom: 30,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
            overflow: 'hidden', textShadow: '0 1px 4px rgba(0,0,0,0.5)', maxWidth: 580,
          } as React.CSSProperties}>
            {item.overview}
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onOpenFull(item.id, type)}
              style={{
                background: 'white', color: '#0a0a0f', border: 'none',
                padding: '14px 32px', borderRadius: 999, fontSize: 16, fontWeight: 800,
                display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                letterSpacing: -0.3,
              }}
            >
              <i className='fas fa-play' style={{ fontSize: 14 }} /> Stream Now
            </button>
            <button
              onClick={() => onOpenQuick(item.id, type)}
              style={{
                background: 'rgba(80,80,90,0.55)', color: 'white', border: '1px solid rgba(255,255,255,0.12)',
                padding: '14px 28px', borderRadius: 999, fontSize: 16, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', backdropFilter: 'blur(10px)',
              }}
            >
              <i className='fas fa-info-circle' /> More Info
            </button>
            <button
              onClick={() => {
                const added = toggle({
                  id: item.id, type: type as 'movie' | 'tv',
                  title: item.title || item.name || '',
                  poster_path: item.poster_path, vote_average: item.vote_average,
                  year: Utils.year(item.release_date || item.first_air_date),
                  overview: item.overview,
                });
                toast(added ? 'Added to My List' : 'Removed from My List', added ? 'success' : 'info');
              }}
              style={{
                width: 50, height: 50, borderRadius: '50%',
                background: inWL ? 'var(--brand-primary)' : 'rgba(255,255,255,0.1)',
                border: inWL ? '2px solid var(--brand-primary)' : '2px solid rgba(255,255,255,0.3)',
                color: 'white', fontSize: 18, display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(10px)',
              }}
            >
              <i className={`fas ${inWL ? 'fa-check' : 'fa-plus'}`} />
            </button>
          </div>
        </div>

        {/* Dots */}
        <div style={{ position: 'absolute', bottom: 24, right: '4%', zIndex: 2, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {slides.map((_, i) => (
              <div
                key={i}
                onClick={() => goTo(i)}
                style={{
                  width: i === idx ? 24 : 8, height: 8,
                  borderRadius: 999,
                  background: i === idx ? 'white' : 'rgba(255,255,255,0.25)',
                  cursor: 'pointer', transition: 'all 0.32s cubic-bezier(0.4,0,0.2,1)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
