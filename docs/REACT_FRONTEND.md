# Creative Muse AI - React Frontend

## 🎨 Überblick

Das React Frontend ist eine moderne, responsive Webanwendung, die eine intuitive Benutzeroberfläche für die Creative Muse AI bietet.

## ✨ Features

### Design & UX
- **Glasmorphismus Design**: Moderne, transparente UI-Elemente
- **Responsive Layout**: Optimiert für Desktop, Tablet und Mobile
- **Dark Mode**: Automatischer und manueller Wechsel zwischen Hell- und Dunkelmodus
- **Animationen**: Flüssige Übergänge mit Framer Motion
- **Accessibility**: WCAG 2.1 konform

### Technologie-Stack
- **React 19**: Neueste React-Version mit Concurrent Features
- **TypeScript**: Vollständige Typsicherheit
- **Vite**: Schneller Build-Tool und Dev-Server
- **Tailwind CSS**: Utility-First CSS Framework
- **Framer Motion**: Animationsbibliothek
- **Lucide React**: Moderne Icon-Bibliothek

### Funktionalitäten
- **Ideengenerierung**: KI-gestützte Kreativitätshilfe
- **Real-time Updates**: Live-Aktualisierung der generierten Ideen
- **Mehrsprachigkeit**: Deutsch/Englisch Support
- **Offline-Fähig**: PWA-Ready für Offline-Nutzung
- **Bewertungssystem**: 5-Sterne-Bewertung für Ideen

## 🚀 Installation & Setup

### Voraussetzungen
- Node.js 18+
- npm oder yarn

### Installation
```bash
cd creative-muse-react
npm install
```

### Entwicklung
```bash
npm run dev
```

### Build für Produktion
```bash
npm run build
```

### Preview der Produktion
```bash
npm run preview
```

## 📁 Projektstruktur

```
creative-muse-react/
├── public/                 # Statische Assets
├── src/
│   ├── components/         # React Komponenten
│   │   ├── IdeaGenerator/  # Ideengenerierung-Komponenten
│   │   └── Layout/         # Layout-Komponenten
│   ├── context/           # React Context für State Management
│   ├── i18n/              # Internationalisierung
│   ├── pages/             # Seiten-Komponenten
│   ├── services/          # API Services
│   ├── types/             # TypeScript Typdefinitionen
│   ├── App.tsx            # Haupt-App-Komponente
│   ├── main.tsx           # Entry Point
│   ├── index.css          # Globale Styles
│   └── App.css            # App-spezifische Styles
├── tailwind.config.js     # Tailwind Konfiguration
├── vite.config.ts         # Vite Konfiguration
├── tsconfig.json          # TypeScript Konfiguration
└── package.json           # Abhängigkeiten
```

## 🎨 Design System

### Farbpalette
- **Primary**: Purple-Blue Gradient (#8b5cf6 → #3b82f6)
- **Secondary**: Indigo (#6366f1)
- **Success**: Green (#10b981)
- **Warning**: Orange (#f59e0b)
- **Error**: Red (#ef4444)

### Typografie
- **Font Family**: Inter (System Fallback)
- **Heading**: 700-900 Font Weight
- **Body**: 400-500 Font Weight
- **Code**: JetBrains Mono

### Spacing
- **Base Unit**: 0.25rem (4px)
- **Scale**: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px

## 🔧 Konfiguration

### Environment Variables
```bash
# .env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=Creative Muse AI
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_PWA=true
```

### Tailwind CSS
Die Tailwind-Konfiguration befindet sich in `tailwind.config.js` und umfasst:
- Custom Colors
- Extended Animations
- Custom Fonts
- Responsive Breakpoints

### Vite Konfiguration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
})
```

## 🧩 Komponenten

### IdeaForm
Hauptformular für die Ideengenerierung mit:
- Prompt-Eingabe
- Kategorie-Auswahl
- Kreativitätslevel-Slider
- Optionen für KI und Typing-Animation

### IdeaCard
Darstellung generierter Ideen mit:
- Titel und Beschreibung
- Kategorie-Badge
- Bewertungssystem
- Zeitstempel

### TypingAnimation
Simuliert Schreibmaschinen-Effekt für:
- Realistische KI-Generierung
- Benutzerengagement
- Visuelles Feedback

## 🌐 Internationalisierung

### Unterstützte Sprachen
- Deutsch (de) - Standard
- Englisch (en)

### Übersetzungen hinzufügen
```typescript
// src/i18n/translations.ts
export const translations = {
  de: {
    // Deutsche Übersetzungen
  },
  en: {
    // Englische Übersetzungen
  }
}
```

## 📱 PWA Features

### Service Worker
- Offline-Caching
- Background Sync
- Push Notifications (optional)

### Manifest
```json
{
  "name": "Creative Muse AI",
  "short_name": "CreativeMuse",
  "theme_color": "#8b5cf6",
  "background_color": "#ffffff",
  "display": "standalone"
}
```

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

### Linting
```bash
npm run lint
```

## 🚀 Deployment

### Statische Hosting
```bash
npm run build
# Upload dist/ folder to hosting provider
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🔒 Sicherheit

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline';">
```

### HTTPS
- Entwicklung: HTTP (localhost)
- Produktion: HTTPS erforderlich

## 📊 Performance

### Optimierungen
- Code Splitting
- Lazy Loading
- Image Optimization
- Bundle Analysis

### Metriken
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Cumulative Layout Shift < 0.1

## 🐛 Debugging

### Development Tools
- React Developer Tools
- Redux DevTools (falls verwendet)
- Vite DevTools

### Logging
```typescript
// Entwicklung
console.log('Debug info')

// Produktion
if (import.meta.env.DEV) {
  console.log('Debug info')
}
```

## 🤝 Beitragen

### Code Style
- ESLint + Prettier
- TypeScript strict mode
- Conventional Commits

### Pull Requests
1. Fork des Repositories
2. Feature Branch erstellen
3. Tests hinzufügen
4. Pull Request erstellen

## 📚 Weitere Ressourcen

- [React Dokumentation](https://react.dev)
- [Tailwind CSS Dokumentation](https://tailwindcss.com)
- [Framer Motion Dokumentation](https://www.framer.com/motion)
- [Vite Dokumentation](https://vitejs.dev)