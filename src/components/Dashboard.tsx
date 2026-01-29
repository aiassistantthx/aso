import React, { useState, useEffect, useCallback } from 'react';
import { projects as projectsApi, ProjectListItem } from '../services/api';
import { useAuth } from '../services/authContext';

interface Props {
  onOpenProject: (id: string) => void;
  onNewProject: () => void;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f7',
  },
  header: {
    background: 'rgba(255, 255, 255, 0.72)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'saturate(180%) blur(20px)',
    WebkitBackdropFilter: 'saturate(180%) blur(20px)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 24px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  logoIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    color: '#fff',
    boxShadow: '0 4px 14px rgba(102, 126, 234, 0.35)',
  },
  logo: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#1d1d1f',
    letterSpacing: '-0.4px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  planBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  userName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#1d1d1f',
  },
  logoutButton: {
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 500,
    border: '1px solid #e0e0e5',
    borderRadius: '8px',
    backgroundColor: '#fff',
    color: '#86868b',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 24px',
  },
  pageTitle: {
    fontSize: '34px',
    fontWeight: 700,
    color: '#1d1d1f',
    letterSpacing: '-0.5px',
    marginBottom: '8px',
  },
  pageSubtitle: {
    fontSize: '16px',
    color: '#86868b',
    marginBottom: '32px',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  newButton: {
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #0071e3 0%, #0077ed 100%)',
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(0, 113, 227, 0.35)',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
  },
  cardThumbnail: {
    width: '100%',
    height: '180px',
    backgroundColor: '#f5f5f7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardThumbnailImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cardThumbnailPlaceholder: {
    fontSize: '48px',
    color: '#d1d1d6',
  },
  cardBody: {
    padding: '16px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '6px',
  },
  cardMeta: {
    fontSize: '13px',
    color: '#86868b',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    padding: '0 16px 16px',
  },
  cardActionButton: {
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 500,
    border: '1px solid #e0e0e5',
    borderRadius: '8px',
    backgroundColor: '#fff',
    color: '#1d1d1f',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  deleteButton: {
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#ff3b30',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 24px',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px',
    color: '#d1d1d6',
  },
  emptyTitle: {
    fontSize: '22px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '15px',
    color: '#86868b',
    marginBottom: '24px',
  },
};

export const Dashboard: React.FC<Props> = ({ onOpenProject, onNewProject }) => {
  const { user, logout } = useAuth();
  const [projectList, setProjectList] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    try {
      const list = await projectsApi.list();
      setProjectList(list);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await projectsApi.delete(id);
      setProjectList((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const plan = user?.plan ?? 'FREE';

  return (
    <div style={styles.container}>
      <header style={styles.header as React.CSSProperties}>
        <div style={styles.headerContent as React.CSSProperties}>
          <div style={styles.logoContainer as React.CSSProperties}>
            <div style={styles.logoIcon as React.CSSProperties}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="16" rx="3" stroke="white" strokeWidth="2" />
                <rect x="7" y="8" width="10" height="8" rx="1" fill="white" opacity="0.5" />
              </svg>
            </div>
            <span style={styles.logo}>Screenshot Studio</span>
          </div>

          <div style={styles.headerRight as React.CSSProperties}>
            <span
              style={{
                ...styles.planBadge,
                backgroundColor: plan === 'PRO' ? '#e8f9ed' : '#f0f7ff',
                color: plan === 'PRO' ? '#248a3d' : '#0071e3',
              }}
            >
              {plan}
            </span>
            <div style={styles.userMenu as React.CSSProperties}>
              <span style={styles.userName}>{user?.name || user?.email}</span>
              <button
                style={styles.logoutButton}
                onClick={logout}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div style={styles.content}>
        <h1 style={styles.pageTitle}>Projects</h1>
        <p style={styles.pageSubtitle}>
          Create and manage your App Store screenshot projects
        </p>

        <div style={styles.toolbar as React.CSSProperties}>
          <span style={{ fontSize: '14px', color: '#86868b' }}>
            {projectList.length} project{projectList.length !== 1 ? 's' : ''}
            {plan === 'FREE' && ` / 3 max`}
          </span>
          <button
            style={styles.newButton}
            onClick={onNewProject}
          >
            + New Project
          </button>
        </div>

        {loading ? (
          <div style={styles.emptyState as React.CSSProperties}>
            <p style={styles.emptyText}>Loading...</p>
          </div>
        ) : projectList.length === 0 ? (
          <div style={styles.emptyState as React.CSSProperties}>
            <div style={styles.emptyIcon}>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <rect x="8" y="12" width="48" height="40" rx="6" stroke="#d1d1d6" strokeWidth="3" />
                <rect x="18" y="22" width="28" height="20" rx="3" stroke="#d1d1d6" strokeWidth="2" />
                <line x1="32" y1="28" x2="32" y2="36" stroke="#d1d1d6" strokeWidth="2" strokeLinecap="round" />
                <line x1="28" y1="32" x2="36" y2="32" stroke="#d1d1d6" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h2 style={styles.emptyTitle}>No projects yet</h2>
            <p style={styles.emptyText}>
              Create your first project to start making App Store screenshots
            </p>
            <button style={styles.newButton} onClick={onNewProject}>
              + Create First Project
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {projectList.map((project) => (
              <div
                key={project.id}
                style={styles.projectCard}
                onClick={() => onOpenProject(project.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.04)';
                }}
              >
                <div style={styles.cardThumbnail as React.CSSProperties}>
                  {project.thumbnail ? (
                    <img
                      src={project.thumbnail}
                      alt={project.name}
                      style={styles.cardThumbnailImage}
                    />
                  ) : (
                    <div style={styles.cardThumbnailPlaceholder}>
                      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <rect x="6" y="8" width="36" height="32" rx="4" stroke="#d1d1d6" strokeWidth="2" />
                        <rect x="14" y="16" width="20" height="16" rx="2" fill="#d1d1d6" opacity="0.3" />
                      </svg>
                    </div>
                  )}
                </div>
                <div style={styles.cardBody}>
                  <h3 style={styles.cardTitle}>{project.name}</h3>
                  <div style={styles.cardMeta as React.CSSProperties}>
                    <span>{project.screenshotCount} screenshot{project.screenshotCount !== 1 ? 's' : ''}</span>
                    <span>{formatDate(project.updatedAt)}</span>
                  </div>
                </div>
                <div style={styles.cardActions as React.CSSProperties}>
                  <button
                    style={styles.deleteButton}
                    onClick={(e) => handleDelete(project.id, e)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
