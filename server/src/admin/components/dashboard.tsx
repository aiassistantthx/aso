import React, { useState, useEffect } from 'react';
import { ApiClient } from 'adminjs';

const api = new ApiClient();

interface DashboardStats {
  totalUsers: number;
  proUsers: number;
  freeUsers: number;
  totalProjects: number;
  wizardProjects: number;
  manualProjects: number;
  recentUsers: Array<{
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
    plan: string;
  }>;
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: '8px',
  padding: '24px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  minWidth: '200px',
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#666',
  marginBottom: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const cardValueStyle: React.CSSProperties = {
  fontSize: '36px',
  fontWeight: 'bold',
  color: '#1a1a2e',
};

const cardSubtitleStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#999',
  marginTop: '4px',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '600',
  marginBottom: '16px',
  color: '#1a1a2e',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  background: '#fff',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 16px',
  background: '#f5f5f5',
  fontWeight: '600',
  fontSize: '13px',
  color: '#666',
  borderBottom: '1px solid #e0e0e0',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderBottom: '1px solid #f0f0f0',
  fontSize: '14px',
};

const badgeStyle = (plan: string): React.CSSProperties => ({
  display: 'inline-block',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '11px',
  fontWeight: '600',
  background: plan === 'PRO' ? '#4CAF50' : '#e0e0e0',
  color: plan === 'PRO' ? '#fff' : '#666',
});

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.resourceAction({
          resourceId: 'AdminDashboard',
          actionName: 'stats',
        });
        setStats(response.data as DashboardStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#d32f2f' }}>
        Error: {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        No data available
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '24px', color: '#1a1a2e' }}>
        Dashboard
      </h1>

      {/* Stats Cards */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <div style={cardStyle}>
          <div style={cardTitleStyle}>Total Users</div>
          <div style={cardValueStyle}>{stats.totalUsers}</div>
          <div style={cardSubtitleStyle}>
            {stats.proUsers} PRO / {stats.freeUsers} FREE
          </div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitleStyle}>PRO Users</div>
          <div style={{ ...cardValueStyle, color: '#4CAF50' }}>{stats.proUsers}</div>
          <div style={cardSubtitleStyle}>
            {stats.totalUsers > 0 ? Math.round((stats.proUsers / stats.totalUsers) * 100) : 0}% of total
          </div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitleStyle}>Total Projects</div>
          <div style={cardValueStyle}>{stats.totalProjects}</div>
          <div style={cardSubtitleStyle}>
            {stats.wizardProjects} wizard / {stats.manualProjects} manual
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div>
        <h2 style={sectionTitleStyle}>Recent Registrations</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Plan</th>
              <th style={thStyle}>Registered</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentUsers.map((user) => (
              <tr key={user.id}>
                <td style={tdStyle}>{user.email}</td>
                <td style={tdStyle}>{user.name || '-'}</td>
                <td style={tdStyle}>
                  <span style={badgeStyle(user.plan)}>{user.plan}</span>
                </td>
                <td style={tdStyle}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {stats.recentUsers.length === 0 && (
              <tr>
                <td style={{ ...tdStyle, textAlign: 'center', color: '#999' }} colSpan={4}>
                  No users yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
