'use client';
import { useState, useEffect } from 'react';
import { CONFIG } from '@/lib/config';

export default function StatsBar() {
  const [movies, setMovies] = useState('10K+');
  const [shows, setShows] = useState('5K+');

  useEffect(() => {
    fetch(`${CONFIG.BASE}/discover/movie?api_key=${CONFIG.API_KEY}&page=1`)
      .then(r => r.json())
      .then(d => { if (d?.total_results) setMovies(d.total_results > 9999 ? `${Math.round(d.total_results / 1000)}K+` : String(d.total_results)); });
    fetch(`${CONFIG.BASE}/discover/tv?api_key=${CONFIG.API_KEY}&page=1`)
      .then(r => r.json())
      .then(d => { if (d?.total_results) setShows(d.total_results > 9999 ? `${Math.round(d.total_results / 1000)}K+` : String(d.total_results)); });
  }, []);

  const stats = [
    { num: movies, label: 'Movies' },
    { num: shows, label: 'TV Shows' },
    { num: '4K', label: 'HDR Quality' },
    { num: 'Free', label: 'No Subscription' },
  ];

  return (
    <div style={{ display: 'flex', gap: 24, padding: '0 4% 28px', flexWrap: 'wrap', alignItems: 'center' }}>
      {stats.map((s, i) => (
        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--brand-primary)' }}>{s.num}</span>
            <span style={{ fontSize: 13, color: 'var(--text-tertiary)', fontWeight: 500 }}>{s.label}</span>
          </div>
          {i < stats.length - 1 && <span style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.05)' }} />}
        </div>
      ))}
    </div>
  );
}
