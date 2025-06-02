'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Alert } from '../ui/alert';
import { apiClient } from '../../lib/api-client';

export const ResetPasswordForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('Token di reset mancante. Richiedi un nuovo link di reset.');
    }
  }, [searchParams]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'La password deve essere di almeno 8 caratteri';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'La password deve contenere almeno una lettera minuscola';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'La password deve contenere almeno una lettera maiuscola';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'La password deve contenere almeno un numero';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Validazione password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Le password non corrispondono');
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.resetPassword(token, newPassword);
      setMessage(response.message || 'Password resettata con successo!');
      // Redirect al login dopo 3 secondi
      setTimeout(() => {
        router.push('/auth');
      }, 3000);
    } catch (error: unknown) {
      console.error('Reset password error:', error);
      setError(error instanceof Error ? error.message : 'Errore durante il reset della password');
    } finally {
      setLoading(false);
    }
  };

  if (!token && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Caricamento...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-4xl mb-4">🔐</div>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>Inserisci la tua nuova password</CardDescription>
        </CardHeader>
        <CardContent>
          {error && !token ? (
            <div className="text-center">
              <Alert variant="destructive" className="mb-4">
                {error}
              </Alert>
              <Button
                onClick={() => router.push('/forgot-password')}
                className="w-full"
              >
                Richiedi Nuovo Link
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nuova Password
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimo 8 caratteri, con maiuscole, minuscole e numeri
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Conferma Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              {error && <Alert variant="destructive">{error}</Alert>}

              {message && (
                <Alert>
                  <div className="text-green-600">
                    ✅ {message}
                    <br />
                    <span className="text-sm">
                      Reindirizzamento al login in corso...
                    </span>
                  </div>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !newPassword || !confirmPassword}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Reset in corso...
                  </div>
                ) : (
                  'Reset Password'
                )}
              </Button>

              <div className="text-center">
                <a
                  href="/auth"
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  ← Torna al Login
                </a>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
