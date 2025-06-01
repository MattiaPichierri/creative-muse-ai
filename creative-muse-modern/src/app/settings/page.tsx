'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Shield, 
  Bell, 
  Globe, 
  Palette, 
  Save,
  ArrowLeft,
  Crown,
  Key
} from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function SettingsPage() {
  const { user, logout, subscriptionInfo, isLoading } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: ''
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/landing');
    }
  }, [user, isLoading, router]);

  // Initialize form data when user is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        username: user.username || ''
      });
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      // Here you would typically make an API call to update user settings
      // For now, we'll just simulate a save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Impostazioni salvate con successo!');
    } catch (error) {
      setMessage('Errore nel salvare le impostazioni');
    } finally {
      setSaving(false);
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName?.toLowerCase()) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'creator': return 'bg-blue-100 text-blue-800';
      case 'pro': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Indietro</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Impostazioni</h1>
              <p className="text-gray-600">Gestisci il tuo account e le preferenze</p>
            </div>
          </div>
          
          {subscriptionInfo && (
            <Badge className={`${getPlanColor(subscriptionInfo.plan.name)} text-sm`}>
              <Crown className="h-3 w-3 mr-1" />
              {subscriptionInfo.plan.display_name}
            </Badge>
          )}
        </div>

        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <CardTitle>Informazioni Profilo</CardTitle>
              </div>
              <CardDescription>
                Aggiorna le tue informazioni personali
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="text-sm font-medium">
                    Nome
                  </label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="Il tuo nome"
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className="text-sm font-medium">
                    Cognome
                  </label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Il tuo cognome"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Il tuo username"
                />
              </div>

              <div>
                <label htmlFor="email" className="text-sm font-medium flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="La tua email"
                />
              </div>

              <Button 
                onClick={handleSave}
                disabled={saving}
                className="w-full"
              >
                {saving ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Salvando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Salva Modifiche</span>
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <CardTitle>Sicurezza Account</CardTitle>
              </div>
              <CardDescription>
                Gestisci la sicurezza del tuo account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Key className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium">Password</p>
                    <p className="text-xs text-gray-500">Ultima modifica: Mai</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Cambia
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium">Verifica Email</p>
                    <p className="text-xs text-gray-500">
                      {user.email_verified ? 'Verificata' : 'Non verificata'}
                    </p>
                  </div>
                </div>
                {!user.email_verified && (
                  <Button variant="outline" size="sm">
                    Verifica
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Palette className="h-5 w-5 text-purple-600" />
                <CardTitle>Preferenze</CardTitle>
              </div>
              <CardDescription>
                Personalizza la tua esperienza
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Globe className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium">Lingua</p>
                    <p className="text-xs text-gray-500">Seleziona la tua lingua preferita</p>
                  </div>
                </div>
                <LanguageSelector />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Palette className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium">Tema</p>
                    <p className="text-xs text-gray-500">Scegli tema chiaro o scuro</p>
                  </div>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>

          {/* Subscription Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                <CardTitle>Abbonamento</CardTitle>
              </div>
              <CardDescription>
                Informazioni sul tuo piano attuale
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscriptionInfo ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Piano Attuale:</span>
                    <Badge className={getPlanColor(subscriptionInfo.plan.name)}>
                      {subscriptionInfo.plan.display_name}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Prezzo:</span>
                    <span className="text-sm">
                      €{subscriptionInfo.plan.price_monthly}/mese
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Idee Giornaliere:</span>
                    <span className="text-sm">
                      {subscriptionInfo.usage.daily_ideas}/{subscriptionInfo.limits.daily_ideas_limit === -1 ? '∞' : subscriptionInfo.limits.daily_ideas_limit}
                    </span>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/subscription')}
                  >
                    Gestisci Abbonamento
                  </Button>
                </>
              ) : (
                <p className="text-sm text-gray-500">Caricamento informazioni abbonamento...</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone */}
        <Card className="mt-6 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Zona Pericolosa</CardTitle>
            <CardDescription>
              Azioni irreversibili per il tuo account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              onClick={logout}
              className="w-full md:w-auto"
            >
              Disconnetti da tutti i dispositivi
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}