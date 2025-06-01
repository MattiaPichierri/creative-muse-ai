#!/usr/bin/env python3
"""
Creative Muse AI - System Monitor
Monitora le performance del sistema e genera report.
"""

import os
import sys
import time
import json
import psutil
import datetime
import subprocess
from pathlib import Path

class SystemMonitor:
    def __init__(self):
        self.base_path = Path(__file__).parent.parent
        self.logs_dir = self.base_path / "logs" / "monitoring"
        self.logs_dir.mkdir(parents=True, exist_ok=True)
        
    def get_system_info(self):
        """Raccoglie informazioni di sistema."""
        return {
            "timestamp": datetime.datetime.now().isoformat(),
            "cpu": {
                "usage_percent": psutil.cpu_percent(interval=1),
                "count": psutil.cpu_count(),
                "freq": psutil.cpu_freq()._asdict() if psutil.cpu_freq() else None
            },
            "memory": {
                "total": psutil.virtual_memory().total,
                "available": psutil.virtual_memory().available,
                "percent": psutil.virtual_memory().percent,
                "used": psutil.virtual_memory().used
            },
            "disk": {
                "total": psutil.disk_usage('/').total,
                "used": psutil.disk_usage('/').used,
                "free": psutil.disk_usage('/').free,
                "percent": psutil.disk_usage('/').percent
            },
            "network": psutil.net_io_counters()._asdict(),
            "processes": self.get_app_processes()
        }
    
    def get_app_processes(self):
        """Trova i processi dell'applicazione."""
        processes = []
        
        for proc in psutil.process_iter(['pid', 'name', 'cmdline', 'cpu_percent', 'memory_percent']):
            try:
                cmdline = ' '.join(proc.info['cmdline']) if proc.info['cmdline'] else ''
                
                # Cerca processi relativi all'app
                if any(keyword in cmdline.lower() for keyword in [
                    'main_mistral_api.py', 'creative-muse', 'npm run dev', 'vite'
                ]):
                    processes.append({
                        "pid": proc.info['pid'],
                        "name": proc.info['name'],
                        "cmdline": cmdline[:100],  # Limita lunghezza
                        "cpu_percent": proc.info['cpu_percent'],
                        "memory_percent": proc.info['memory_percent']
                    })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        
        return processes
    
    def check_api_health(self):
        """Controlla la salute dell'API."""
        try:
            import requests
            response = requests.get("http://localhost:8000/api/v1/stats", timeout=5)
            return {
                "status": "healthy" if response.status_code == 200 else "unhealthy",
                "status_code": response.status_code,
                "response_time": response.elapsed.total_seconds()
            }
        except Exception as e:
            return {
                "status": "unreachable",
                "error": str(e)
            }
    
    def check_frontend_health(self):
        """Controlla la salute del frontend."""
        try:
            import requests
            response = requests.get("http://localhost:3000", timeout=5)
            return {
                "status": "healthy" if response.status_code == 200 else "unhealthy",
                "status_code": response.status_code,
                "response_time": response.elapsed.total_seconds()
            }
        except Exception as e:
            return {
                "status": "unreachable",
                "error": str(e)
            }
    
    def get_database_info(self):
        """Informazioni sul database."""
        db_path = self.base_path / "database" / "creative_muse.db"
        
        if not db_path.exists():
            return {"status": "not_found"}
        
        try:
            import sqlite3
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Conta le idee
            cursor.execute("SELECT COUNT(*) FROM simple_ideas")
            ideas_count = cursor.fetchone()[0]
            
            # Dimensione del database
            db_size = db_path.stat().st_size
            
            conn.close()
            
            return {
                "status": "healthy",
                "ideas_count": ideas_count,
                "size_bytes": db_size,
                "size_mb": round(db_size / (1024 * 1024), 2)
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    def generate_report(self):
        """Genera un report completo del sistema."""
        print("📊 Generazione report sistema Creative Muse AI...")
        
        report = {
            "system": self.get_system_info(),
            "api": self.check_api_health(),
            "frontend": self.check_frontend_health(),
            "database": self.get_database_info()
        }
        
        # Salva report
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = self.logs_dir / f"system_report_{timestamp}.json"
        
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        return report, report_file
    
    def print_status(self, report):
        """Stampa lo stato del sistema."""
        print("\n" + "="*60)
        print("🖥️  CREATIVE MUSE AI - SYSTEM STATUS")
        print("="*60)
        
        # Sistema
        sys_info = report["system"]
        print(f"\n💻 Sistema:")
        print(f"  CPU: {sys_info['cpu']['usage_percent']:.1f}%")
        print(f"  RAM: {sys_info['memory']['percent']:.1f}% ({sys_info['memory']['used'] / (1024**3):.1f}GB / {sys_info['memory']['total'] / (1024**3):.1f}GB)")
        print(f"  Disk: {sys_info['disk']['percent']:.1f}% ({sys_info['disk']['used'] / (1024**3):.1f}GB / {sys_info['disk']['total'] / (1024**3):.1f}GB)")
        
        # API
        api_status = report["api"]
        api_icon = "✅" if api_status["status"] == "healthy" else "❌"
        print(f"\n🔧 Backend API: {api_icon} {api_status['status']}")
        if "response_time" in api_status:
            print(f"  Response Time: {api_status['response_time']:.3f}s")
        
        # Frontend
        frontend_status = report["frontend"]
        frontend_icon = "✅" if frontend_status["status"] == "healthy" else "❌"
        print(f"\n🖥️  Frontend: {frontend_icon} {frontend_status['status']}")
        if "response_time" in frontend_status:
            print(f"  Response Time: {frontend_status['response_time']:.3f}s")
        
        # Database
        db_status = report["database"]
        db_icon = "✅" if db_status["status"] == "healthy" else "❌"
        print(f"\n🗄️  Database: {db_icon} {db_status['status']}")
        if "ideas_count" in db_status:
            print(f"  Idee generate: {db_status['ideas_count']}")
            print(f"  Dimensione: {db_status['size_mb']} MB")
        
        # Processi
        processes = sys_info["processes"]
        print(f"\n🔄 Processi attivi: {len(processes)}")
        for proc in processes:
            print(f"  PID {proc['pid']}: {proc['name']} (CPU: {proc['cpu_percent']:.1f}%, RAM: {proc['memory_percent']:.1f}%)")
    
    def continuous_monitor(self, interval=60):
        """Monitoraggio continuo."""
        print(f"🔄 Avvio monitoraggio continuo (intervallo: {interval}s)")
        print("Premi Ctrl+C per fermare")
        
        try:
            while True:
                report, report_file = self.generate_report()
                self.print_status(report)
                print(f"\n📄 Report salvato: {report_file}")
                print(f"⏰ Prossimo check in {interval} secondi...")
                time.sleep(interval)
        except KeyboardInterrupt:
            print("\n⏹️  Monitoraggio fermato")

def main():
    """Funzione principale."""
    monitor = SystemMonitor()
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "continuous":
            interval = int(sys.argv[2]) if len(sys.argv) > 2 else 60
            monitor.continuous_monitor(interval)
        elif sys.argv[1] == "report":
            report, report_file = monitor.generate_report()
            monitor.print_status(report)
            print(f"\n📄 Report salvato: {report_file}")
    else:
        # Status singolo
        report, report_file = monitor.generate_report()
        monitor.print_status(report)
        print(f"\n📄 Report salvato: {report_file}")

if __name__ == "__main__":
    main()