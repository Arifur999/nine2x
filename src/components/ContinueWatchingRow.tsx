'use client';
import { useApp, useToast } from '@/context/AppContext';
import { CONFIG } from '@/lib/config';

interface Props {
  onOpenFull: (id: number, type: string) => void;
}

export default function ContinueWatchingRow({ onOpenFull }: Props) {
  const { state, dispatch } = useApp();
  const toast = useToast();

  if (!state.continueWatch.length) return null;

  return (
    <div style={{ padding: '0 4% 20px' }}>
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: '0 4px' }}>
          <span style={{ fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10, letterSpacing: -0.3 }}>
            <i className='fas fa-history' style={{ color: 'var(--brand-primary)', fontSize: 18 }} /> Continue Watching
          </span>
          <button
            onClick={() => { dispatch({ type: 'CLEAR_CONTINUE' }); toast('Cleared', 'info'); }}
            style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-accent)', cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 5 }}
          >
            Clear All <i className='fas fa-trash-alt' />
          </button>
        </div>
        <div className='hz-row'>
          {state.continueWatch.map(c => (
            <div
              key={c.id}
              style={{ flexShrink: 0, width: 240, cursor: 'pointer', borderRadius: 10, overflow: 'hidden', position: 'relative', background: 'var(--bg-card)', transition: 'transform 0.32s', }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04) translateY(-4px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1) translateY(0)')}
              onClick={() => onOpenFull(c.id, c.type)}
            >
              <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
                <img src={CONFIG.W500 + c.poster} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading='lazy' />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.22s' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                >
                  <div style={{ width: 50, height: 50, background: 'var(--brand-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'white' }}>
                    <i className='fas fa-play' style={{ marginLeft: 2 }} />
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); dispatch({ type: 'REMOVE_CONTINUE', payload: c.id }); }}
                  style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, background: 'rgba(0,0,0,0.7)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <i className='fas fa-times' />
                </button>
              </div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.15)' }}>
                <div style={{ height: '100%', width: `${c.progress}%`, background: 'var(--brand-primary)' }} />
              </div>
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 }}>{c.type === 'tv' ? 'Continue watching' : 'Continue'} · {c.progress}% watched</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
