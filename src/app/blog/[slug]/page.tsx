import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostBySlug, getAllPosts } from '@/lib/blog';

interface Props {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: 'Post Not Found | Playflix' };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nine2x.tech';
  const url = `${siteUrl}/blog/${post.slug}`;
  const ogImg = post.coverImage || `${siteUrl}/opengraph-image`;

  return {
    title: `${post.title} | Playflix`,
    description: post.excerpt,
    keywords: post.tags.join(', '),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: 'article',
      publishedTime: post.createdAt,
      authors: [post.author],
      images: [{ url: ogImg, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [ogImg],
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  // JSON-LD schema for Google News / Articles & FAQPage Schema for Search
  const schemas: any[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      image: [post.coverImage || 'https://nine2x.tech/og-image.png'],
      datePublished: post.createdAt,
      dateModified: post.createdAt,
      author: {
        '@type': 'Person',
        name: post.author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Playflix',
        logo: {
          '@type': 'ImageObject',
          url: 'https://playflix.vercel.app/icon-512.png',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://playflix.vercel.app/blog/${post.slug}`,
      },
    },
  ];

  if (post.faqs && post.faqs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: post.faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer,
        },
      })),
    });
  }

  return (
    <article style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingTop: 100, paddingBottom: 80 }}>
      {schemas.map((s, idx) => (
        <script
          key={idx}
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 4%' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20 }}>
          <Link href='/' style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link href='/blog' style={{ color: 'inherit', textDecoration: 'none' }}>Blog</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>{post.category}</span>
        </div>

        {/* Category & Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <span style={{ background: 'var(--brand-primary)', color: 'white', padding: '3px 12px', borderRadius: 999, fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>
            {post.category}
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{post.readTime}</span>
          <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>•</span>
          <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
            {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: 900, color: 'white', lineHeight: 1.15, letterSpacing: -1, marginBottom: 20 }}>
          {post.title}
        </h1>

        {/* Author row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 30 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'white' }}>
            <i className='fas fa-user-edit' />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{post.author}</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Entertainment Columnist</div>
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div style={{ width: '100%', borderRadius: 20, overflow: 'hidden', marginBottom: 40, boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
            <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 480, objectFit: 'cover' }} />
          </div>
        )}

        {/* Content */}
        <div style={{ fontSize: 17, lineHeight: 1.8, color: '#d0d0dc', whiteSpace: 'pre-line', marginBottom: 50 }}>
          {post.content}
        </div>

        {/* FAQ Section with Elegant Accordion Cards (Google Answer Snippets) */}
        {post.faqs && post.faqs.length > 0 && (
          <div style={{ marginBottom: 50, background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '28px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <i className='fas fa-question-circle' style={{ color: 'var(--brand-primary)', fontSize: 22 }} />
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: -0.5, margin: 0 }}>
                Frequently Asked Questions (FAQ)
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {post.faqs.map((faq, i) => (
                <div key={i} style={{ background: 'var(--bg-surface-2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '16px 20px' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--brand-accent)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className='fas fa-chevron-right' style={{ fontSize: 12, color: 'var(--brand-primary)' }} /> {faq.question}
                  </h3>
                  <p style={{ fontSize: 15, color: '#c0c0d0', lineHeight: 1.65, margin: 0 }}>
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '24px 0', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 40 }}>
          {post.tags.map((tag) => (
            <span key={tag} style={{ background: 'var(--bg-surface-2)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)', padding: '6px 14px', borderRadius: 999, fontSize: 13 }}>
              #{tag}
            </span>
          ))}
        </div>

        {/* Back Link */}
        <div style={{ textAlign: 'center' }}>
          <Link href='/blog' style={{ background: 'var(--bg-surface-2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px 28px', borderRadius: 999, textDecoration: 'none', fontSize: 14, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <i className='fas fa-arrow-left' /> Back to All Articles
          </Link>
        </div>
      </div>
    </article>
  );
}
