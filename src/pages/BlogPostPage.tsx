import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { MDXProvider } from '@mdx-js/react';
import { getPostBySlug, getAllPosts, BlogPost } from '../content/blog';
import { ComponentType, ReactNode } from 'react';

// Color palette matching Landing.tsx
const colors = {
  bg: '#FAFAF8',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textMuted: '#9A9A9A',
  accent: '#FF6B4A',
  accentLight: '#FF8A65',
  accentBg: '#FFF5F2',
  border: '#E8E8E8',
  borderLight: '#F0F0F0',
};

interface BlogPostPageProps {
  slug: string;
  onNavigate: (page: string, slug?: string) => void;
}

// Custom MDX components with styling - using coral accent
const mdxComponents: Record<string, ComponentType<{ children?: ReactNode }>> = {
  h1: ({ children }) => (
    <h1
      style={{
        fontSize: '36px',
        fontWeight: 700,
        color: colors.text,
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
        color: colors.text,
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
        color: colors.text,
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
        color: colors.text,
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
        color: colors.text,
        marginBottom: '8px',
      }}
    >
      {children}
    </li>
  ),
  strong: ({ children }) => (
    <strong style={{ fontWeight: 600, color: colors.text }}>{children}</strong>
  ),
  a: ({ children, ...props }) => (
    <a
      style={{
        color: colors.accent,
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
        borderLeft: `4px solid ${colors.accent}`,
        backgroundColor: colors.accentBg,
        borderRadius: '0 8px 8px 0',
      }}
    >
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code
      style={{
        backgroundColor: colors.bg,
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
        backgroundColor: colors.text,
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
        borderTop: `1px solid ${colors.border}`,
        margin: '32px 0',
      }}
    />
  ),
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', margin: '24px 0' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '15px',
          backgroundColor: colors.card,
          borderRadius: '12px',
          overflow: 'hidden',
          border: `1px solid ${colors.border}`,
        }}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead
      style={{
        backgroundColor: colors.bg,
        borderBottom: `2px solid ${colors.border}`,
      }}
    >
      {children}
    </thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr
      style={{
        borderBottom: `1px solid ${colors.borderLight}`,
      }}
    >
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th
      style={{
        padding: '14px 16px',
        textAlign: 'left',
        fontWeight: 600,
        color: colors.text,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td
      style={{
        padding: '12px 16px',
        color: colors.text,
        verticalAlign: 'top',
      }}
    >
      {children}
    </td>
  ),
};

