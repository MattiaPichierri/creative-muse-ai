#!/usr/bin/env python3
"""
Creative Muse AI - Environment Loader
Carica le variabili d'ambiente dal file .env
"""

import os
import sys
from pathlib import Path

def load_env_file(env_path=None):
    """Carica le variabili d'ambiente dal file .env"""
    if env_path is None:
        env_path = Path(__file__).parent.parent / ".env"
    
    if not env_path.exists():
        print(f"⚠️ File .env non trovato: {env_path}")
        return False
    
    print(f"📁 Caricamento variabili da: {env_path}")
    
    loaded_vars = 0
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            
            # Ignora commenti e righe vuote
            if not line or line.startswith('#'):
                continue
            
            # Cerca il pattern KEY=VALUE
            if '=' in line:
                key, value = line.split('=', 1)
                key = key.strip()
                value = value.strip()
                
                # Rimuovi virgolette se presenti
                if value.startswith('"') and value.endswith('"'):
                    value = value[1:-1]
                elif value.startswith("'") and value.endswith("'"):
                    value = value[1:-1]
                
                # Imposta la variabile d'ambiente solo se non è già impostata
                if key not in os.environ:
                    os.environ[key] = value
                    loaded_vars += 1
                    print(f"✅ {key} = {value[:20]}{'...' if len(value) > 20 else ''}")
                else:
                    print(f"⚠️ {key} già impostata (mantengo valore esistente)")
    
    print(f"📊 Caricate {loaded_vars} variabili d'ambiente")
    return True

def export_env_script():
    """Genera uno script bash per esportare le variabili"""
    env_path = Path(__file__).parent.parent / ".env"
    script_path = Path(__file__).parent.parent / "load_env.sh"
    
    if not env_path.exists():
        print(f"⚠️ File .env non trovato: {env_path}")
        return False
    
    script_content = "#!/bin/bash\n"
    script_content += "# Creative Muse AI - Environment Variables\n"
    script_content += "# Source this file: source load_env.sh\n\n"
    
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            
            # Ignora commenti e righe vuote
            if not line or line.startswith('#'):
                continue
            
            # Cerca il pattern KEY=VALUE
            if '=' in line:
                key, value = line.split('=', 1)
                key = key.strip()
                value = value.strip()
                
                # Aggiungi export solo se la variabile non è già impostata
                script_content += f'export {key}="{value}"\n'
    
    with open(script_path, 'w') as f:
        f.write(script_content)
    
    # Rendi eseguibile
    os.chmod(script_path, 0o755)
    
    print(f"✅ Script bash creato: {script_path}")
    print("Per caricare le variabili: source load_env.sh")
    return True

def main():
    """Funzione principale"""
    if len(sys.argv) > 1 and sys.argv[1] == "bash":
        export_env_script()
    else:
        load_env_file()

if __name__ == "__main__":
    main()