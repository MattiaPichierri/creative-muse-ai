'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import PaymentModal from './PaymentModal';
import {
  Crown,
  Zap,
  Users,
  FolderOpen,
  Lightbulb,
  Calendar,
  TrendingUp,
  Settings,
  CreditCard
} from 'lucide-react';

interface Plan {
  name: string;
  display_name: string;
  price_monthly: number;
  features: string[];
}

export default function SubscriptionDashboard() {
  const { user, subscriptionInfo, refreshSubscriptionInfo } = useAuth();
  const { t } = useLanguage();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Definizione dei piani disponibili
  const availablePlans: Plan[] = [
    {
      name: 'creator',
      display_name: 'Creator',
      price_monthly: 9.99,
      features: [
        '50 idee al giorno',
        '500 idee al mese',
        '3 membri del team',
        '10 progetti',
        'AI avanzata',
        'Esportazione PDF'
      ]
    },
    {
      name: 'pro',
      display_name: 'Pro',
      price_monthly: 29.99,
      features: [
        '200 idee al giorno',
        '2000 idee al mese',
        '10 membri del team',
        'Progetti illimitati',
        'AI premium',
        'Collaborazione team',
        'Supporto prioritario'
      ]
    },
    {
      name: 'enterprise',
      display_name: 'Enterprise',
      price_monthly: 99.99,
      features: [
        'Idee illimitate',
        'Team illimitato',
        'Progetti illimitati',
        'Tutti i modelli AI',
        'Accesso API',
        'White label',
        'Analytics avanzate',
        'Supporto dedicato'
      ]
    }
  ];

  const handleUpgrade = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async () => {
    // Aggiorna le informazioni della subscription
    await refreshSubscriptionInfo();
    setIsPaymentModalOpen(false);
    setSelectedPlan(null);
  };

  if (!user || !subscriptionInfo) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>{t('subscription.loading')}</p>
        </div>
      </div>
    );
  }

  const { plan, limits, usage } = subscriptionInfo;

  // Calcola le percentuali di utilizzo
  const dailyUsagePercent = limits.daily_ideas_limit > 0 
    ? (usage.daily_ideas / limits.daily_ideas_limit) * 100 
    : 0;
  
  const monthlyUsagePercent = limits.monthly_ideas_limit > 0 
    ? (usage.monthly_ideas / limits.monthly_ideas_limit) * 100 
    : 0;

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'creator': return 'bg-blue-100 text-blue-800';
      case 'pro': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-gold-100 text-gold-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free': return <Lightbulb className="h-5 w-5" />;
      case 'creator': return <Zap className="h-5 w-5" />;
      case 'pro': return <TrendingUp className="h-5 w-5" />;
      case 'enterprise': return <Crown className="h-5 w-5" />;
      default: return <Lightbulb className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con info piano */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getPlanIcon(plan.name)}
              <div>
                <CardTitle className="text-2xl">{plan.display_name}</CardTitle>
                <CardDescription>
                  {plan.price_monthly > 0
                    ? `€${plan.price_monthly}${t('plans.monthly')}`
                    : t('plans.freePrice')
                  }
                </CardDescription>
              </div>
            </div>
            <Badge className={getPlanColor(plan.name)}>
              {plan.display_name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600">{t('subscription.teamMembers')}</p>
              <p className="text-xl font-bold">
                {limits.max_team_members === -1 ? t('subscription.unlimited') : limits.max_team_members}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <FolderOpen className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-gray-600">{t('subscription.maxProjects')}</p>
              <p className="text-xl font-bold">
                {limits.max_projects === -1 ? t('subscription.unlimited') : limits.max_projects}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Settings className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-sm text-gray-600">{t('subscription.features')}</p>
              <p className="text-xl font-bold">
                {(limits.features?.ai_models || []).length} {t('subscription.aiModels')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Utilizzo idee */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>{t('subscription.dailyUsage')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>{t('subscription.ideasToday')}</span>
                <span>
                  {usage.daily_ideas} / {limits.daily_ideas_limit === -1 ? t('subscription.unlimited') : limits.daily_ideas_limit}
                </span>
              </div>
              {limits.daily_ideas_limit > 0 && (
                <Progress value={dailyUsagePercent} className="h-2" />
              )}
              {dailyUsagePercent > 80 && (
                <p className="text-sm text-orange-600">
                  {t('subscription.warningDaily')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>{t('subscription.monthlyUsage')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>{t('subscription.ideasMonth')}</span>
                <span>
                  {usage.monthly_ideas} / {limits.monthly_ideas_limit === -1 ? t('subscription.unlimited') : limits.monthly_ideas_limit}
                </span>
              </div>
              {limits.monthly_ideas_limit > 0 && (
                <Progress value={monthlyUsagePercent} className="h-2" />
              )}
              {monthlyUsagePercent > 80 && (
                <p className="text-sm text-orange-600">
                  {t('subscription.warningMonthly')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funzionalità disponibili */}
      <Card>
        <CardHeader>
          <CardTitle>{t('subscription.planFeatures')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">{t('subscription.aiModelsAvailable')}</h4>
              <div className="flex flex-wrap gap-2">
                {(limits.features?.ai_models || []).map((model) => (
                  <Badge key={model} variant="outline">
                    {model}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">{t('subscription.exportFormats')}</h4>
              <div className="flex flex-wrap gap-2">
                {(limits.features?.export_formats || []).map((format) => (
                  <Badge key={format} variant="outline">
                    {format.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">{t('subscription.advancedFeatures')}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center space-x-2">
                  <span className={limits.features?.collaboration ? "text-green-600" : "text-gray-400"}>
                    {limits.features?.collaboration ? "✓" : "✗"}
                  </span>
                  <span>{t('subscription.collaboration')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={limits.features?.priority_support ? "text-green-600" : "text-gray-400"}>
                    {limits.features?.priority_support ? "✓" : "✗"}
                  </span>
                  <span>{t('subscription.prioritySupport')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={limits.features?.api_access ? "text-green-600" : "text-gray-400"}>
                    {limits.features?.api_access ? "✓" : "✗"}
                  </span>
                  <span>{t('subscription.apiAccess')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={limits.features?.analytics ? "text-green-600" : "text-gray-400"}>
                    {limits.features?.analytics ? "✓" : "✗"}
                  </span>
                  <span>{t('subscription.analytics')}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Azioni */}
      {plan.name !== 'enterprise' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('subscription.upgradeTitle')}</CardTitle>
            <CardDescription>
              {t('subscription.upgradeDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availablePlans
                .filter(p => {
                  const planOrder = { free: 0, creator: 1, pro: 2, enterprise: 3 };
                  return planOrder[p.name as keyof typeof planOrder] > planOrder[plan.name as keyof typeof planOrder];
                })
                .map((upgradePlan) => (
                  <div key={upgradePlan.name} className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{upgradePlan.display_name}</h3>
                      <Badge className="bg-blue-100 text-blue-800">
                        €{upgradePlan.price_monthly}/mese
                      </Badge>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1 mb-4">
                      {upgradePlan.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center space-x-1">
                          <span className="text-green-600">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                      {upgradePlan.features.length > 3 && (
                        <li className="text-xs text-gray-500">
                          +{upgradePlan.features.length - 3} altre funzionalità
                        </li>
                      )}
                    </ul>
                    <Button
                      onClick={() => handleUpgrade(upgradePlan)}
                      className="w-full"
                      size="sm"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Aggiorna a {upgradePlan.display_name}
                    </Button>
                  </div>
                ))}
            </div>
            
            {plan.name === 'free' && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  💳 <strong>Modalità Sandbox:</strong> I pagamenti sono in modalità test.
                  Nessun addebito reale verrà effettuato.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        selectedPlan={selectedPlan}
        currentPlan={plan.display_name}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}