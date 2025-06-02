import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface UserOverride {
  id: number;
  user_id: number;
  user_email: string;
  flag_key: string;
  is_enabled: boolean;
  expires_at: string | null;
  created_at: string;
}

export const UserOverridesTable: React.FC = () => {
  const { token } = useAuth();
  const [overrides, setOverrides] = useState<UserOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchOverrides();
  }, [token]);

  const fetchOverrides = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        'http://localhost:8000/api/v1/admin/user-overrides',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOverrides(data.overrides);
      }
    } catch (error) {
      console.error('Error fetching user overrides:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteOverride = async (overrideId: number) => {
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/admin/user-overrides/${overrideId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        await fetchOverrides();
      }
    } catch (error) {
      console.error('Error deleting override:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <h2 className="text-2xl font-bold text-gray-900">Override Utenti</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
        >
          Nuovo Override
        </button>
      </div>

      {overrides.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">⚙️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nessun Override Attivo
          </h3>
          <p className="text-gray-500">
            Non ci sono override utente configurati al momento.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-500">
              <div>Utente</div>
              <div>Feature Flag</div>
              <div>Stato</div>
              <div>Scadenza</div>
              <div>Creato</div>
              <div>Azioni</div>
            </div>
          </div>
          <ul className="divide-y divide-gray-200">
            {overrides.map((override) => (
              <li key={override.id} className="px-4 py-4">
                <div className="grid grid-cols-6 gap-4 items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {override.user_email}
                    </p>
                    <p className="text-sm text-gray-500">
                      ID: {override.user_id}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-mono text-gray-900">
                      {override.flag_key}
                    </span>
                  </div>

                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        override.is_enabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {override.is_enabled ? '✅ Attivo' : '❌ Disattivo'}
                    </span>
                  </div>

                  <div>
                    <span className="text-sm text-gray-900">
                      {override.expires_at
                        ? formatDate(override.expires_at)
                        : 'Mai'}
                    </span>
                  </div>

                  <div>
                    <span className="text-sm text-gray-500">
                      {formatDate(override.created_at)}
                    </span>
                  </div>

                  <div>
                    <button
                      onClick={() => deleteOverride(override.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Elimina
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Create Override Modal */}
      {showCreateModal && (
        <CreateOverrideModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchOverrides();
          }}
        />
      )}
    </div>
  );
};

interface CreateOverrideModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateOverrideModal: React.FC<CreateOverrideModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const { token } = useAuth();
  const [userId, setUserId] = useState('');
  const [flagKey, setFlagKey] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);

  const availableFlags = [
    'ai_model_selection',
    'advanced_analytics',
    'bulk_idea_generation',
    'export_formats',
    'api_access',
    'team_collaboration',
    'custom_prompts',
    'priority_support',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(
        'http://localhost:8000/api/v1/admin/user-overrides',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: parseInt(userId),
            flag_key: flagKey,
            is_enabled: isEnabled,
            expires_at: expiresAt || null,
          }),
        }
      );

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating override:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Crea Nuovo Override
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User ID
              </label>
              <input
                type="number"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feature Flag
              </label>
              <select
                value={flagKey}
                onChange={(e) => setFlagKey(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleziona un flag</option>
                {availableFlags.map((flag) => (
                  <option key={flag} value={flag}>
                    {flag}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stato
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={isEnabled}
                    onChange={() => setIsEnabled(true)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Attivo</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!isEnabled}
                    onChange={() => setIsEnabled(false)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Disattivo</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scadenza (opzionale)
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors"
              >
                {loading ? 'Creazione...' : 'Crea Override'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
