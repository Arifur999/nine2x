import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '404 — Page Not Found | Playflix',
  description: 'Oops! This page could not be found. Go back to Playflix and keep streaming.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
        color: 'white',
        fontFamily: 'Outfit, sans-serif',
        textAlign: 'center',
        padding: '0 24px',
      }}
    >
      <div style={{ fontSize: 120, fontWeight: 900, color: '#E50914', lineHeight: 1, letterSpacing: -4 }}>
        404
      </div>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginTop: 16, marginBottom: 12 }}>
        Page Not Found
      </h1>
      <p style={{ fontSize: 16, color: '#b3b3c4', maxWidth: 440, lineHeight: 1.6, marginBottom: 36 }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Go back to the homepage and keep streaming your favourite movies &amp; shows.
      </p>
      <Link
        href='/'
        style={{
          background: '#E50914',
          color: 'white',
          padding: '14px 32px',
          borderRadius: 999,
          fontSize: 16,
          fontWeight: 700,
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        ← Back to Playflix
      </Link>
    </div>
  );
}
