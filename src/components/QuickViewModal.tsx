'use client';
import { useState, useEffect } from 'react';
import { CONFIG } from '@/lib/config';
import { Utils } from '@/lib/utils';
import { MediaItem } from '@/lib/types';
import { useWatchlist, useToast } from '@/context/AppContext';

interface Props {
  isOpen: boolean;
  id: number | null;
  type: string;
  onClose: () => void;
  onOpenFull: (id: number, type: string) => void;
}

export default function QuickViewModal({ isOpen, id, type, onClose, onOpenFull }: Props) {
  const [data, setData] = useState<MediaItem | null>(null);
  const { isInWatchlist, toggle } = useWatchlist();
  const toast = useToast();

  useEffect(() => {
    if (isOpen && id) {
      setData(null);
      fetch(`${CONFIG.BASE}/${type}/${id}?api_key=${CONFIG.API_KEY}`)
        .then(r => r.json())
        .then(setData)
        .catch(() => {});
    }
  }, [isOpen, id, type]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  const playTrailer = async () => {
    if (!id) return;
    try {
      const r = await fetch(`${CONFIG.BASE}/${type}/${id}/videos?api_key=${CONFIG.API_KEY}`);
      const d = await r.json();
      const tr = d.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
      if (tr) {
        onOpenFull(id, type);
      } else {
        toast('Trailer not available', 'error');
      }
    } catch {
      toast('Failed to load trailer', 'error');
    }
  };

  if (!isOpen) return null;

  const inWL = data ? isInWatchlist(data.id) : false;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        zIndex: 8000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          position: 'fixed', top: 20, right: 20, width: 44, height: 44, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
          color: 'white', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 8010, transition: 'all 0.22s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-primary)'; e.currentTarget.style.transform = 'rotate(90deg) scale(1.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'none'; }}
      >
        <i className='fas fa-times' />
      </button>

      {/* Modal Box */}
      <div style={{
        background: 'var(--bg-surface)', width: '92%', maxWidth: 860, borderRadius: 24,
        border: '1px solid rgba(255,255,255,0.09)', overflow: 'hidden', position: 'relative',
        boxShadow: '0 30px 80px rgba(0,0,0,0.85)', maxHeight: '92vh', overflowY: 'auto',
      }}>
        {!data ? (
          <div style={{ display: 'flex', minHeight: 400 }}>
            <div style={{ width: 320, flexShrink: 0 }} className='skeleton' />
            <div style={{ flex: 1, padding: 36, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[200, 140, 100, 280].map((w, i) => <div key={i} style={{ height: 20, width: w, borderRadius: 8 }} className='skeleton' />)}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', minHeight: 400, flexWrap: 'wrap' }}>
            {/* Poster */}
            <div style={{ width: 320, flexShrink: 0, position: 'relative', background: 'var(--bg-base)' }}>
              <img
                src={data.poster_path ? CONFIG.W500 + data.poster_path : '/placeholder.png'}
                alt={Utils.titleOf(data)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: 400 }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 70%, var(--bg-surface) 100%)', pointerEvents: 'none' }} />
            </div>

            {/* Body */}
            <div style={{ padding: '36px 32px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
              <h2 style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.1, marginBottom: 12, letterSpacing: -0.5 }}>{Utils.titleOf(data)}</h2>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600 }}>{Utils.year(data.release_date || data.first_air_date)}</span>
                <span style={{ background: 'rgba(255,193,7,0.12)', color: 'var(--brand-gold)', border: '1px solid rgba(255,193,7,0.25)', padding: '3px 10px', borderRadius: 999, fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <i className='fas fa-star' /> {data.vote_average?.toFixed(1) || 'N/A'}
                </span>
                <span style={{ background: 'var(--bg-surface-3)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.09)', padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>HD</span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }}>
                {data.genres?.map(g => (
                  <span key={g.id} style={{ background: 'var(--bg-surface-3)', border: '1px solid rgba(255,255,255,0.09)', color: 'var(--text-secondary)', padding: '4px 12px', borderRadius: 999, fontSize: 12 }}>{g.name}</span>
                ))}
              </div>

              <p style={{ fontSize: 15, color: '#bbbbc8', lineHeight: 1.65, marginBottom: 24, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
                {data.overview}
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button onClick={() => id && onOpenFull(id, type)}
                  style={{ background: 'var(--brand-primary)', color: 'white', border: 'none', padding: '12px 26px', borderRadius: 999, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9 }}>
                  <i className='fas fa-play' /> Watch Now
                </button>
                <button onClick={playTrailer}
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'white', border: '1px solid rgba(255,255,255,0.16)', padding: '12px 22px', borderRadius: 999, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9 }}>
                  <i className='fab fa-youtube' /> Trailer
                </button>
                <button
                  onClick={() => {
                    const added = toggle({ id: data.id, type: type as 'movie' | 'tv', title: Utils.titleOf(data), poster_path: data.poster_path, vote_average: data.vote_average, year: Utils.year(data.release_date || data.first_air_date) });
                    toast(added ? 'Added to My List' : 'Removed from My List', added ? 'success' : 'info');
                  }}
                  style={{ width: 46, height: 46, borderRadius: '50%', background: inWL ? 'var(--brand-primary)' : 'rgba(255,255,255,0.07)', border: inWL ? '1px solid var(--brand-primary)' : '1px solid rgba(255,255,255,0.16)', color: 'white', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.22s' }}>
                  <i className={`fas ${inWL ? 'fa-check' : 'fa-plus'}`} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
