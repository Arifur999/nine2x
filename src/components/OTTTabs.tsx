'use client';
import { useState } from 'react';
import { CONFIG } from '@/lib/config';
import { useApp } from '@/context/AppContext';
import { Platform } from '@/lib/types';

export default function OTTTabs() {
  const { dispatch } = useApp();
  const [activeIdx, setActiveIdx] = useState(0);

  const select = (p: Platform, i: number) => {
    setActiveIdx(i);
    dispatch({ type: 'SET_IS_SEARCH', payload: false });
    dispatch({ type: 'SET_QUERY', payload: '' });
    dispatch({ type: 'SET_PROVIDER', payload: { id: p.id, region: p.region } });
    dispatch({
      type: 'SHOW_BROWSE',
      payload: { heading: p.id ? p.name : 'Trending Now', icon: 'fa-bolt' },
    });
  };

  return (
    <section style={{ paddingTop: 'calc(var(--navbar-h) + 20px)', paddingBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, padding: '0 4%' }}>
        <i className='fas fa-bolt' style={{ color: 'var(--brand-gold)' }} /> Explore Platforms
        <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)', maxWidth: 80, display: 'block' }} />
      </div>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '4px 4% 12px', scrollbarWidth: 'none' }}>
        {CONFIG.PLATFORMS.map((p, i) => (
          <div
            key={p.id || 'all'}
            onClick={() => select(p, i)}
            style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: 40, minWidth: 80, padding: '0 18px',
              background: activeIdx === i ? 'rgba(229,9,20,0.12)' : 'var(--bg-surface-2)',
              border: activeIdx === i ? '1px solid var(--brand-primary)' : '1px solid rgba(255,255,255,0.09)',
              borderRadius: 999, cursor: 'pointer',
              boxShadow: activeIdx === i ? '0 0 20px rgba(229,9,20,0.15)' : 'none',
              transition: 'all 0.32s cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            {p.logo ? (
              <img
                src={p.logo}
                alt={p.name}
                width={60}
                height={20}
                loading='lazy'
                decoding='async'
                style={{ height: 20, width: 'auto', maxWidth: 80, objectFit: 'contain', filter: p.invert ? 'invert(1) brightness(0.9)' : 'none' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: -0.3, color: p.color || 'white' }}>{p.name}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
