'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Lightbulb,
  Zap,
  Users,
  Crown,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Brain,
  Rocket,
  Shield,
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  // const { t } = useLanguage(); // Currently not used

  const features = [
    {
      icon: Brain,
      title: 'AI Avanzata',
      description:
        "Intelligenza artificiale all'avanguardia per generare idee innovative e creative",
    },
    {
      icon: Zap,
      title: 'Generazione Rapida',
      description:
        'Ottieni idee creative in pochi secondi con i nostri algoritmi ottimizzati',
    },
    {
      icon: Users,
      title: 'Collaborazione Team',
      description:
        'Lavora insieme al tuo team per sviluppare progetti straordinari',
    },
    {
      icon: Shield,
      title: 'Sicuro e Privato',
      description:
        'Le tue idee sono protette con crittografia di livello enterprise',
    },
  ];

  const plans = [
    {
      name: 'Free',
      price: '€0',
      period: '/mese',
      description: 'Perfetto per iniziare',
      features: [
        '5 idee al giorno',
        '3 progetti',
        '1 membro team',
        'Modelli AI base',
      ],
      color: 'border-gray-200',
      buttonVariant: 'outline' as const,
    },
    {
      name: 'Creator',
      price: '€9.99',
      period: '/mese',
      description: 'Per creativi e freelancer',
      features: [
        '50 idee al giorno',
        '15 progetti',
        '3 membri team',
        'AI avanzata',
        'Collaborazione',
        'Analytics',
      ],
      color: 'border-blue-200 bg-blue-50',
      buttonVariant: 'default' as const,
      popular: true,
    },
    {
      name: 'Pro',
      price: '€29.99',
      period: '/mese',
      description: 'Per professionisti',
      features: [
        '200 idee al giorno',
        '50 progetti',
        '10 membri team',
        'AI premium',
        'API access',
        'Supporto prioritario',
      ],
      color: 'border-purple-200',
      buttonVariant: 'outline' as const,
    },
    {
      name: 'Enterprise',
      price: '€99.99',
      period: '/mese',
      description: 'Per grandi organizzazioni',
      features: [
        'Idee illimitate',
        'Progetti illimitati',
        'Team illimitato',
        'White-label',
        'Supporto dedicato',
        'SLA garantito',
      ],
      color: 'border-yellow-200',
      buttonVariant: 'outline' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Creative Muse
              </span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="#features"
                className="text-gray-600 hover:text-blue-600"
              >
                Funzionalità
              </Link>
              <Link
                href="#pricing"
                className="text-gray-600 hover:text-blue-600"
              >
                Prezzi
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-blue-600">
                Chi Siamo
              </Link>
              <Link href="/auth">
                <Button variant="outline" size="sm">
                  Accedi
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="sm">Inizia Gratis</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-800">
            🚀 Powered by Advanced AI
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Libera la tua
            <br />
            Creatività
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Genera idee innovative con l&apos;intelligenza artificiale più
            avanzata. Trasforma i tuoi pensieri in progetti straordinari e porta
            la tua creatività al livello successivo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="text-lg px-8 py-6">
                <Rocket className="h-5 w-5 mr-2" />
                Inizia Gratis
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              <Lightbulb className="h-5 w-5 mr-2" />
              Guarda Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Perché scegliere Creative Muse?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              La piattaforma più avanzata per la generazione di idee creative,
              progettata per professionisti e team innovativi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="text-center hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Scegli il piano perfetto per te
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Inizia gratis e scala con le tue esigenze. Tutti i piani includono
              accesso all&apos;AI avanzata.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${plan.color} hover:shadow-lg transition-shadow`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">
                      <Crown className="h-3 w-3 mr-1" />
                      Più Popolare
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    {plan.price}
                    <span className="text-lg font-normal text-gray-600">
                      {plan.period}
                    </span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth">
                    <Button variant={plan.buttonVariant} className="w-full">
                      {plan.name === 'Free' ? 'Inizia Gratis' : 'Scegli Piano'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Pronto a trasformare le tue idee?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Unisciti a migliaia di creativi che stanno già usando Creative Muse
            per generare idee innovative e portare i loro progetti al successo.
          </p>
          <Link href="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              <Sparkles className="h-5 w-5 mr-2" />
              Inizia la tua prova gratuita
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold">Creative Muse</span>
              </div>
              <p className="text-gray-400">
                La piattaforma AI per la creatività del futuro.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Prodotto</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#features" className="hover:text-white">
                    Funzionalità
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-white">
                    Prezzi
                  </Link>
                </li>
                <li>
                  <Link href="/auth" className="hover:text-white">
                    Inizia Gratis
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Azienda</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white">
                    Chi Siamo
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contatti
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Supporto</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Centro Aiuto
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-white">
                    Documentazione
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="hover:text-white">
                    API
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Creative Muse. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
