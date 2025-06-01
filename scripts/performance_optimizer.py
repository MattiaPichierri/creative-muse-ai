#!/usr/bin/env python3
"""
Creative Muse AI - Performance Optimizer
Ottimizza le performance del sistema e pulisce i file temporanei.
"""

import os
import sys
import shutil
import subprocess
from pathlib import Path
import json
import datetime

class PerformanceOptimizer:
    def __init__(self):
        self.base_path = Path(__file__).parent.parent
        self.cleaned_size = 0
        
    def clean_python_cache(self):
        """Pulisce la cache Python."""
        print("🐍 Pulizia cache Python...")
        
        cache_dirs = []
        pyc_files = []
        
        # Trova directory __pycache__
        for pycache_dir in self.base_path.rglob("__pycache__"):
            cache_dirs.append(pycache_dir)
        
        # Trova file .pyc
        for pyc_file in self.base_path.rglob("*.pyc"):
            pyc_files.append(pyc_file)
        
        # Rimuovi cache
        for cache_dir in cache_dirs:
            if cache_dir.exists():
                size = self._get_dir_size(cache_dir)
                shutil.rmtree(cache_dir)
                self.cleaned_size += size
                print(f"  ✅ Rimossa: {cache_dir}")
        
        # Rimuovi file .pyc
        for pyc_file in pyc_files:
            if pyc_file.exists():
                size = pyc_file.stat().st_size
                pyc_file.unlink()
                self.cleaned_size += size
                print(f"  ✅ Rimosso: {pyc_file}")
        
        print(f"  📊 Cache Python pulita: {len(cache_dirs)} directory, {len(pyc_files)} file")
    
    def clean_node_cache(self):
        """Pulisce la cache Node.js."""
        print("📦 Pulizia cache Node.js...")
        
        node_modules_cache = []
        
        # Trova directory node_modules/.cache
        for cache_dir in self.base_path.rglob("node_modules/.cache"):
            node_modules_cache.append(cache_dir)
        
        # Trova directory .vite
        for vite_dir in self.base_path.rglob(".vite"):
            node_modules_cache.append(vite_dir)
        
        # Rimuovi cache
        for cache_dir in node_modules_cache:
            if cache_dir.exists():
                size = self._get_dir_size(cache_dir)
                shutil.rmtree(cache_dir)
                self.cleaned_size += size
                print(f"  ✅ Rimossa: {cache_dir}")
        
        print(f"  📊 Cache Node.js pulita: {len(node_modules_cache)} directory")
    
    def clean_build_artifacts(self):
        """Pulisce gli artifact di build."""
        print("🔨 Pulizia artifact di build...")
        
        build_dirs = []
        
        # Directory di build comuni
        build_patterns = ["dist", "build", ".next", ".nuxt"]
        
        for pattern in build_patterns:
            for build_dir in self.base_path.rglob(pattern):
                if build_dir.is_dir() and build_dir.parent.name in ["creative-muse-react", "ui_frontend"]:
                    build_dirs.append(build_dir)
        
        # Rimuovi build artifacts
        for build_dir in build_dirs:
            if build_dir.exists():
                size = self._get_dir_size(build_dir)
                shutil.rmtree(build_dir)
                self.cleaned_size += size
                print(f"  ✅ Rimossa: {build_dir}")
        
        print(f"  📊 Build artifacts puliti: {len(build_dirs)} directory")
    
    def clean_logs(self, days_to_keep=7):
        """Pulisce i log vecchi."""
        print(f"📋 Pulizia log (mantengo ultimi {days_to_keep} giorni)...")
        
        logs_dir = self.base_path / "logs"
        if not logs_dir.exists():
            print("  ⚠️ Directory logs non trovata")
            return
        
        cutoff_date = datetime.datetime.now() - datetime.timedelta(days=days_to_keep)
        removed_files = 0
        
        for log_file in logs_dir.rglob("*.log"):
            if log_file.stat().st_mtime < cutoff_date.timestamp():
                size = log_file.stat().st_size
                log_file.unlink()
                self.cleaned_size += size
                removed_files += 1
                print(f"  ✅ Rimosso: {log_file}")
        
        # Pulisci anche i report di monitoring vecchi
        monitoring_dir = logs_dir / "monitoring"
        if monitoring_dir.exists():
            for report_file in monitoring_dir.glob("system_report_*.json"):
                if report_file.stat().st_mtime < cutoff_date.timestamp():
                    size = report_file.stat().st_size
                    report_file.unlink()
                    self.cleaned_size += size
                    removed_files += 1
                    print(f"  ✅ Rimosso: {report_file}")
        
        print(f"  📊 Log puliti: {removed_files} file")
    
    def optimize_database(self):
        """Ottimizza il database."""
        print("🗄️ Ottimizzazione database...")
        
        db_path = self.base_path / "database" / "creative_muse.db"
        if not db_path.exists():
            print("  ⚠️ Database non trovato")
            return
        
        try:
            import sqlite3
            
            # Backup del database
            backup_path = db_path.with_suffix('.db.backup')
            shutil.copy2(db_path, backup_path)
            
            # Ottimizza database
            conn = sqlite3.connect(db_path)
            
            # VACUUM per compattare il database
            print("  🔄 Esecuzione VACUUM...")
            conn.execute("VACUUM")
            
            # ANALYZE per aggiornare le statistiche
            print("  📊 Esecuzione ANALYZE...")
            conn.execute("ANALYZE")
            
            conn.close()
            
            # Confronta dimensioni
            original_size = backup_path.stat().st_size
            optimized_size = db_path.stat().st_size
            saved_space = original_size - optimized_size
            
            if saved_space > 0:
                self.cleaned_size += saved_space
                print(f"  ✅ Database ottimizzato: {saved_space / 1024:.1f} KB risparmiati")
            else:
                print("  ✅ Database già ottimizzato")
            
            # Rimuovi backup se tutto è andato bene
            backup_path.unlink()
            
        except Exception as e:
            print(f"  ❌ Errore ottimizzazione database: {e}")
    
    def check_disk_space(self):
        """Controlla lo spazio disco disponibile."""
        print("💾 Controllo spazio disco...")
        
        try:
            import psutil
            disk_usage = psutil.disk_usage('/')
            
            free_gb = disk_usage.free / (1024**3)
            total_gb = disk_usage.total / (1024**3)
            used_percent = (disk_usage.used / disk_usage.total) * 100
            
            print(f"  📊 Spazio libero: {free_gb:.1f} GB / {total_gb:.1f} GB ({100-used_percent:.1f}% libero)")
            
            if used_percent > 90:
                print("  ⚠️ ATTENZIONE: Spazio disco quasi esaurito!")
            elif used_percent > 80:
                print("  ⚠️ Spazio disco in esaurimento")
            else:
                print("  ✅ Spazio disco sufficiente")
                
        except ImportError:
            print("  ⚠️ psutil non disponibile per controllo spazio disco")
    
    def optimize_npm_packages(self):
        """Ottimizza i pacchetti npm."""
        print("📦 Ottimizzazione pacchetti npm...")
        
        frontend_dirs = [
            self.base_path / "creative-muse-react",
            self.base_path / "ui_frontend"
        ]
        
        for frontend_dir in frontend_dirs:
            if not frontend_dir.exists():
                continue
                
            package_json = frontend_dir / "package.json"
            if not package_json.exists():
                continue
            
            print(f"  🔄 Ottimizzazione {frontend_dir.name}...")
            
            try:
                # npm audit fix per risolvere vulnerabilità
                result = subprocess.run(
                    ["npm", "audit", "fix"],
                    cwd=frontend_dir,
                    capture_output=True,
                    text=True,
                    timeout=120
                )
                
                if result.returncode == 0:
                    print(f"    ✅ npm audit fix completato")
                else:
                    print(f"    ⚠️ npm audit fix con avvisi")
                
                # npm dedupe per rimuovere duplicati
                result = subprocess.run(
                    ["npm", "dedupe"],
                    cwd=frontend_dir,
                    capture_output=True,
                    text=True,
                    timeout=60
                )
                
                if result.returncode == 0:
                    print(f"    ✅ npm dedupe completato")
                
            except subprocess.TimeoutExpired:
                print(f"    ⚠️ Timeout durante ottimizzazione npm")
            except Exception as e:
                print(f"    ❌ Errore ottimizzazione npm: {e}")
    
    def _get_dir_size(self, path):
        """Calcola la dimensione di una directory."""
        total_size = 0
        try:
            for dirpath, dirnames, filenames in os.walk(path):
                for filename in filenames:
                    filepath = os.path.join(dirpath, filename)
                    if os.path.exists(filepath):
                        total_size += os.path.getsize(filepath)
        except (OSError, FileNotFoundError):
            pass
        return total_size
    
    def run_optimization(self, full=False):
        """Esegue l'ottimizzazione completa."""
        print("🚀 Creative Muse AI - Performance Optimizer")
        print("=" * 50)
        
        start_time = datetime.datetime.now()
        self.cleaned_size = 0
        
        # Controllo spazio disco
        self.check_disk_space()
        print()
        
        # Pulizia base
        self.clean_python_cache()
        print()
        
        self.clean_node_cache()
        print()
        
        self.clean_build_artifacts()
        print()
        
        self.clean_logs()
        print()
        
        if full:
            # Ottimizzazioni avanzate
            self.optimize_database()
            print()
            
            self.optimize_npm_packages()
            print()
        
        # Riepilogo
        end_time = datetime.datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        print("=" * 50)
        print("📊 RIEPILOGO OTTIMIZZAZIONE")
        print("=" * 50)
        print(f"⏱️  Tempo impiegato: {duration:.1f} secondi")
        print(f"🗑️  Spazio liberato: {self.cleaned_size / (1024*1024):.1f} MB")
        print(f"✅ Ottimizzazione completata!")
        
        return {
            "duration": duration,
            "cleaned_size": self.cleaned_size,
            "timestamp": datetime.datetime.now().isoformat()
        }

def main():
    """Funzione principale."""
    optimizer = PerformanceOptimizer()
    
    full_optimization = "--full" in sys.argv
    
    if full_optimization:
        print("🔧 Esecuzione ottimizzazione completa...")
    else:
        print("🧹 Esecuzione pulizia rapida...")
        print("💡 Usa --full per ottimizzazione completa")
    
    print()
    
    result = optimizer.run_optimization(full=full_optimization)
    
    # Salva risultati
    logs_dir = Path(__file__).parent.parent / "logs"
    logs_dir.mkdir(exist_ok=True)
    
    result_file = logs_dir / f"optimization_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(result_file, 'w') as f:
        json.dump(result, f, indent=2)
    
    print(f"\n📄 Report salvato: {result_file}")

if __name__ == "__main__":
    main()