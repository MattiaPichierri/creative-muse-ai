'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Users, 
  Target, 
  Heart,
  Brain,
  Rocket,
  Globe,
  Award,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const values = [
    {
      icon: Brain,
      title: 'Innovazione',
      description: 'Spingiamo i confini della tecnologia AI per offrire soluzioni creative all\'avanguardia.'
    },
    {
      icon: Heart,
      title: 'Passione',
      description: 'Crediamo nel potere della creatività umana amplificata dall\'intelligenza artificiale.'
    },
    {
      icon: Users,
      title: 'Collaborazione',
      description: 'Costruiamo strumenti che uniscono le persone per creare progetti straordinari insieme.'
    },
    {
      icon: Globe,
      title: 'Accessibilità',
      description: 'Rendiamo la creatività AI accessibile a tutti, ovunque nel mondo.'
    }
  ];

  const team = [
    {
      name: 'Marco Rossi',
      role: 'CEO & Founder',
      description: 'Esperto in AI e machine learning con 15 anni di esperienza nel settore tech.',
      image: '👨‍💼'
    },
    {
      name: 'Sofia Chen',
      role: 'CTO',
      description: 'Architetto software specializzata in sistemi distribuiti e intelligenza artificiale.',
      image: '👩‍💻'
    },
    {
      name: 'Alessandro Bianchi',
      role: 'Head of Design',
      description: 'Designer UX/UI con passione per l\'innovazione e l\'esperienza utente.',
      image: '👨‍🎨'
    },
    {
      name: 'Elena Verdi',
      role: 'Head of AI Research',
      description: 'Ricercatrice AI con PhD in Computer Science e pubblicazioni internazionali.',
      image: '👩‍🔬'
    }
  ];

  const milestones = [
    {
      year: '2023',
      title: 'Fondazione',
      description: 'Creative Muse nasce dall\'idea di democratizzare la creatività attraverso l\'AI.'
    },
    {
      year: '2024',
      title: 'Lancio Beta',
      description: 'Rilascio della versione beta con i primi 1000 utenti creativi.'
    },
    {
      year: '2024',
      title: 'Serie A',
      description: 'Raccolta fondi di €5M per accelerare lo sviluppo della piattaforma.'
    },
    {
      year: '2024',
      title: 'Lancio Pubblico',
      description: 'Apertura al pubblico con sistema di sottoscrizioni e funzionalità avanzate.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/landing" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <Sparkles className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Creative Muse
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button variant="outline" size="sm">
                  Accedi
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="sm">
                  Inizia Gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-purple-100 text-purple-800">
            🚀 Chi Siamo
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            La nostra missione
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
            Creative Muse nasce dalla convinzione che ogni persona abbia un potenziale creativo illimitato. 
            La nostra missione è amplificare questa creatività attraverso l&apos;intelligenza artificiale più avanzata, 
            rendendo l&apos;innovazione accessibile a tutti.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <Target className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold">La nostra visione</h2>
              </div>
              <p className="text-lg text-gray-600 mb-6">
                Immaginiamo un mondo dove la creatività non ha limiti, dove ogni idea può essere esplorata 
                e sviluppata con l&apos;aiuto dell&apos;intelligenza artificiale. Vogliamo essere il ponte tra 
                l&apos;immaginazione umana e le infinite possibilità della tecnologia.
              </p>
              <div className="flex items-center mb-6">
                <Rocket className="h-8 w-8 text-purple-600 mr-3" />
                <h2 className="text-3xl font-bold">I nostri obiettivi</h2>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Democratizzare l&apos;accesso agli strumenti creativi avanzati
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Accelerare l&apos;innovazione attraverso la collaborazione AI-umana
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Costruire una community globale di creativi e innovatori
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Sviluppare tecnologie AI etiche e responsabili
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8 text-center">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-2xl font-bold mb-4">Creatività Amplificata</h3>
                <p className="text-gray-600">
                  L&apos;unione perfetta tra intuizione umana e potenza computazionale dell&apos;AI
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">I nostri valori</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Questi principi guidano ogni decisione che prendiamo e ogni prodotto che sviluppiamo.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Il nostro team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Un gruppo di visionari, ingegneri e creativi uniti dalla passione per l&apos;innovazione.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-6xl mb-4">{member.image}</div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <Badge variant="outline" className="mx-auto">
                    {member.role}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {member.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">La nostra storia</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Dal concept iniziale alla piattaforma che conoscete oggi.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center mb-2">
                      <Badge className="mr-3 bg-blue-100 text-blue-800">
                        {milestone.year}
                      </Badge>
                      <h3 className="text-xl font-bold">{milestone.title}</h3>
                    </div>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <Award className="h-16 w-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-4xl font-bold mb-4">
            Unisciti alla rivoluzione creativa
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Fai parte della community di creativi che stanno già trasformando le loro idee in realtà 
            con Creative Muse. Il futuro della creatività inizia oggi.
          </p>
          <Link href="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              <Sparkles className="h-5 w-5 mr-2" />
              Inizia il tuo viaggio creativo
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold">Creative Muse</span>
          </div>
          <p className="text-gray-400 mb-6">
            Amplificare la creatività umana attraverso l&apos;intelligenza artificiale
          </p>
          <div className="flex justify-center space-x-6 text-gray-400">
            <Link href="/landing" className="hover:text-white">Home</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Termini</Link>
            <Link href="/contact" className="hover:text-white">Contatti</Link>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-gray-400">
            <p>&copy; 2024 Creative Muse. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}