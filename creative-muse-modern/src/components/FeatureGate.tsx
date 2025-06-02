import React from 'react';
import { useFeatureFlags, FeatureFlags } from '../hooks/useFeatureFlags';
import { useLanguage } from '../contexts/LanguageContext';

interface FeatureGateProps {
  feature: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
}) => {
  const { hasFeature, loading } = useFeatureFlags();
  const { t } = useLanguage();

  if (loading) {
    return <div className="animate-pulse bg-gray-200 rounded h-8 w-full"></div>;
  }

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradePrompt) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-800">
              {t('featureGate.premiumFeature')}
            </h3>
            <p className="text-sm text-blue-600 mt-1">
              {t('featureGate.upgradePrompt')}
            </p>
          </div>
          <div className="flex-shrink-0">
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-md transition-colors">
              {t('featureGate.upgrade')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Spezifische Feature Gates für häufig verwendete Features
export const AIModelSelectionGate: React.FC<
  Omit<FeatureGateProps, 'feature'>
> = (props) => <FeatureGate feature="ai_model_selection" {...props} />;

export const AdvancedAnalyticsGate: React.FC<
  Omit<FeatureGateProps, 'feature'>
> = (props) => <FeatureGate feature="advanced_analytics" {...props} />;

export const BulkGenerationGate: React.FC<Omit<FeatureGateProps, 'feature'>> = (
  props
) => <FeatureGate feature="bulk_idea_generation" {...props} />;

export const ExportFormatsGate: React.FC<Omit<FeatureGateProps, 'feature'>> = (
  props
) => <FeatureGate feature="export_formats" {...props} />;

export const TeamCollaborationGate: React.FC<
  Omit<FeatureGateProps, 'feature'>
> = (props) => <FeatureGate feature="team_collaboration" {...props} />;

export const CustomPromptsGate: React.FC<Omit<FeatureGateProps, 'feature'>> = (
  props
) => <FeatureGate feature="custom_prompts" {...props} />;
