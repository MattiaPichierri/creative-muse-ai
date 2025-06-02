import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useFeatureFlags } from '../hooks/useFeatureFlags';

interface SubscriptionUpgradeProps {
  requiredTier: 'creator' | 'pro' | 'enterprise';
  featureName?: string;
  className?: string;
}

export const SubscriptionUpgrade: React.FC<SubscriptionUpgradeProps> = ({
  requiredTier,
  featureName,
  className = '',
}) => {
  const { t } = useLanguage();
  const { userTier } = useFeatureFlags();

  const tierColors = {
    creator: 'from-green-50 to-emerald-50 border-green-200',
    pro: 'from-blue-50 to-indigo-50 border-blue-200',
    enterprise: 'from-purple-50 to-violet-50 border-purple-200',
  };

  const tierIcons = {
    creator: (
      <svg
        className="h-6 w-6 text-green-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    pro: (
      <svg
        className="h-6 w-6 text-blue-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
      </svg>
    ),
    enterprise: (
      <svg
        className="h-6 w-6 text-purple-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  };

  const handleUpgrade = () => {
    // Hier würde die Upgrade-Logik implementiert werden
    window.location.href = '/subscription';
  };

  return (
    <div
      className={`bg-gradient-to-r ${tierColors[requiredTier]} border rounded-lg p-6 ${className}`}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">{tierIcons[requiredTier]}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('subscription.upgradeRequired')}
          </h3>
          <p className="text-gray-700 mb-4">
            {featureName
              ? `Die Funktion "${featureName}" erfordert ein ${t(`subscription.tiers.${requiredTier}`)}-Abonnement.`
              : `Diese Funktion erfordert ein ${t(`subscription.tiers.${requiredTier}`)}-Abonnement.`}
          </p>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">
                {t('subscription.currentPlan')}:
              </span>{' '}
              {t(`subscription.tiers.${userTier || 'free'}`)}
            </div>
            <button
              onClick={handleUpgrade}
              className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
                requiredTier === 'creator'
                  ? 'bg-green-600 hover:bg-green-700'
                  : requiredTier === 'pro'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              Upgrade auf {t(`subscription.tiers.${requiredTier}`)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Feature-spezifische Upgrade-Komponenten
export const AIModelUpgrade: React.FC<
  Omit<SubscriptionUpgradeProps, 'requiredTier'>
> = (props) => (
  <SubscriptionUpgrade
    requiredTier="pro"
    featureName="KI-Modell Auswahl"
    {...props}
  />
);

export const AdvancedAnalyticsUpgrade: React.FC<
  Omit<SubscriptionUpgradeProps, 'requiredTier'>
> = (props) => (
  <SubscriptionUpgrade
    requiredTier="enterprise"
    featureName="Erweiterte Analytik"
    {...props}
  />
);

export const BulkGenerationUpgrade: React.FC<
  Omit<SubscriptionUpgradeProps, 'requiredTier'>
> = (props) => (
  <SubscriptionUpgrade
    requiredTier="pro"
    featureName="Massen-Ideengenerierung"
    {...props}
  />
);

export const ExportFormatsUpgrade: React.FC<
  Omit<SubscriptionUpgradeProps, 'requiredTier'>
> = (props) => (
  <SubscriptionUpgrade
    requiredTier="creator"
    featureName="Export-Formate"
    {...props}
  />
);

export const TeamCollaborationUpgrade: React.FC<
  Omit<SubscriptionUpgradeProps, 'requiredTier'>
> = (props) => (
  <SubscriptionUpgrade
    requiredTier="pro"
    featureName="Team-Zusammenarbeit"
    {...props}
  />
);
