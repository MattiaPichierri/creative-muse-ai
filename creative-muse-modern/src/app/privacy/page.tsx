'use client';

import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔒 Datenschutzerklärung
          </h1>
          <p className="text-xl text-gray-600">
            Letzte Aktualisierung: {new Date().toLocaleDateString('de-DE')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Datenerhebung und -verwendung</h2>
            <p className="text-gray-700 mb-4">
              Creative Muse AI sammelt und verarbeitet personenbezogene Daten nur in dem Umfang, 
              der für die Bereitstellung unserer Dienste erforderlich ist.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>E-Mail-Adresse für Kontenerstellung und Kommunikation</li>
              <li>Verschlüsselte Passwörter für sichere Authentifizierung</li>
              <li>Generierte Ideen und Nutzungsstatistiken</li>
              <li>Technische Logs für Systemsicherheit und -optimierung</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Datensicherheit</h2>
            <p className="text-gray-700 mb-4">
              Wir implementieren branchenübliche Sicherheitsmaßnahmen zum Schutz Ihrer Daten:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>JWT-Token-basierte Authentifizierung</li>
              <li>Bcrypt-Verschlüsselung für Passwörter mit Salt</li>
              <li>HTTPS-Verschlüsselung für alle Datenübertragungen</li>
              <li>Regelmäßige Sicherheitsaudits und Updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Cookies und Tracking</h2>
            <p className="text-gray-700 mb-4">
              Wir verwenden nur technisch notwendige Cookies:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Authentifizierungs-Token für Login-Sessions</li>
              <li>Spracheinstellungen und Benutzervorlieben</li>
              <li>Keine Tracking-Cookies von Drittanbietern</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Ihre Rechte</h2>
            <p className="text-gray-700 mb-4">
              Gemäß DSGVO haben Sie folgende Rechte:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Recht auf Auskunft über gespeicherte Daten</li>
              <li>Recht auf Berichtigung unrichtiger Daten</li>
              <li>Recht auf Löschung Ihrer Daten</li>
              <li>Recht auf Datenportabilität</li>
              <li>Recht auf Widerspruch gegen Datenverarbeitung</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Kontakt</h2>
            <p className="text-gray-700">
              Bei Fragen zum Datenschutz kontaktieren Sie uns unter: 
              <a href="mailto:privacy@creativemuse.ai" className="text-blue-600 hover:underline ml-1">
                privacy@creativemuse.ai
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}