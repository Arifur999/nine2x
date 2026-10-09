import fs from 'fs';
import path from 'path';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: string;
  category: string;
  tags: string[];
  createdAt: string;
  readTime: string;
  faqs?: FAQItem[];
}

const blogsFilePath = path.join(process.cwd(), 'content', 'blogs.json');

function ensureFile() {
  const dir = path.dirname(blogsFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(blogsFilePath)) {
    fs.writeFileSync(blogsFilePath, JSON.stringify([], null, 2), 'utf-8');
  }
}

export function getAllPosts(): BlogPost[] {
  ensureFile();
  try {
    const raw = fs.readFileSync(blogsFilePath, 'utf-8');
    const posts: BlogPost[] = JSON.parse(raw);
    return posts.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

export function getPostBySlug(slug: string): BlogPost | null {
  const posts = getAllPosts();
  return posts.find((p) => p.slug === slug) || null;
}

export function savePost(post: Omit<BlogPost, 'id' | 'createdAt' | 'readTime'>): BlogPost {
  ensureFile();
  const posts = getAllPosts();
  
  // Calculate read time roughly (200 words/min)
  const words = post.content.split(/\s+/).length;
  const readMinutes = Math.max(1, Math.round(words / 200));

  const newPost: BlogPost = {
    ...post,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    readTime: `${readMinutes} min read`,
  };

  posts.unshift(newPost);
  fs.writeFileSync(blogsFilePath, JSON.stringify(posts, null, 2), 'utf-8');
  return newPost;
}

export function deletePost(id: string): boolean {
  ensureFile();
  const posts = getAllPosts();
  const filtered = posts.filter((p) => p.id !== id);
  if (filtered.length !== posts.length) {
    fs.writeFileSync(blogsFilePath, JSON.stringify(filtered, null, 2), 'utf-8');
    return true;
  }
  return false;
}
