# Creative Muse AI - Backend Unificato

## 🎯 Panoramica

Il backend unificato Creative Muse AI consolida tutte le funzionalità precedentemente distribuite in multipli file `main_*.py` in un'unica applicazione modulare e scalabile.

## 🏗️ Architettura

### Struttura Directory
```
ai_core/
├── main.py                 # Applicazione unificata principale
├── routers/               # Router modulari per API
│   ├── auth.py           # Autenticazione e gestione utenti
│   ├── ai.py             # Generazione AI e gestione modelli
│   ├── admin.py          # Funzionalità amministrative
│   ├── subscription.py   # Gestione abbonamenti
│   └── training.py       # Training e fine-tuning modelli
├── services/             # Servizi business logic
│   ├── auth_service.py   # Servizio autenticazione
│   ├── model_manager.py  # Gestione modelli AI
│   ├── admin_service.py  # Servizio amministrazione
│   └── training_service.py # Servizio training
├── models/               # Modelli Pydantic
│   └── api_models.py     # Tutti i modelli API
├── middleware/           # Middleware personalizzati
├── utils/                # Utilities condivise
└── security/             # Componenti sicurezza (opzionali)
```

### Router Modulari

#### 🔐 Auth Router (`/api/v1/auth/*`)
- **POST** `/register` - Registrazione utente
- **POST** `/login` - Login utente
- **POST** `/forgot-password` - Richiesta reset password
- **POST** `/reset-password` - Reset password con token
- **GET** `/profile` - Profilo utente corrente
- **POST** `/logout` - Logout utente
- **POST** `/verify-email/{token}` - Verifica email

#### 🤖 AI Router (`/api/v1/ai/*`)
- **POST** `/generate` - Genera singola idea
- **POST** `/generate/batch` - Genera multiple idee
- **GET** `/models` - Lista modelli disponibili
- **POST** `/models/{model_key}/load` - Carica modello specifico
- **GET** `/ideas/history` - Storico idee utente
- **POST** `/ideas/{idea_id}/rate` - Valuta idea
- **GET** `/stream/generate` - Generazione streaming

#### 👑 Admin Router (`/api/v1/admin/*`)
- **GET** `/stats` - Statistiche sistema
- **GET** `/users` - Lista utenti
- **POST** `/users/{user_id}/suspend` - Sospendi utente
- **GET** `/feature-flags` - Gestione feature flags
- **POST** `/feature-flags` - Aggiorna feature flag
- **GET** `/rate-limits/stats` - Statistiche rate limiting
- **POST** `/rate-limits/unblock` - Sblocca rate limit

#### 💳 Subscription Router (`/api/v1/subscription/*`)
- **GET** `/info` - Info abbonamento corrente
- **GET** `/plans` - Piani disponibili
- **POST** `/upgrade/{plan_id}` - Upgrade abbonamento
- **POST** `/cancel` - Cancella abbonamento
- **GET** `/usage` - Statistiche utilizzo
- **GET** `/billing/history` - Storico fatturazione

#### 🎓 Training Router (`/api/v1/train/*`)
- **POST** `/upload` - Upload dataset training
- **POST** `/start` - Avvia training modello
- **GET** `/status/{job_id}` - Status training job
- **POST** `/stop/{job_id}` - Ferma training
- **GET** `/jobs` - Lista job utente
- **GET** `/datasets` - Lista dataset utente

## 🚀 Avvio

### Metodo 1: Diretto
```bash
cd ai_core
python main.py
```

### Metodo 2: Con Uvicorn
```bash
cd ai_core
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Metodo 3: Con variabili d'ambiente
```bash
cd ai_core
export HOST=0.0.0.0
export PORT=8000
export RELOAD=true
python main.py
```

## 🔧 Configurazione

### Variabili d'Ambiente
```bash
# Server
HOST=0.0.0.0
PORT=8000
WORKERS=1
RELOAD=false

# Database
DATABASE_URL=sqlite:///./database/creative_muse.db

# AI Models
HF_TOKEN=your_huggingface_token
MODEL_CACHE_DIR=../models

# Stripe (per abbonamenti)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# JWT
JWT_SECRET=your-secret-key-here

# Security (opzionale)
SECURITY_CONFIG_PATH=./security-config.yaml
```

## 🧪 Testing

### Test Automatico
```bash
cd ai_core
python test_unified.py
```

### Test Manuale
1. Avvia il server: `python main.py`
2. Apri browser: `http://localhost:8000/docs`
3. Testa gli endpoint tramite Swagger UI

### Health Check
```bash
curl http://localhost:8000/health
```

## 📊 Monitoraggio

### Endpoint di Sistema
- **GET** `/` - Info applicazione
- **GET** `/health` - Health check completo
- **GET** `/api/v1/info` - Info API

### WebSocket
- **WS** `/ws/{session_id}` - Comunicazione real-time

### Logging
I log sono strutturati e includono:
- Eventi di sistema
- Errori e eccezioni
- Audit trail (se sicurezza abilitata)
- Performance metrics

## 🔒 Sicurezza

### Rate Limiting
- Protezione contro abusi
- Limiti per IP e utente
- Configurabile per endpoint

### Autenticazione
- JWT tokens
- Session management
- Password hashing con bcrypt

### CORS
- Configurato per frontend locali
- Personalizzabile per produzione

### Audit Logging
- Tracciamento eventi sensibili
- Compliance e debugging
- Storage sicuro

## 🔄 Migrazione

### Da main_subscription.py
Il nuovo backend include tutte le funzionalità di `main_subscription.py`:
- ✅ Autenticazione completa
- ✅ Sistema abbonamenti
- ✅ Rate limiting
- ✅ Feature flags
- ✅ Admin panel

### Compatibilità API
Tutti gli endpoint esistenti sono mantenuti con la stessa interfaccia.

## 🐛 Troubleshooting

### Problemi Comuni

#### 1. Errore Import Moduli
```bash
# Assicurati di essere nella directory corretta
cd ai_core
python main.py
```

#### 2. Database Non Trovato
```bash
# Il database viene creato automaticamente al primo avvio
# Verifica permessi directory
```

#### 3. Modelli AI Non Disponibili
```bash
# Verifica token Hugging Face
export HF_TOKEN=your_token
# Verifica directory modelli
export MODEL_CACHE_DIR=../models
```

#### 4. Errori CORS
```bash
# Aggiungi il tuo frontend agli allowed_origins in main.py
```

## 📈 Performance

### Ottimizzazioni Implementate
- Lazy loading dei modelli AI
- Connection pooling database
- Caching intelligente
- Async/await per I/O non bloccante

### Metriche
- Tempo risposta < 100ms per endpoint semplici
- Supporto 1000+ richieste/minuto
- Memory usage ottimizzato

## 🔮 Roadmap

### Prossime Funzionalità
- [ ] Clustering multi-worker
- [ ] Redis per caching distribuito
- [ ] Metrics con Prometheus
- [ ] Container Docker ottimizzato
- [ ] CI/CD pipeline

### Miglioramenti Pianificati
- [ ] GraphQL endpoint
- [ ] gRPC per comunicazione interna
- [ ] Event sourcing
- [ ] Microservices architecture

## 📞 Supporto

Per problemi o domande:
1. Controlla i log: `tail -f logs/backend.log`
2. Verifica health check: `curl localhost:8000/health`
3. Consulta documentazione API: `http://localhost:8000/docs`

---

**Versione Backend**: 2.0.0  
**Ultima Modifica**: 2025-01-06  
**Compatibilità**: Python 3.8+