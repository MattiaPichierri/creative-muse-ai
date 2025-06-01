'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Menu,
  Home,
  Lightbulb,
  BarChart3,
  X
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { t } = useLanguage()

  const navigationItems = [
    {
      name: t('nav.home'),
      href: '/',
      icon: Home,
      description: t('home.subtitle')
    },
    {
      name: t('nav.ideas'),
      href: '/ideas',
      icon: Lightbulb,
      description: t('ideas.emptyDescription')
    },
    {
      name: t('nav.stats'),
      href: '/stats',
      icon: BarChart3,
      description: t('stats.totalDescription')
    }
  ]

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 glass">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-semibold gradient-text">Menu</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <nav className="space-y-4">
            {navigationItems.map((item, index) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`block p-4 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 border border-blue-200 shadow-sm'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-5 w-5 ${
                        isActive ? 'text-blue-600' : 'text-slate-500'
                      }`} />
                      <div>
                        <div className={`font-medium ${
                          isActive ? 'text-blue-900' : 'text-slate-900'
                        }`}>
                          {item.name}
                        </div>
                        <div className="text-sm text-slate-500">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export function DesktopNavigation() {
  const pathname = usePathname()
  const { t } = useLanguage()
  
  const navigationItems = [
    {
      name: t('nav.home'),
      href: '/',
      icon: Home,
      description: t('home.subtitle')
    },
    {
      name: t('nav.ideas'),
      href: '/ideas',
      icon: Lightbulb,
      description: t('ideas.emptyDescription')
    },
    {
      name: t('nav.stats'),
      href: '/stats',
      icon: BarChart3,
      description: t('stats.totalDescription')
    }
  ]
  
  return (
    <nav className="hidden md:flex items-center space-x-6">
      {navigationItems.slice(1).map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
              isActive
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}