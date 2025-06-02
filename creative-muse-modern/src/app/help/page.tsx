'use client';

import React from 'react';

export default function HelpPage() {
  const faqs = [
    {
      question: 'Wie erstelle ich ein Konto?',
      answer:
        "Gehe zur Login-Seite (/auth) und klicke auf 'Registrieren'. Gib deine E-Mail-Adresse und ein sicheres Passwort ein.",
    },
    {
      question: 'Wie generiere ich Ideen?',
      answer:
        "Nach dem Login kannst du auf der Hauptseite einen Prompt eingeben und auf 'Generieren' klicken. Du kannst auch zufällige Ideen generieren lassen.",
    },
    {
      question: 'Was sind die Unterschiede zwischen den Subscription-Plänen?',
      answer:
        'Free (€0): 5 Ideen/Tag, Creator (€9.99): 50 Ideen/Tag, Pro (€29.99): 200 Ideen/Tag, Enterprise (€99.99): Unbegrenzt. Siehe /subscription für Details.',
    },
    {
      question: 'Wie kann ich mein Passwort ändern?',
      answer:
        "Gehe zu den Einstellungen (/settings) und verwende den Bereich 'Sicherheitseinstellungen' um dein Passwort zu aktualisieren.",
    },
    {
      question: 'Wo finde ich meine generierten Ideen?',
      answer:
        'Alle deine Ideen werden automatisch gespeichert und können über die API (/api/v1/ideas) oder im Dashboard abgerufen werden.',
    },
    {
      question: 'Wie funktioniert das Usage-Tracking?',
      answer:
        'Jede generierte Idee wird zu deinen täglichen und monatlichen Limits gezählt. Du kannst deinen aktuellen Verbrauch im Subscription-Dashboard sehen.',
    },
    {
      question: 'Welche AI-Modelle stehen zur Verfügung?',
      answer:
        'Je nach Subscription-Plan hast du Zugang zu verschiedenen AI-Modellen: Basic (Free), Advanced (Creator), Premium (Pro), All Models (Enterprise).',
    },
    {
      question: 'Kann ich die API direkt verwenden?',
      answer:
        'Ja! Die vollständige API-Dokumentation findest du unter /docs. Enterprise-Kunden haben vollen API-Zugang.',
    },
  ];

  const quickLinks = [
    {
      title: '🏠 Hauptseite',
      url: '/',
      description: 'Zurück zur Ideengenerierung',
    },
    {
      title: '🔐 Login/Register',
      url: '/auth',
      description: 'Anmelden oder Konto erstellen',
    },
    {
      title: '💳 Subscription',
      url: '/subscription',
      description: 'Plan verwalten und Usage anzeigen',
    },
    {
      title: '⚙️ Einstellungen',
      url: '/settings',
      description: 'Profil und Sicherheit verwalten',
    },
    {
      title: '📚 API Docs',
      url: '/docs',
      description: 'Vollständige API-Dokumentation',
    },
    {
      title: '📊 API Info',
      url: '/api',
      description: 'API-Übersicht und Endpoints',
    },
    {
      title: '🌟 Landing Page',
      url: '/landing',
      description: 'Produktübersicht und Features',
    },
    {
      title: 'ℹ️ Über uns',
      url: '/about',
      description: 'Unternehmensinformationen',
    },
  ];

  const troubleshooting = [
    {
      problem: 'Ich kann mich nicht anmelden',
      solution:
        'Überprüfe deine E-Mail und dein Passwort. Stelle sicher, dass dein Konto registriert ist. Bei anhaltenden Problemen versuche es mit einem anderen Browser.',
    },
    {
      problem: 'Ideengenerierung funktioniert nicht',
      solution:
        'Überprüfe, ob du angemeldet bist und noch Ideen-Credits übrig hast. Schaue in dein Subscription-Dashboard für aktuelle Limits.',
    },
    {
      problem: 'Seite lädt nicht richtig',
      solution:
        'Aktualisiere die Seite (F5) oder lösche den Browser-Cache. Stelle sicher, dass JavaScript aktiviert ist.',
    },
    {
      problem: 'API-Aufrufe schlagen fehl',
      solution:
        'Überprüfe, ob das Backend läuft (http://localhost:8000/health) und ob dein JWT-Token noch gültig ist.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🆘 Hilfe & Support
          </h1>
          <p className="text-xl text-gray-600">
            Finde Antworten auf häufige Fragen und lerne, wie du Creative Muse
            AI optimal nutzt
          </p>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">🔗 Schnellzugriff</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <h3 className="font-medium text-gray-900 mb-1">{link.title}</h3>
                <p className="text-sm text-gray-600">{link.description}</p>
              </a>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">
            ❓ Häufig gestellte Fragen (FAQ)
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border-b border-gray-200 pb-4 last:border-b-0"
              >
                <h3 className="font-medium text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">🔧 Problemlösung</h2>
          <div className="space-y-6">
            {troubleshooting.map((item, index) => (
              <div
                key={index}
                className="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <h3 className="font-medium text-red-800 mb-2">
                  Problem: {item.problem}
                </h3>
                <p className="text-red-700">{item.solution}</p>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">🖥️ System-Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-800 mb-2">Frontend</h3>
              <p className="text-green-700 text-sm">http://localhost:3001</p>
              <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs mt-2">
                ✅ Online
              </span>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-800 mb-2">Backend API</h3>
              <p className="text-green-700 text-sm">http://localhost:8000</p>
              <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs mt-2">
                ✅ Online
              </span>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-800 mb-2">Database</h3>
              <p className="text-green-700 text-sm">SQLite + Web Admin</p>
              <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs mt-2">
                ✅ Online
              </span>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">🚀 Erste Schritte</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                1
              </span>
              <div>
                <h3 className="font-medium">Konto erstellen</h3>
                <p className="text-gray-600 text-sm">
                  Gehe zu{' '}
                  <a href="/auth" className="text-blue-600 hover:underline">
                    /auth
                  </a>{' '}
                  und registriere dich mit deiner E-Mail
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                2
              </span>
              <div>
                <h3 className="font-medium">Anmelden</h3>
                <p className="text-gray-600 text-sm">
                  Logge dich ein und du wirst zur Hauptseite weitergeleitet
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                3
              </span>
              <div>
                <h3 className="font-medium">Erste Idee generieren</h3>
                <p className="text-gray-600 text-sm">
                  Gib einen Prompt ein und lass die AI eine kreative Idee für
                  dich generieren
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                4
              </span>
              <div>
                <h3 className="font-medium">Subscription verwalten</h3>
                <p className="text-gray-600 text-sm">
                  Schaue in{' '}
                  <a
                    href="/subscription"
                    className="text-blue-600 hover:underline"
                  >
                    /subscription
                  </a>{' '}
                  für deine Limits und Upgrade-Optionen
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-2xl font-bold mb-4">📞 Kontakt & Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Technischer Support</h3>
              <p className="text-gray-600 text-sm mb-2">
                Für technische Probleme und API-Fragen
              </p>
              <p className="text-blue-600">support@creativemuse.ai</p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Allgemeine Anfragen</h3>
              <p className="text-gray-600 text-sm mb-2">
                Für Fragen zu Subscriptions und Features
              </p>
              <p className="text-blue-600">info@creativemuse.ai</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm">
              💡 <strong>Tipp:</strong> Schaue zuerst in die{' '}
              <a href="/docs" className="underline">
                API-Dokumentation
              </a>
              für technische Fragen oder durchsuche diese FAQ-Seite.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
