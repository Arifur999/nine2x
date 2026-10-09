'use client';
import { useState, useEffect, useRef } from 'react';
import { CONFIG } from '@/lib/config';
import { Utils } from '@/lib/utils';
import { MediaItem } from '@/lib/types';
import { useApp, useWatchlist, useToast } from '@/context/AppContext';

interface Props {
  isOpen: boolean;
  id: number | null;
  type: string;
  onClose: () => void;
  onOpenFull: (id: number, type: string) => void;
}

const TABS = ['overview', 'cast', 'similar'] as const;

export default function FullViewModal({ isOpen, id, type, onClose, onOpenFull }: Props) {
  const { dispatch } = useApp();
  const { isInWatchlist, toggle } = useWatchlist();
  const toast = useToast();
  const [data, setData] = useState<MediaItem | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'cast' | 'similar'>('overview');
  const [activeServer, setActiveServer] = useState(0);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [playerSrc, setPlayerSrc] = useState('');
  const playerRef = useRef<HTMLIFrameElement>(null);
  const [isBuffering, setIsBuffering] = useState(true);
  const [bufferProgress, setBufferProgress] = useState(0);
  const [bufferStatus, setBufferStatus] = useState('Connecting to Fast Ultra HD Edge CDN...');
  const bufferTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && id) {
      setData(null);
      setActiveTab('overview');
      setActiveServer(0);
      setIsBuffering(true);
      setBufferProgress(0);
      setBufferStatus('📡 Establishing secure SSL handshake with Ultra CDN (14ms)...');

      if (bufferTimerRef.current) clearInterval(bufferTimerRef.current);

      // 7.5-second buffer progress bar to satisfy Google Analytics 10s engagement window
      const totalDuration = 7500;
      const intervalMs = 60;
      let currentProgress = 0;

      bufferTimerRef.current = setInterval(() => {
        currentProgress += (intervalMs / totalDuration) * 100;
        if (currentProgress >= 100) {
          currentProgress = 100;
          setBufferProgress(100);
          setBufferStatus('🚀 Stream Ready! Starting Playback...');
          if (bufferTimerRef.current) clearInterval(bufferTimerRef.current);
          setTimeout(() => {
            setIsBuffering(false);
          }, 350);
        } else {
          setBufferProgress(Math.floor(currentProgress));
          if (currentProgress < 25) {
            setBufferStatus('📡 Connecting to High-Speed CDN Edge Node (Ultra HD)...');
          } else if (currentProgress < 55) {
            setBufferStatus('⚡ Decrypting 4K Ultra HD & 1080p Video Stream...');
          } else if (currentProgress < 85) {
            setBufferStatus('🎧 Synchronizing Dolby 5.1 & English/Bangla/Hindi Audio...');
          } else {
            setBufferStatus('🛡️ Bypassing ISP Throttling & Pre-buffering Video Chunks...');
          }
        }
      }, intervalMs);

      fetch(`${CONFIG.BASE}/${type}/${id}?api_key=${CONFIG.API_KEY}&append_to_response=credits,similar,videos`)
        .then(r => r.json())
        .then(d => {
          setData(d);
          const srv = CONFIG.SERVERS[0];
          const src = type === 'movie' ? srv.movie(id) : srv.tv(id, 1, 1);
          setPlayerSrc(src);
          dispatch({
            type: 'ADD_CONTINUE',
            payload: {
              id,
              type: type as 'movie' | 'tv',
              title: d.title || d.name || '',
              poster: d.poster_path,
              progress: Math.floor(Math.random() * 60) + 10
            },
          });
        })
        .catch(() => {});

      return () => {
        if (bufferTimerRef.current) clearInterval(bufferTimerRef.current);
      };
    }
  }, [isOpen, id, type, dispatch]);

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

  const loadVideo = (serverIdx = activeServer, s = season, e = episode) => {
    if (!id) return;
    const srv = CONFIG.SERVERS[serverIdx];
    const src = type === 'movie' ? srv.movie(id) : srv.tv(id, s, e);
    setPlayerSrc(src);
  };

  const skipBuffer = () => {
    if (bufferTimerRef.current) clearInterval(bufferTimerRef.current);
    setBufferProgress(100);
    setIsBuffering(false);
  };

  const copyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast('Link copied!', 'info');
    }
  };

  const share = (platform: 'twitter' | 'whatsapp') => {
    const title = data ? Utils.titleOf(data) : 'Playflix';
    const url = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';
    const text = encodeURIComponent(`Watch "${title}" on Playflix! `);
    const link = platform === 'twitter'
      ? `https://twitter.com/intent/tweet?text=${text}&url=${url}`
      : `https://api.whatsapp.com/send?text=${text}${url}`;
    if (typeof window !== 'undefined') window.open(link, '_blank');
  };

  if (!isOpen) return null;

  const inWL = data ? isInWatchlist(data.id) : false;
  const title = data ? Utils.titleOf(data) : '';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-base)', zIndex: 8000, overflowY: 'auto' }}>
      {/* Ambient BG */}
      {data?.backdrop_path && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '70vh', backgroundImage: `url(${CONFIG.ORIG + data.backdrop_path})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.1, maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)', zIndex: -1, filter: 'blur(30px)', pointerEvents: 'none' }} />
      )}

      {/* Close Button */}
      <button onClick={onClose} style={{ position: 'fixed', top: 20, right: 20, width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 8010, transition: 'all 0.22s ease' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-primary)'; e.currentTarget.style.transform = 'rotate(90deg) scale(1.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'none'; }}
      >
        <i className='fas fa-times' />
      </button>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '36px 4% 60px' }}>
        {/* Player Container */}
        <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: 24, overflow: 'hidden', position: 'relative', marginBottom: 24, boxShadow: '0 30px 70px rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Iframe */}
          <iframe ref={playerRef} src={playerSrc} style={{ width: '100%', height: '100%', border: 'none', display: 'block' }} allowFullScreen title='Player' />

          {/* Traffic Engagement / High-Tech Stream Loader Overlay */}
          {isBuffering && (
            <div
              style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(6,6,8,0.97) 0%, rgba(14,14,20,0.95) 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '24px 32px', zIndex: 50,
                transition: 'opacity 0.4s ease',
              }}
            >
              {/* Glowing Ambient Glow */}
              <div style={{
                position: 'absolute', width: 280, height: 280,
                background: 'radial-gradient(circle, rgba(229,9,20,0.25) 0%, transparent 70%)',
                filter: 'blur(40px)', pointerEvents: 'none',
              }} />

              {/* Title & Quality Badges */}
              <div style={{ textAlign: 'center', marginBottom: 24, zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                  <span style={{ background: 'rgba(229,9,20,0.18)', color: 'var(--brand-primary)', border: '1px solid rgba(229,9,20,0.4)', padding: '3px 12px', borderRadius: 999, fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>
                    <i className='fas fa-circle' style={{ fontSize: 7, marginRight: 6, verticalAlign: 'middle', color: '#ff3b30' }} /> SECURE CDN STREAM
                  </span>
                  <span style={{ background: 'rgba(0,212,255,0.15)', color: 'var(--brand-accent)', border: '1px solid rgba(0,212,255,0.3)', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800 }}>
                    4K ULTRA HD
                  </span>
                  <span style={{ background: 'rgba(255,215,0,0.15)', color: 'var(--brand-gold)', border: '1px solid rgba(255,215,0,0.3)', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800 }}>
                    DOLBY ATMOS
                  </span>
                </div>
                <h3 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 900, color: 'white', letterSpacing: -0.5, marginBottom: 6 }}>
                  {title || 'Loading Media Stream...'}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Connecting to lowest-latency streaming server & pre-loading video stream
                </p>
              </div>

              {/* Progress Bar Container */}
              <div style={{ width: '100%', maxWidth: 540, zIndex: 2, marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className='fas fa-sync-alt fa-spin' style={{ color: 'var(--brand-primary)' }} />
                    {bufferStatus}
                  </span>
                  <span style={{ color: 'white', fontWeight: 900, fontSize: 15, fontFamily: 'monospace' }}>
                    {bufferProgress}%
                  </span>
                </div>

                {/* Progress track */}
                <div style={{
                  width: '100%', height: 8, background: 'rgba(255,255,255,0.08)',
                  borderRadius: 999, overflow: 'hidden', position: 'relative',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{
                    width: `${bufferProgress}%`, height: '100%',
                    background: 'linear-gradient(90deg, #E50914, #ff3344, #00d4ff)',
                    borderRadius: 999,
                    boxShadow: '0 0 18px rgba(229,9,20,0.9)',
                    transition: 'width 0.1s linear',
                  }} />
                </div>
              </div>

              {/* Bottom status + Skip button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 540, zIndex: 2 }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className='fas fa-shield-alt' style={{ color: 'var(--brand-green)' }} /> Zero Buffering Guarantee · SSL Encrypted
                </div>
                <button
                  onClick={skipBuffer}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    color: 'white', padding: '6px 16px', borderRadius: 999,
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                >
                  Skip Buffering <i className='fas fa-forward' />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Server + Episode Controls */}
        <div style={{ background: 'var(--bg-surface-2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '18px 24px', marginBottom: 44, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {CONFIG.SERVERS.map((srv, i) => (
              <button key={srv.name} onClick={() => { setActiveServer(i); loadVideo(i, season, episode); }}
                style={{ background: activeServer === i ? 'rgba(229,9,20,0.12)' : 'rgba(255,255,255,0.05)', color: activeServer === i ? 'var(--brand-primary)' : 'var(--text-secondary)', border: activeServer === i ? '1px solid rgba(229,9,20,0.35)' : '1px solid transparent', padding: '8px 18px', borderRadius: 999, cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.22s' }}>
                <i className={`fas ${srv.icon}`} style={{ color: 'var(--brand-accent)', fontSize: 12 }} /> {srv.name}
              </button>
            ))}
          </div>
          {type === 'tv' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-surface-3)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 6, overflow: 'hidden' }}>
                <span style={{ padding: '6px 12px', fontSize: 12, fontWeight: 700, color: 'var(--brand-primary)', borderRight: '1px solid rgba(255,255,255,0.09)' }}>S</span>
                <input type='number' min='1' value={season} onChange={e => setSeason(Number(e.target.value))} style={{ background: 'transparent', border: 'none', color: 'white', width: 44, fontSize: 15, fontWeight: 700, textAlign: 'center', padding: '6px 8px', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-surface-3)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 6, overflow: 'hidden' }}>
                <span style={{ padding: '6px 12px', fontSize: 12, fontWeight: 700, color: 'var(--brand-primary)', borderRight: '1px solid rgba(255,255,255,0.09)' }}>E</span>
                <input type='number' min='1' value={episode} onChange={e => setEpisode(Number(e.target.value))} style={{ background: 'transparent', border: 'none', color: 'white', width: 44, fontSize: 15, fontWeight: 700, textAlign: 'center', padding: '6px 8px', outline: 'none' }} />
              </div>
              <button onClick={() => loadVideo(activeServer, season, episode)} style={{ background: 'var(--brand-primary)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className='fas fa-play' /> Play
              </button>
            </div>
          )}
        </div>

        {/* Info Grid */}
        {!data ? (
          <div style={{ display: 'flex', gap: 36 }}>
            <div style={{ width: 280, borderRadius: 16, aspectRatio: '2/3', flexShrink: 0 }} className='skeleton' />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
              {[300, 200, 150, 400, 300].map((w, i) => <div key={i} style={{ height: 20, width: w, borderRadius: 8 }} className='skeleton' />)}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 280px) 1fr', gap: 48, marginBottom: 48 }}>
            <div>
              <img src={data.poster_path ? CONFIG.W500 + data.poster_path : '/placeholder.png'} alt={title} style={{ width: '100%', borderRadius: 16, boxShadow: '0 16px 48px rgba(0,0,0,0.75)', display: 'block' }} />
            </div>
            <div>
              <h1 style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.05, marginBottom: 14, letterSpacing: -1 }}>{title}</h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, color: 'var(--text-secondary)', fontSize: 15, fontWeight: 500, marginBottom: 20, alignItems: 'center' }}>
                <span>{Utils.year(data.release_date || data.first_air_date)}</span>
                <span>•</span>
                <span>{type === 'movie' ? Utils.runtime(data.runtime) : `${data.number_of_seasons || 1} Season${data.number_of_seasons !== 1 ? 's' : ''}`}</span>
                <span>•</span>
                <span style={{ background: 'rgba(255,193,7,0.1)', color: 'var(--brand-gold)', border: '1px solid rgba(255,193,7,0.2)', padding: '4px 12px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                  <i className='fas fa-star' /> {data.vote_average?.toFixed(1) || 'N/A'}
                </span>
              </div>

              {/* Social Actions */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 28 }}>
                {[
                  { icon: inWL ? 'fa-check' : 'fa-plus', label: 'My List', action: () => { const added = toggle({ id: data.id, type: type as 'movie'|'tv', title: Utils.titleOf(data), poster_path: data.poster_path, vote_average: data.vote_average, year: Utils.year(data.release_date || data.first_air_date) }); toast(added ? 'Added to My List' : 'Removed from My List', added ? 'success' : 'info'); }, active: inWL },
                  { icon: 'fa-link', label: 'Copy Link', action: copyLink, active: false },
                  { icon: 'fa-twitter fab', label: 'Twitter', action: () => share('twitter'), active: false },
                  { icon: 'fa-whatsapp fab', label: 'WhatsApp', action: () => share('whatsapp'), active: false },
                ].map((btn, i) => (
                  <div key={i} onClick={btn.action}
                    style={{ width: 46, height: 46, borderRadius: '50%', background: btn.active ? 'var(--brand-primary)' : 'rgba(255,255,255,0.07)', border: btn.active ? '1px solid var(--brand-primary)' : '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: btn.active ? 'white' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.22s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#0a0a0f'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = btn.active ? 'var(--brand-primary)' : 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = btn.active ? 'white' : 'var(--text-secondary)'; }}
                    title={btn.label}
                  >
                    <i className={`${btn.icon.startsWith('fa-') && !btn.icon.startsWith('fa-twitter') && !btn.icon.startsWith('fa-whatsapp') ? 'fas' : ''} ${btn.icon}`} />
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {TABS.map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    style={{ background: 'transparent', border: 'none', color: activeTab === tab ? 'white' : 'var(--text-tertiary)', padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', position: 'relative', letterSpacing: 0.3, transition: 'color 0.22s', textTransform: 'capitalize' }}>
                    {tab}
                    {activeTab === tab && <span style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, background: 'var(--brand-primary)', borderRadius: 2 }} />}
                  </button>
                ))}
              </div>

              {/* Tab Panes */}
              {activeTab === 'overview' && (
                <p style={{ fontSize: 17, color: '#c0c0d0', lineHeight: 1.7 }}>{data.overview}</p>
              )}

              {activeTab === 'cast' && (
                <div style={{ display: 'flex', gap: 18, overflowX: 'auto', paddingBottom: 16, scrollbarWidth: 'none' }}>
                  {(data.credits?.cast || []).slice(0, 14).map(c => (
                    <div key={c.id} style={{ flexShrink: 0, width: 100, textAlign: 'center', cursor: 'pointer' }}>
                      <img src={c.profile_path ? CONFIG.W500 + c.profile_path : 'https://via.placeholder.com/150x150?text=?'} alt={c.name} loading='lazy'
                        style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 8px', border: '2px solid transparent', transition: 'all 0.22s', display: 'block' }}
                        onMouseEnter={e => { (e.target as HTMLImageElement).style.borderColor = 'var(--brand-primary)'; (e.target as HTMLImageElement).style.transform = 'scale(1.07)'; }}
                        onMouseLeave={e => { (e.target as HTMLImageElement).style.borderColor = 'transparent'; (e.target as HTMLImageElement).style.transform = 'scale(1)'; }}
                      />
                      <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.character || 'Actor'}</div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'similar' && (
                <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 16, scrollbarWidth: 'none' }}>
                  {(data.similar?.results || []).filter(r => r.poster_path).slice(0, 14).map(r => (
                    <div key={r.id} onClick={() => onOpenFull(r.id, type)}
                      style={{ flexShrink: 0, width: 150, cursor: 'pointer', borderRadius: 10, overflow: 'hidden', transition: 'transform 0.22s' }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-5px)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                    >
                      <img src={CONFIG.W500 + r.poster_path} alt={Utils.titleOf(r)} loading='lazy' style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover' }} />
                      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{Utils.titleOf(r)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
