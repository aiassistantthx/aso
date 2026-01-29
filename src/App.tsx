import { useState, useCallback, useEffect } from 'react';
import { AuthProvider, useAuth } from './services/authContext';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { Editor } from './components/Editor';
import { Landing } from './components/Landing';
import { projects as projectsApi } from './services/api';

type Route =
  | { page: 'landing' }
  | { page: 'login' }
  | { page: 'register' }
  | { page: 'dashboard' }
  | { page: 'editor'; projectId: string };

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
      if (route.page === 'dashboard' || route.page === 'editor') {
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
    try {
      const project = await projectsApi.create(
        `Project ${new Date().toLocaleDateString()}`,
        defaultStyle,
      );
      navigate('editor', project.id);
    } catch (err) {
      console.error('Failed to create project:', err);
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
        />
      );

    case 'editor':
      return (
        <Editor
          projectId={route.projectId}
          onBack={() => navigate('dashboard')}
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
    </AuthProvider>
  );
}

export default App;
