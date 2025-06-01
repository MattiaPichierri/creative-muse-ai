'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Crown, 
  Zap, 
  Users, 
  FolderOpen, 
  Lightbulb, 
  Calendar,
  TrendingUp,
  Settings
} from 'lucide-react';

export default function SubscriptionDashboard() {
  const { user, subscriptionInfo } = useAuth();

  if (!user || !subscriptionInfo) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Caricamento informazioni sottoscrizione...</p>
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
                    ? `€${plan.price_monthly}/mese` 
                    : 'Piano gratuito'
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
              <p className="text-sm text-gray-600">Membri Team</p>
              <p className="text-xl font-bold">
                {limits.max_team_members === -1 ? '∞' : limits.max_team_members}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <FolderOpen className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-gray-600">Progetti Max</p>
              <p className="text-xl font-bold">
                {limits.max_projects === -1 ? '∞' : limits.max_projects}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Settings className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-sm text-gray-600">Funzionalità</p>
              <p className="text-xl font-bold">
                {limits.features.ai_models.length} AI
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
              <span>Utilizzo Giornaliero</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Idee generate oggi</span>
                <span>
                  {usage.daily_ideas} / {limits.daily_ideas_limit === -1 ? '∞' : limits.daily_ideas_limit}
                </span>
              </div>
              {limits.daily_ideas_limit > 0 && (
                <Progress value={dailyUsagePercent} className="h-2" />
              )}
              {dailyUsagePercent > 80 && (
                <p className="text-sm text-orange-600">
                  ⚠️ Stai raggiungendo il limite giornaliero
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Utilizzo Mensile</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Idee generate questo mese</span>
                <span>
                  {usage.monthly_ideas} / {limits.monthly_ideas_limit === -1 ? '∞' : limits.monthly_ideas_limit}
                </span>
              </div>
              {limits.monthly_ideas_limit > 0 && (
                <Progress value={monthlyUsagePercent} className="h-2" />
              )}
              {monthlyUsagePercent > 80 && (
                <p className="text-sm text-orange-600">
                  ⚠️ Stai raggiungendo il limite mensile
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funzionalità disponibili */}
      <Card>
        <CardHeader>
          <CardTitle>Funzionalità del tuo piano</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Modelli AI disponibili:</h4>
              <div className="flex flex-wrap gap-2">
                {limits.features.ai_models.map((model) => (
                  <Badge key={model} variant="outline">
                    {model}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Formati di esportazione:</h4>
              <div className="flex flex-wrap gap-2">
                {limits.features.export_formats.map((format) => (
                  <Badge key={format} variant="outline">
                    {format.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Funzionalità avanzate:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center space-x-2">
                  <span className={limits.features.collaboration ? "text-green-600" : "text-gray-400"}>
                    {limits.features.collaboration ? "✓" : "✗"}
                  </span>
                  <span>Collaborazione team</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={limits.features.priority_support ? "text-green-600" : "text-gray-400"}>
                    {limits.features.priority_support ? "✓" : "✗"}
                  </span>
                  <span>Supporto prioritario</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={limits.features.api_access ? "text-green-600" : "text-gray-400"}>
                    {limits.features.api_access ? "✓" : "✗"}
                  </span>
                  <span>Accesso API</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={limits.features.analytics ? "text-green-600" : "text-gray-400"}>
                    {limits.features.analytics ? "✓" : "✗"}
                  </span>
                  <span>Analytics avanzate</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Azioni */}
      {plan.name === 'free' && (
        <Card>
          <CardHeader>
            <CardTitle>Aggiorna il tuo piano</CardTitle>
            <CardDescription>
              Sblocca più funzionalità e aumenta i tuoi limiti
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full md:w-auto">
              <Crown className="h-4 w-4 mr-2" />
              Visualizza piani disponibili
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}