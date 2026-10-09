import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import MobileBottomNav from '@/components/MobileBottomNav';
import Toast from '@/components/Toast';
import ProgressBar from '@/components/ProgressBar';

// ── Font ──────────────────────────────────────────────────────────────────────
const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-outfit',
  preload: true,
});

// ── Site Constants ────────────────────────────────────────────────────────────
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Playflix';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nine2x.tech';
const SITE_DESCRIPTION =
  'Watch the latest movies and TV shows online free in HD & 4K quality. Stream new releases, top-rated films, Bengali cinema, Hindi movies, Korean dramas, and popular web series — no subscription needed.';
const SITE_KEYWORDS =
  'watch movies online free, stream tv shows, HD movies, 4K streaming, Bengali movies, Hindi movies, Korean drama, free streaming, watch online, movies 2024, new releases, web series, no subscription streaming';
const OG_IMAGE = `${SITE_URL}/og-image.png`;

// ── Viewport Export ───────────────────────────────────────────────────────────
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#050507' },
    { media: '(prefers-color-scheme: light)', color: '#050507' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,         // Allow zoom for accessibility (don't block it entirely)
  colorScheme: 'dark',
};

// ── Metadata Export ───────────────────────────────────────────────────────────
export const metadata: Metadata = {
  // ── Basic ──────────────────────────────────────────────────────────────────
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Free HD Movie & TV Streaming`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  creator: SITE_NAME,
  publisher: SITE_NAME,

  // ── Canonical ──────────────────────────────────────────────────────────────
  alternates: {
    canonical: SITE_URL,
    languages: {
      'en-US': `${SITE_URL}/en`,
      'bn-BD': `${SITE_URL}/bn`,
      'hi-IN': `${SITE_URL}/hi`,
    },
  },

  // ── Open Graph (Facebook, WhatsApp, LinkedIn) ──────────────────────────────
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Free HD Movies & TV Shows Streaming`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Stream Movies & TV Shows Free`,
        type: 'image/png',
      },
    ],
  },

  // ── Twitter Card ───────────────────────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Free HD Movies & TV Streaming`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
    creator: '@playflix',
    site: '@playflix',
  },

  // ── Icons & PWA ────────────────────────────────────────────────────────────
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/icon', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.svg',
  },
  manifest: '/manifest.json',

  // ── Robots ─────────────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // ── Verification ───────────────────────────────────────────────────────────
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'MPtRRZFTNQvDuNy4Pz4wh_5DzXJ66uicag2VxCsK7gA',
    other: {
      'msvalidate.01': '89C8962F38EDC376B78FAE1046E701DF',
    },
  },

  // ── Category ───────────────────────────────────────────────────────────────
  category: 'entertainment',
};

// ── JSON-LD Structured Data ───────────────────────────────────────────────────
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      potentialAction: [
        {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      ],
      inLanguage: 'en-US',
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icon-512.png`,
        width: 512,
        height: 512,
      },
      sameAs: [
        'https://twitter.com/playflix',
        'https://www.facebook.com/playflix',
      ],
    },
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: `${SITE_NAME} — Free HD Movies & TV Streaming`,
      description: SITE_DESCRIPTION,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#organization` },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: SITE_URL,
          },
        ],
      },
      inLanguage: 'en-US',
    },
  ],
};

// ── Root Layout ───────────────────────────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' dir='ltr' className={outfit.variable}>
      <head>
        {/* Preconnect for performance */}
        <link rel='preconnect' href='https://image.tmdb.org' crossOrigin='anonymous' />
        <link rel='dns-prefetch' href='https://image.tmdb.org' />
        <link rel='dns-prefetch' href='https://cdnjs.cloudflare.com' />

        {/* FontAwesome — loaded asynchronously to prevent render-blocking */}
        <link
          rel='preload'
          href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
          as='style'
          crossOrigin='anonymous'
        />
        <link
          rel='stylesheet'
          href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
          crossOrigin='anonymous'
          media='print'
          // @ts-expect-error - React standard async stylesheet trick
          onLoad="this.media='all'"
        />
        <noscript>
          <link
            rel='stylesheet'
            href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
          />
        </noscript>

        {/* JSON-LD Structured Data */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Google Analytics 4 (GA4) - Free Traffic & Dwell-Time Tracking */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_path: window.location.pathname,
                    engagement_time_msec: 10000
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body>
        <AppProvider>
          <ProgressBar />
          <Toast />
          {/* Skip navigation for accessibility (screen readers & SEO) */}
          <a
            href='#main-content'
            style={{
              position: 'absolute',
              left: '-9999px',
              top: 'auto',
              width: 1,
              height: 1,
              overflow: 'hidden',
            }}
          >
            Skip to main content
          </a>
          <Navbar />
          <main id='main-content' role='main'>
            {children}
          </main>
          <MobileBottomNav />
        </AppProvider>
      </body>
    </html>
  );
}
