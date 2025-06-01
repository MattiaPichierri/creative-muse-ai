'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { User, LogOut, Crown, Settings } from 'lucide-react';
import Link from 'next/link';

export default function AuthNavigation() {
  const { user, logout, subscriptionInfo } = useAuth();
  const { t } = useLanguage();

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Link href="/auth">
          <Button variant="ghost" size="sm">
            {t('auth.login')}
          </Button>
        </Link>
        <Link href="/auth">
          <Button size="sm">
            {t('auth.register')}
          </Button>
        </Link>
      </div>
    );
  }

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
    <div className="flex items-center space-x-4">
      {/* Badge del piano */}
      {subscriptionInfo && subscriptionInfo.plan && (
        <Link href="/subscription">
          <Badge className={`${getPlanColor(subscriptionInfo.plan.name)} hover:opacity-80 cursor-pointer`}>
            <Crown className="h-3 w-3 mr-1" />
            {subscriptionInfo.plan.display_name}
          </Badge>
        </Link>
      )}

      {/* Menu utente */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">
              {user.username || user.email.split('@')[0]}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{user.username || t('nav.user')}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <Link href="/subscription" className="flex items-center">
              <Crown className="h-4 w-4 mr-2" />
              {t('nav.subscription')}
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              {t('nav.settings')}
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={logout}
            className="flex items-center text-red-600 focus:text-red-600"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {t('auth.logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}