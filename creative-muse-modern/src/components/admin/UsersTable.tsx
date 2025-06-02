import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminUser {
  id: number;
  email: string;
  is_admin: boolean;
  subscription_tier: string;
}

export const UsersTable: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8000/api/v1/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierBadgeColor = (tier: string) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestione Utenti</h2>
        <div className="text-sm text-gray-500">
          {users.length} utenti totali
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-500">
            <div>Email</div>
            <div>Subscription Tier</div>
            <div>Ruolo</div>
            <div>Azioni</div>
          </div>
        </div>
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.id} className="px-4 py-4">
              <div className="grid grid-cols-4 gap-4 items-center">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8">
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {user.email}
                    </p>
                    <p className="text-sm text-gray-500">ID: {user.id}</p>
                  </div>
                </div>

                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierBadgeColor(user.subscription_tier)}`}
                  >
                    {user.subscription_tier || 'free'}
                  </span>
                </div>

                <div>
                  {user.is_admin ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      👑 Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      👤 Utente
                    </span>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                    Override
                  </button>
                  <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                    Dettagli
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
