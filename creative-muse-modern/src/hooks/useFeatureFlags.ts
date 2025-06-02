import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface FeatureFlags {
  ai_model_selection: boolean;
  advanced_analytics: boolean;
  bulk_idea_generation: boolean;
  export_formats: boolean;
  api_access: boolean;
  team_collaboration: boolean;
  custom_prompts: boolean;
  priority_support: boolean;
}

export type SubscriptionTier = 'free' | 'creator' | 'pro' | 'enterprise';

interface UseFeatureFlagsReturn {
  features: FeatureFlags;
  loading: boolean;
  error: string | null;
  userTier: SubscriptionTier | null;
  hasFeature: (featureKey: keyof FeatureFlags) => boolean;
  requireFeature: (
    featureKey: keyof FeatureFlags,
    fallback?: () => void
  ) => boolean;
}

export const useFeatureFlags = (): UseFeatureFlagsReturn => {
  const { token } = useAuth();
  const [features, setFeatures] = useState<FeatureFlags>({
    ai_model_selection: false,
    advanced_analytics: false,
    bulk_idea_generation: false,
    export_formats: false,
    api_access: false,
    team_collaboration: false,
    custom_prompts: false,
    priority_support: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<SubscriptionTier | null>(null);

  useEffect(() => {
    const fetchFeatures = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/api/v1/features', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFeatures(data.features);
          setUserTier(data.user_tier || 'free');
          setError(null);
        } else {
          setError('Fehler beim Laden der Features');
        }
      } catch (err) {
        setError('Netzwerkfehler beim Laden der Features');
        console.error('Feature flags error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, [token]);

  const hasFeature = (featureKey: keyof FeatureFlags): boolean => {
    return features[featureKey] || false;
  };

  const requireFeature = (
    featureKey: keyof FeatureFlags,
    fallback?: () => void
  ): boolean => {
    const hasAccess = hasFeature(featureKey);
    if (!hasAccess && fallback) {
      fallback();
    }
    return hasAccess;
  };

  return {
    features,
    loading,
    error,
    userTier,
    hasFeature,
    requireFeature,
  };
};
