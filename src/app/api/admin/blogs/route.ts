import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts, savePost, deletePost } from '@/lib/blog';

const SESSION_TOKEN = 'playflix_admin_session_auth_secret_token_2026';

function isAuthorized(req: NextRequest): boolean {
  const cookie = req.cookies.get('pf_admin_auth');
  return cookie?.value === SESSION_TOKEN;
}

export async function GET() {
  const posts = getAllPosts();
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, slug, excerpt, content, coverImage, author, category, tags } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const cleanSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newPost = savePost({
      title,
      slug: cleanSlug,
      excerpt: excerpt || title,
      content,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&auto=format&fit=crop&q=80',
      author: author || 'Playflix Editorial',
      category: category || 'Movies',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t: string) => t.trim()) : ['movies']),
    });

    return NextResponse.json({ success: true, post: newPost });
  } catch {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const deleted = deletePost(id);
    if (deleted) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  } catch {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
