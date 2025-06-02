'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth, User } from '@/contexts/AuthContext';
import apiClient from '@/lib/api-client';

interface LoginFormProps {
  onSuccess?: (token: string, user: User) => void;
  onSwitchToRegister?: () => void;
}

export default function LoginForm({
  onSuccess,
  onSwitchToRegister,
}: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.login(formData.email, formData.password);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Errore durante il login');
      }

      const data = response.data;

      // Crea l'oggetto user con la struttura corretta
      const user = {
        id: data.user_id,
        email: data.email,
        username: data.username,
        subscription_tier: data.subscription_tier,
        first_name: data.first_name,
        last_name: data.last_name,
        is_active: true,
        email_verified: data.email_verified === 1,
      };

      // Imposta il token nel client API
      apiClient.setToken(data.token);

      // Usa il login del AuthContext
      login(data.token, user);

      if (onSuccess) {
        onSuccess(data.token, user);
      }

      // Redirect alla homepage dopo il login
      router.push('/');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Errore durante il login';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Accedi a Creative Muse
        </CardTitle>
        <CardDescription className="text-center">
          Inserisci le tue credenziali per accedere
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nome@esempio.com"
                value={formData.email}
                onChange={handleInputChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </Button>

          <div className="text-center text-sm">
            <a
              href="/forgot-password"
              className="text-blue-600 hover:text-blue-800 font-medium block mb-2"
            >
              Password dimenticata?
            </a>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">Non hai un account? </span>
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Registrati
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
