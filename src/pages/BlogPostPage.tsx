import { Helmet } from 'react-helmet-async';
import { MDXProvider } from '@mdx-js/react';
import { getPostBySlug } from '../content/blog';
import { ComponentType, ReactNode } from 'react';

interface BlogPostPageProps {
  slug: string;
  onNavigate: (page: string, slug?: string) => void;
}

// Custom MDX components with styling
const mdxComponents: Record<string, ComponentType<{ children?: ReactNode }>> = {
  h1: ({ children }) => (
    <h1
      style={{
        fontSize: '36px',
        fontWeight: 700,
        color: '#1d1d1f',
        margin: '0 0 24px 0',
        lineHeight: 1.2,
      }}
    >
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2
      style={{
        fontSize: '28px',
        fontWeight: 600,
        color: '#1d1d1f',
        margin: '32px 0 16px 0',
        lineHeight: 1.3,
      }}
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3
      style={{
        fontSize: '22px',
        fontWeight: 600,
        color: '#1d1d1f',
        margin: '24px 0 12px 0',
        lineHeight: 1.4,
      }}
    >
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p
      style={{
        fontSize: '17px',
        color: '#1d1d1f',
        margin: '0 0 16px 0',
        lineHeight: 1.7,
      }}
    >
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul
      style={{
        margin: '0 0 16px 0',
        paddingLeft: '24px',
        lineHeight: 1.7,
      }}
    >
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol
      style={{
        margin: '0 0 16px 0',
        paddingLeft: '24px',
        lineHeight: 1.7,
      }}
    >
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li
      style={{
        fontSize: '17px',
        color: '#1d1d1f',
        marginBottom: '8px',
      }}
    >
      {children}
    </li>
  ),
  strong: ({ children }) => (
    <strong style={{ fontWeight: 600, color: '#1d1d1f' }}>{children}</strong>
  ),
  a: ({ children, ...props }) => (
    <a
      style={{
        color: '#0071e3',
        textDecoration: 'none',
        fontWeight: 500,
      }}
      {...props}
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote
      style={{
        margin: '24px 0',
        padding: '16px 24px',
        borderLeft: '4px solid #0071e3',
        backgroundColor: 'rgba(0, 113, 227, 0.05)',
        borderRadius: '0 8px 8px 0',
      }}
    >
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code
      style={{
        backgroundColor: '#f5f5f7',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '15px',
        fontFamily: 'monospace',
      }}
    >
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre
      style={{
        backgroundColor: '#1d1d1f',
        color: '#fff',
        padding: '20px',
        borderRadius: '12px',
        overflow: 'auto',
        margin: '24px 0',
        fontSize: '14px',
        lineHeight: 1.6,
      }}
    >
      {children}
    </pre>
  ),
  hr: () => (
    <hr
      style={{
        border: 'none',
        borderTop: '1px solid #e5e5e5',
        margin: '32px 0',
      }}
    />
  ),
};

