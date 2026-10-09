'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';

type Tab = 'home' | 'movies' | 'tv' | 'mylist' | 'search';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'home', label: 'Home', icon: 'fa-home' },
  { key: 'movies', label: 'Movies', icon: 'fa-film' },
  { key: 'tv', label: 'TV Shows', icon: 'fa-tv' },
  { key: 'mylist', label: 'My List', icon: 'fa-heart' },
  { key: 'search', label: 'Search', icon: 'fa-search' },
];

export default function MobileBottomNav() {
  const { state, dispatch } = useApp();
  const [active, setActive] = useState<Tab>('home');

  const go = (tab: Tab) => {
    setActive(tab);
    if (tab === 'home') dispatch({ type: 'SHOW_HOME' });
    else if (tab === 'movies') {
      dispatch({ type: 'SET_MEDIA_TYPE', payload: 'movie' });
      dispatch({ type: 'SET_IS_SEARCH', payload: false });
      dispatch({ type: 'SHOW_BROWSE', payload: { heading: 'Movies', icon: 'fa-film' } });
    } else if (tab === 'tv') {
      dispatch({ type: 'SET_MEDIA_TYPE', payload: 'tv' });
      dispatch({ type: 'SET_IS_SEARCH', payload: false });
      dispatch({ type: 'SHOW_BROWSE', payload: { heading: 'TV Shows', icon: 'fa-tv' } });
    } else if (tab === 'mylist') dispatch({ type: 'SHOW_WATCHLIST' });
    else if (tab === 'search') {
      dispatch({ type: 'SHOW_BROWSE', payload: { heading: 'Search', icon: 'fa-search' } });
      setTimeout(() => document.querySelector<HTMLInputElement>('#main-search-input')?.focus(), 100);
    }
  };

  return (
    <>
      <nav
        data-mobile-nav
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 6000,
          background: 'rgba(14,14,18,0.8)', backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '0 0 max(0px, env(safe-area-inset-bottom))',
          display: 'flex', justifyContent: 'space-around', alignItems: 'stretch',
          height: 'var(--bottom-nav-h)',
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => go(tab.key)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 3, background: 'none', border: 'none',
              color: active === tab.key ? 'var(--brand-primary)' : 'var(--text-muted)',
              fontSize: 9, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase',
              letterSpacing: 0.5, transition: 'color 0.22s ease',
            }}
          >
            <i
              className={`fas ${tab.icon}`}
              style={{
                fontSize: 19,
                transform: active === tab.key ? 'scale(1.18)' : 'scale(1)',
                transition: 'transform 0.32s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
      <style>{`@media (min-width: 769px) { nav[data-mobile-nav] { display: none !important; } }`}</style>
    </>
  );
}
