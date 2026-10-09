import type { Metadata, Viewport } from 'next';

// ── Reusable SEO helper for individual movie/TV pages ─────────────────────────
// Usage: export const metadata = generateMetadata({ title: 'Movie Name', ... })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://playflix.vercel.app';
const SITE_NAME = 'Playflix';

interface GenerateMetadataOptions {
  title: string;
  description?: string;
  image?: string;
  type?: 'website' | 'video.movie' | 'video.tv_show';
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
}

export function generateSEO({
  title,
  description,
  image,
  type = 'website',
  path = '',
  keywords = [],
  noIndex = false,
}: GenerateMetadataOptions): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const url = `${SITE_URL}${path}`;
  const ogImage = image || `${SITE_URL}/opengraph-image`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      type,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

// ── Core Web Vitals / Performance helpers ─────────────────────────────────────

/** Preload a critical image URL so it doesn't block LCP */
export function getPreloadImageLink(src: string) {
  return { rel: 'preload', as: 'image', href: src };
}

/** Build a canonical URL from a path */
export function canonical(path: string) {
  return `${SITE_URL}${path.startsWith('/') ? path : '/' + path}`;
}
