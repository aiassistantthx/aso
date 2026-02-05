import React, { useState, useEffect, useCallback } from 'react';
import { unified as unifiedApi, UnifiedProjectListItem, ApiError, polar } from '../services/api';
import { useAuth } from '../services/authContext';
import { AppHeader } from './AppHeader';

interface Props {
  onOpenProject: (id: string, mode: 'wizard' | 'manual') => void;
  onNewProject: () => void;
  onNavigate: (page: string, id?: string) => void;
}

type FilterMode = 'all' | 'wizard' | 'manual';

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f7',
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
    flexWrap: 'wrap',
    gap: '16px',
  },
  filterTabs: {
    display: 'flex',
    gap: '4px',
    backgroundColor: '#e5e5ea',
    padding: '4px',
    borderRadius: '10px',
  },
  filterTab: {
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    color: '#86868b',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  filterTabActive: {
    backgroundColor: '#fff',
    color: '#1d1d1f',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  newButton: {
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A65 100%)',
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(255, 107, 74, 0.35)',
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
    position: 'relative',
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
  modeBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  wizardBadge: {
    backgroundColor: 'rgba(255, 107, 74, 0.9)',
    color: '#fff',
  },
  manualBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    color: '#fff',
  },
  cardBody: {
    padding: '16px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '6px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
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
  statusBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 500,
    marginLeft: '8px',
  },
};

