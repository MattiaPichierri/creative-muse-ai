'use client';

import React, { useState } from 'react';
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

export const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        'http://localhost:8000/api/v1/auth/forgot-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setEmail(''); // Clear form
      } else {
        setError(data.detail || 'Errore durante la richiesta');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Errore di connessione al server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-4xl mb-4">🔑</div>
          <CardTitle className="text-2xl font-bold">
            Password Dimenticata
          </CardTitle>
          <CardDescription>
            Inserisci la tua email per ricevere un link di reset password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="la-tua-email@esempio.com"
                disabled={loading}
              />
            </div>

            {error && <Alert variant="destructive">{error}</Alert>}

            {message && (
              <Alert>
                <div className="text-green-600">✅ {message}</div>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !email}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Invio in corso...
                </div>
              ) : (
                'Invia Link di Reset'
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
        </CardContent>
      </Card>
    </div>
  );
};
