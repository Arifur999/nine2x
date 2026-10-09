'use client';
import { useApp } from '@/context/AppContext';

export default function Toast() {
  const { state } = useApp();
  const t = state.toast;

  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle',
  };
  const colors = {
    success: '#46d369',
    error: '#E50914',
    info: '#00D4FF',
  };

  return (
    <div
      style={{
        position: 'fixed', bottom: 90, left: '50%',
        transform: t ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(20px)',
        zIndex: 99998,
        opacity: t ? 1 : 0,
        transition: 'all 0.32s cubic-bezier(0.4,0,0.2,1)',
        pointerEvents: 'none',
      }}
    >
      {t && (
        <div style={{
          background: 'rgba(14,14,18,0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.09)',
          color: 'white',
          padding: '12px 24px 12px 16px',
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.55)',
          whiteSpace: 'nowrap',
        }}>
          <i className={`fas ${icons[t.type]}`} style={{ color: colors[t.type], fontSize: 16 }} />
          <span>{t.msg}</span>
        </div>
      )}
    </div>
  );
}
