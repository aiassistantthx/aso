import { Helmet } from 'react-helmet-async';
import { getAllPosts, BlogPost } from '../content/blog';

interface BlogPageProps {
  onNavigate: (page: string, slug?: string) => void;
}

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
        backgroundColor: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
      }}
      onClick={() => onNavigate('blog-post', frontmatter.slug)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.08)';
      }}
    >
      {frontmatter.image && (
        <div
          style={{
            width: '100%',
            height: '200px',
            backgroundColor: '#f5f5f7',
            backgroundImage: `url(${frontmatter.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      <div style={{ padding: '24px' }}>
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
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#1d1d1f',
            margin: '0 0 8px 0',
            lineHeight: 1.3,
          }}
        >
          {frontmatter.title}
        </h2>
        <p
          style={{
            fontSize: '14px',
            color: '#86868b',
            margin: '0 0 16px 0',
            lineHeight: 1.5,
          }}
        >
          {frontmatter.description}
        </p>
        <div
          style={{
            fontSize: '13px',
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
    </article>
  );
}

export function BlogPage({ onNavigate }: BlogPageProps) {
  const posts = getAllPosts();

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
              maxWidth: '1200px',
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

        {/* Hero */}
        <section
          style={{
            backgroundColor: '#fff',
            padding: '60px 24px',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '48px',
              fontWeight: 700,
              color: '#1d1d1f',
              margin: '0 0 16px 0',
            }}
          >
            Blog
          </h1>
          <p
            style={{
              fontSize: '18px',
              color: '#86868b',
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            Tips, tutorials, and best practices for App Store optimization and
            screenshot localization.
          </p>
        </section>

        {/* Posts Grid */}
        <section
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '40px 24px 80px',
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
              {posts.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '60px 24px',
                    color: '#86868b',
                  }}
                >
                  <p style={{ fontSize: '18px' }}>No blog posts yet. Check back soon!</p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                    gap: '24px',
                  }}
                >
                  {posts.map((post) => (
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
                  backgroundColor: '#fff',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                }}
              >
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#1d1d1f',
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
                        color: '#0071e3',
                        textDecoration: 'none',
                        fontSize: '15px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <span style={{ fontSize: '18px' }}>&#x2192;</span> All Features
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
                        color: '#0071e3',
                        textDecoration: 'none',
                        fontSize: '15px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <span style={{ fontSize: '18px' }}>&#x2192;</span> Screenshot Size Calculator
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
                        color: '#0071e3',
                        textDecoration: 'none',
                        fontSize: '15px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <span style={{ fontSize: '18px' }}>&#x2192;</span> Compare Alternatives
                    </a>
                  </li>
                </ul>
              </div>

              {/* CTA Card */}
              <div
                style={{
                  backgroundColor: '#0071e3',
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
                    color: '#0071e3',
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
