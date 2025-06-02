'use client';

import React from 'react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">📞 Kontakt</h1>
          <p className="text-xl text-gray-600">
            Wir sind hier, um dir zu helfen. Kontaktiere uns über einen der
            folgenden Kanäle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-2xl font-bold mb-6">Kontaktinformationen</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">
                  📧 E-Mail Support
                </h3>
                <p className="text-blue-600">support@creativemuse.ai</p>
                <p className="text-sm text-gray-600">
                  Für technische Fragen und Support
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-1">
                  💼 Geschäftliche Anfragen
                </h3>
                <p className="text-blue-600">business@creativemuse.ai</p>
                <p className="text-sm text-gray-600">
                  Für Partnerschaften und Enterprise-Lösungen
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-1">
                  ℹ️ Allgemeine Informationen
                </h3>
                <p className="text-blue-600">info@creativemuse.ai</p>
                <p className="text-sm text-gray-600">
                  Für allgemeine Fragen und Feedback
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-2xl font-bold mb-6">Schnelle Hilfe</h2>

            <div className="space-y-3">
              <a
                href="/help"
                className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <h3 className="font-medium text-blue-900">🆘 Hilfe & FAQ</h3>
                <p className="text-sm text-blue-700">
                  Häufige Fragen und Problemlösungen
                </p>
              </a>

              <a
                href="/docs"
                className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <h3 className="font-medium text-green-900">
                  📚 API Dokumentation
                </h3>
                <p className="text-sm text-green-700">
                  Vollständige technische Referenz
                </p>
              </a>

              <a
                href="/subscription"
                className="block p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <h3 className="font-medium text-purple-900">
                  💳 Subscription Support
                </h3>
                <p className="text-sm text-purple-700">
                  Fragen zu Plänen und Abrechnung
                </p>
              </a>
            </div>
          </div>
        </div>

        {/* Response Times */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
          <h2 className="text-2xl font-bold mb-4">⏰ Antwortzeiten</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900">Enterprise Kunden</h3>
              <p className="text-2xl font-bold text-green-600">&lt; 4h</p>
              <p className="text-sm text-green-700">Prioritärer Support</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900">Pro & Creator</h3>
              <p className="text-2xl font-bold text-blue-600">&lt; 24h</p>
              <p className="text-sm text-blue-700">Werktags</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">Free Plan</h3>
              <p className="text-2xl font-bold text-gray-600">2-3 Tage</p>
              <p className="text-sm text-gray-700">Community Support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
