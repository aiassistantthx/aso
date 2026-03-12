import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { getAllPosts, BlogPost } from '../content/blog';

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

interface BlogPageProps {
  onNavigate: (page: string, slug?: string) => void;
}

const categories = ['All', 'ASO', 'Tutorials', 'Screenshots', 'Tools'];

function BlogPostCard({ post, onNavigate }: { post: BlogPost; onNavigate: BlogPageProps['onNavigate'] }) {
  const { frontmatter } = post;
  const formattedDate = new Date(frontmatter.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article
      style={{
        backgroundColor: colors.card,
        borderRadius: '16px',
        overflow: 'hidden',
        border: `1px solid ${colors.borderLight}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
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
            height: '200px',
            backgroundColor: colors.bg,
            backgroundImage: `url(${frontmatter.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '12px',
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
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 600,
            color: colors.text,
            margin: '0 0 8px 0',
            lineHeight: 1.3,
          }}
        >
          {frontmatter.title}
        </h2>
        <p
          style={{
            fontSize: '14px',
            color: colors.textSecondary,
            margin: '0 0 16px 0',
            lineHeight: 1.5,
            flex: 1,
          }}
        >
          {frontmatter.description}
        </p>
        <div
          style={{
            fontSize: '13px',
            color: colors.textMuted,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{formattedDate}</span>
            {frontmatter.author && (
              <>
                <span>|</span>
                <span>{frontmatter.author}</span>
              </>
            )}
          </div>
          <span
            style={{
              color: colors.accent,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            Read Article
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
      </div>
    </article>
  );
}

export function BlogPage({ onNavigate }: BlogPageProps) {
  const posts = getAllPosts();
  const [scrolled, setScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter posts by category
  const filteredPosts = activeCategory === 'All'
    ? posts
    : posts.filter(post =>
        post.frontmatter.tags?.some(tag =>
          tag.toLowerCase().includes(activeCategory.toLowerCase())
        )
      );

  // JSON-LD for Blog listing
  const blogListSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'LocalizeShots Blog',
    description: 'Tips, tutorials, and best practices for App Store optimization and screenshot localization.',
    url: 'https://localizeshots.com/blog',
    publisher: {
      '@type': 'Organization',
      name: 'LocalizeShots',
      url: 'https://localizeshots.com',
    },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.frontmatter.title,
      description: post.frontmatter.description,
      datePublished: post.frontmatter.date,
      author: {
        '@type': 'Person',
        name: post.frontmatter.author || 'LocalizeShots Team',
      },
      url: `https://localizeshots.com/blog/${post.frontmatter.slug}`,
    })),
  };

  return (
    <>
      <Helmet>
        <title>Blog - LocalizeShots</title>
        <meta
          name="description"
          content="Tips, tutorials, and best practices for App Store optimization and screenshot localization."
        />
        <link rel="canonical" href="https://localizeshots.com/blog" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Blog - LocalizeShots" />
        <meta
          property="og:description"
          content="Tips, tutorials, and best practices for App Store optimization and screenshot localization."
        />
        <meta property="og:url" content="https://localizeshots.com/blog" />
        <script type="application/ld+json">{JSON.stringify(blogListSchema)}</script>
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
              maxWidth: 1100,
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
            <div style={{ display: 'flex', gap: 32 }}>
              <button
                onClick={() => onNavigate('features')}
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: colors.textSecondary,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase',
                  padding: 0,
                }}
              >
                Features
              </button>
              <button
                onClick={() => onNavigate('blog')}
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: colors.accent,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase',
                  padding: 0,
                }}
              >
                Blog
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => onNavigate('login')}
                style={{
                  padding: '8px 16px',
                  fontSize: 14,
                  fontWeight: 500,
                  color: colors.textSecondary,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  letterSpacing: '0.3px',
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('register')}
                style={{
                  padding: '10px 20px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#fff',
                  backgroundColor: colors.accent,
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  letterSpacing: '0.3px',
                }}
              >
                Get Started
              </button>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section
          style={{
            backgroundColor: colors.bg,
            padding: '140px 24px 60px',
            textAlign: 'center',
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              marginBottom: 20,
            }}
          >
            <span style={{ height: '0.5px', width: 40, backgroundColor: colors.border }} />
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: colors.accent,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
              }}
            >
              ASO Insights & Tutorials
            </span>
            <span style={{ height: '0.5px', width: 40, backgroundColor: colors.border }} />
          </div>
          <h1
            style={{
              fontSize: '48px',
              fontWeight: 700,
              color: colors.text,
              margin: '0 0 16px 0',
              letterSpacing: '-1px',
            }}
          >
            Blog
          </h1>
          <p
            style={{
              fontSize: '18px',
              color: colors.textSecondary,
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Tips, tutorials, and best practices for App Store optimization and
            screenshot localization.
          </p>
        </section>

        {/* Category Filter */}
        <section
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 24px 40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: activeCategory === category ? '#fff' : colors.textSecondary,
                  backgroundColor: activeCategory === category ? colors.accent : colors.card,
                  border: `1px solid ${activeCategory === category ? colors.accent : colors.borderLight}`,
                  borderRadius: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (activeCategory !== category) {
                    e.currentTarget.style.borderColor = colors.accent;
                    e.currentTarget.style.color = colors.accent;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeCategory !== category) {
                    e.currentTarget.style.borderColor = colors.borderLight;
                    e.currentTarget.style.color = colors.textSecondary;
                  }
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Posts Grid */}
        <section
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 24px 80px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 300px',
              gap: '40px',
            }}
          >
            {/* Main Content */}
            <div>
              {filteredPosts.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '60px 24px',
                    color: colors.textSecondary,
                  }}
                >
                  <p style={{ fontSize: '18px' }}>No blog posts found in this category.</p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                    gap: '24px',
                  }}
                >
                  {filteredPosts.map((post) => (
                    <BlogPostCard
                      key={post.frontmatter.slug}
                      post={post}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              }}
            >
              {/* Resources Card */}
              <div
                style={{
                  backgroundColor: colors.card,
                  borderRadius: '16px',
                  padding: '24px',
                  border: `1px solid ${colors.borderLight}`,
                }}
              >
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: colors.text,
                    margin: '0 0 16px 0',
                  }}
                >
                  Resources
                </h3>
                <ul
                  style={{
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <li>
                    <a
                      href="/features"
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate('features');
                      }}
                      style={{
                        color: colors.accent,
                        textDecoration: 'none',
                        fontSize: '15px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      All Features
                    </a>
                  </li>
                  <li>
                    <a
                      href="/tools/size-calculator"
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate('size-calculator');
                      }}
                      style={{
                        color: colors.accent,
                        textDecoration: 'none',
                        fontSize: '15px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Screenshot Size Calculator
                    </a>
                  </li>
                  <li>
                    <a
                      href="/alternatives"
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate('alternatives');
                      }}
                      style={{
                        color: colors.accent,
                        textDecoration: 'none',
                        fontSize: '15px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Compare Alternatives
                    </a>
                  </li>
                </ul>
              </div>

              {/* CTA Card - using coral accent */}
              <div
                style={{
                  backgroundColor: colors.accent,
                  borderRadius: '16px',
                  padding: '24px',
                  color: '#fff',
                }}
              >
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    margin: '0 0 12px 0',
                  }}
                >
                  Create Screenshots Now
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    margin: '0 0 16px 0',
                    opacity: 0.9,
                    lineHeight: 1.5,
                  }}
                >
                  Generate professional App Store screenshots with AI-powered localization.
                </p>
                <button
                  onClick={() => onNavigate('register')}
                  style={{
                    backgroundColor: '#fff',
                    color: colors.accent,
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  Get Started Free
                </button>
              </div>
            </aside>
          </div>
        </section>

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
        @media (max-width: 900px) {
          .blog-grid-container > div {
            grid-template-columns: 1fr !important;
          }
          .blog-grid-container aside {
            display: none;
          }
        }
        @media (max-width: 600px) {
          .blog-posts-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
