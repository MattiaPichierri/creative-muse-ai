'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  username?: string;
  subscription_tier: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  email_verified: boolean;
}

interface SubscriptionLimits {
  daily_ideas_limit: number;
  monthly_ideas_limit: number;
  max_team_members: number;
  max_projects: number;
  features: {
    ai_models: string[];
    export_formats: string[];
    collaboration: boolean;
    priority_support: boolean;
    api_access: boolean;
    white_label: boolean;
    analytics: boolean;
  };
}

interface SubscriptionInfo {
  plan: {
    name: string;
    display_name: string;
    price_monthly: number;
  };
  limits: SubscriptionLimits;
  usage: {
    daily_ideas: number;
    monthly_ideas: number;
  };
}

interface BackendSubscriptionResponse {
  tier: string;
  limits: {
    daily_ideas: number;
    monthly_ideas: number;
    team_members: number;
    projects: number;
  };
  usage: {
    daily_ideas: number;
    monthly_ideas: number;
  };
  features: {
    ai_models: string[];
    export_formats: string[];
    collaboration: boolean;
    priority_support: boolean;
    api_access: boolean;
    white_label: boolean;
    analytics: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  subscriptionInfo: SubscriptionInfo | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshSubscriptionInfo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carica i dati dal localStorage all'avvio
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user_data');

    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(userData);
        refreshSubscriptionInfo(savedToken);
      } catch (error) {
        console.error('Errore nel parsing dei dati utente:', error);
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('user_data', JSON.stringify(newUser));
    refreshSubscriptionInfo(newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setSubscriptionInfo(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  };

  const refreshSubscriptionInfo = async (authToken?: string) => {
    const currentToken = authToken || token;
    if (!currentToken) return;

    try {
      const response = await fetch('http://localhost:8000/api/v1/subscription/info', {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
        },
      });

      if (response.ok) {
        const data: BackendSubscriptionResponse = await response.json();
        
        // Transform backend response to frontend format
        const transformedData: SubscriptionInfo = {
          plan: {
            name: data.tier,
            display_name: data.tier.charAt(0).toUpperCase() + data.tier.slice(1),
            price_monthly: data.tier === 'free' ? 0 :
                          data.tier === 'creator' ? 9.99 :
                          data.tier === 'pro' ? 29.99 : 99.99
          },
          limits: {
            daily_ideas_limit: data.limits.daily_ideas,
            monthly_ideas_limit: data.limits.monthly_ideas,
            max_team_members: data.limits.team_members,
            max_projects: data.limits.projects,
            features: {
              ai_models: data.features.ai_models,
              export_formats: data.features.export_formats,
              collaboration: data.features.collaboration,
              priority_support: data.features.priority_support,
              api_access: data.features.api_access,
              white_label: data.features.white_label,
              analytics: data.features.analytics
            }
          },
          usage: {
            daily_ideas: data.usage.daily_ideas,
            monthly_ideas: data.usage.monthly_ideas
          }
        };
        
        setSubscriptionInfo(transformedData);
      } else {
        console.error('Errore nel caricamento info sottoscrizione');
      }
    } catch (error) {
      console.error('Errore nella richiesta info sottoscrizione:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    subscriptionInfo,
    isLoading,
    login,
    logout,
    refreshSubscriptionInfo,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}