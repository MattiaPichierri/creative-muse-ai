#!/usr/bin/env python3
"""
Creative Muse AI - React Frontend Setup Script
Configura automaticamente il React frontend con tutte le dipendenze necessarie.
"""

import os
import sys
import subprocess
import json
from pathlib import Path

def run_command(command, cwd=None, check=True):
    """Esegue un comando shell e gestisce gli errori."""
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            cwd=cwd, 
            check=check,
            capture_output=True,
            text=True
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"❌ Errore nell'esecuzione del comando: {command}")
        print(f"Errore: {e.stderr}")
        if check:
            sys.exit(1)
        return None

def check_node_version():
    """Verifica la versione di Node.js."""
    print("🔍 Verifico la versione di Node.js...")
    try:
        output = run_command("node --version")
        version = output.strip().replace('v', '')
        major_version = int(version.split('.')[0])
        
        if major_version >= 18:
            print(f"✅ Node.js {version} trovato (>= 18 richiesto)")
            return True
        else:
            print(f"❌ Node.js {version} trovato, ma è richiesta la versione >= 18")
            return False
    except:
        print("❌ Node.js non trovato. Installa Node.js >= 18")
        return False

def setup_react_frontend():
    """Configura il React frontend."""
    print("🚀 Configurazione React Frontend...")
    
    react_dir = Path(__file__).parent.parent / "creative-muse-react"
    
    if not react_dir.exists():
        print(f"❌ Directory React non trovata: {react_dir}")
        return False
    
    print(f"📁 Directory React: {react_dir}")
    
    # Installa dipendenze
    print("📦 Installazione dipendenze...")
    run_command("npm install", cwd=react_dir)
    
    # Verifica che Tailwind CSS sia configurato
    tailwind_config = react_dir / "tailwind.config.js"
    if tailwind_config.exists():
        print("✅ Tailwind CSS configurato")
    else:
        print("⚠️ Tailwind CSS non configurato")
    
    # Verifica PostCSS
    postcss_config = react_dir / "postcss.config.js"
    if postcss_config.exists():
        print("✅ PostCSS configurato")
    else:
        print("⚠️ PostCSS non configurato")
    
    # Verifica TypeScript
    tsconfig = react_dir / "tsconfig.json"
    if tsconfig.exists():
        print("✅ TypeScript configurato")
    else:
        print("⚠️ TypeScript non configurato")
    
    print("✅ Setup React Frontend completato!")
    return True

def create_env_file():
    """Crea file .env per il React frontend se non esiste."""
    react_dir = Path(__file__).parent.parent / "creative-muse-react"
    env_file = react_dir / ".env"
    
    if not env_file.exists():
        print("📝 Creazione file .env...")
        env_content = """# Creative Muse AI - React Frontend Environment
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=Creative Muse AI
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_PWA=true
"""
        env_file.write_text(env_content)
        print("✅ File .env creato")
    else:
        print("✅ File .env già esistente")

def main():
    """Funzione principale."""
    print("🎨 Creative Muse AI - React Frontend Setup")
    print("=" * 50)
    
    # Verifica Node.js
    if not check_node_version():
        sys.exit(1)
    
    # Setup React frontend
    if not setup_react_frontend():
        sys.exit(1)
    
    # Crea file .env
    create_env_file()
    
    print("\n🎉 Setup completato con successo!")
    print("\nPer avviare il frontend:")
    print("cd creative-muse-react && npm run dev")

if __name__ == "__main__":
    main()