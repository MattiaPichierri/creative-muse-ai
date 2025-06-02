import React from 'react';
import {
  FeatureGate,
  AIModelSelectionGate,
  AdvancedAnalyticsGate,
  BulkGenerationGate,
  ExportFormatsGate,
} from './FeatureGate';
import {
  AIModelUpgrade,
  AdvancedAnalyticsUpgrade,
  BulkGenerationUpgrade,
  ExportFormatsUpgrade,
} from './SubscriptionUpgrade';
import { useFeatureFlags } from '../hooks/useFeatureFlags';

export const FeatureShowcase: React.FC = () => {
  const { userTier, loading } = useFeatureFlags();

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse bg-gray-200 rounded h-8 w-full"></div>
        <div className="animate-pulse bg-gray-200 rounded h-32 w-full"></div>
        <div className="animate-pulse bg-gray-200 rounded h-32 w-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Feature Showcase
        </h1>
        <p className="text-gray-600">
          Aktueller Plan:{' '}
          <span className="font-semibold">{userTier || 'Free'}</span>
        </p>
      </div>

      {/* KI-Modell Auswahl */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">🤖 KI-Modell Auswahl</h2>
        <AIModelSelectionGate fallback={<AIModelUpgrade className="mt-4" />}>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">
              Verfügbare KI-Modelle:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded border">
                <div className="font-medium">GPT-4</div>
                <div className="text-sm text-gray-600">Höchste Qualität</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="font-medium">Claude-3</div>
                <div className="text-sm text-gray-600">
                  Kreativ & analytisch
                </div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="font-medium">Gemini Pro</div>
                <div className="text-sm text-gray-600">Schnell & effizient</div>
              </div>
            </div>
          </div>
        </AIModelSelectionGate>
      </div>

      {/* Erweiterte Analytik */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">📊 Erweiterte Analytik</h2>
        <AdvancedAnalyticsGate
          fallback={<AdvancedAnalyticsUpgrade className="mt-4" />}
        >
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">1,247</div>
                <div className="text-sm text-gray-600">Generierte Ideen</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">89%</div>
                <div className="text-sm text-gray-600">Erfolgsrate</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">42h</div>
                <div className="text-sm text-gray-600">Gesparte Zeit</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">15</div>
                <div className="text-sm text-gray-600">Aktive Projekte</div>
              </div>
            </div>
          </div>
        </AdvancedAnalyticsGate>
      </div>

      {/* Massen-Ideengenerierung */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          ⚡ Massen-Ideengenerierung
        </h2>
        <BulkGenerationGate
          fallback={<BulkGenerationUpgrade className="mt-4" />}
        >
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium">Batch-Größe:</span>
              <select className="border rounded px-3 py-1">
                <option>5 Ideen</option>
                <option>10 Ideen</option>
                <option>20 Ideen</option>
              </select>
            </div>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors">
              Batch-Generierung starten
            </button>
          </div>
        </BulkGenerationGate>
      </div>

      {/* Export-Formate */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">📄 Export-Formate</h2>
        <ExportFormatsGate fallback={<ExportFormatsUpgrade className="mt-4" />}>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button className="bg-white border border-orange-300 hover:bg-orange-100 p-3 rounded-lg text-center transition-colors">
                <div className="font-medium">PDF</div>
                <div className="text-xs text-gray-600">Professionell</div>
              </button>
              <button className="bg-white border border-orange-300 hover:bg-orange-100 p-3 rounded-lg text-center transition-colors">
                <div className="font-medium">DOCX</div>
                <div className="text-xs text-gray-600">Word-Format</div>
              </button>
              <button className="bg-white border border-orange-300 hover:bg-orange-100 p-3 rounded-lg text-center transition-colors">
                <div className="font-medium">JSON</div>
                <div className="text-xs text-gray-600">Strukturiert</div>
              </button>
              <button className="bg-white border border-orange-300 hover:bg-orange-100 p-3 rounded-lg text-center transition-colors">
                <div className="font-medium">MD</div>
                <div className="text-xs text-gray-600">Markdown</div>
              </button>
            </div>
          </div>
        </ExportFormatsGate>
      </div>

      {/* Feature-Übersicht */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">🎯 Feature-Übersicht</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureGate
            feature="team_collaboration"
            fallback={
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
                Team-Zusammenarbeit (Pro+)
              </div>
            }
          >
            <div className="bg-white border border-green-300 rounded-lg p-4">
              <div className="font-medium text-green-800">
                ✅ Team-Zusammenarbeit
              </div>
              <div className="text-sm text-green-600">
                Verfügbar in deinem Plan
              </div>
            </div>
          </FeatureGate>

          <FeatureGate
            feature="custom_prompts"
            fallback={
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
                Benutzerdefinierte Prompts (Creator+)
              </div>
            }
          >
            <div className="bg-white border border-green-300 rounded-lg p-4">
              <div className="font-medium text-green-800">
                ✅ Benutzerdefinierte Prompts
              </div>
              <div className="text-sm text-green-600">
                Verfügbar in deinem Plan
              </div>
            </div>
          </FeatureGate>

          <FeatureGate
            feature="api_access"
            fallback={
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
                API-Zugang (Enterprise)
              </div>
            }
          >
            <div className="bg-white border border-green-300 rounded-lg p-4">
              <div className="font-medium text-green-800">✅ API-Zugang</div>
              <div className="text-sm text-green-600">
                Verfügbar in deinem Plan
              </div>
            </div>
          </FeatureGate>

          <FeatureGate
            feature="priority_support"
            fallback={
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
                Prioritäts-Support (Pro+)
              </div>
            }
          >
            <div className="bg-white border border-green-300 rounded-lg p-4">
              <div className="font-medium text-green-800">
                ✅ Prioritäts-Support
              </div>
              <div className="text-sm text-green-600">
                Verfügbar in deinem Plan
              </div>
            </div>
          </FeatureGate>
        </div>
      </div>
    </div>
  );
};
