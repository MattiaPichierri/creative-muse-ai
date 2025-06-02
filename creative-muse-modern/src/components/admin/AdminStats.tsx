import React from 'react';

interface AdminStatsData {
  total_flags: number;
  enabled_flags: number;
  disabled_flags: number;
  total_users: number;
  admin_users: number;
  regular_users: number;
  total_overrides: number;
  tier_distribution: Record<string, number>;
}

interface AdminStatsProps {
  stats: AdminStatsData | null;
}

export const AdminStats: React.FC<AdminStatsProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Caricamento statistiche...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Feature Flags Totali',
      value: stats.total_flags,
      icon: '🚩',
      color: 'bg-blue-500',
    },
    {
      title: 'Flags Attivi',
      value: stats.enabled_flags,
      icon: '✅',
      color: 'bg-green-500',
    },
    {
      title: 'Flags Disattivi',
      value: stats.disabled_flags,
      icon: '❌',
      color: 'bg-red-500',
    },
    {
      title: 'Utenti Totali',
      value: stats.total_users,
      icon: '👥',
      color: 'bg-purple-500',
    },
    {
      title: 'Admin',
      value: stats.admin_users,
      icon: '👑',
      color: 'bg-yellow-500',
    },
    {
      title: 'Override Attivi',
      value: stats.total_overrides,
      icon: '⚙️',
      color: 'bg-indigo-500',
    },
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free':
        return 'bg-gray-100 text-gray-800';
      case 'creator':
        return 'bg-green-100 text-green-800';
      case 'pro':
        return 'bg-blue-100 text-blue-800';
      case 'enterprise':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Dashboard Admin
        </h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((card, index) => (
            <div
              key={index}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div
                      className={`${card.color} rounded-md p-3 text-white text-2xl`}
                    >
                      {card.icon}
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {card.title}
                      </dt>
                      <dd className="text-3xl font-bold text-gray-900">
                        {card.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tier Distribution */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Distribuzione Subscription Tiers
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.tier_distribution).map(([tier, count]) => (
              <div key={tier} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTierColor(tier)}`}
                  >
                    {tier || 'Non specificato'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        tier === 'free'
                          ? 'bg-gray-400'
                          : tier === 'creator'
                            ? 'bg-green-400'
                            : tier === 'pro'
                              ? 'bg-blue-400'
                              : tier === 'enterprise'
                                ? 'bg-purple-400'
                                : 'bg-gray-400'
                      }`}
                      style={{
                        width: `${Math.max((count / stats.total_users) * 100, 5)}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Azioni Rapide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <span className="mr-2">🔄</span>
              Refresh Cache
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <span className="mr-2">📊</span>
              Export Report
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <span className="mr-2">🔧</span>
              System Health
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <span className="mr-2">📝</span>
              Audit Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
