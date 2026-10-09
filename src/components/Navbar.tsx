'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useApp, useToast } from '@/context/AppContext';
import { CONFIG } from '@/lib/config';
import { MediaItem } from '@/lib/types';
import Image from 'next/image';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isSubPage = pathname !== '/';
  const { state, dispatch } = useApp();
  const toast = useToast();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const lastScroll = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const inputRef = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      if (y > lastScroll.current + 5 && y > 200) setHidden(true);
      else if (y < lastScroll.current - 5) setHidden(false);
      lastScroll.current = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!searchWrapRef.current?.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleSearchInput = useCallback((q: string) => {
    clearTimeout(debounceRef.current);
    if (q.length > 2) {
      debounceRef.current = setTimeout(async () => {
        const r = await fetch(
          `${CONFIG.BASE}/search/multi?api_key=${CONFIG.API_KEY}&query=${encodeURIComponent(q)}`
        );
        const data = await r.json();
        if (data?.results) {
          setSearchResults(data.results.filter((i: MediaItem) => i.poster_path).slice(0, 6));
          setDropdownOpen(true);
        }
      }, 280);
    } else {
      setSearchResults([]);
    }
  }, []);

  const navigateHome = () => {
    dispatch({ type: 'SHOW_HOME' });
    if (pathname !== '/') router.push('/');
  };

  const navigateBrowse = (type: 'movie' | 'tv') => {
    dispatch({ type: 'SET_MEDIA_TYPE', payload: type });
    dispatch({ type: 'SET_IS_SEARCH', payload: false });
    dispatch({ type: 'SET_FILTERS', payload: { genres: [], year: null, rating: null } });
    dispatch({ type: 'SET_LANG', payload: '' });
    dispatch({ type: 'SET_PROVIDER', payload: { id: '', region: 'IN' } });
    dispatch({
      type: 'SHOW_BROWSE',
      payload: {
        heading: type === 'movie' ? 'Movies' : 'TV Shows',
        icon: type === 'movie' ? 'fa-film' : 'fa-tv',
      },
    });
    if (pathname !== '/') router.push('/');
  };

  const navigateWatchlist = () => {
    dispatch({ type: 'SHOW_WATCHLIST' });
    if (pathname !== '/') router.push('/');
  };

  const commitSearch = (q: string) => {
    dispatch({ type: 'SET_QUERY', payload: q });
    dispatch({ type: 'SET_IS_SEARCH', payload: true });
    dispatch({ type: 'ADD_SEARCH', payload: q });
    dispatch({
      type: 'SHOW_BROWSE',
      payload: { heading: `Results for "${q}"`, icon: 'fa-search' },
    });
    setDropdownOpen(false);
    setMobileSearchOpen(false);
    if (inputRef.current) inputRef.current.value = q;
    if (pathname !== '/') router.push('/');
  };

  const initVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast('Voice search not supported', 'error'); return; }
    const r = new SR();
    r.continuous = false;
    r.start();
    setIsRecording(true);
    r.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      if (inputRef.current) inputRef.current.value = t;
      commitSearch(t);
    };
    r.onend = () => setIsRecording(false);
  };

  const navStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: 'var(--navbar-h)',
    zIndex: 5000, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0 4%',
    background: isSubPage || scrolled
      ? 'rgba(8, 8, 12, 0.96)'
      : 'linear-gradient(to bottom, rgba(6,6,8,0.95) 0%, transparent 100%)',
    backdropFilter: isSubPage || scrolled ? 'blur(24px)' : 'none',
    WebkitBackdropFilter: isSubPage || scrolled ? 'blur(24px)' : 'none',
    borderBottom: isSubPage || scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
    boxShadow: isSubPage || scrolled ? '0 4px 30px rgba(0,0,0,0.7)' : 'none',
    transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
    transition: 'all 0.32s cubic-bezier(0.4,0,0.2,1)',
  };

  return (
    <nav style={navStyle}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
        {/* Logo */}
        <div
          onClick={navigateHome}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
            fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 900, letterSpacing: -1.2,
            color: 'var(--brand-primary)',
            textShadow: '0 0 30px rgba(229,9,20,0.5)',
            userSelect: 'none',
          }}
        >
          {CONFIG.LOGO_IMAGE ? (
            <img
              src={CONFIG.LOGO_IMAGE}
              alt={CONFIG.SITE_NAME}
              style={{ height: 38, width: 'auto', objectFit: 'contain' }}
            />
          ) : (
            <div style={{
              width: 38, height: 38, background: 'var(--brand-primary)',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, color: 'white', boxShadow: 'var(--brand-glow)', flexShrink: 0,
            }}>
              <i className={`fas ${CONFIG.LOGO_ICON}`} />
            </div>
          )}
          <span style={{ background: 'linear-gradient(90deg, #E50914, #ff3344)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {CONFIG.SITE_NAME}
          </span>
        </div>

        {/* Desktop Nav Links */}
        <div className='nav-links-desktop' style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={navigateHome}
            style={{
              background: 'transparent', border: 'none',
              color: pathname === '/' && state.isHomeView ? 'white' : 'var(--text-secondary)',
              fontSize: 15, fontWeight: pathname === '/' && state.isHomeView ? 700 : 500,
              cursor: 'pointer', padding: '8px 16px', borderRadius: 999,
              transition: 'all 0.22s ease',
            }}
          >
            Home
          </button>
          {[
            { label: 'Movies', key: 'movie', icon: null },
            { label: 'TV Shows', key: 'tv', icon: null },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => navigateBrowse(item.key as 'movie' | 'tv')}
              style={{
                background: 'transparent', border: 'none',
                color: pathname === '/' && state.mediaType === item.key && state.isBrowseView
                  ? 'white' : 'var(--text-secondary)',
                fontSize: 15, fontWeight: pathname === '/' && state.mediaType === item.key && state.isBrowseView ? 700 : 500,
                cursor: 'pointer', padding: '8px 16px', borderRadius: 999,
                transition: 'all 0.22s ease',
              }}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={navigateWatchlist}
            style={{
              background: 'transparent', border: 'none',
              color: pathname === '/' && state.isWatchlistView ? 'white' : 'var(--text-secondary)',
              fontWeight: pathname === '/' && state.isWatchlistView ? 700 : 500,
              fontSize: 15, cursor: 'pointer', padding: '8px 16px', borderRadius: 999,
              transition: 'all 0.22s ease',
            }}
          >
            <i className='fas fa-heart' style={{ marginRight: 6 }} /> My List
          </button>
          <Link
            href='/blog'
            style={{
              color: pathname.startsWith('/blog') ? 'white' : 'var(--text-secondary)',
              fontWeight: pathname.startsWith('/blog') ? 700 : 500,
              fontSize: 15,
              padding: '8px 16px',
              borderRadius: 999,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.22s ease',
            }}
          >
            <i className='fas fa-newspaper' /> Blog
          </Link>
          <Link
            href='/admin'
            title='Admin Portal'
            style={{
              color: pathname === '/admin' ? 'var(--brand-primary)' : 'var(--text-muted)',
              fontSize: 14,
              padding: '8px 10px',
              borderRadius: 999,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              opacity: pathname === '/admin' ? 1 : 0.7,
              transition: 'opacity 0.2s',
            }}
          >
            <i className='fas fa-user-shield' />
          </Link>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Mobile search toggle */}
        <button
          className='mobile-search-toggle'
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          style={{
            display: 'none', background: 'none', border: 'none',
            color: 'white', fontSize: 20, cursor: 'pointer', padding: 6,
          }}
        >
          <i className='fas fa-search' />
        </button>

        {/* Search */}
        <div ref={searchWrapRef} style={{ position: 'relative' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.06)',
            border: dropdownOpen ? '1px solid rgba(229,9,20,0.6)' : '1px solid rgba(255,255,255,0.09)',
            borderRadius: 999, padding: '9px 18px',
            width: dropdownOpen ? 380 : 300,
            transition: 'all 0.32s cubic-bezier(0.4,0,0.2,1)',
            backdropFilter: 'blur(10px)',
          }}>
            <i
              className='fas fa-search'
              style={{ color: 'var(--text-tertiary)', cursor: 'pointer' }}
              onClick={() => inputRef.current?.value && commitSearch(inputRef.current.value)}
            />
            <input
              ref={inputRef}
              id='main-search-input'
              type='text'
              placeholder='Search movies, shows...'
              autoComplete='off'
              onFocus={() => setDropdownOpen(true)}
              onChange={(e) => handleSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.value && commitSearch(inputRef.current.value)}
              style={{
                background: 'transparent', border: 'none', color: 'white',
                fontSize: 14, flex: 1, outline: 'none',
              }}
            />
            <i
              className={`fas fa-microphone ${isRecording ? 'animate-pulse-mic' : ''}`}
              onClick={initVoice}
              style={{
                color: isRecording ? 'white' : 'var(--text-tertiary)',
                cursor: 'pointer', padding: '3px 4px', borderRadius: '50%',
              }}
            />
          </div>

          {/* Dropdown */}
          {dropdownOpen && (
            <div
              className='animate-drop-in'
              style={{
                position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                width: '100%', minWidth: 400,
                background: 'var(--bg-surface-2)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 16, boxShadow: '0 16px 48px rgba(0,0,0,0.75)',
                zIndex: 5001, overflow: 'hidden',
              }}
            >
              {searchResults.length > 0 && (
                <>
                  <div style={{ padding: '12px 18px 8px', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Quick Results</div>
                  {searchResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => commitSearch(item.title || item.name || '')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14, padding: '10px 18px',
                        cursor: 'pointer', borderTop: '1px solid rgba(255,255,255,0.05)',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <img
                        src={CONFIG.W500 + item.poster_path}
                        alt=''
                        style={{ width: 40, height: 58, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.title || item.name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3, display: 'flex', gap: 10, alignItems: 'center' }}>
                          <span style={{ background: 'rgba(229,9,20,0.12)', color: '#E50914', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                            {item.media_type || 'movie'}
                          </span>
                          <span><i className='fas fa-star' style={{ color: '#FFD700', fontSize: 11 }} /> {item.vote_average?.toFixed(1) || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
              {state.searches.length > 0 && (
                <>
                  <div style={{ padding: '12px 18px 8px', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Recent</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '4px 18px 16px' }}>
                    {state.searches.map((q) => (
                      <span
                        key={q}
                        onClick={() => commitSearch(q)}
                        style={{
                          background: 'var(--bg-surface-3)', border: '1px solid rgba(255,255,255,0.09)',
                          color: 'var(--text-secondary)', padding: '5px 14px', borderRadius: 999,
                          fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                        }}
                      >
                        <i className='fas fa-history' /> {q}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <button
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
            color: 'var(--text-secondary)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', fontSize: 16, position: 'relative',
          }}
        >
          <i className='fas fa-bell' />
          <span style={{
            position: 'absolute', top: 5, right: 5, width: 8, height: 8,
            background: 'var(--brand-primary)', borderRadius: '50%', border: '2px solid var(--bg-base)',
          }} />
        </button>
      </div>

      {/* Mobile-responsive styles */}
      <style jsx>{`
        @media (max-width: 992px) { .nav-links-desktop { display: none !important; } }
        @media (max-width: 768px) { .mobile-search-toggle { display: block !important; } }
      `}</style>
    </nav>
  );
}
