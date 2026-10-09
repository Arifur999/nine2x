import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Playflix — Free HD Movie & TV Streaming';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #060608 0%, #0e0e12 50%, #1a000a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(229,9,20,0.25) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Logo Icon */}
        <div
          style={{
            width: 90,
            height: 90,
            background: '#E50914',
            borderRadius: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            boxShadow: '0 0 60px rgba(229,9,20,0.6)',
          }}
        >
          <div style={{ fontSize: 48, color: 'white', display: 'flex' }}>▶</div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            color: '#E50914',
            letterSpacing: -3,
            textShadow: '0 0 40px rgba(229,9,20,0.5)',
            marginBottom: 16,
          }}
        >
          Playflix
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: '#b3b3c4',
            fontWeight: 400,
            textAlign: 'center',
            maxWidth: 700,
            lineHeight: 1.4,
          }}
        >
          Stream Movies &amp; TV Shows Online Free
        </div>

        {/* Features row */}
        <div
          style={{
            display: 'flex',
            gap: 24,
            marginTop: 40,
          }}
        >
          {['4K HDR', 'No Subscription', '10K+ Titles', 'Free Forever'].map((f) => (
            <div
              key={f}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 999,
                padding: '8px 22px',
                color: 'white',
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              {f}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
