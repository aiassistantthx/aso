import { useState, useCallback, useEffect } from 'react';
import { AuthProvider, useAuth } from './services/authContext';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { Editor } from './components/Editor';
import { Landing } from './components/Landing';
import { ProfilePage } from './components/ProfilePage';
import { MetadataPage } from './components/MetadataPage';
import { WizardPage } from './components/WizardPage';
import { projects as projectsApi, auth as authApi, ApiError } from './services/api';

type Route =
  | { page: 'landing' }
  | { page: 'login' }
  | { page: 'register' }
  | { page: 'dashboard' }
  | { page: 'editor'; projectId: string; fromWizardId?: string }
  | { page: 'profile' }
  | { page: 'metadata' }
  | { page: 'metadata-editor'; projectId: string }
  | { page: 'wizard' }
  | { page: 'wizard-editor'; projectId: string };

const defaultStyle = {
  backgroundColor: '#667eea',
  gradient: {
    enabled: true,
    color1: '#667eea',
    color2: '#764ba2',
    angle: 135,
  },
  textColor: '#ffffff',
  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: 72,
  textPosition: 'top',
  textAlign: 'center',
  paddingTop: 80,
  paddingBottom: 60,
  showMockup: true,
  mockupColor: 'black',
  mockupStyle: 'flat',
  mockupVisibility: 'full',
  mockupAlignment: 'center',
  mockupOffset: { x: 0, y: 0 },
  textOffset: { x: 0, y: 0 },
  mockupScale: 1.0,
  mockupRotation: 0,
  mockupContinuation: 'none',
  highlightColor: '#FFE135',
  highlightPadding: 12,
  highlightBorderRadius: 8,
};

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
        backgroundColor: plan === 'PRO' ? '#248a3d' : '#0071e3',
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
      } else if (path === '/metadata') {
        setRoute({ page: 'metadata' });
      } else if (path.startsWith('/metadata/')) {
        const projectId = path.replace('/metadata/', '');
        if (projectId) {
          setRoute({ page: 'metadata-editor', projectId });
        }
      } else if (path === '/wizard') {
        setRoute({ page: 'wizard' });
      } else if (path.startsWith('/wizard/')) {
        const projectId = path.replace('/wizard/', '');
        if (projectId) {
          setRoute({ page: 'wizard-editor', projectId });
        }
      } else if (path.startsWith('/editor/')) {
        const projectId = path.replace('/editor/', '');
        if (projectId) {
          setRoute({ page: 'editor', projectId });
        }
      } else {
        setRoute({ page: 'landing' });
      }
    };

    handlePath();
    window.addEventListener('popstate', handlePath);
    return () => window.removeEventListener('popstate', handlePath);
  }, []);

  // Redirect based on auth state
  useEffect(() => {
    if (loading) return;

    if (user) {
      if (route.page === 'landing' || route.page === 'login' || route.page === 'register') {
        navigate('dashboard');
      }
    } else {
      if (route.page === 'dashboard' || route.page === 'editor' || route.page === 'profile' || route.page === 'metadata' || route.page === 'metadata-editor' || route.page === 'wizard' || route.page === 'wizard-editor') {
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
    } else if (page === 'metadata') {
      path = '/metadata';
      newRoute = { page: 'metadata' };
    } else if (page === 'wizard') {
      path = '/wizard';
      newRoute = { page: 'wizard' };
    } else if (page === 'wizard-editor' && projectId) {
      path = `/wizard/${projectId}`;
      newRoute = { page: 'wizard-editor', projectId };
    } else if (page === 'metadata-editor' && projectId) {
      path = `/metadata/${projectId}`;
      newRoute = { page: 'metadata-editor', projectId };
    } else if (page === 'editor' && projectId) {
      path = `/editor/${projectId}`;
      newRoute = { page: 'editor', projectId };
    } else {
      path = '/';
      newRoute = { page: 'landing' };
    }

    window.history.pushState({}, '', path);
    setRoute(newRoute);
  }, []);

  const handleNewProject = useCallback(async () => {
    const defaultName = `Project ${new Date().toLocaleDateString()}`;
    const name = window.prompt('Project name', defaultName);
    if (!name || !name.trim()) return;

    try {
      const project = await projectsApi.create(name.trim(), defaultStyle);
      navigate('editor', project.id);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        window.alert(err.message || 'Plan limit reached. Upgrade to Pro for unlimited projects.');
      } else {
        console.error('Failed to create project:', err);
      }
    }
  }, [navigate]);

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
          onOpenProject={(id) => navigate('editor', id)}
          onNewProject={handleNewProject}
          onNavigate={(page, id) => navigate(page, id)}
        />
      );

    case 'profile':
      return (
        <ProfilePage
          onNavigate={(page, id) => navigate(page, id)}
        />
      );

    case 'metadata':
      return (
        <MetadataPage
          onBack={() => navigate('metadata')}
          onOpenProject={(id) => navigate('metadata-editor', id)}
          onNavigate={(page, id) => navigate(page, id)}
        />
      );

    case 'metadata-editor':
      return (
        <MetadataPage
          projectId={route.projectId}
          onBack={() => navigate('metadata')}
          onOpenProject={(id) => navigate('metadata-editor', id)}
          onNavigate={(page, id) => navigate(page, id)}
        />
      );

    case 'wizard':
      return (
        <WizardPage
          onBack={() => navigate('wizard')}
          onOpenProject={(id) => navigate('wizard-editor', id)}
          onNavigate={(page, id) => navigate(page, id)}
        />
      );

    case 'wizard-editor':
      return (
        <WizardPage
          projectId={route.projectId}
          onBack={() => navigate('wizard')}
          onOpenProject={(id) => navigate('wizard-editor', id)}
          onNavigate={(page, id) => navigate(page, id)}
        />
      );

    case 'editor':
      return (
        <Editor
          projectId={route.projectId}
          onBack={() => {
            if (route.fromWizardId) {
              navigate('wizard-editor', route.fromWizardId);
            } else {
              navigate('dashboard');
            }
          }}
          onNavigate={(page, id) => navigate(page, id)}
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
