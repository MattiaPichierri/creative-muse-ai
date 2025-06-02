'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { AdminDashboard } from '../../components/admin/AdminDashboard';
import { AdminLogin } from '../../components/admin/AdminLogin';

export default function AdminPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user || !token) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          'http://localhost:8000/api/v1/admin/stats',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          setIsAdmin(true);
        } else if (response.status === 403) {
          setIsAdmin(false);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [user, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !token) {
    return <AdminLogin />;
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Accesso Negato
          </h1>
          <p className="text-gray-600 mb-4">
            Non hai i privilegi necessari per accedere al pannello admin.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}
