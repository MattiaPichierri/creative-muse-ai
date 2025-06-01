# Creative Muse - AI-Powered Idea Generator

Una moderna applicazione web per la generazione di idee creative utilizzando l'intelligenza artificiale Mistral-7B-Instruct-v0.3.

## 🚀 Tecnologie

- **Next.js 15** - Framework React con App Router
- **React 19** - Libreria UI con le ultime funzionalità
- **TypeScript** - Tipizzazione statica per maggiore sicurezza
- **Tailwind CSS v4** - Framework CSS utility-first moderno
- **shadcn/ui** - Componenti UI professionali e accessibili
- **Framer Motion** - Animazioni fluide e coinvolgenti
- **Lucide React** - Icone moderne e consistenti

## ✨ Caratteristiche

### 🎨 Design Moderno
- Interfaccia glassmorphism con effetti di sfocatura
- Gradienti e animazioni fluide
- Design responsive per tutti i dispositivi
- Sistema di colori coerente e accessibile

### 🤖 Intelligenza Artificiale
- Integrazione con Mistral-7B-Instruct-v0.3
- Generazione di idee casuali
- Prompt personalizzati per idee specifiche
- Categorizzazione automatica delle idee

### 📊 Gestione Completa
- Visualizzazione di tutte le idee generate
- Sistema di valutazione a stelle
- Filtri per categoria e ricerca testuale
- Statistiche dettagliate e analytics

### 🔧 Funzionalità Avanzate
- Navigazione intuitiva desktop e mobile
- Stati di caricamento animati
- Gestione errori robusta
- Performance ottimizzate

## 🏗️ Struttura del Progetto

```
creative-muse-modern/
├── src/
│   ├── app/                    # App Router di Next.js
│   │   ├── ideas/             # Pagina gestione idee
│   │   ├── stats/             # Pagina statistiche
│   │   ├── layout.tsx         # Layout principale
│   │   ├── page.tsx           # Homepage
│   │   └── globals.css        # Stili globali
│   ├── components/            # Componenti riutilizzabili
│   │   ├── ui/               # Componenti shadcn/ui
│   │   ├── Navigation.tsx    # Sistema di navigazione
│   │   └── LoadingSpinner.tsx # Componenti di caricamento
│   └── lib/                  # Utilities e servizi
│       ├── api.ts           # Client API tipizzato
│       └── utils.ts         # Utility functions
├── public/                   # Asset statici
└── package.json             # Dipendenze e script
```

## 🚦 Avvio Rapido

### Prerequisiti
- Node.js 18+ 
- npm o yarn
- Backend API in esecuzione su porta 8000

### Installazione

1. **Clona il repository**
   ```bash
   git clone <repository-url>
   cd creative-muse-modern
   ```

2. **Installa le dipendenze**
   ```bash
   npm install
   ```

3. **Configura le variabili d'ambiente**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Modifica `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Avvia l'applicazione**
   ```bash
   npm run dev
   ```

5. **Apri il browser**
   Vai su [http://localhost:3000](http://localhost:3000)

## 📱 Pagine e Funzionalità

### 🏠 Homepage (`/`)
- Generazione idee casuali con un click
- Input personalizzato per prompt specifici
- Anteprima delle ultime 6 idee generate
- Navigazione rapida alle altre sezioni

### 💡 Gestione Idee (`/ideas`)
- Visualizzazione di tutte le idee generate
- Ricerca testuale nelle idee
- Filtri per categoria
- Sistema di valutazione a stelle
- Ordinamento e paginazione

### 📊 Statistiche (`/stats`)
- Numero totale di idee generate
- Valutazione media delle idee
- Distribuzione per categoria con grafici
- Attività recente e trend
- Azioni rapide per nuove generazioni

## 🎨 Sistema di Design

### Colori
- **Primario**: Blu (#3b82f6) - Azioni principali
- **Secondario**: Viola (#8b5cf6) - Accenti e gradienti
- **Successo**: Verde (#10b981) - Feedback positivo
- **Attenzione**: Giallo (#f59e0b) - Avvisi
- **Errore**: Rosso (#ef4444) - Errori e problemi

### Tipografia
- **Font**: Inter (system-ui fallback)
- **Scala**: Modulare con rapporti armonici
- **Peso**: 400 (normale), 500 (medio), 600 (semibold), 700 (bold)

### Animazioni
- **Durata**: 200ms (micro), 300ms (standard), 500ms (complesse)
- **Easing**: ease-in-out per transizioni naturali
- **Hover**: Scale e shadow per feedback immediato

## 🔧 API Integration

### Endpoints Utilizzati
- `POST /api/v1/random` - Generazione idea casuale
- `POST /api/v1/generate` - Generazione con prompt personalizzato
- `GET /api/v1/ideas` - Lista di tutte le idee
- `GET /api/v1/stats` - Statistiche aggregate
- `POST /api/v1/ideas/:id/rate` - Valutazione idea

### Gestione Errori
- Retry automatico per errori di rete
- Fallback graceful per API non disponibili
- Messaggi di errore user-friendly
- Logging dettagliato per debugging

## 🚀 Performance

### Ottimizzazioni Implementate
- **Code Splitting**: Caricamento lazy delle pagine
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Analisi dimensioni bundle
- **Caching**: Strategia di cache per API calls
- **Prefetching**: Precaricamento link critici

### Metriche Target
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🧪 Testing

### Tipi di Test
- **Unit Tests**: Componenti e utilities
- **Integration Tests**: Flussi API
- **E2E Tests**: Scenari utente completi
- **Visual Regression**: Consistenza UI

### Comandi Test
```bash
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:coverage # Coverage report
```

## 📦 Build e Deploy

### Build di Produzione
```bash
npm run build
npm run start
```

### Variabili d'Ambiente
```env
# Produzione
NEXT_PUBLIC_API_URL=https://api.creativemuse.com
NEXT_PUBLIC_APP_ENV=production

# Sviluppo
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_ENV=development
```

### Deploy Platforms
- **Vercel**: Deploy automatico da Git
- **Netlify**: Build e hosting statico
- **Docker**: Containerizzazione per cloud

## 🤝 Contribuire

1. Fork del repository
2. Crea un branch feature (`git checkout -b feature/amazing-feature`)
3. Commit delle modifiche (`git commit -m 'Add amazing feature'`)
4. Push al branch (`git push origin feature/amazing-feature`)
5. Apri una Pull Request

### Linee Guida
- Segui le convenzioni TypeScript
- Aggiungi test per nuove funzionalità
- Mantieni la documentazione aggiornata
- Usa commit semantici

## 📄 Licenza

Questo progetto è sotto licenza MIT. Vedi il file `LICENSE` per dettagli.

## 🆘 Supporto

Per problemi o domande:
- Apri un issue su GitHub
- Consulta la documentazione API
- Controlla i log di sviluppo

---

**Creative Muse** - Libera la tua creatività con l'intelligenza artificiale! 🚀✨
