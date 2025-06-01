# Creative Muse AI - Next.js Frontend

## 🎨 Überblick

Das Next.js Frontend ist eine moderne, responsive Webanwendung, die eine intuitive Benutzeroberfläche für die Creative Muse AI bietet.

## ✨ Features

### Design & UX
- **Glasmorphismus Design**: Moderne, transparente UI-Elemente
- **Responsive Layout**: Optimiert für Desktop, Tablet und Mobile
- **Dark Mode**: Automatischer und manueller Wechsel zwischen Hell- und Dunkelmodus
- **Animationen**: Flüssige Übergänge mit Framer Motion
- **Accessibility**: WCAG 2.1 konform

### Technologie-Stack
- **Next.js 15**: Neueste Next.js-Version mit App Router und Server Components
- **React 19**: Neueste React-Version mit Concurrent Features
- **TypeScript**: Vollständige Typsicherheit
- **Tailwind CSS**: Utility-First CSS Framework
- **Framer Motion**: Animationsbibliothek
- **Lucide React**: Moderne Icon-Bibliothek

### Funktionalitäten
- **Ideengenerierung**: KI-gestützte Kreativitätshilfe
- **Real-time Updates**: Live-Aktualisierung der generierten Ideen
- **Mehrsprachigkeit**: Deutsch/Englisch/Französisch/Spanisch/Italienisch Support
- **Server-Side Rendering**: Optimierte Performance durch SSR
- **Bewertungssystem**: 5-Sterne-Bewertung für Ideen

## 🚀 Installation & Setup

### Voraussetzungen
- Node.js 18+
- npm oder yarn

### Installation
```bash
cd creative-muse-modern
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

### Start der Produktion
```bash
npm start
```

## 📁 Projektstruktur

```
creative-muse-modern/
├── public/                 # Statische Assets
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── globals.css    # Globale Styles
│   │   ├── layout.tsx     # Root Layout
│   │   ├── page.tsx       # Homepage
│   │   ├── ideas/         # Ideen-Seite
│   │   └── stats/         # Statistiken-Seite
│   ├── components/        # React Komponenten
│   │   ├── ui/            # UI-Komponenten
│   │   └── ...            # Feature-Komponenten
│   ├── contexts/          # React Context für State Management
│   ├── hooks/             # Custom React Hooks
│   ├── lib/               # Utility-Funktionen und API Services
│   └── types/             # TypeScript Typdefinitionen
├── tailwind.config.js     # Tailwind Konfiguration
├── next.config.ts         # Next.js Konfiguration
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
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Creative Muse AI
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### Tailwind CSS
Die Tailwind-Konfiguration befindet sich in `tailwind.config.js` und umfasst:
- Custom Colors
- Extended Animations
- Custom Fonts
- Responsive Breakpoints

### Next.js Konfiguration
```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
}

export default nextConfig
```

## 🧩 Komponenten

### Server Components
Next.js Server Components für optimale Performance:
- **Layout**: Root Layout mit Theme und Language Provider
- **Page**: Statische Seiten-Komponenten
- **Metadata**: SEO-optimierte Meta-Tags

### Client Components
Interactive React Components:
- **IdeaGenerator**: Hauptformular für die Ideengenerierung
- **IdeaCard**: Darstellung generierter Ideen
- **ThemeToggle**: Dark/Light Mode Umschalter
- **LanguageSelector**: Sprachauswahl
- **Navigation**: Responsive Navigation

### UI Components
Wiederverwendbare UI-Elemente:
- **Button**: Verschiedene Button-Varianten
- **Card**: Container für Inhalte
- **Input/Textarea**: Formulareingaben
- **Badge**: Status- und Kategorie-Anzeigen

## 🌐 Internationalisierung

### Unterstützte Sprachen
- Deutsch (de) - Standard
- Englisch (en)
- Französisch (fr)
- Spanisch (es)
- Italienisch (it)

### Übersetzungen hinzufügen
```typescript
// src/contexts/LanguageContext.tsx
const translations = {
  de: {
    'header.title': 'Creative Muse',
    'home.title': 'Entfessle deine Kreativität',
    // Weitere deutsche Übersetzungen
  },
  en: {
    'header.title': 'Creative Muse',
    'home.title': 'Unleash Your Creativity',
    // Weitere englische Übersetzungen
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

### Vercel (Empfohlen)
```bash
npm run build
# Automatisches Deployment über Vercel CLI oder GitHub Integration
```

### Statische Hosting
```bash
npm run build
npm run export
# Upload out/ folder zu statischen Hosting-Anbietern
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
CMD ["npm", "start"]
```

### Selbst-gehostet
```bash
npm run build
npm start
# Läuft auf Port 3000
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
- Server-Side Rendering (SSR)
- Static Site Generation (SSG)
- Image Optimization
- Code Splitting
- Bundle Analysis

### Metriken
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Cumulative Layout Shift < 0.1

## 🐛 Debugging

### Development Tools
- React Developer Tools
- Next.js DevTools
- Browser DevTools

### Logging
```typescript
// Entwicklung
console.log('Debug info')

// Produktion
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info')
}
```

### Next.js Debugging
```bash
# Debug Mode
DEBUG=* npm run dev

# Analyze Bundle
npm run analyze
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

- [Next.js Dokumentation](https://nextjs.org/docs)
- [React Dokumentation](https://react.dev)
- [Tailwind CSS Dokumentation](https://tailwindcss.com)
- [Framer Motion Dokumentation](https://www.framer.com/motion)
- [TypeScript Dokumentation](https://www.typescriptlang.org/docs)