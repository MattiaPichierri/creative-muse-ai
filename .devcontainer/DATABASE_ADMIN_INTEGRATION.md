# 🗄️ Database Admin Integration - DevContainer

Integrazione completa degli strumenti di amministrazione database nel DevContainer di Creative Muse AI.

## 🚀 Configurazione Automatica

Il DevContainer è configurato per fornire accesso immediato al database SQLite attraverso:

### 🔧 **Configurazione Automatica**
- ✅ **Porte Forward**: 8080, 8081, 8082 per i servizi database
- ✅ **Estensioni VSCode**: SQLite Viewer e SQLite Explorer
- ✅ **Alias Bash**: Comandi rapidi per gestione database
- ✅ **Tasks VSCode**: Interfaccia grafica per operazioni database
- ✅ **Permessi File**: Script eseguibili configurati automaticamente

## 🌐 **Servizi Database Disponibili**

### 1. **Adminer** - http://localhost:8080
- 🎯 **Uso**: Amministrazione universale database
- 🔐 **Accesso**: Server: `sqlite`, Database: percorso file
- 🎨 **Tema**: Dark mode ottimizzato

### 2. **SQLite Web** - http://localhost:8081
- 🎯 **Uso**: Browser leggero per SQLite
- 🔒 **Modalità**: Read-only per sicurezza
- ⚡ **Performance**: Ottimizzato per grandi dataset

### 3. **phpLiteAdmin** - http://localhost:8082
- 🎯 **Uso**: Amministrazione avanzata SQLite
- 🔐 **Password**: `creativemuse2024`
- 🎨 **UI**: Interfaccia ricca e personalizzata

## 🖥️ **Accesso tramite VSCode**

### **Command Palette** (Ctrl+Shift+P)
```
Tasks: Run Task
├── 🗄️ Start Database Admin
├── 🛑 Stop Database Admin
├── 📊 Database Admin Status
├── 📋 Database Admin Logs
├── 🔄 Restart Database Admin
├── 🗄️ Open Database Shell
├── 🔧 Initialize Database
└── 🌐 Open Database Admin URLs
```

### **Estensioni VSCode Integrate**
- **SQLite Viewer**: Visualizzazione diretta file .db
- **SQLite Explorer**: Navigazione struttura database
- **Syntax Highlighting**: SQL con evidenziazione sintassi

## 🔧 **Comandi Bash Disponibili**

### **Gestione Servizi**
```bash
# Avviare tutti i servizi database admin
start-db-admin

# Fermare tutti i servizi
stop-db-admin

# Controllare stato servizi
db-admin-status

# Visualizzare logs in tempo reale
db-admin-logs

# Accesso diretto al database
db-shell
```

### **Inizializzazione Database**
```bash
# Inizializzare database pulito
init-database

# Navigare alla cartella database
db
```

## 📁 **Struttura File Integrata**

```
.devcontainer/
├── devcontainer.json          # Configurazione container
├── setup.sh                   # Script setup automatico
├── init-database.sh          # Inizializzazione database
└── DATABASE_ADMIN_INTEGRATION.md

.vscode/
├── settings.json              # Configurazioni SQLite
└── tasks.json                 # Tasks database admin

database/
├── creative_muse.db          # Database principale
├── schema.sql                # Schema database
└── web-admin/                # Strumenti web admin
    ├── docker-compose.yml    # Configurazione servizi
    ├── start-db-admin.sh     # Script avvio
    ├── README.md             # Documentazione
    └── sequel-pro-setup.md   # Setup Sequel Pro
```

## 🔒 **Sicurezza Integrata**

### **Protezioni Attive**
- 🔒 **Read-Only Mode**: Tutti i servizi in modalità sola lettura
- 🏠 **Localhost Only**: Accesso limitato a localhost
- 🔐 **Password Protection**: phpLiteAdmin protetto
- 📁 **File Permissions**: Database montato read-only
- 🌐 **Network Isolation**: Servizi in rete Docker isolata

### **Best Practices Automatiche**
- ✅ Backup automatico prima di modifiche
- ✅ Verifica integrità database
- ✅ Logging completo delle operazioni
- ✅ Monitoraggio accessi

## 🚀 **Workflow di Sviluppo**

### **1. Avvio DevContainer**
```bash
# Il DevContainer si avvia automaticamente con:
# - Database inizializzato
# - Servizi configurati
# - Alias disponibili
# - Estensioni installate
```

### **2. Accesso Database**
```bash
# Opzione A: Servizi Web
start-db-admin
# Poi apri http://localhost:8080

# Opzione B: VSCode Extension
# Apri file .db direttamente in VSCode

# Opzione C: Shell diretto
db-shell
```

### **3. Sviluppo e Test**
```bash
# Modifica codice
# Test con database pulito
init-database

# Verifica modifiche
db-admin-status
```

## 🎯 **Casi d'Uso Comuni**

### **Esplorazione Dati**
1. **Avvia servizi**: `start-db-admin`
2. **Apri Adminer**: http://localhost:8080
3. **Esplora tabelle**: Naviga struttura database
4. **Esegui query**: SELECT per analisi dati

### **Debug Applicazione**
1. **Apri VSCode**: Usa SQLite Viewer extension
2. **Visualizza dati**: Controlla stato database
3. **Esegui query**: Debug problemi specifici
4. **Monitora logs**: `db-admin-logs`

### **Analisi Performance**
1. **SQLite Web**: http://localhost:8081
2. **Query ottimizzate**: Analizza performance
3. **Statistiche**: Verifica dimensioni tabelle
4. **Indici**: Controlla utilizzo indici

## 🔧 **Personalizzazione**

### **Modificare Porte**
Edita `.devcontainer/devcontainer.json`:
```json
"forwardPorts": [8080, 8081, 8082],
```

### **Aggiungere Servizi**
Edita `database/web-admin/docker-compose.yml`:
```yaml
services:
  nuovo-servizio:
    # configurazione
```

### **Personalizzare Alias**
Edita `.devcontainer/setup.sh`:
```bash
alias mio-comando='comando personalizzato'
```

## 🆘 **Risoluzione Problemi**

### **Servizi Non Avviati**
```bash
# Controlla Docker
docker ps

# Riavvia servizi
stop-db-admin
start-db-admin

# Verifica logs
db-admin-logs
```

### **Database Non Trovato**
```bash
# Reinizializza database
init-database

# Verifica percorso
ls -la database/creative_muse.db
```

### **Porte Occupate**
```bash
# Controlla porte in uso
netstat -tulpn | grep :808

# Modifica porte in docker-compose.yml
```

## 📚 **Risorse Aggiuntive**

- 📖 [README Database Admin](../database/web-admin/README.md)
- 🔗 [Setup Sequel Pro](../database/web-admin/sequel-pro-setup.md)
- 🐳 [Docker Compose Reference](https://docs.docker.com/compose/)
- 🗄️ [SQLite Documentation](https://sqlite.org/docs.html)

---

**🎨 Creative Muse AI DevContainer** - Database admin integrato per un'esperienza di sviluppo completa!