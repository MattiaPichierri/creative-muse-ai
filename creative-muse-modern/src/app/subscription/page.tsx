'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SubscriptionDashboard from '@/components/subscription/SubscriptionDashboard';
import { useAuth } from '@/contexts/AuthContext';

export default function SubscriptionPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [user, isLoading, router]);

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
    return null; // Il redirect è gestito dall'useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Sottoscrizione
          </h1>
          <p className="text-gray-600 mt-2">
            Gestisci il tuo piano e monitora l'utilizzo
          </p>
        </div>
        
        <SubscriptionDashboard />
      </div>
    </div>
  );
}