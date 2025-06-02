'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Crown,
  Zap,
  Star,
  Check,
  X,
  TrendingUp,
  Calendar,
  DollarSign,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api-client';

interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  limits: {
    daily_ideas: number;
    monthly_ideas: number;
    team_members: number;
    projects: number;
  };
  popular?: boolean;
}

interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  status: string;
  description: string;
  invoice_url?: string;
}

export default function EnhancedSubscriptionDashboard() {
  const { subscriptionInfo, refreshSubscriptionInfo } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    setLoading(true);
    setError('');

    try {
      // Carica piani disponibili
      const plansResponse = await apiClient.getSubscriptionPlans();
      if (plansResponse.success && plansResponse.data) {
        setPlans(plansResponse.data as unknown as SubscriptionPlan[]);
      }

      // Carica storico fatturazione
      const billingResponse = await apiClient.getBillingHistory(10);
      if (billingResponse.success && billingResponse.data) {
        setBillingHistory(billingResponse.data as unknown as BillingHistory[]);
      }

      // Carica statistiche utilizzo
      await apiClient.getUsageStats();

      // Aggiorna info abbonamento
      await refreshSubscriptionInfo();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dati');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setUpgrading(planId);
    setError('');

    try {
      const response = await apiClient.upgradeSubscription(planId);
      if (response.success && response.data) {
        // Reindirizza a Stripe Checkout
        window.location.href = response.data.checkout_url;
      } else {
        throw new Error(response.error || 'Errore nell\'upgrade');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'upgrade');
      setUpgrading(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Sei sicuro di voler cancellare il tuo abbonamento?')) {
      return;
    }

    try {
      const response = await apiClient.cancelSubscription();
      if (response.success) {
        await refreshSubscriptionInfo();
      } else {
        throw new Error(response.error || 'Errore nella cancellazione');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella cancellazione');
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await apiClient.getCustomerPortal();
      if (response.success && response.data) {
        window.open(response.data.portal_url, '_blank');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'apertura del portale');
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return <Star className="h-5 w-5" />;
      case 'creator':
        return <Zap className="h-5 w-5" />;
      case 'pro':
        return <Crown className="h-5 w-5" />;
      case 'enterprise':
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestione Abbonamento</h1>
          <p className="text-gray-600">Gestisci il tuo piano e la fatturazione</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadSubscriptionData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Aggiorna
          </Button>
          <Button onClick={handleManageBilling} variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            Gestisci Fatturazione
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Subscription */}
      {subscriptionInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getPlanIcon(subscriptionInfo.plan.name)}
              Piano Attuale: {subscriptionInfo.plan.display_name}
            </CardTitle>
            <CardDescription>
              {subscriptionInfo.plan.price_monthly > 0 
                ? `€${subscriptionInfo.plan.price_monthly}/mese`
                : 'Gratuito'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Usage Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Idee giornaliere</span>
                  <span>
                    {subscriptionInfo.usage.daily_ideas} / {subscriptionInfo.limits.daily_ideas_limit}
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(
                    subscriptionInfo.usage.daily_ideas, 
                    subscriptionInfo.limits.daily_ideas_limit
                  )} 
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Idee mensili</span>
                  <span>
                    {subscriptionInfo.usage.monthly_ideas} / {subscriptionInfo.limits.monthly_ideas_limit}
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(
                    subscriptionInfo.usage.monthly_ideas, 
                    subscriptionInfo.limits.monthly_ideas_limit
                  )} 
                />
              </div>
            </div>

            {/* Features */}
            <div>
              <h4 className="font-medium mb-2">Funzionalità incluse:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(subscriptionInfo.limits.features).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    {enabled ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                    <span className="capitalize">{feature.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            {subscriptionInfo.plan.name !== 'free' && (
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" onClick={handleCancel}>
                  Cancella Abbonamento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Piani Disponibili</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'border-blue-500 shadow-lg' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  Più Popolare
                </Badge>
              )}
              
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getPlanIcon(plan.name)}
                  {plan.display_name}
                </CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold">
                    €{plan.price_monthly}
                  </span>
                  {plan.price_monthly > 0 && <span className="text-sm">/mese</span>}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Limits */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Idee giornaliere:</span>
                    <span className="font-medium">{plan.limits.daily_ideas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Idee mensili:</span>
                    <span className="font-medium">{plan.limits.monthly_ideas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Membri team:</span>
                    <span className="font-medium">{plan.limits.team_members}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Button
                  className="w-full"
                  variant={
                    subscriptionInfo?.plan.name === plan.name ? 'outline' : 'default'
                  }
                  disabled={
                    subscriptionInfo?.plan.name === plan.name || 
                    upgrading === plan.id
                  }
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {upgrading === plan.id ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Elaborazione...
                    </>
                  ) : subscriptionInfo?.plan.name === plan.name ? (
                    'Piano Attuale'
                  ) : (
                    'Seleziona Piano'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Billing History */}
      {billingHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Storico Fatturazione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {billingHistory.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium">{bill.description}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(bill.date).toLocaleDateString('it-IT')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">€{bill.amount}</span>
                    <Badge 
                      variant={bill.status === 'paid' ? 'default' : 'secondary'}
                    >
                      {bill.status === 'paid' ? 'Pagato' : 'In sospeso'}
                    </Badge>
                    {bill.invoice_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={bill.invoice_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}