// Related post card component
function RelatedPostCard({ post, onNavigate }: { post: BlogPost; onNavigate: BlogPostPageProps['onNavigate'] }) {
  const { frontmatter } = post;
  const formattedDate = new Date(frontmatter.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <article
      style={{
        backgroundColor: colors.card,
        borderRadius: '12px',
        overflow: 'hidden',
        border: `1px solid ${colors.borderLight}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
      }}
      onClick={() => onNavigate('blog-post', frontmatter.slug)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {frontmatter.image && (
        <div
          style={{
            width: '100%',
            height: '140px',
            backgroundColor: colors.bg,
            backgroundImage: `url(${frontmatter.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      <div style={{ padding: '16px' }}>
        <h4
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: colors.text,
            margin: '0 0 8px 0',
            lineHeight: 1.3,
          }}
        >
          {frontmatter.title}
        </h4>
        <div style={{ fontSize: '13px', color: colors.textMuted }}>
          {formattedDate}
        </div>
      </div>
    </article>
  );
}

export function BlogPostPage({ slug, onNavigate }: BlogPostPageProps) {
  const post = getPostBySlug(slug);
  const allPosts = getAllPosts();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get related posts (excluding current post, max 3)
  const relatedPosts = allPosts
    .filter(p => p.frontmatter.slug !== slug)
    .slice(0, 3);

  if (!post) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.bg,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '48px', color: colors.text, margin: '0 0 16px 0' }}>
            404
          </h1>
          <p style={{ fontSize: '18px', color: colors.textSecondary, margin: '0 0 24px 0' }}>
            Blog post not found
          </p>
          <button
            onClick={() => onNavigate('blog')}
            style={{
              backgroundColor: colors.accent,
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
          backgroundColor: colors.bg,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Header - matching Landing.tsx style */}
        <nav
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            transition: 'all 0.3s ease',
            backgroundColor: scrolled ? 'rgba(250, 250, 248, 0.95)' : 'transparent',
            backdropFilter: scrolled ? 'blur(20px)' : 'none',
            borderBottom: scrolled ? `1px solid ${colors.borderLight}` : 'none',
          }}
        >
          <div
            style={{
              maxWidth: 800,
              margin: '0 auto',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
              }}
              onClick={() => onNavigate('landing')}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 12px ${colors.accent}40`,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="2" width="18" height="20" rx="3" fill="white"/>
                  <rect x="6" y="5" width="12" height="3" rx="1" fill={colors.accent}/>
                  <rect x="6" y="10" width="12" height="8" rx="1" fill={colors.accent} fillOpacity="0.3"/>
                </svg>
              </div>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  color: colors.text,
                  letterSpacing: '-0.3px',
                }}
              >
                LocalizeShots
              </span>
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              <button
                onClick={() => onNavigate('blog')}
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: colors.accent,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Blog
              </button>
              <button
                onClick={() => onNavigate('login')}
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: colors.textSecondary,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Sign In
              </button>
            </div>
          </div>
        </nav>

        {/* Article */}
        <article
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '100px 24px 60px',
          }}
        >
          {/* Breadcrumb */}
          <nav
            style={{
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
            }}
          >
            <button
              onClick={() => onNavigate('blog')}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: colors.accent,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Blog
            </button>
            <span style={{ color: colors.textMuted }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span style={{ color: colors.textSecondary, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {frontmatter.title}
            </span>
          </nav>

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
                    color: colors.accent,
                    backgroundColor: colors.accentBg,
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
                color: colors.textMuted,
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
              backgroundColor: colors.card,
              borderRadius: '16px',
              padding: '40px',
              border: `1px solid ${colors.borderLight}`,
            }}
          >
            <MDXProvider components={mdxComponents}>
              <Component />
            </MDXProvider>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div style={{ marginTop: '60px' }}>
              <h3
                style={{
                  fontSize: '24px',
                  fontWeight: 600,
                  color: colors.text,
                  margin: '0 0 24px 0',
                }}
              >
                Related Articles
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '20px',
                }}
                className="related-posts-grid"
              >
                {relatedPosts.map((relatedPost) => (
                  <RelatedPostCard
                    key={relatedPost.frontmatter.slug}
                    post={relatedPost}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Related Resources */}
          <div
            style={{
              marginTop: '40px',
              backgroundColor: colors.card,
              borderRadius: '16px',
              padding: '32px',
              border: `1px solid ${colors.borderLight}`,
            }}
          >
            <h3
              style={{
                fontSize: '22px',
                fontWeight: 600,
                color: colors.text,
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
                  backgroundColor: colors.bg,
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s',
                  border: `1px solid ${colors.borderLight}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.borderLight;
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
                    backgroundColor: colors.accent,
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
                      color: colors.text,
                    }}
                  >
                    All Features
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: colors.textSecondary,
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
                  backgroundColor: colors.bg,
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s',
                  border: `1px solid ${colors.borderLight}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.borderLight;
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
                    backgroundColor: '#22C55E',
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
                      color: colors.text,
                    }}
                  >
                    Size Calculator
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: colors.textSecondary,
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
                  backgroundColor: colors.bg,
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s',
                  border: `1px solid ${colors.borderLight}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.borderLight;
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
                    backgroundColor: colors.accentLight,
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
                      color: colors.text,
                    }}
                  >
                    Compare Tools
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: colors.textSecondary,
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
                  backgroundColor: colors.bg,
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s',
                  border: `1px solid ${colors.borderLight}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.borderLight;
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
                      color: colors.text,
                    }}
                  >
                    LocalizeShots
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: colors.textSecondary,
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
                color: colors.accent,
                border: `1px solid ${colors.accent}`,
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.accent;
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = colors.accent;
              }}
            >
              Back to Blog
            </button>
          </div>
        </article>

        {/* Footer */}
        <footer
          style={{
            backgroundColor: colors.text,
            padding: '40px 24px',
            textAlign: 'center',
          }}
        >
          <p style={{ color: colors.textMuted, fontSize: '14px', margin: 0 }}>
            &copy; {new Date().getFullYear()} LocalizeShots. All rights reserved.
          </p>
        </footer>
      </div>

      {/* Mobile responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .related-posts-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 600px) {
          article > div[style*="padding: 40px"] {
            padding: 24px !important;
          }
        }
      `}</style>
    </>
  );
}