export const Dashboard: React.FC<Props> = ({ onOpenProject, onNavigate }) => {
  const { user, refreshUser } = useAuth();
  const [projectList, setProjectList] = useState<UnifiedProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      const list = await unifiedApi.list();
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

  // Check for checkout success in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('upgraded') === 'true' || params.get('checkout') === 'success') {
      setShowUpgradeSuccess(true);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
      // Refresh user to get updated plan
      refreshUser?.();
      // Auto-hide after 5 seconds
      setTimeout(() => setShowUpgradeSuccess(false), 5000);
    }
  }, [refreshUser]);

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    try {
      const { url } = await polar.checkout();
      window.location.href = url;
    } catch (err) {
      console.error('Failed to start checkout:', err);
      setUpgradeLoading(false);
    }
  };

  const handleRename = async (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = window.prompt('Rename project', currentName);
    if (!newName || newName.trim() === '' || newName.trim() === currentName) return;

    try {
      await unifiedApi.update(id, { name: newName.trim() });
      setProjectList((prev) =>
        prev.map((p) => p.id === id ? { ...p, name: newName.trim() } : p),
      );
    } catch (err) {
      console.error('Failed to rename project:', err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await unifiedApi.delete(id);
      setProjectList((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  const handleNewProject = async () => {
    try {
      const project = await unifiedApi.create('wizard');
      onNavigate('wizard-editor', project.id);
    } catch (err) {
      if (err instanceof ApiError && err.limit === 'wizardProjects') {
        window.alert(err.message);
      } else {
        console.error('Failed to create project:', err);
      }
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return { label: 'Draft', color: '#86868b', bg: '#f5f5f7' };
      case 'generated': return { label: 'Generated', color: '#248a3d', bg: '#e3f9e5' };
      case 'translated': return { label: 'Translated', color: '#FF6B4A', bg: '#FFF5F2' };
      default: return { label: status, color: '#86868b', bg: '#f5f5f7' };
    }
  };

  const plan = user?.plan ?? 'FREE';

  const filteredProjects = filter === 'all'
    ? projectList
    : projectList.filter(p => p.mode === filter);

  const wizardCount = projectList.filter(p => p.mode === 'wizard').length;
  const manualCount = projectList.filter(p => p.mode === 'manual').length;

  return (
    <div style={styles.container}>
      <AppHeader currentPage="dashboard" onNavigate={onNavigate} />

      <div style={styles.content}>
        {/* Upgrade Success Banner */}
        {showUpgradeSuccess && (
          <div style={{
            padding: '16px 20px',
            marginBottom: '24px',
            backgroundColor: '#e8f9ed',
            border: '1px solid #c6f0c6',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#248a3d"/>
                <path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1d1d1f' }}>
                  Welcome to PRO!
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: '#424245' }}>
                  You now have access to unlimited projects and all languages.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowUpgradeSuccess(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: '#86868b',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M6 18L18 6"/>
              </svg>
            </button>
          </div>
        )}

        <h1 style={styles.pageTitle}>Projects</h1>
        <p style={styles.pageSubtitle}>
          Create and manage your App Store screenshot projects
        </p>

        <div style={styles.toolbar as React.CSSProperties}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={styles.filterTabs}>
              <button
                style={{
                  ...styles.filterTab,
                  ...(filter === 'all' ? styles.filterTabActive : {}),
                }}
                onClick={() => setFilter('all')}
              >
                All ({projectList.length})
              </button>
              <button
                style={{
                  ...styles.filterTab,
                  ...(filter === 'wizard' ? styles.filterTabActive : {}),
                }}
                onClick={() => setFilter('wizard')}
              >
                Wizard ({wizardCount})
              </button>
              <button
                style={{
                  ...styles.filterTab,
                  ...(filter === 'manual' ? styles.filterTabActive : {}),
                }}
                onClick={() => setFilter('manual')}
              >
                Manual ({manualCount})
              </button>
            </div>
            {plan === 'FREE' && (
              <span style={{ fontSize: '13px', color: '#86868b' }}>
                {wizardCount}/1 wizard, {manualCount}/3 manual
              </span>
            )}
            {plan === 'FREE' && (
              <button
                onClick={handleUpgrade}
                disabled={upgradeLoading}
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A65 100%)',
                  color: '#fff',
                  cursor: upgradeLoading ? 'wait' : 'pointer',
                  opacity: upgradeLoading ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                {upgradeLoading ? 'Loading...' : 'Upgrade to PRO'}
              </button>
            )}
          </div>
          <button style={styles.newButton} onClick={handleNewProject}>
            + New Project
          </button>
        </div>

        {loading ? (
          <div style={styles.emptyState as React.CSSProperties}>
            <p style={styles.emptyText}>Loading...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div style={styles.emptyState as React.CSSProperties}>
            <div style={styles.emptyIcon}>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <rect x="8" y="12" width="48" height="40" rx="6" stroke="#d1d1d6" strokeWidth="3" />
                <rect x="18" y="22" width="28" height="20" rx="3" stroke="#d1d1d6" strokeWidth="2" />
                <line x1="32" y1="28" x2="32" y2="36" stroke="#d1d1d6" strokeWidth="2" strokeLinecap="round" />
                <line x1="28" y1="32" x2="36" y2="32" stroke="#d1d1d6" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h2 style={styles.emptyTitle}>
              {filter === 'all' ? 'No projects yet' : `No ${filter} projects`}
            </h2>
            <p style={styles.emptyText}>
              {filter === 'all'
                ? 'Create your first project to start making App Store screenshots'
                : `You don't have any ${filter} projects yet`}
            </p>
            <button style={styles.newButton} onClick={handleNewProject}>
              + Create Project
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredProjects.map((project) => {
              const status = getStatusLabel(project.wizardStatus);
              return (
                <div
                  key={project.id}
                  style={styles.projectCard}
                  onClick={() => onOpenProject(project.id, project.mode)}
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
                        alt={project.name || project.appName}
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
                    <span style={{
                      ...styles.modeBadge,
                      ...(project.mode === 'wizard' ? styles.wizardBadge : styles.manualBadge),
                    } as React.CSSProperties}>
                      {project.mode === 'wizard' ? 'Wizard' : 'Manual'}
                    </span>
                  </div>
                  <div style={styles.cardBody}>
                    <h3 style={styles.cardTitle}>
                      {project.name || project.appName || 'Untitled Project'}
                      {project.mode === 'wizard' && (
                        <span style={{
                          ...styles.statusBadge,
                          color: status.color,
                          backgroundColor: status.bg,
                        }}>
                          {status.label}
                        </span>
                      )}
                    </h3>
                    <div style={styles.cardMeta as React.CSSProperties}>
                      <span>
                        {project.mode === 'wizard'
                          ? `Step ${project.wizardCurrentStep}/9`
                          : `${project.screenshotCount} screenshot${project.screenshotCount !== 1 ? 's' : ''}`
                        }
                      </span>
                      <span>{formatDate(project.updatedAt)}</span>
                    </div>
                  </div>
                  <div style={styles.cardActions as React.CSSProperties}>
                    <button
                      style={styles.cardActionButton}
                      onClick={(e) => handleRename(project.id, project.name || project.appName, e)}
                    >
                      Rename
                    </button>
                    <button
                      style={styles.deleteButton}
                      onClick={(e) => handleDelete(project.id, e)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
