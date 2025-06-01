#!/usr/bin/env python3
"""
Creative Muse AI - Next.js Frontend Setup Script
Configura automaticamente il Next.js frontend con tutte le dipendenze.
"""

import sys
import subprocess
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
            print(f"❌ Node.js {version} trovato, versione >= 18 richiesta")
            return False
    except Exception:
        print("❌ Node.js non trovato. Installa Node.js >= 18")
        return False


def setup_nextjs_frontend():
    """Configura il Next.js frontend."""
    print("🚀 Configurazione Next.js Frontend...")
    
    nextjs_dir = Path(__file__).parent.parent / "creative-muse-modern"
    
    if not nextjs_dir.exists():
        print(f"❌ Directory Next.js non trovata: {nextjs_dir}")
        return False
    
    print(f"📁 Directory Next.js: {nextjs_dir}")
    
    # Installa dipendenze
    print("📦 Installazione dipendenze...")
    run_command("npm install", cwd=nextjs_dir)
    
    # Verifica che Tailwind CSS sia configurato
    tailwind_config = nextjs_dir / "tailwind.config.js"
    if tailwind_config.exists():
        print("✅ Tailwind CSS configurato")
    else:
        print("⚠️ Tailwind CSS non configurato")
    
    # Verifica PostCSS
    postcss_config = nextjs_dir / "postcss.config.mjs"
    if postcss_config.exists():
        print("✅ PostCSS configurato")
    else:
        print("⚠️ PostCSS non configurato")
    
    # Verifica TypeScript
    tsconfig = nextjs_dir / "tsconfig.json"
    if tsconfig.exists():
        print("✅ TypeScript configurato")
    else:
        print("⚠️ TypeScript non configurato")
    
    # Verifica Next.js config
    next_config = nextjs_dir / "next.config.ts"
    if next_config.exists():
        print("✅ Next.js configurato")
    else:
        print("⚠️ Next.js config non trovato")
    
    print("✅ Setup Next.js Frontend completato!")
    return True


def create_env_file():
    """Crea file .env.local per il Next.js frontend se non esiste."""
    nextjs_dir = Path(__file__).parent.parent / "creative-muse-modern"
    env_file = nextjs_dir / ".env.local"
    
    if not env_file.exists():
        print("📝 Creazione file .env.local...")
        env_content = """# Creative Muse AI - Next.js Frontend Environment
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Creative Muse AI
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENABLE_ANALYTICS=false
"""
        env_file.write_text(env_content)
        print("✅ File .env.local creato")
    else:
        print("✅ File .env.local già esistente")


def main():
    """Funzione principale."""
    print("🎨 Creative Muse AI - Next.js Frontend Setup")
    print("=" * 50)
    
    # Verifica Node.js
    if not check_node_version():
        sys.exit(1)
    
    # Setup Next.js frontend
    if not setup_nextjs_frontend():
        sys.exit(1)
    
    # Crea file .env
    create_env_file()
    
    print("\n🎉 Setup completato con successo!")
    print("\nPer avviare il frontend:")
    print("cd creative-muse-modern && npm run dev")


if __name__ == "__main__":
    main()