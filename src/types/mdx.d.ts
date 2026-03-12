declare module '*.mdx' {
  import type { ComponentType } from 'react';

  export const frontmatter: {
    title: string;
    description: string;
    date: string;
    author?: string;
    slug: string;
    image?: string;
    tags?: string[];
  };

  const MDXComponent: ComponentType;
  export default MDXComponent;
}
