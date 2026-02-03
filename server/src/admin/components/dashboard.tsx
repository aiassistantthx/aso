import React, { useState, useEffect } from 'react';

interface Stats {
  users: {
    total: number;
    today: number;
    week: number;
    month: number;
    byPlan: Record<string, number>;
  };
  projects: {
    total: number;
    wizard: number;
    manual: number;
  };
  screenshots: {
    total: number;
    localized: number;
  };
  languages: {
    totalUsed: number;
    top: Array<{ language: string; count: number }>;
  };
  ai: {
    totalCost: number;
    totalRequests: number;
    byOperation: Record<string, { count: number; cost: number }>;
    byModel: Record<string, { count: number; cost: number }>;
    dailyCosts: Array<{ date: string; cost: number; requests: number }>;
  };
  promoCodes: {
    total: number;
    active: number;
    redemptions: number;
  };
  recentUsers: Array<{
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
  }>;
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: '8px',
  padding: '20px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  minWidth: '160px',
  flex: '1',
};

const sectionStyle: React.CSSProperties = {
  marginBottom: '32px',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: '600',
  marginBottom: '16px',
  color: '#1a1a2e',
};

const cardGridStyle: React.CSSProperties = {
  display: 'flex',
  gap: '16px',
  flexWrap: 'wrap',
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
  padding: '10px 16px',
  borderBottom: '1px solid #f0f0f0',
  fontSize: '14px',
};

const Card: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}> = ({ title, value, subtitle, color = '#1a1a2e' }) => (
  <div style={cardStyle}>
    <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>
      {title}
    </div>
    <div style={{ fontSize: '28px', fontWeight: 'bold', color }}>{value}</div>
    {subtitle && (
      <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>{subtitle}</div>
    )}
  </div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
      })
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
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

  if (!stats) return null;

  const formatCost = (cost: number) => '$' + cost.toFixed(4);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

  return (
    <div style={{ padding: '24px', maxWidth: '1400px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '32px', color: '#1a1a2e' }}>
        Dashboard
      </h1>

      {/* Users Section */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Users</h2>
        <div style={cardGridStyle}>
          <Card title="Total Users" value={stats.users.total} />
          <Card title="Today" value={stats.users.today} color="#007D7F" />
          <Card title="This Week" value={stats.users.week} color="#007D7F" />
          <Card title="This Month" value={stats.users.month} color="#007D7F" />
          <Card title="FREE" value={stats.users.byPlan.FREE || 0} color="#666" />
          <Card title="PRO" value={stats.users.byPlan.PRO || 0} color="#4CAF50" />
        </div>
      </div>

      {/* Projects Section */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Projects</h2>
        <div style={cardGridStyle}>
          <Card title="Total Projects" value={stats.projects.total} />
          <Card title="Wizard Mode" value={stats.projects.wizard} color="#6483F8" />
          <Card title="Manual Mode" value={stats.projects.manual} color="#99A9EE" />
        </div>
      </div>

      {/* Screenshots & Localization */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Screenshots & Localization</h2>
        <div style={cardGridStyle}>
          <Card title="Total Screenshots" value={stats.screenshots.total} />
          <Card
            title="Localized Screenshots"
            value={stats.screenshots.localized}
            subtitle="Screenshots × Languages"
            color="#007D7F"
          />
          <Card title="Languages Used" value={stats.languages.totalUsed} color="#6483F8" />
        </div>
      </div>

      {/* AI Costs */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>AI Costs (Last 30 Days)</h2>
        <div style={cardGridStyle}>
          <Card title="Total Cost" value={formatCost(stats.ai.totalCost)} color="#C20012" />
          <Card title="Total Requests" value={stats.ai.totalRequests} />
        </div>

        {Object.keys(stats.ai.byOperation).length > 0 && (
          <table style={{ ...tableStyle, marginTop: '16px' }}>
            <thead>
              <tr>
                <th style={thStyle}>Operation</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Requests</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Cost</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats.ai.byOperation).map(([op, data]) => (
                <tr key={op}>
                  <td style={tdStyle}>{op}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{data.count}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#C20012', fontWeight: 'bold' }}>
                    {formatCost(data.cost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {Object.keys(stats.ai.byModel).length > 0 && (
          <table style={{ ...tableStyle, marginTop: '16px' }}>
            <thead>
              <tr>
                <th style={thStyle}>Model</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Requests</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Cost</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats.ai.byModel).map(([model, data]) => (
                <tr key={model}>
                  <td style={tdStyle}>{model}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{data.count}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#C20012', fontWeight: 'bold' }}>
                    {formatCost(data.cost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Promo Codes */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Promo Codes</h2>
        <div style={cardGridStyle}>
          <Card title="Total Codes" value={stats.promoCodes.total} />
          <Card title="Active" value={stats.promoCodes.active} color="#007D7F" />
          <Card title="Redemptions" value={stats.promoCodes.redemptions} color="#6483F8" />
        </div>
      </div>

      {/* Top Languages */}
      {stats.languages.top.length > 0 && (
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Top Languages</h2>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Language</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Projects</th>
              </tr>
            </thead>
            <tbody>
              {stats.languages.top.map((lang) => (
                <tr key={lang.language}>
                  <td style={tdStyle}>{lang.language}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 'bold' }}>{lang.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent Users */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Recent Users</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Registered</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentUsers.map((user) => (
              <tr key={user.id}>
                <td style={tdStyle}>{user.email}</td>
                <td style={tdStyle}>{user.name || '-'}</td>
                <td style={tdStyle}>{formatDate(user.createdAt)}</td>
              </tr>
            ))}
            {stats.recentUsers.length === 0 && (
              <tr>
                <td style={{ ...tdStyle, textAlign: 'center', color: '#999' }} colSpan={3}>
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
