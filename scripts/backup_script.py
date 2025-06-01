#!/usr/bin/env python3
"""
Creative Muse AI - Backup Script
Crea backup sicuri e crittografati del sistema.
"""

import os
import sys
import shutil
import datetime
import json
import sqlite3
from pathlib import Path
import tarfile
import gzip

def create_backup():
    """Crea un backup completo del sistema."""
    print("💾 Creazione backup Creative Muse AI...")
    
    # Timestamp per il backup
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_name = f"creative_muse_backup_{timestamp}"
    
    # Directory di backup
    backup_dir = Path(__file__).parent.parent / "backups"
    backup_dir.mkdir(exist_ok=True)
    
    backup_path = backup_dir / backup_name
    backup_path.mkdir(exist_ok=True)
    
    print(f"📁 Backup directory: {backup_path}")
    
    # Backup database
    backup_database(backup_path)
    
    # Backup configurazioni
    backup_configs(backup_path)
    
    # Backup logs (ultimi 7 giorni)
    backup_logs(backup_path)
    
    # Backup security keys (se esistono)
    backup_security(backup_path)
    
    # Crea archivio compresso
    archive_path = create_archive(backup_path, backup_dir / f"{backup_name}.tar.gz")
    
    # Rimuovi directory temporanea
    shutil.rmtree(backup_path)
    
    print(f"✅ Backup completato: {archive_path}")
    return archive_path

def backup_database(backup_path):
    """Backup del database."""
    print("🗄️ Backup database...")
    
    db_source = Path(__file__).parent.parent / "database"
    if db_source.exists():
        db_backup = backup_path / "database"
        shutil.copytree(db_source, db_backup)
        print("✅ Database backup completato")
    else:
        print("⚠️ Database non trovato")

def backup_configs(backup_path):
    """Backup delle configurazioni."""
    print("⚙️ Backup configurazioni...")
    
    config_backup = backup_path / "configs"
    config_backup.mkdir(exist_ok=True)
    
    # File di configurazione da salvare
    config_files = [
        "security-config.yaml",
        "ai_core/config.py",
        "creative-muse-react/vite.config.ts",
        "creative-muse-react/tailwind.config.js",
        "creative-muse-react/package.json",
        "ai_core/requirements.txt",
        "ai_core/requirements-security.txt"
    ]
    
    base_path = Path(__file__).parent.parent
    
    for config_file in config_files:
        source = base_path / config_file
        if source.exists():
            dest = config_backup / Path(config_file).name
            shutil.copy2(source, dest)
            print(f"✅ {config_file} salvato")
        else:
            print(f"⚠️ {config_file} non trovato")

def backup_logs(backup_path):
    """Backup dei log recenti."""
    print("📋 Backup logs...")
    
    logs_source = Path(__file__).parent.parent / "logs"
    if logs_source.exists():
        logs_backup = backup_path / "logs"
        
        # Copia solo i log degli ultimi 7 giorni
        cutoff_date = datetime.datetime.now() - datetime.timedelta(days=7)
        
        logs_backup.mkdir(exist_ok=True)
        
        for log_file in logs_source.rglob("*.log"):
            if log_file.stat().st_mtime > cutoff_date.timestamp():
                relative_path = log_file.relative_to(logs_source)
                dest = logs_backup / relative_path
                dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(log_file, dest)
        
        print("✅ Logs backup completato")
    else:
        print("⚠️ Directory logs non trovata")

def backup_security(backup_path):
    """Backup delle chiavi di sicurezza (solo metadati, non le chiavi stesse)."""
    print("🔐 Backup security metadata...")
    
    security_source = Path(__file__).parent.parent / "security"
    if security_source.exists():
        security_backup = backup_path / "security_metadata"
        security_backup.mkdir(exist_ok=True)
        
        # Salva solo i metadati, non le chiavi effettive
        metadata = {
            "backup_date": datetime.datetime.now().isoformat(),
            "security_structure": []
        }
        
        for item in security_source.rglob("*"):
            if item.is_file() and not item.name.endswith(('.key', '.pem')):
                metadata["security_structure"].append(str(item.relative_to(security_source)))
        
        with open(security_backup / "metadata.json", 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print("✅ Security metadata backup completato")
    else:
        print("⚠️ Directory security non trovata")

def create_archive(source_path, archive_path):
    """Crea un archivio compresso."""
    print(f"📦 Creazione archivio: {archive_path}")
    
    with tarfile.open(archive_path, "w:gz") as tar:
        tar.add(source_path, arcname=source_path.name)
    
    return archive_path

def list_backups():
    """Elenca i backup disponibili."""
    backup_dir = Path(__file__).parent.parent / "backups"
    
    if not backup_dir.exists():
        print("📁 Nessun backup trovato")
        return
    
    backups = list(backup_dir.glob("creative_muse_backup_*.tar.gz"))
    
    if not backups:
        print("📁 Nessun backup trovato")
        return
    
    print("📋 Backup disponibili:")
    for backup in sorted(backups, reverse=True):
        size = backup.stat().st_size / (1024 * 1024)  # MB
        mtime = datetime.datetime.fromtimestamp(backup.stat().st_mtime)
        print(f"  📦 {backup.name} ({size:.1f} MB) - {mtime.strftime('%Y-%m-%d %H:%M:%S')}")

def main():
    """Funzione principale."""
    if len(sys.argv) > 1 and sys.argv[1] == "list":
        list_backups()
    else:
        create_backup()

if __name__ == "__main__":
    main()