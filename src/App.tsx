import { useState, useCallback, useEffect } from 'react';
import { AuthProvider, useAuth } from './services/authContext';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { Landing } from './components/Landing';
import { ProfilePage } from './components/ProfilePage';
import { WizardPage } from './components/WizardPage';
import { TermsOfService } from './components/TermsOfService';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { RefundPolicy } from './components/RefundPolicy';
import { SizeCalculatorPage } from './pages/SizeCalculatorPage';
import { IOSScreenshotsPage } from './pages/IOSScreenshotsPage';
import { AndroidScreenshotsPage } from './pages/AndroidScreenshotsPage';
import { ForIndieDevelopersPage } from './pages/ForIndieDevelopersPage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { FeaturesPage } from './components/FeaturesPage';
import { AlternativesPage } from './components/AlternativesPage';
import { CompareAppScreensPage } from './components/CompareAppScreensPage';
import { CompareAppLaunchpadPage } from './components/CompareAppLaunchpadPage';
import { CompareScreenshotsProPage } from './components/CompareScreenshotsProPage';
import { CompareAppurePage } from './components/CompareAppurePage';
import { AboutPage } from './components/AboutPage';
import { auth as authApi } from './services/api';
type Route =
  | { page: 'landing' }
  | { page: 'login' }
  | { page: 'register' }
  | { page: 'dashboard' }
  | { page: 'profile' }
  | { page: 'project'; projectId: string }
  | { page: 'terms' }
  | { page: 'privacy' }
  | { page: 'refund' }
  | { page: 'size-calculator' }
  | { page: 'ios-screenshots' }
  | { page: 'android-screenshots' }
  | { page: 'for-indie-developers' }
  | { page: 'features' }
  | { page: 'alternatives' }
  | { page: 'compare-appscreens' }
  | { page: 'compare-applaunchpad' }
  | { page: 'compare-screenshots-pro' }
  | { page: 'compare-appure' }
  | { page: 'about' }
  | { page: 'blog' }
  | { page: 'blog-post'; slug: string };

function AdminPlanToggle() {
  const { user, refreshUser } = useAuth();
  const [toggling, setToggling] = useState(false);

  if (!user || user.email !== 'vorobyeviv@gmail.com') return null;

  const plan = user.plan ?? 'FREE';

  const handleToggle = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      await authApi.togglePlan();
      await refreshUser();
    } catch (err) {
      console.error('Failed to toggle plan:', err);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: '#1d1d1f',
        color: '#fff',
        padding: '10px 16px',
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: 600,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        cursor: 'pointer',
        userSelect: 'none',
        opacity: toggling ? 0.6 : 1,
        transition: 'opacity 0.2s',
      }}
      onClick={handleToggle}
    >
      <span style={{ fontSize: '11px', color: '#86868b' }}>DEV</span>
      <span style={{
        padding: '3px 10px',
        borderRadius: '6px',
        backgroundColor: plan === 'PRO' ? '#248a3d' : '#FF6B4A',
        fontSize: '12px',
        fontWeight: 700,
      }}>
        {plan}
      </span>
      <span style={{ fontSize: '11px', color: '#86868b' }}>click to toggle</span>
    </div>
  );
}

