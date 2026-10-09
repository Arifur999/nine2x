import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Nine2x';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: 'linear-gradient(135deg, #FF1E27 0%, #B20710 100%)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
        }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderLeft: '11px solid white',
            marginLeft: 3,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
