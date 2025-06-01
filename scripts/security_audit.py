#!/usr/bin/env python3
"""
Creative Muse AI - Security Audit Script
Esegue controlli di sicurezza di base sul sistema.
"""

import os
import sys
import json
import datetime
import subprocess
from pathlib import Path
import stat

class SecurityAuditor:
    def __init__(self):
        self.base_path = Path(__file__).parent.parent
        self.issues = []
        self.warnings = []
        self.passed = []
    
    def log_issue(self, message, severity="HIGH"):
        """Registra un problema di sicurezza."""
        self.issues.append({
            "message": message,
            "severity": severity,
            "timestamp": datetime.datetime.now().isoformat()
        })
        print(f"❌ [{severity}] {message}")
    
    def log_warning(self, message):
        """Registra un avviso."""
        self.warnings.append({
            "message": message,
            "timestamp": datetime.datetime.now().isoformat()
        })
        print(f"⚠️ [WARNING] {message}")
    
    def log_passed(self, message):
        """Registra un controllo superato."""
        self.passed.append({
            "message": message,
            "timestamp": datetime.datetime.now().isoformat()
        })
        print(f"✅ {message}")
    
    def check_file_permissions(self):
        """Controlla i permessi dei file sensibili."""
        print("\n🔍 Controllo permessi file...")
        
        sensitive_dirs = [
            "security",
            "database",
            "logs"
        ]
        
        for dir_name in sensitive_dirs:
            dir_path = self.base_path / dir_name
            if dir_path.exists():
                mode = dir_path.stat().st_mode
                if stat.S_IROTH & mode or stat.S_IWOTH & mode:
                    self.log_issue(f"Directory {dir_name} accessibile da altri utenti")
                else:
                    self.log_passed(f"Permessi directory {dir_name} corretti")
            else:
                self.log_warning(f"Directory {dir_name} non trovata")
    
    def check_config_files(self):
        """Controlla la sicurezza dei file di configurazione."""
        print("\n🔍 Controllo file di configurazione...")
        
        config_files = [
            "security-config.yaml",
            "ai_core/config.py",
            ".env"
        ]
        
        for config_file in config_files:
            file_path = self.base_path / config_file
            if file_path.exists():
                mode = file_path.stat().st_mode
                if stat.S_IROTH & mode or stat.S_IWOTH & mode:
                    self.log_issue(f"File {config_file} accessibile da altri utenti")
                else:
                    self.log_passed(f"Permessi file {config_file} corretti")
            else:
                self.log_warning(f"File {config_file} non trovato")
    
    def check_dependencies(self):
        """Controlla le dipendenze per vulnerabilità note."""
        print("\n🔍 Controllo dipendenze Python...")
        
        requirements_file = self.base_path / "ai_core" / "requirements.txt"
        if requirements_file.exists():
            try:
                # Controlla se pip-audit è disponibile
                result = subprocess.run(
                    ["pip-audit", "--format", "json", "-r", str(requirements_file)],
                    capture_output=True,
                    text=True,
                    check=False
                )
                
                if result.returncode == 0:
                    self.log_passed("Nessuna vulnerabilità trovata nelle dipendenze Python")
                else:
                    self.log_warning("pip-audit non disponibile o vulnerabilità trovate")
            except FileNotFoundError:
                self.log_warning("pip-audit non installato - impossibile controllare vulnerabilità")
        
        print("\n🔍 Controllo dipendenze Node.js...")
        
        # Controlla React frontend
        react_package = self.base_path / "creative-muse-react" / "package.json"
        if react_package.exists():
            try:
                result = subprocess.run(
                    ["npm", "audit", "--json"],
                    cwd=self.base_path / "creative-muse-react",
                    capture_output=True,
                    text=True,
                    check=False
                )
                
                if result.returncode == 0:
                    audit_data = json.loads(result.stdout)
                    if audit_data.get("metadata", {}).get("vulnerabilities", {}).get("total", 0) == 0:
                        self.log_passed("Nessuna vulnerabilità trovata nel React frontend")
                    else:
                        self.log_warning("Vulnerabilità trovate nel React frontend")
                else:
                    self.log_warning("Errore nel controllo npm audit")
            except Exception as e:
                self.log_warning(f"Errore nel controllo dipendenze Node.js: {e}")
    
    def check_ports(self):
        """Controlla le porte aperte."""
        print("\n🔍 Controllo porte di rete...")
        
        try:
            # Controlla se il backend è in esecuzione
            result = subprocess.run(
                ["netstat", "-tuln"],
                capture_output=True,
                text=True,
                check=False
            )
            
            if ":8000" in result.stdout:
                self.log_passed("Backend API in esecuzione su porta 8000")
            else:
                self.log_warning("Backend API non in esecuzione")
                
            if ":3000" in result.stdout:
                self.log_passed("Frontend in esecuzione su porta 3000")
            else:
                self.log_warning("Frontend non in esecuzione")
                
        except FileNotFoundError:
            self.log_warning("netstat non disponibile - impossibile controllare porte")
    
    def check_environment(self):
        """Controlla le variabili d'ambiente."""
        print("\n🔍 Controllo variabili d'ambiente...")
        
        # Controlla variabili sensibili
        sensitive_vars = ["HF_TOKEN", "SECRET_KEY", "DATABASE_URL"]
        
        for var in sensitive_vars:
            if var in os.environ:
                self.log_passed(f"Variabile {var} configurata")
            else:
                self.log_warning(f"Variabile {var} non configurata")
    
    def check_database(self):
        """Controlla la sicurezza del database."""
        print("\n🔍 Controllo database...")
        
        db_file = self.base_path / "database" / "creative_muse.db"
        if db_file.exists():
            mode = db_file.stat().st_mode
            if stat.S_IROTH & mode or stat.S_IWOTH & mode:
                self.log_issue("Database accessibile da altri utenti", "CRITICAL")
            else:
                self.log_passed("Permessi database corretti")
        else:
            self.log_warning("File database non trovato")
    
    def generate_report(self):
        """Genera un report dell'audit."""
        print("\n" + "="*60)
        print("📊 REPORT AUDIT DI SICUREZZA")
        print("="*60)
        
        print(f"\n✅ Controlli superati: {len(self.passed)}")
        print(f"⚠️ Avvisi: {len(self.warnings)}")
        print(f"❌ Problemi critici: {len(self.issues)}")
        
        if self.issues:
            print("\n🚨 PROBLEMI CRITICI:")
            for issue in self.issues:
                print(f"  - {issue['message']} [{issue['severity']}]")
        
        if self.warnings:
            print("\n⚠️ AVVISI:")
            for warning in self.warnings:
                print(f"  - {warning['message']}")
        
        # Salva report
        report_data = {
            "timestamp": datetime.datetime.now().isoformat(),
            "passed": self.passed,
            "warnings": self.warnings,
            "issues": self.issues,
            "summary": {
                "total_checks": len(self.passed) + len(self.warnings) + len(self.issues),
                "passed": len(self.passed),
                "warnings": len(self.warnings),
                "critical_issues": len(self.issues)
            }
        }
        
        logs_dir = self.base_path / "logs"
        logs_dir.mkdir(exist_ok=True)
        
        report_file = logs_dir / f"security_audit_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(report_data, f, indent=2)
        
        print(f"\n📄 Report salvato in: {report_file}")
        
        return len(self.issues) == 0
    
    def run_audit(self):
        """Esegue l'audit completo."""
        print("🔒 Creative Muse AI - Security Audit")
        print("="*50)
        
        self.check_file_permissions()
        self.check_config_files()
        self.check_database()
        self.check_dependencies()
        self.check_ports()
        self.check_environment()
        
        return self.generate_report()

def main():
    """Funzione principale."""
    auditor = SecurityAuditor()
    success = auditor.run_audit()
    
    if success:
        print("\n🎉 Audit completato senza problemi critici!")
        sys.exit(0)
    else:
        print("\n⚠️ Audit completato con problemi critici da risolvere!")
        sys.exit(1)

if __name__ == "__main__":
    main()