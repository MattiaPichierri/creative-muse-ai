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
import {
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Activity,
  TrendingUp,
  Shield,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Eye,
  UserX,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient, { User } from '@/lib/api-client';

interface AdminStats {
  total_users: number;
  active_users: number;
  total_ideas: number;
  subscription_breakdown: Record<string, number>;
  feature_usage: Record<string, unknown>;
}

interface FeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
  created_at: string;
  updated_at: string;
}

interface RateLimitStat {
  identifier: string;
  limit_type: string;
  current_count: number;
  limit: number;
  window_start: string;
  blocked: boolean;
}

export default function EnhancedAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [rateLimitStats, setRateLimitStats] = useState<RateLimitStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      // Carica statistiche
      const statsResponse = await apiClient.getAdminStats();
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data as unknown as AdminStats);
      }

      // Carica utenti
      const usersResponse = await apiClient.getAllUsers(50, 0);
      if (usersResponse.success && usersResponse.data) {
        setUsers(usersResponse.data);
      }

      // Carica feature flags
      const flagsResponse = await apiClient.getFeatureFlags();
      if (flagsResponse.success && flagsResponse.data) {
        setFeatureFlags(flagsResponse.data as FeatureFlag[]);
      }

      // Carica statistiche rate limiting
      const rateLimitResponse = await apiClient.getRateLimitStats();
      if (rateLimitResponse.success && rateLimitResponse.data) {
        setRateLimitStats(rateLimitResponse.data as RateLimitStat[]);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dati');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (userId: string, reason: string) => {
    try {
      const response = await apiClient.suspendUser(userId, reason);
      if (response.success) {
        await loadDashboardData(); // Ricarica i dati
      }
    } catch (error) {
      console.error('Errore nella sospensione utente:', error);
    }
  };

  const handleToggleFeatureFlag = async (flagName: string, enabled: boolean) => {
    try {
      const response = await apiClient.updateFeatureFlag(flagName, enabled);
      if (response.success) {
        await loadDashboardData(); // Ricarica i dati
      }
    } catch (error) {
      console.error('Errore nell\'aggiornamento feature flag:', error);
    }
  };

  const handleUnblockRateLimit = async (identifier: string, limitType: string) => {
    try {
      const response = await apiClient.unblockRateLimit(identifier, limitType, 'Admin unblock');
      if (response.success) {
        await loadDashboardData(); // Ricarica i dati
      }
    } catch (error) {
      console.error('Errore nello sblocco rate limit:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Amministrativo</h1>
          <p className="text-gray-600">Gestisci utenti, funzionalità e monitoraggio sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadDashboardData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Aggiorna
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Esporta Report
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Panoramica', icon: Activity },
          { id: 'users', label: 'Utenti', icon: Users },
          { id: 'features', label: 'Feature Flags', icon: Settings },
          { id: 'security', label: 'Sicurezza', icon: Shield },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2"
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utenti Totali</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_users}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.active_users} attivi
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Idee Generate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_ideas}</div>
                <p className="text-xs text-muted-foreground">
                  Totale nel sistema
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasso Attivazione</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((stats.active_users / stats.total_users) * 100)}%
                </div>
                <Progress 
                  value={(stats.active_users / stats.total_users) * 100} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rate Limit Attivi</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {rateLimitStats.filter(stat => stat.blocked).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Identificatori bloccati
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuzione Abbonamenti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.subscription_breakdown).map(([tier, count]) => (
                  <div key={tier} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {tier}
                      </Badge>
                      <span className="text-sm">{count} utenti</span>
                    </div>
                    <Progress 
                      value={(count / stats.total_users) * 100} 
                      className="w-24"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <CardTitle>Gestione Utenti</CardTitle>
            <CardDescription>
              Visualizza e gestisci tutti gli utenti del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{user.email}</span>
                      <span className="text-sm text-gray-600">
                        {user.first_name} {user.last_name}
                      </span>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {user.subscription_tier}
                    </Badge>
                    <div className="flex items-center gap-2">
                      {user.email_verified ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm">
                        {user.email_verified ? 'Verificato' : 'Non verificato'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Dettagli
                    </Button>
                    {user.is_active ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuspendUser(user.id, 'Sospensione amministrativa')}
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Sospendi
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm">
                        <UserCheck className="h-4 w-4 mr-2" />
                        Riattiva
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Flags Tab */}
      {activeTab === 'features' && (
        <Card>
          <CardHeader>
            <CardTitle>Feature Flags</CardTitle>
            <CardDescription>
              Gestisci le funzionalità attive nel sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {featureFlags.map((flag) => (
                <div key={flag.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex flex-col">
                    <span className="font-medium">{flag.name}</span>
                    <span className="text-sm text-gray-600">{flag.description}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={flag.enabled ? 'default' : 'secondary'}>
                      {flag.enabled ? 'Attivo' : 'Disattivo'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleFeatureFlag(flag.name, !flag.enabled)}
                    >
                      {flag.enabled ? 'Disattiva' : 'Attiva'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rate Limiting</CardTitle>
              <CardDescription>
                Monitoraggio e gestione dei limiti di velocità
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rateLimitStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex flex-col">
                      <span className="font-medium">{stat.identifier}</span>
                      <span className="text-sm text-gray-600">
                        Tipo: {stat.limit_type} • {stat.current_count}/{stat.limit} richieste
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress 
                        value={(stat.current_count / stat.limit) * 100} 
                        className="w-24"
                      />
                      <Badge variant={stat.blocked ? 'destructive' : 'default'}>
                        {stat.blocked ? 'Bloccato' : 'Attivo'}
                      </Badge>
                      {stat.blocked && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnblockRateLimit(stat.identifier, stat.limit_type)}
                        >
                          Sblocca
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}