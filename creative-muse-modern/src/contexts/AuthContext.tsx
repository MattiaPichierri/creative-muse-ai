'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { apiClient, User } from '../lib/api-client';

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

interface EnhancedSubscriptionInfo {
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


interface AuthContextType {
  user: User | null;
  token: string | null;
  subscriptionInfo: EnhancedSubscriptionInfo | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshSubscriptionInfo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] =
    useState<EnhancedSubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carica i dati dal localStorage all'avvio
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user_data');

    if (
      savedToken &&
      savedUser &&
      savedUser !== 'undefined' &&
      savedUser !== 'null'
    ) {
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      // Set token for API client
      apiClient.setToken(currentToken);
      const response = await apiClient.getSubscriptionInfo();
      
      // Transform the basic SubscriptionInfo to EnhancedSubscriptionInfo
      if (response.data) {
        const data = response.data;
        const transformedData: EnhancedSubscriptionInfo = {
          plan: {
            name: data.tier,
            display_name: data.tier.charAt(0).toUpperCase() + data.tier.slice(1),
            price_monthly:
              data.tier === 'free'
                ? 0
                : data.tier === 'creator'
                  ? 9.99
                  : data.tier === 'pro'
                    ? 29.99
                    : 99.99,
          },
          limits: {
            daily_ideas_limit: (data.limits as Record<string, unknown>)?.daily_ideas as number || 0,
            monthly_ideas_limit: (data.limits as Record<string, unknown>)?.monthly_ideas as number || 0,
            max_team_members: (data.limits as Record<string, unknown>)?.team_members as number || 0,
            max_projects: (data.limits as Record<string, unknown>)?.projects as number || 0,
            features: {
              ai_models: (data.features as Record<string, unknown>)?.ai_models as string[] || [],
              export_formats: (data.features as Record<string, unknown>)?.export_formats as string[] || [],
              collaboration: (data.features as Record<string, unknown>)?.collaboration as boolean || false,
              priority_support: (data.features as Record<string, unknown>)?.priority_support as boolean || false,
              api_access: (data.features as Record<string, unknown>)?.api_access as boolean || false,
              white_label: (data.features as Record<string, unknown>)?.white_label as boolean || false,
              analytics: (data.features as Record<string, unknown>)?.analytics as boolean || false,
            },
          },
          usage: {
            daily_ideas: (data.usage as Record<string, unknown>)?.daily_ideas as number || 0,
            monthly_ideas: (data.usage as Record<string, unknown>)?.monthly_ideas as number || 0,
          },
        };
        
        setSubscriptionInfo(transformedData);
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
