import { ComponentType } from 'react';

export interface BlogPostMeta {
  title: string;
  description: string;
  date: string;
  author?: string;
  slug: string;
  image?: string;
  tags?: string[];
}

export interface BlogPost {
  frontmatter: BlogPostMeta;
  Component: ComponentType;
}

// Import all blog posts
import AppStoreScreenshotBestPractices, {
  frontmatter as appStoreScreenshotBestPracticesMeta,
} from './app-store-screenshot-best-practices.mdx';

// Export all posts
export const blogPosts: BlogPost[] = [
  {
    frontmatter: appStoreScreenshotBestPracticesMeta,
    Component: AppStoreScreenshotBestPractices,
  },
];

// Get all posts sorted by date (newest first)
export function getAllPosts(): BlogPost[] {
  return [...blogPosts].sort(
    (a, b) =>
      new Date(b.frontmatter.date).getTime() -
      new Date(a.frontmatter.date).getTime()
  );
}

// Get a single post by slug
export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.frontmatter.slug === slug);
}
