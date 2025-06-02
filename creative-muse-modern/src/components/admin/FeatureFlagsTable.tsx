import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface FeatureFlag {
  id: number;
  flag_key: string;
  name: string;
  description: string;
  is_enabled: boolean;
  allowed_tiers: string[];
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const FeatureFlagsTable: React.FC = () => {
  const { token } = useAuth();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchFlags();
  }, [token]);

  const fetchFlags = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        'http://localhost:8000/api/v1/admin/feature-flags',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFlags(data.flags);
      }
    } catch (error) {
      console.error('Error fetching feature flags:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFlag = async (flagId: number, currentState: boolean) => {
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/admin/feature-flags/${flagId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_enabled: !currentState }),
        }
      );

      if (response.ok) {
        await fetchFlags(); // Refresh the list
      }
    } catch (error) {
      console.error('Error toggling feature flag:', error);
    }
  };

  const updateFlag = async (flagId: number, updates: Partial<FeatureFlag>) => {
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/admin/feature-flags/${flagId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      );

      if (response.ok) {
        await fetchFlags();
        setShowEditModal(false);
        setEditingFlag(null);
      }
    } catch (error) {
      console.error('Error updating feature flag:', error);
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
        <h2 className="text-2xl font-bold text-gray-900">Feature Flags</h2>
        <div className="text-sm text-gray-500">{flags.length} flags totali</div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {flags.map((flag) => (
            <li key={flag.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {flag.name}
                    </h3>
                    <span className="text-sm text-gray-500 font-mono">
                      {flag.flag_key}
                    </span>
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleFlag(flag.id, flag.is_enabled)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          flag.is_enabled ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            flag.is_enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span
                        className={`ml-2 text-sm font-medium ${
                          flag.is_enabled ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {flag.is_enabled ? 'Attivo' : 'Disattivo'}
                      </span>
                    </div>
                  </div>

                  <p className="mt-1 text-sm text-gray-600">
                    {flag.description}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {flag.allowed_tiers.map((tier) => (
                      <span
                        key={tier}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierBadgeColor(tier)}`}
                      >
                        {tier}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingFlag(flag);
                      setShowEditModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Modifica
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingFlag && (
        <EditFlagModal
          flag={editingFlag}
          onSave={(updates) => updateFlag(editingFlag.id, updates)}
          onClose={() => {
            setShowEditModal(false);
            setEditingFlag(null);
          }}
        />
      )}
    </div>
  );
};

interface EditFlagModalProps {
  flag: FeatureFlag;
  onSave: (updates: Partial<FeatureFlag>) => void;
  onClose: () => void;
}

const EditFlagModal: React.FC<EditFlagModalProps> = ({
  flag,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(flag.name);
  const [description, setDescription] = useState(flag.description);
  const [allowedTiers, setAllowedTiers] = useState<string[]>(
    flag.allowed_tiers
  );

  const allTiers = ['free', 'creator', 'pro', 'enterprise'];

  const handleTierToggle = (tier: string) => {
    setAllowedTiers((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
    );
  };

  const handleSave = () => {
    onSave({
      name,
      description,
      allowed_tiers: allowedTiers,
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Modifica Feature Flag
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrizione
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiers Consentiti
              </label>
              <div className="space-y-2">
                {allTiers.map((tier) => (
                  <label key={tier} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={allowedTiers.includes(tier)}
                      onChange={() => handleTierToggle(tier)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">
                      {tier}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Salva
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
