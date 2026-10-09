'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/blog';

const DEFAULT_ADMIN_EMAIL = 'hayarifur@gmail.com';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Login form state
  const [email, setEmail] = useState(DEFAULT_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Rate Limiting & Lockout state (5 attempts -> 30 min lockout)
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [countdownText, setCountdownText] = useState('');
  const lockIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Blog list & form state
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [fetchingPosts, setFetchingPosts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // New post fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('Recommendations');
  const [tags, setTags] = useState('movies, reviews, 4k');
  const [coverImage, setCoverImage] = useState('');
  const [content, setContent] = useState('');

  // Initialize lockout state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pf_admin_lock');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.lockedUntil && parsed.lockedUntil > Date.now()) {
          setLockedUntil(parsed.lockedUntil);
        } else {
          setAttempts(parsed.attempts || 0);
        }
      }
    } catch {}

    // Check if session cookie is already valid
    checkAuthSession();
  }, []);

  // Countdown timer for 30-minute lockout
  useEffect(() => {
    if (lockedUntil && lockedUntil > Date.now()) {
      const updateCountdown = () => {
        const diff = lockedUntil - Date.now();
        if (diff <= 0) {
          setLockedUntil(null);
          setAttempts(0);
          setCountdownText('');
          try {
            localStorage.removeItem('pf_admin_lock');
          } catch {}
          if (lockIntervalRef.current) clearInterval(lockIntervalRef.current);
        } else {
          const m = Math.floor(diff / 60000);
          const s = Math.floor((diff % 60000) / 1000);
          setCountdownText(`${m}m ${s < 10 ? '0' : ''}${s}s`);
        }
      };

      updateCountdown();
      lockIntervalRef.current = setInterval(updateCountdown, 1000);
      return () => {
        if (lockIntervalRef.current) clearInterval(lockIntervalRef.current);
      };
    }
  }, [lockedUntil]);

  const checkAuthSession = async () => {
    try {
      const res = await fetch('/api/admin/login');
      if (res.ok) {
        setIsAuthenticated(true);
        fetchPosts();
      }
    } catch {} finally {
      setCheckingAuth(false);
    }
  };

  const fetchPosts = async () => {
    setFetchingPosts(true);
    try {
      const res = await fetch('/api/admin/blogs');
      if (res.ok) {
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : (data.posts || []));
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setFetchingPosts(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockedUntil && lockedUntil > Date.now()) return;

    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsAuthenticated(true);
        setAttempts(0);
        setLockedUntil(null);
        try {
          localStorage.removeItem('pf_admin_lock');
        } catch {}
        fetchPosts();
      } else {
        if (data.locked && data.lockedUntil) {
          setLockedUntil(data.lockedUntil);
          setAttempts(5);
          try {
            localStorage.setItem('pf_admin_lock', JSON.stringify({ attempts: 5, lockedUntil: data.lockedUntil }));
          } catch {}
          setLoginError('Security Alert: 5 failed attempts reached! Portal locked for 30 minutes.');
        } else {
          const nextAttempts = attempts + 1;
          setAttempts(nextAttempts);
          if (nextAttempts >= 5) {
            const lockTime = Date.now() + 30 * 60 * 1000;
            setLockedUntil(lockTime);
            try {
              localStorage.setItem('pf_admin_lock', JSON.stringify({ attempts: 5, lockedUntil: lockTime }));
            } catch {}
            setLoginError('Security Alert: 5 failed attempts reached! Portal locked for 30 minutes.');
          } else {
            try {
              localStorage.setItem('pf_admin_lock', JSON.stringify({ attempts: nextAttempts, lockedUntil: 0 }));
            } catch {}
            const rem = 5 - nextAttempts;
            setLoginError(`Incorrect password! ${rem} attempt${rem !== 1 ? 's' : ''} left before 30-minute lockout.`);
          }
        }
      }
    } catch {
      setLoginError('Connection error. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    setIsAuthenticated(false);
    setPassword('');
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('Title and content are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          excerpt,
          category,
          tags,
          coverImage,
          content,
        }),
      });

      if (res.ok) {
        showToast('Blog post published successfully! 🚀');
        setTitle('');
        setSlug('');
        setExcerpt('');
        setContent('');
        setCoverImage('');
        fetchPosts();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to publish post');
      }
    } catch {
      showToast('Network error while publishing');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const res = await fetch(`/api/admin/blogs?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Post deleted');
        setPosts(posts.filter((p) => p.id !== id));
      } else {
        showToast('Failed to delete post');
      }
    } catch {
      showToast('Error deleting post');
    }
  };

  const isLocked = Boolean(lockedUntil && lockedUntil > Date.now());

  if (checkingAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', gap: 16 }}>
        <i className='fas fa-spinner fa-spin' style={{ fontSize: 32, color: 'var(--brand-primary)' }} />
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Loading Admin Portal...</span>
      </div>
    );
  }

  // ── Simple, Clean Login View ──────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 20px 60px', background: 'var(--bg-base)' }}>
        <div style={{ width: '100%', maxWidth: 440, background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '40px 32px', boxShadow: '0 24px 60px rgba(0,0,0,0.85)' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 26 }}>
            <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #E50914, #b20710)', borderRadius: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'white', marginBottom: 14, boxShadow: '0 8px 24px rgba(229,9,20,0.4)' }}>
              <i className='fas fa-user-shield' />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: 'white', letterSpacing: -0.5 }}>Playflix Super Admin</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Enter your password to manage SEO blogs and content</p>
          </div>

          {/* 30-Minute Security Lockout Alert */}
          {isLocked && (
            <div style={{ background: 'rgba(229,9,20,0.15)', border: '1px solid rgba(229,9,20,0.4)', borderRadius: 12, padding: '16px', marginBottom: 20, textAlign: 'center' }}>
              <div style={{ color: '#ff4d4d', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
                <i className='fas fa-lock' /> Portal Temporarily Locked
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                5 failed attempts reached. Security lockout active for:
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: 'white', marginTop: 6, letterSpacing: 1, fontFamily: 'monospace' }}>
                {countdownText || '30m 00s'}
              </div>
            </div>
          )}

          {/* Normal Error */}
          {loginError && !isLocked && (
            <div style={{ background: 'rgba(229,9,20,0.12)', border: '1px solid rgba(229,9,20,0.3)', color: '#ff6b6b', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 20, textAlign: 'center', fontWeight: 600 }}>
              <i className='fas fa-exclamation-circle' style={{ marginRight: 6 }} />
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Admin Email</label>
              <input
                type='email'
                required
                value={email}
                disabled={isLocked}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='hayarifur@gmail.com'
                style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-surface-2)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, color: 'white', fontSize: 14, marginTop: 6, outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Password</label>
              <input
                type='password'
                required
                disabled={isLocked}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Enter super admin password...'
                autoFocus
                style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-surface-2)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, color: 'white', fontSize: 14, marginTop: 6, outline: 'none' }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6 }}>
                Security: Max 5 attempts allowed before 30-minute lockout
              </div>
            </div>

            <button
              type='submit'
              disabled={loginLoading || isLocked}
              style={{
                background: isLocked ? 'rgba(255,255,255,0.1)' : 'var(--brand-primary)',
                color: isLocked ? 'var(--text-muted)' : 'white',
                border: 'none',
                padding: '14px',
                borderRadius: 999,
                fontSize: 15,
                fontWeight: 800,
                cursor: isLocked ? 'not-allowed' : 'pointer',
                marginTop: 6,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: isLocked ? 'none' : '0 8px 24px rgba(229,9,20,0.3)',
              }}
            >
              {loginLoading ? <i className='fas fa-spinner fa-spin' /> : <i className='fas fa-key' />}
              {isLocked ? 'Portal Locked (30m)' : 'Unlock Admin Portal'}
            </button>
          </form>

          {/* Quick Home Return */}
          <div style={{ textAlign: 'center', marginTop: 22 }}>
            <Link href='/' style={{ color: 'var(--text-tertiary)', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <i className='fas fa-arrow-left' /> Back to Home Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Authenticated Admin Dashboard ─────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingTop: 110, paddingBottom: 60 }}>
      {toastMsg && (
        <div style={{ position: 'fixed', bottom: 30, right: 30, background: 'var(--brand-primary)', color: 'white', padding: '14px 24px', borderRadius: 12, zIndex: 99999, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', fontWeight: 700 }}>
          {toastMsg}
        </div>
      )}

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 4%' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-accent)', textTransform: 'uppercase', letterSpacing: 1.5 }}>
              ⚡ Super Admin Portal
            </span>
            <h1 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 900, color: 'white', letterSpacing: -0.5, marginTop: 4 }}>
              SEO Blog &amp; Content Manager
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href='/' style={{ background: 'var(--bg-surface-2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 18px', borderRadius: 999, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <i className='fas fa-home' /> Home
            </Link>
            <Link href='/blog' target='_blank' style={{ background: 'var(--bg-surface-2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 18px', borderRadius: 999, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <i className='fas fa-external-link-alt' /> Live Blog ({posts.length})
            </Link>
            <button onClick={handleLogout} style={{ background: 'rgba(229,9,20,0.15)', color: 'var(--brand-primary)', border: '1px solid rgba(229,9,20,0.3)', padding: '10px 18px', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <i className='fas fa-sign-out-alt' /> Logout
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
          {/* Post Creation Form */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className='fas fa-pen-fancy' style={{ color: 'var(--brand-primary)' }} /> Create New Article
            </h2>

            <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Article Title (H1)</label>
                <input
                  type='text'
                  required
                  placeholder='e.g., Top 10 Action Movies on Netflix in 2026'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', background: 'var(--bg-surface-2)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8, color: 'white', fontSize: 14, marginTop: 4, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>URL Slug (Auto-generated if empty)</label>
                <input
                  type='text'
                  placeholder='e.g., top-10-action-movies-netflix-2026'
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', background: 'var(--bg-surface-2)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8, color: 'white', fontSize: 14, marginTop: 4, outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', background: 'var(--bg-surface-2)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8, color: 'white', fontSize: 14, marginTop: 4, outline: 'none' }}
                  >
                    <option value='Recommendations'>Recommendations</option>
                    <option value='Marvel & Superhero'>Marvel &amp; Superhero</option>
                    <option value='Action'>Action</option>
                    <option value='Hindi Cinema'>Hindi Cinema</option>
                    <option value='Bengali Cinema'>Bengali Cinema</option>
                    <option value='Korean Drama'>Korean Drama</option>
                    <option value='Guides'>Guides</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Keywords / Tags</label>
                  <input
                    type='text'
                    placeholder='action movies, netflix, 4k'
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', background: 'var(--bg-surface-2)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8, color: 'white', fontSize: 14, marginTop: 4, outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Cover Image URL (Optional)</label>
                <input
                  type='url'
                  placeholder='https://images.unsplash.com/photo-...'
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', background: 'var(--bg-surface-2)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8, color: 'white', fontSize: 14, marginTop: 4, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Excerpt (Meta description for Google)</label>
                <input
                  type='text'
                  placeholder='Catchy 150-character summary for Google search snippet...'
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', background: 'var(--bg-surface-2)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8, color: 'white', fontSize: 14, marginTop: 4, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Full Content (Markdown formatted)</label>
                <textarea
                  required
                  rows={8}
                  placeholder='Write your article in Markdown. Use ## for headings, **bold** for keywords, and write FAQs at the bottom!'
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-surface-2)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8, color: 'white', fontSize: 13, marginTop: 4, outline: 'none', resize: 'vertical', fontFamily: 'monospace' }}
                />
              </div>

              <button
                type='submit'
                disabled={submitting}
                style={{ background: 'var(--brand-primary)', color: 'white', border: 'none', padding: '13px', borderRadius: 999, fontSize: 14, fontWeight: 800, cursor: 'pointer', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {submitting ? <i className='fas fa-spinner fa-spin' /> : <i className='fas fa-rocket' />}
                Publish SEO Article
              </button>
            </form>
          </div>

          {/* Posts List */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className='fas fa-list' style={{ color: 'var(--brand-primary)' }} /> Published Articles ({posts.length})
              </h2>
              <button onClick={fetchPosts} style={{ background: 'transparent', border: 'none', color: 'var(--brand-accent)', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className={`fas fa-sync-alt ${fetchingPosts ? 'fa-spin' : ''}`} /> Refresh
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', maxHeight: 680, paddingRight: 4 }}>
              {posts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)' }}>
                  No blog posts found. Create your first article!
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    style={{ background: 'var(--bg-surface-2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {post.category}
                      </span>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: 'white', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {post.title}
                      </h4>
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                        /{post.slug} · {post.readTime}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <Link
                        href={`/blog/${post.slug}`}
                        target='_blank'
                        style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontSize: 13 }}
                        title='View Article'
                      >
                        <i className='fas fa-eye' />
                      </Link>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.3)', color: '#ff4d4d', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13 }}
                        title='Delete'
                      >
                        <i className='fas fa-trash' />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
