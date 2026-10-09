'use client';
import { useState, useEffect } from 'react';
import { CONFIG } from '@/lib/config';
import { MediaItem } from '@/lib/types';
import { Utils } from '@/lib/utils';

interface Props {
  onOpenQuick: (id: number, type: string) => void;
  onSeeAll: (key: string, label: string) => void;
}

interface RowConfig {
  id: string;
  title: string;
  icon: string;
  url: string;
  type: 'movie' | 'tv';
  seeAllKey: string;
  seeAllLabel: string;
}

const ROWS: RowConfig[] = [
  { id: 'row-new', title: 'New Releases', icon: 'fa-calendar-alt', url: `${CONFIG.BASE}/movie/now_playing?api_key=${CONFIG.API_KEY}`, type: 'movie', seeAllKey: 'new_releases', seeAllLabel: 'New Releases' },
  { id: 'row-top', title: 'Top Rated', icon: 'fa-trophy', url: `${CONFIG.BASE}/movie/top_rated?api_key=${CONFIG.API_KEY}`, type: 'movie', seeAllKey: 'top_rated', seeAllLabel: 'Top Rated' },
  { id: 'row-bengali', title: 'Bengali Cinema', icon: 'fa-language', url: `${CONFIG.BASE}/discover/movie?api_key=${CONFIG.API_KEY}&with_original_language=bn&sort_by=popularity.desc`, type: 'movie', seeAllKey: 'bengali', seeAllLabel: 'Bengali Cinema' },
  { id: 'row-hindi', title: 'Hindi Movies', icon: 'fa-film', url: `${CONFIG.BASE}/discover/movie?api_key=${CONFIG.API_KEY}&with_original_language=hi&sort_by=popularity.desc`, type: 'movie', seeAllKey: 'hindi', seeAllLabel: 'Hindi Movies' },
  { id: 'row-korean', title: 'Korean Drama', icon: 'fa-globe-asia', url: `${CONFIG.BASE}/discover/tv?api_key=${CONFIG.API_KEY}&with_original_language=ko&sort_by=popularity.desc`, type: 'tv', seeAllKey: 'korean', seeAllLabel: 'Korean Drama' },
  { id: 'row-action', title: 'Action & Thriller', icon: 'fa-bolt', url: `${CONFIG.BASE}/discover/movie?api_key=${CONFIG.API_KEY}&with_genres=28,53&sort_by=popularity.desc`, type: 'movie', seeAllKey: 'action', seeAllLabel: 'Action & Thriller' },
  { id: 'row-web', title: 'Popular Web Series', icon: 'fa-tv', url: `${CONFIG.BASE}/tv/popular?api_key=${CONFIG.API_KEY}`, type: 'tv', seeAllKey: 'webseries', seeAllLabel: 'Web Series' },
];

function RowSection({ row, onOpenQuick, onSeeAll }: { row: RowConfig; onOpenQuick: Props['onOpenQuick']; onSeeAll: Props['onSeeAll'] }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(row.url)
      .then(r => r.json())
      .then(d => { setItems(d.results?.filter((i: MediaItem) => i.poster_path).slice(0, 20) || []); setLoading(false); });
  }, [row.url]);

  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: '0 4px' }}>
        <span style={{ fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10, letterSpacing: -0.3 }}>
          <i className={`fas ${row.icon}`} style={{ color: 'var(--brand-primary)', fontSize: 18 }} /> {row.title}
        </span>
        <button
          onClick={() => onSeeAll(row.seeAllKey, row.seeAllLabel)}
          style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-accent)', cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 5, letterSpacing: 0.3 }}
        >
          See All <i className='fas fa-chevron-right' />
        </button>
      </div>
      <div className='hz-row'>
        {loading
          ? Array(10).fill(0).map((_, i) => (
              <div key={i} style={{ flexShrink: 0, width: 155, aspectRatio: '2/3', borderRadius: 10 }} className='skeleton' />
            ))
          : items.map((item, i) => (
              <div
                key={item.id}
                onClick={() => onOpenQuick(item.id, row.type)}
                style={{
                  flexShrink: 0, width: 155, cursor: 'pointer', borderRadius: 10,
                  overflow: 'hidden', position: 'relative',
                  transition: 'transform 0.32s cubic-bezier(0.4,0,0.2,1)',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08) translateY(-4px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1) translateY(0)')}
              >
                <div style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden' }}>
                  <img
                    src={CONFIG.W500 + item.poster_path}
                    alt={item.title || item.name}
                    loading='lazy'
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  {i < 3 && (
                    <span style={{ position: 'absolute', top: 8, left: 8, zIndex: 3, background: 'var(--brand-primary)', color: 'white', borderRadius: 6, fontSize: 11, fontWeight: 900, padding: '2px 7px', letterSpacing: 0.5 }}>#{i + 1}</span>
                  )}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(0deg, rgba(6,6,8,0.85) 0%, transparent 55%)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 10,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title || item.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{Utils.year(item.release_date || item.first_air_date)} · ⭐ {item.vote_average?.toFixed(1) || 'NR'}</div>
                  </div>
                </div>
              </div>
            ))
        }
      </div>
    </div>
  );
}

export default function HomeRows({ onOpenQuick, onSeeAll }: Props) {
  const [bgImg, setBgImg] = useState('');

  useEffect(() => {
    fetch(`${CONFIG.BASE}/trending/movie/day?api_key=${CONFIG.API_KEY}`)
      .then(r => r.json())
      .then(d => { if (d?.results?.[2]) setBgImg(CONFIG.ORIG + d.results[2].backdrop_path); });
  }, []);

  return (
    <div style={{ padding: '0 4% 20px' }}>
      {ROWS.slice(0, 2).map(row => (
        <RowSection key={row.id} row={row} onOpenQuick={onOpenQuick} onSeeAll={onSeeAll} />
      ))}

      {/* Featured Collection Banner */}
      <div
        onClick={() => onSeeAll('action', 'Action & Thriller')}
        style={{
          marginBottom: 48, borderRadius: 24, overflow: 'hidden', position: 'relative',
          minHeight: 180, background: 'linear-gradient(135deg, #1a0020 0%, #0d0d30 50%, #001a1a 100%)',
          border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
          transition: 'transform 0.32s, box-shadow 0.32s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.75)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        {bgImg && <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${bgImg})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.2, filter: 'blur(2px)' }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(229,9,20,0.15) 0%, rgba(0,212,255,0.08) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '32px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--brand-accent)', marginBottom: 8 }}><i className='fas fa-fire' /> Featured Collection</div>
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.5 }}>Action & Thriller</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>Heart-pounding movies & shows hand-picked for you</div>
          </div>
          <button style={{ flexShrink: 0, background: 'var(--brand-primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 999, fontSize: 14, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className='fas fa-play' /> Explore Now
          </button>
        </div>
      </div>

      {ROWS.slice(2).map(row => (
        <RowSection key={row.id} row={row} onOpenQuick={onOpenQuick} onSeeAll={onSeeAll} />
      ))}
    </div>
  );
}
