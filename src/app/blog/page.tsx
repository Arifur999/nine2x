import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Movie Reviews, Recommendations & Streaming News | Playflix Blog',
  description:
    'Discover the latest movie reviews, web series recommendations, 4K streaming guides, and top 10 rankings on the Playflix Blog.',
  keywords: 'movie blog, movie reviews, streaming guides, top 10 movies, web series recommendations',
  alternates: {
    canonical: 'https://nine2x.tech/blog',
  },
  openGraph: {
    title: 'Playflix Blog — Streaming News & Reviews',
    description: 'Expert reviews, watch guides, and recommendations for movies & shows.',
    url: 'https://nine2x.tech/blog',
    type: 'website',
  },
};

export default function BlogListingPage() {
  const posts = getAllPosts();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingTop: 100, paddingBottom: 80 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 4%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: 2 }}>
            <i className='fas fa-newspaper' /> Playflix Editorial
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 900, color: 'white', marginTop: 10, letterSpacing: -1 }}>
            Streaming Guides &amp; Movie Reviews
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 640, margin: '14px auto 0', lineHeight: 1.6 }}>
            Curated recommendations, reviews, and insider streaming tips to help you find your next favourite binge.
          </p>
        </div>

        {/* Blog Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 28 }}>
          {posts.map((post) => (
            <article
              key={post.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 18,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s',
              }}
            >
              <div style={{ position: 'relative', width: '100%', height: 210, overflow: 'hidden' }}>
                <img
                  src={post.coverImage || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80'}
                  alt={post.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading='lazy'
                />
                <span
                  style={{
                    position: 'absolute',
                    top: 14,
                    left: 14,
                    background: 'var(--brand-primary)',
                    color: 'white',
                    padding: '3px 10px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  {post.category}
                </span>
              </div>

              <div style={{ padding: '24px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 12 }}>
                  <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>

                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'white', lineHeight: 1.3, marginBottom: 12, letterSpacing: -0.3 }}>
                  <Link href={`/blog/${post.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {post.title}
                  </Link>
                </h2>

                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
                  {post.excerpt}
                </p>

                <Link
                  href={`/blog/${post.slug}`}
                  style={{
                    color: 'var(--brand-primary)',
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  Read Full Article <i className='fas fa-arrow-right' style={{ fontSize: 12 }} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
