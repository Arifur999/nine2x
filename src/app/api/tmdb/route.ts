import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '05902896074695709d7763505bb88b4d';
const TMDB_BASE = 'https://api.themoviedb.org/3';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let path = searchParams.get('path') || '';

    // If path is missing, try to get from pathname or error
    if (!path) {
      return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 });
    }

    // Collect all forwarded params
    const forwardParams = new URLSearchParams();

    // Check if path itself contained extra query string e.g. path=/movie/popular?language=en
    if (path.includes('?')) {
      const [cleanPath, innerQuery] = path.split('?');
      path = cleanPath;
      const innerParams = new URLSearchParams(innerQuery);
      innerParams.forEach((val, key) => {
        forwardParams.set(key, val);
      });
    }

    // Add query params from outer URL (excluding 'path')
    searchParams.forEach((val, key) => {
      if (key !== 'path') {
        forwardParams.set(key, val);
      }
    });

    // Always enforce our valid server TMDB API key
    forwardParams.set('api_key', TMDB_API_KEY);

    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const targetUrl = `${TMDB_BASE}${cleanPath}?${forwardParams.toString()}`;

    const res = await fetch(targetUrl, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: `TMDB responded with ${res.status}`, details: errorText },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
      },
    });
  } catch (err: any) {
    console.error('TMDB Proxy Error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch from TMDB', message: err?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