function AppRouter() {
  const { user, loading } = useAuth();
  const [route, setRoute] = useState<Route>({ page: 'landing' });

  // Handle browser navigation
  useEffect(() => {
    const handlePath = () => {
      const path = window.location.pathname;
      if (path === '/login') {
        setRoute({ page: 'login' });
      } else if (path === '/register') {
        setRoute({ page: 'register' });
      } else if (path === '/dashboard') {
        setRoute({ page: 'dashboard' });
      } else if (path === '/profile') {
        setRoute({ page: 'profile' });
      } else if (path.startsWith('/project/')) {
        const projectId = path.replace('/project/', '');
        if (projectId) {
          setRoute({ page: 'project', projectId });
        }
      } else if (path.startsWith('/editor/') || path.startsWith('/wizard/')) {
        // Legacy routes - redirect to unified /project/
        const projectId = path.replace(/^\/(editor|wizard)\//, '');
        if (projectId) {
          setRoute({ page: 'project', projectId });
        }
      } else if (path === '/terms') {
        setRoute({ page: 'terms' });
      } else if (path === '/privacy') {
        setRoute({ page: 'privacy' });
      } else if (path === '/refund') {
        setRoute({ page: 'refund' });
      } else if (path === '/tools/size-calculator') {
        setRoute({ page: 'size-calculator' });
      } else if (path === '/ios-screenshots') {
        setRoute({ page: 'ios-screenshots' });
      } else if (path === '/android-screenshots') {
        setRoute({ page: 'android-screenshots' });
      } else if (path === '/for-indie-developers') {
        setRoute({ page: 'for-indie-developers' });
      } else if (path === '/features') {
        setRoute({ page: 'features' });
      } else if (path === '/alternatives') {
        setRoute({ page: 'alternatives' });
      } else if (path === '/compare/appscreens') {
        setRoute({ page: 'compare-appscreens' });
      } else if (path === '/compare/applaunchpad') {
        setRoute({ page: 'compare-applaunchpad' });
      } else if (path === '/compare/screenshots-pro') {
        setRoute({ page: 'compare-screenshots-pro' });
      } else if (path === '/compare/appure') {
        setRoute({ page: 'compare-appure' });
      } else if (path === '/about') {
        setRoute({ page: 'about' });
      } else if (path === '/blog') {
        setRoute({ page: 'blog' });
      } else if (path.startsWith('/blog/')) {
        const slug = path.replace('/blog/', '');
        if (slug) {
          setRoute({ page: 'blog-post', slug });
        }
      } else {
        setRoute({ page: 'landing' });
      }
    };

    handlePath();
    window.addEventListener('popstate', handlePath);
    return () => window.removeEventListener('popstate', handlePath);
  }, []);

  // Redirect based on auth state (legal pages are always accessible)
  useEffect(() => {
    if (loading) return;

    // Legal, tool, and marketing pages are always accessible, skip redirect logic
    const publicPages = [
      'terms', 'privacy', 'refund', 'size-calculator', 'ios-screenshots',
      'android-screenshots', 'for-indie-developers', 'features', 'alternatives',
      'compare-appscreens', 'compare-applaunchpad', 'compare-screenshots-pro',
      'compare-appure', 'about', 'blog', 'blog-post'
    ];
    if (publicPages.includes(route.page)) {
      return;
    }

    if (user) {
      if (route.page === 'landing' || route.page === 'login' || route.page === 'register') {
        navigate('dashboard');
      }
    } else {
      if (route.page === 'dashboard' || route.page === 'profile' || route.page === 'project') {
        navigate('landing');
      }
    }
  }, [user, loading, route.page]);

  const navigate = useCallback((page: string, projectId?: string) => {
    let path = '/';
    let newRoute: Route;

    if (page === 'landing') {
      path = '/';
      newRoute = { page: 'landing' };
    } else if (page === 'login') {
      path = '/login';
      newRoute = { page: 'login' };
    } else if (page === 'register') {
      path = '/register';
      newRoute = { page: 'register' };
    } else if (page === 'dashboard') {
      path = '/dashboard';
      newRoute = { page: 'dashboard' };
    } else if (page === 'profile') {
      path = '/profile';
      newRoute = { page: 'profile' };
    } else if (page === 'project' && projectId) {
      path = `/project/${projectId}`;
      newRoute = { page: 'project', projectId };
    } else if (page === 'terms') {
      path = '/terms';
      newRoute = { page: 'terms' };
    } else if (page === 'privacy') {
      path = '/privacy';
      newRoute = { page: 'privacy' };
    } else if (page === 'refund') {
      path = '/refund';
      newRoute = { page: 'refund' };
    } else if (page === 'size-calculator') {
      path = '/tools/size-calculator';
      newRoute = { page: 'size-calculator' };
    } else if (page === 'ios-screenshots') {
      path = '/ios-screenshots';
      newRoute = { page: 'ios-screenshots' };
    } else if (page === 'android-screenshots') {
      path = '/android-screenshots';
      newRoute = { page: 'android-screenshots' };
    } else if (page === 'for-indie-developers') {
      path = '/for-indie-developers';
      newRoute = { page: 'for-indie-developers' };
    } else if (page === 'features') {
      path = '/features';
      newRoute = { page: 'features' };
    } else if (page === 'alternatives') {
      path = '/alternatives';
      newRoute = { page: 'alternatives' };
    } else if (page === 'compare-appscreens') {
      path = '/compare/appscreens';
      newRoute = { page: 'compare-appscreens' };
    } else if (page === 'compare-applaunchpad') {
      path = '/compare/applaunchpad';
      newRoute = { page: 'compare-applaunchpad' };
    } else if (page === 'compare-screenshots-pro') {
      path = '/compare/screenshots-pro';
      newRoute = { page: 'compare-screenshots-pro' };
    } else if (page === 'compare-appure') {
      path = '/compare/appure';
      newRoute = { page: 'compare-appure' };
    } else if (page === 'about') {
      path = '/about';
      newRoute = { page: 'about' };
    } else if (page === 'blog') {
      path = '/blog';
      newRoute = { page: 'blog' };
    } else if (page === 'blog-post' && projectId) {
      path = `/blog/${projectId}`;
      newRoute = { page: 'blog-post', slug: projectId };
    } else {
      path = '/';
      newRoute = { page: 'landing' };
    }

    window.history.pushState({}, '', path);
    setRoute(newRoute);
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f7',
      }}>
        <div style={{
          fontSize: '16px',
          color: '#86868b',
          fontWeight: 500,
        }}>
          Loading...
        </div>
      </div>
    );
  }

  switch (route.page) {
    case 'landing':
      return (
        <Landing
          onGetStarted={() => navigate('register')}
          onLogin={() => navigate('login')}
          onNavigate={(page) => navigate(page)}
        />
      );

    case 'login':
      return (
        <AuthPage
          mode="login"
          onToggleMode={() => navigate('register')}
          onSuccess={() => navigate('dashboard')}
        />
      );

    case 'register':
      return (
        <AuthPage
          mode="register"
          onToggleMode={() => navigate('login')}
          onSuccess={() => navigate('dashboard')}
        />
      );

    case 'dashboard':
      return (
        <Dashboard
          onOpenProject={(id) => navigate('project', id)}
          onNewProject={() => {
            // New project handled in Dashboard via unified API
          }}
          onNavigate={(page, id) => navigate(page, id)}
        />
      );

    case 'profile':
      return (
        <ProfilePage
          onNavigate={(page, id) => navigate(page, id)}
        />
      );

    case 'project':
      return (
        <WizardPage
          projectId={route.projectId}
          onBack={() => navigate('dashboard')}
          onNavigate={(page, id) => navigate(page, id)}
        />
      );

    case 'terms':
      return <TermsOfService onBack={() => navigate('landing')} />;

    case 'privacy':
      return <PrivacyPolicy onBack={() => navigate('landing')} />;

    case 'refund':
      return <RefundPolicy onBack={() => navigate('landing')} />;

    case 'size-calculator':
      return (
        <SizeCalculatorPage
          onNavigate={(page) => navigate(page)}
        />
      );

    case 'ios-screenshots':
      return (
        <IOSScreenshotsPage
          onGetStarted={() => navigate('register')}
          onLogin={() => navigate('login')}
          onNavigate={(page) => navigate(page)}
        />
      );

    case 'blog':
      return (
        <BlogPage onNavigate={(page, slug) => navigate(page, slug)} />
      );

    case 'blog-post':
      return (
        <BlogPostPage
          slug={route.slug}
          onNavigate={(page, slug) => navigate(page, slug)}
        />
      );

    case 'android-screenshots':
      return (
        <AndroidScreenshotsPage
          onGetStarted={() => navigate('register')}
          onNavigate={(page) => navigate(page)}
        />
      );

    case 'for-indie-developers':
      return (
        <ForIndieDevelopersPage
          onGetStarted={() => navigate('register')}
          onNavigate={(page) => navigate(page)}
        />
      );

    case 'features':
      return (
        <FeaturesPage
          onGetStarted={() => navigate('register')}
          onNavigate={(page) => navigate(page)}
        />
      );

    case 'alternatives':
      return (
        <AlternativesPage
          onBack={() => navigate('landing')}
          onNavigate={(page) => navigate(page)}
          onGetStarted={() => navigate('register')}
        />
      );

    case 'compare-appscreens':
      return (
        <CompareAppScreensPage
          onBack={() => navigate('landing')}
          onGetStarted={() => navigate('register')}
          onNavigate={(page) => navigate(page)}
        />
      );

    case 'compare-applaunchpad':
      return (
        <CompareAppLaunchpadPage
          onBack={() => navigate('landing')}
          onGetStarted={() => navigate('register')}
          onNavigate={(page) => navigate(page)}
        />
      );

    case 'compare-screenshots-pro':
      return (
        <CompareScreenshotsProPage
          onBack={() => navigate('landing')}
          onGetStarted={() => navigate('register')}
          onNavigate={(page) => navigate(page)}
        />
      );

    case 'compare-appure':
      return (
        <CompareAppurePage
          onBack={() => navigate('landing')}
          onGetStarted={() => navigate('register')}
          onNavigate={(page) => navigate(page)}
        />
      );

    case 'about':
      return (
        <AboutPage
          onBack={() => navigate('landing')}
          onNavigate={(page) => navigate(page)}
        />
      );

    default:
      return null;
  }
}

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <AdminPlanToggle />
    </AuthProvider>
  );
}

export default App;
