'use client';

import React from 'react';

export default function DocsPage() {
  const endpoints = [
    {
      category: "Authentication",
      items: [
        {
          method: "POST",
          path: "/api/v1/auth/register",
          description: "Registriere einen neuen Benutzer",
          body: {
            email: "string",
            password: "string",
            username: "string (optional)"
          }
        },
        {
          method: "POST",
          path: "/api/v1/auth/login",
          description: "Melde dich mit E-Mail und Passwort an",
          body: {
            email: "string",
            password: "string"
          }
        },
        {
          method: "GET",
          path: "/api/v1/auth/me",
          description: "Hole Benutzerprofilinformationen",
          auth: true
        }
      ]
    },
    {
      category: "Subscription",
      items: [
        {
          method: "GET",
          path: "/api/v1/subscription/info",
          description: "Hole Subscription-Informationen und Usage-Statistiken",
          auth: true
        }
      ]
    },
    {
      category: "Ideas",
      items: [
        {
          method: "POST",
          path: "/api/v1/generate",
          description: "Generiere eine personalisierte Idee",
          auth: true,
          body: {
            prompt: "string",
            category: "string (optional)",
            language: "string (optional, default: 'it')",
            creativity_level: "number (optional, 1-10)",
            model: "string (optional)"
          }
        },
        {
          method: "POST",
          path: "/api/v1/random",
          description: "Generiere eine zufällige Idee",
          auth: true,
          body: {
            category: "string (optional)",
            language: "string (optional)"
          }
        },
        {
          method: "GET",
          path: "/api/v1/ideas",
          description: "Hole alle deine generierten Ideen",
          auth: true
        }
      ]
    }
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium';
      case 'POST': return 'bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium';
      case 'PUT': return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-medium';
      case 'DELETE': return 'bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium';
      default: return 'bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-medium';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            API Dokumentation
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Vollständige Referenz für die Creative Muse AI API
          </p>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border">
              <span className="font-medium">Backend:</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                http://localhost:8000
              </code>
            </div>
            <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border">
              <span className="font-medium">Frontend:</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                http://localhost:3001
              </code>
            </div>
          </div>
        </div>

        {/* Authentication Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">🔒 Authentifizierung</h2>
          <p className="text-gray-600 mb-4">
            Die meisten Endpoints erfordern eine Authentifizierung mit JWT-Token.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Authorization Header:</h4>
            <code className="text-sm">
              Authorization: Bearer &lt;your-jwt-token&gt;
            </code>
          </div>
        </div>

        {/* Endpoints */}
        {endpoints.map((category) => (
          <div key={category.category} className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">
              {category.category}
              <span className="ml-3 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {category.items.length} Endpoint{category.items.length !== 1 ? 's' : ''}
              </span>
            </h2>
            
            <div className="space-y-6">
              {category.items.map((endpoint, index) => (
                <div key={index} className="border-l-4 border-blue-200 pl-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={getMethodColor(endpoint.method)}>
                      {endpoint.method}
                    </span>
                    <code className="text-lg font-mono bg-gray-100 px-2 py-1 rounded">
                      {endpoint.path}
                    </code>
                    {endpoint.auth && (
                      <span className="text-orange-600 border border-orange-600 px-2 py-1 rounded text-sm">
                        🔒 Auth Required
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-3">
                    {endpoint.description}
                  </p>

                  {endpoint.body && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h5 className="font-medium mb-2">Request Body:</h5>
                      <pre className="text-sm overflow-x-auto">
                        {JSON.stringify(endpoint.body, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Subscription Tiers */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">💳 Subscription Tiers & Limits</h2>
          <p className="text-gray-600 mb-6">
            Verschiedene Pläne mit unterschiedlichen Limits und Features
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-800">Free</h4>
              <p className="text-sm text-gray-600 mb-2">€0/Monat</p>
              <ul className="text-sm space-y-1">
                <li>• 5 Ideen/Tag</li>
                <li>• 50 Ideen/Monat</li>
                <li>• 1 Teammitglied</li>
                <li>• 3 Projekte</li>
                <li>• Basic AI</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-bold text-blue-800">Creator</h4>
              <p className="text-sm text-blue-600 mb-2">€9.99/Monat</p>
              <ul className="text-sm space-y-1">
                <li>• 50 Ideen/Tag</li>
                <li>• 500 Ideen/Monat</li>
                <li>• 3 Teammitglieder</li>
                <li>• 10 Projekte</li>
                <li>• Advanced AI</li>
              </ul>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-bold text-purple-800">Pro</h4>
              <p className="text-sm text-purple-600 mb-2">€29.99/Monat</p>
              <ul className="text-sm space-y-1">
                <li>• 200 Ideen/Tag</li>
                <li>• 2000 Ideen/Monat</li>
                <li>• 10 Teammitglieder</li>
                <li>• ∞ Projekte</li>
                <li>• Premium AI</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-bold text-yellow-800">Enterprise</h4>
              <p className="text-sm text-yellow-600 mb-2">€99.99/Monat</p>
              <ul className="text-sm space-y-1">
                <li>• ∞ Ideen</li>
                <li>• ∞ Teammitglieder</li>
                <li>• ∞ Projekte</li>
                <li>• All AI Models</li>
                <li>• API Access</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-2xl font-bold mb-4">🔗 Quick Links</h2>
          <div className="flex flex-wrap gap-3">
            <a 
              href="/api" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-100 text-blue-800 px-4 py-2 rounded hover:bg-blue-200 transition-colors"
            >
              📊 API Info
            </a>
            <a 
              href="http://localhost:8000/health" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-green-100 text-green-800 px-4 py-2 rounded hover:bg-green-200 transition-colors"
            >
              ❤️ Health Check
            </a>
            <a 
              href="/auth"
              className="bg-orange-100 text-orange-800 px-4 py-2 rounded hover:bg-orange-200 transition-colors"
            >
              🔐 Login/Register
            </a>
            <a 
              href="/subscription"
              className="bg-purple-100 text-purple-800 px-4 py-2 rounded hover:bg-purple-200 transition-colors"
            >
              ⚡ Subscription Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}