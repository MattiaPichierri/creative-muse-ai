'use client';

import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📋 Nutzungsbedingungen
          </h1>
          <p className="text-xl text-gray-600">
            Letzte Aktualisierung: {new Date().toLocaleDateString('de-DE')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">
              1. Akzeptanz der Bedingungen
            </h2>
            <p className="text-gray-700">
              Durch die Nutzung von Creative Muse AI stimmen Sie diesen
              Nutzungsbedingungen zu. Falls Sie nicht einverstanden sind, nutzen
              Sie den Service bitte nicht.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Servicebeschreibung</h2>
            <p className="text-gray-700 mb-4">
              Creative Muse AI ist ein KI-gestützter Ideengenerator, der
              Benutzern hilft, kreative Ideen zu entwickeln. Der Service
              umfasst:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>KI-basierte Ideengenerierung</li>
              <li>
                Verschiedene Subscription-Pläne mit unterschiedlichen Limits
              </li>
              <li>API-Zugang für Entwickler (je nach Plan)</li>
              <li>Speicherung und Verwaltung generierter Ideen</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Benutzerkonten</h2>
            <p className="text-gray-700 mb-4">
              Für die Nutzung des Services ist ein Benutzerkonto erforderlich:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Sie sind verantwortlich für die Sicherheit Ihres Kontos</li>
              <li>Verwenden Sie ein sicheres Passwort</li>
              <li>Teilen Sie Ihre Anmeldedaten nicht mit anderen</li>
              <li>Informieren Sie uns umgehend bei verdächtigen Aktivitäten</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Subscription-Pläne</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Free Plan (€0/Monat)</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 5 Ideen pro Tag</li>
                  <li>• 50 Ideen pro Monat</li>
                  <li>• Basic AI-Modelle</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Creator Plan (€9.99/Monat)</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 50 Ideen pro Tag</li>
                  <li>• 500 Ideen pro Monat</li>
                  <li>• Advanced AI-Modelle</li>
                </ul>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Pro Plan (€29.99/Monat)</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 200 Ideen pro Tag</li>
                  <li>• 2000 Ideen pro Monat</li>
                  <li>• Premium AI-Modelle</li>
                </ul>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">
                  Enterprise Plan (€99.99/Monat)
                </h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Unbegrenzte Ideen</li>
                  <li>• Alle AI-Modelle</li>
                  <li>• API-Zugang</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Nutzungsrichtlinien</h2>
            <p className="text-gray-700 mb-4">
              Bei der Nutzung unseres Services ist Folgendes nicht gestattet:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>
                Generierung von illegalen, schädlichen oder beleidigenden
                Inhalten
              </li>
              <li>
                Missbrauch des Services für Spam oder automatisierte Anfragen
              </li>
              <li>Umgehung von Nutzungslimits oder Sicherheitsmaßnahmen</li>
              <li>
                Reverse Engineering oder unbefugte Zugriffe auf das System
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Geistiges Eigentum</h2>
            <p className="text-gray-700 mb-4">
              Bezüglich der generierten Inhalte gilt:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>
                Sie behalten die Rechte an den von Ihnen generierten Ideen
              </li>
              <li>
                Creative Muse AI behält sich das Recht vor, anonymisierte Daten
                für Verbesserungen zu nutzen
              </li>
              <li>
                Der Service und seine Technologie bleiben Eigentum von Creative
                Muse AI
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Haftungsausschluss</h2>
            <p className="text-gray-700">
              Der Service wird &quot;wie besehen&quot; bereitgestellt. Wir
              übernehmen keine Garantie für die Verfügbarkeit, Genauigkeit oder
              Eignung der generierten Inhalte für bestimmte Zwecke.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Kündigung</h2>
            <p className="text-gray-700">
              Sie können Ihr Konto jederzeit kündigen. Wir behalten uns das
              Recht vor, Konten bei Verstößen gegen diese Bedingungen zu
              sperren.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Kontakt</h2>
            <p className="text-gray-700">
              Bei Fragen zu diesen Nutzungsbedingungen kontaktieren Sie uns
              unter:
              <a
                href="mailto:legal@creativemuse.ai"
                className="text-blue-600 hover:underline ml-1"
              >
                legal@creativemuse.ai
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