export function BlogPostPage({ slug, onNavigate }: BlogPostPageProps) {
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f7',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '48px', color: '#1d1d1f', margin: '0 0 16px 0' }}>
            404
          </h1>
          <p style={{ fontSize: '18px', color: '#86868b', margin: '0 0 24px 0' }}>
            Blog post not found
          </p>
          <button
            onClick={() => onNavigate('blog')}
            style={{
              backgroundColor: '#0071e3',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  const { frontmatter, Component } = post;
  const formattedDate = new Date(frontmatter.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Article schema for SEO
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: frontmatter.title,
    description: frontmatter.description,
    image: frontmatter.image
      ? `https://localizeshots.com${frontmatter.image}`
      : 'https://localizeshots.com/og-image.png',
    datePublished: frontmatter.date,
    dateModified: frontmatter.date,
    author: {
      '@type': 'Person',
      name: frontmatter.author || 'LocalizeShots Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'LocalizeShots',
      url: 'https://localizeshots.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://localizeshots.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://localizeshots.com/blog/${frontmatter.slug}`,
    },
  };

  return (
    <>
      <Helmet>
        <title>{frontmatter.title} - LocalizeShots Blog</title>
        <meta name="description" content={frontmatter.description} />
        <link
          rel="canonical"
          href={`https://localizeshots.com/blog/${frontmatter.slug}`}
        />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={frontmatter.title} />
        <meta property="og:description" content={frontmatter.description} />
        <meta
          property="og:url"
          content={`https://localizeshots.com/blog/${frontmatter.slug}`}
        />
        {frontmatter.image && (
          <meta
            property="og:image"
            content={`https://localizeshots.com${frontmatter.image}`}
          />
        )}
        <meta property="article:published_time" content={frontmatter.date} />
        <meta
          property="article:author"
          content={frontmatter.author || 'LocalizeShots Team'}
        />
        {frontmatter.tags?.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>

      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f5f5f7',
        }}
      >
        {/* Header */}
        <header
          style={{
            backgroundColor: '#fff',
            borderBottom: '1px solid #e5e5e5',
            padding: '16px 24px',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <div
            style={{
              maxWidth: '800px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#1d1d1f',
                cursor: 'pointer',
              }}
              onClick={() => onNavigate('landing')}
            >
              LocalizeShots
            </div>
            <nav style={{ display: 'flex', gap: '24px' }}>
              <a
                href="/blog"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('blog');
                }}
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#0071e3',
                  textDecoration: 'none',
                }}
              >
                Blog
              </a>
              <a
                href="/login"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('login');
                }}
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#1d1d1f',
                  textDecoration: 'none',
                }}
              >
                Sign In
              </a>
            </nav>
          </div>
        </header>

        {/* Article */}
        <article
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '40px 24px 80px',
          }}
        >
          {/* Meta */}
          <div style={{ marginBottom: '32px' }}>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px',
                flexWrap: 'wrap',
              }}
            >
              {frontmatter.tags?.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#0071e3',
                    backgroundColor: 'rgba(0, 113, 227, 0.1)',
                    padding: '4px 10px',
                    borderRadius: '12px',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <div
              style={{
                fontSize: '14px',
                color: '#86868b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>{formattedDate}</span>
              {frontmatter.author && (
                <>
                  <span>|</span>
                  <span>{frontmatter.author}</span>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              padding: '40px',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
            }}
          >
            <MDXProvider components={mdxComponents}>
              <Component />
            </MDXProvider>
          </div>

          {/* Related Resources */}
          <div
            style={{
              marginTop: '40px',
              backgroundColor: '#fff',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
            }}
          >
            <h3
              style={{
                fontSize: '22px',
                fontWeight: 600,
                color: '#1d1d1f',
                margin: '0 0 20px 0',
              }}
            >
              Related Resources
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
              }}
            >
              <a
                href="/features"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('features');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: '#f5f5f7',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e8e8ed';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f7';
                }}
              >
                <span
                  style={{
                    fontSize: '24px',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0071e3',
                    borderRadius: '10px',
                    color: '#fff',
                  }}
                >
                  &#x2728;
                </span>
                <div>
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#1d1d1f',
                    }}
                  >
                    All Features
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#86868b',
                    }}
                  >
                    Explore all capabilities
                  </div>
                </div>
              </a>

              <a
                href="/tools/size-calculator"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('size-calculator');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: '#f5f5f7',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e8e8ed';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f7';
                }}
              >
                <span
                  style={{
                    fontSize: '24px',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#34c759',
                    borderRadius: '10px',
                    color: '#fff',
                  }}
                >
                  &#x1F4D0;
                </span>
                <div>
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#1d1d1f',
                    }}
                  >
                    Size Calculator
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#86868b',
                    }}
                  >
                    Get exact dimensions
                  </div>
                </div>
              </a>

              <a
                href="/alternatives"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('alternatives');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: '#f5f5f7',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e8e8ed';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f7';
                }}
              >
                <span
                  style={{
                    fontSize: '24px',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#ff9500',
                    borderRadius: '10px',
                    color: '#fff',
                  }}
                >
                  &#x2696;
                </span>
                <div>
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#1d1d1f',
                    }}
                  >
                    Compare Tools
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#86868b',
                    }}
                  >
                    See how we compare
                  </div>
                </div>
              </a>

              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('landing');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: '#f5f5f7',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e8e8ed';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f7';
                }}
              >
                <span
                  style={{
                    fontSize: '24px',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#5856d6',
                    borderRadius: '10px',
                    color: '#fff',
                  }}
                >
                  &#x1F3E0;
                </span>
                <div>
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#1d1d1f',
                    }}
                  >
                    LocalizeShots
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#86868b',
                    }}
                  >
                    Back to homepage
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Back to Blog */}
          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <button
              onClick={() => onNavigate('blog')}
              style={{
                backgroundColor: 'transparent',
                color: '#0071e3',
                border: '1px solid #0071e3',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0071e3';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#0071e3';
              }}
            >
              Back to Blog
            </button>
          </div>
        </article>

        {/* Footer */}
        <footer
          style={{
            backgroundColor: '#1d1d1f',
            padding: '40px 24px',
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#86868b', fontSize: '14px', margin: 0 }}>
            &copy; {new Date().getFullYear()} LocalizeShots. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}
