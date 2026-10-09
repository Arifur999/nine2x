import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Playflix';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#E50914',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          color: 'white',
        }}
      >
        ▶
      </div>
    ),
    { ...size }
  );
}
