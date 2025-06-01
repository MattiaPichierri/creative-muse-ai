#!/usr/bin/env python3
"""
Creative Muse AI - Deployment Script
Automatisiert das Deployment der Anwendung
"""

import os
import sys
import subprocess
import shutil
import logging
from pathlib import Path
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class DeploymentManager:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.backup_dir = self.project_root / "backups" / "deployment"
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        
    def run_command(self, command, cwd=None):
        """Führe Shell-Kommando aus"""
        try:
            result = subprocess.run(
                command, 
                shell=True, 
                cwd=cwd or self.project_root,
                capture_output=True, 
                text=True, 
                check=True
            )
            logger.info(f"✅ Kommando erfolgreich: {command}")
            return result.stdout
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Kommando fehlgeschlagen: {command}")
            logger.error(f"Fehler: {e.stderr}")
            raise
    
    def backup_current_deployment(self):
        """Erstelle Backup der aktuellen Deployment"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = self.backup_dir / f"backup_{timestamp}"
        
        logger.info("📦 Erstelle Deployment-Backup...")
        
        # Backup wichtiger Dateien
        important_files = [
            ".env",
            "database/creative_muse.db",
            "security/keys",
            "logs"
        ]
        
        backup_path.mkdir(exist_ok=True)
        
        for file_path in important_files:
            source = self.project_root / file_path
            if source.exists():
                if source.is_file():
                    shutil.copy2(source, backup_path / source.name)
                else:
                    shutil.copytree(source, backup_path / source.name, dirs_exist_ok=True)
        
        logger.info(f"✅ Backup erstellt: {backup_path}")
        return backup_path
    
    def check_prerequisites(self):
        """Prüfe Deployment-Voraussetzungen"""
        logger.info("🔍 Prüfe Deployment-Voraussetzungen...")
        
        # Prüfe Docker
        try:
            self.run_command("docker --version")
            self.run_command("docker-compose --version")
        except subprocess.CalledProcessError:
            logger.error("❌ Docker oder Docker Compose nicht gefunden")
            return False
        
        # Prüfe .env Datei
        env_file = self.project_root / ".env"
        if not env_file.exists():
            logger.warning("⚠️ .env Datei nicht gefunden, kopiere .env.example")
            shutil.copy2(self.project_root / ".env.example", env_file)
        
        # Prüfe HF_TOKEN
        with open(env_file) as f:
            env_content = f.read()
            if "your_huggingface_token_here" in env_content:
                logger.error("❌ HF_TOKEN in .env muss gesetzt werden")
                return False
        
        logger.info("✅ Alle Voraussetzungen erfüllt")
        return True
    
    def build_images(self):
        """Baue Docker Images"""
        logger.info("🔨 Baue Docker Images...")
        
        # Backend Image
        self.run_command(
            "docker build -t creative-muse-api .", 
            cwd=self.project_root / "ai_core"
        )
        
        # Frontend Image
        self.run_command(
            "docker build -t creative-muse-frontend .", 
            cwd=self.project_root / "creative-muse-react"
        )
        
        logger.info("✅ Docker Images erfolgreich gebaut")
    
    def deploy_with_docker_compose(self):
        """Deployment mit Docker Compose"""
        logger.info("🚀 Starte Deployment mit Docker Compose...")
        
        # Stoppe alte Container
        self.run_command("docker-compose down")
        
        # Starte neue Container
        self.run_command("docker-compose up -d")
        
        # Warte auf Gesundheitsprüfung
        logger.info("⏳ Warte auf Gesundheitsprüfung...")
        import time
        time.sleep(30)
        
        # Prüfe Container Status
        result = self.run_command("docker-compose ps")
        logger.info(f"Container Status:\n{result}")
        
        logger.info("✅ Deployment abgeschlossen")
    
    def run_health_checks(self):
        """Führe Gesundheitsprüfungen durch"""
        logger.info("🏥 Führe Gesundheitsprüfungen durch...")
        
        import requests
        import time
        
        # Prüfe API
        for attempt in range(5):
            try:
                response = requests.get("http://localhost:8000/health", timeout=10)
                if response.status_code == 200:
                    logger.info("✅ API Gesundheitsprüfung erfolgreich")
                    break
            except Exception as e:
                logger.warning(f"⚠️ API Gesundheitsprüfung Versuch {attempt + 1} fehlgeschlagen: {e}")
                time.sleep(10)
        else:
            logger.error("❌ API Gesundheitsprüfung fehlgeschlagen")
            return False
        
        # Prüfe Frontend
        for attempt in range(5):
            try:
                response = requests.get("http://localhost:3000", timeout=10)
                if response.status_code == 200:
                    logger.info("✅ Frontend Gesundheitsprüfung erfolgreich")
                    break
            except Exception as e:
                logger.warning(f"⚠️ Frontend Gesundheitsprüfung Versuch {attempt + 1} fehlgeschlagen: {e}")
                time.sleep(10)
        else:
            logger.error("❌ Frontend Gesundheitsprüfung fehlgeschlagen")
            return False
        
        return True
    
    def deploy(self, skip_backup=False, skip_build=False):
        """Hauptdeployment-Funktion"""
        logger.info("🚀 Starte Creative Muse AI Deployment...")
        
        try:
            # Backup
            if not skip_backup:
                self.backup_current_deployment()
            
            # Voraussetzungen prüfen
            if not self.check_prerequisites():
                return False
            
            # Images bauen
            if not skip_build:
                self.build_images()
            
            # Deployment
            self.deploy_with_docker_compose()
            
            # Gesundheitsprüfungen
            if not self.run_health_checks():
                logger.error("❌ Deployment fehlgeschlagen - Gesundheitsprüfungen nicht bestanden")
                return False
            
            logger.info("🎉 Deployment erfolgreich abgeschlossen!")
            logger.info("📱 Frontend: http://localhost:3000")
            logger.info("🔧 API: http://localhost:8000")
            logger.info("📊 API Docs: http://localhost:8000/docs")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Deployment fehlgeschlagen: {e}")
            return False

def main():
    """Hauptfunktion"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Creative Muse AI Deployment")
    parser.add_argument("--skip-backup", action="store_true", help="Backup überspringen")
    parser.add_argument("--skip-build", action="store_true", help="Image-Build überspringen")
    parser.add_argument("--production", action="store_true", help="Production Deployment")
    
    args = parser.parse_args()
    
    # Production Environment
    if args.production:
        env_file = Path(__file__).parent.parent / ".env"
        production_env = Path(__file__).parent.parent / ".env.production"
        if production_env.exists():
            shutil.copy2(production_env, env_file)
            logger.info("📋 Production Environment geladen")
    
    # Deployment ausführen
    deployer = DeploymentManager()
    success = deployer.deploy(
        skip_backup=args.skip_backup,
        skip_build=args.skip_build
    )
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()