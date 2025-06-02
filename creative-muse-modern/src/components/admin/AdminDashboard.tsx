import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FeatureFlagsTable } from './FeatureFlagsTable';
import { UsersTable } from './UsersTable';
import { UserOverridesTable } from './UserOverridesTable';
import { AdminStats } from './AdminStats';

interface AdminStats {
  total_flags: number;
  enabled_flags: number;
  disabled_flags: number;
  total_users: number;
  admin_users: number;
  regular_users: number;
  total_overrides: number;
  tier_distribution: Record<string, number>;
}

export const AdminDashboard: React.FC = () => {
  const { token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'stats' | 'flags' | 'users' | 'overrides'
  >('stats');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;

      try {
        const response = await fetch(
          'http://localhost:8000/api/v1/admin/stats',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  const tabs = [
    { id: 'stats', label: 'Dashboard', icon: '📊' },
    { id: 'flags', label: 'Feature Flags', icon: '🚩' },
    { id: 'users', label: 'Utenti', icon: '👥' },
    { id: 'overrides', label: 'Override', icon: '⚙️' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <span className="ml-3 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                ADMIN
              </span>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'stats' && <AdminStats stats={stats} />}
            {activeTab === 'flags' && <FeatureFlagsTable />}
            {activeTab === 'users' && <UsersTable />}
            {activeTab === 'overrides' && <UserOverridesTable />}
          </>
        )}
      </main>
    </div>
  );
};
