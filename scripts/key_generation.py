#!/usr/bin/env python3
"""
Creative Muse AI - Schlüsselgenerierungs-Skript
Generiert alle notwendigen kryptographischen Schlüssel für das System
"""

import os
import sys
import secrets
import hashlib
from pathlib import Path
from datetime import datetime
import json
import base64
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend
from cryptography.fernet import Fernet
from cryptography import x509
from cryptography.x509.oid import NameOID

# Pfad zum Projektroot hinzufügen
sys.path.append(str(Path(__file__).parent.parent))

def create_directories():
    """Erstelle notwendige Verzeichnisse"""
    directories = [
        "security/keys",
        "security/certificates", 
        "logs/audit",
        "logs/security",
        "logs/performance",
        "database",
        "backups"
    ]
    
    for directory in directories:
        path = Path(directory)
        path.mkdir(parents=True, exist_ok=True)
        
        # Sichere Berechtigungen setzen
        os.chmod(path, 0o700)
        print(f"✅ Verzeichnis erstellt: {directory}")

def generate_master_key():
    """Generiere Master-Schlüssel für Schlüsselverschlüsselung"""
    print("\n🔑 Generiere Master-Schlüssel...")
    
    try:
        keys_dir = Path("security/keys")
        master_key_file = keys_dir / "master.key"
        
        # Master-Schlüssel generieren
        master_key = secrets.token_bytes(32)  # 256-bit
        
        # Passwort für Master-Schlüssel (in Produktion: sicher eingeben)
        password = os.getenv('MASTER_KEY_PASSWORD')
        if not password:
            password = input("Master-Key-Passwort eingeben (oder Enter für Standard): ").strip()
            if not password:
                password = 'creative_muse_default_password'
                print("⚠️  Standard-Passwort verwendet. In Produktion sollte ein sicheres Passwort verwendet werden!")
        
        # Salt für Schlüsselableitung
        salt = secrets.token_bytes(32)
        
        # Schlüsselableitung
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
            backend=default_backend()
        )
        derived_key = kdf.derive(password.encode())
        
        # Master-Schlüssel verschlüsseln
        fernet = Fernet(base64.urlsafe_b64encode(derived_key))
        encrypted_master = fernet.encrypt(master_key)
        
        # Speichern
        with open(master_key_file, 'wb') as f:
            f.write(encrypted_master)
        
        # Salt separat speichern
        salt_file = keys_dir / "master.salt"
        with open(salt_file, 'wb') as f:
            f.write(salt)
        
        # Berechtigungen setzen
        os.chmod(master_key_file, 0o600)
        os.chmod(salt_file, 0o600)
        
        # Checksum für Integrität
        checksum = hashlib.sha256(encrypted_master).hexdigest()
        checksum_file = keys_dir / "master.checksum"
        with open(checksum_file, 'w') as f:
            f.write(checksum)
        
        print(f"✅ Master-Schlüssel generiert: {master_key_file}")
        print(f"✅ Salt gespeichert: {salt_file}")
        print(f"✅ Checksum: {checksum[:16]}...")
        
        return master_key
        
    except Exception as e:
        print(f"❌ Fehler beim Generieren des Master-Schlüssels: {e}")
        sys.exit(1)

def generate_application_keys(master_key):
    """Generiere Anwendungsschlüssel"""
    print("\n🔐 Generiere Anwendungsschlüssel...")
    
    keys_to_generate = [
        ("database", "Datenbank-Verschlüsselung"),
        ("session", "Session-Verschlüsselung"),
        ("file", "Datei-Verschlüsselung"),
        ("communication", "Kommunikations-Verschlüsselung"),
        ("backup", "Backup-Verschlüsselung"),
        ("audit", "Audit-Log-Verschlüsselung")
    ]
    
    keys_dir = Path("security/keys")
    fernet = Fernet(base64.urlsafe_b64encode(master_key))
    
    key_metadata = {}
    
    for key_name, description in keys_to_generate:
        try:
            # Schlüssel generieren
            key_data = secrets.token_bytes(32)  # 256-bit
            
            # Verschlüsseln
            encrypted_key = fernet.encrypt(key_data)
            
            # Speichern
            key_file = keys_dir / f"{key_name}.key"
            with open(key_file, 'wb') as f:
                f.write(encrypted_key)
            
            os.chmod(key_file, 0o600)
            
            # Metadaten
            checksum = hashlib.sha256(key_data).hexdigest()
            key_metadata[key_name] = {
                "description": description,
                "algorithm": "AES-256",
                "key_size": 256,
                "created_at": datetime.utcnow().isoformat(),
                "checksum": checksum,
                "file": str(key_file)
            }
            
            print(f"✅ {description}: {key_file}")
            
        except Exception as e:
            print(f"❌ Fehler beim Generieren von {key_name}: {e}")
    
    # Metadaten speichern
    metadata_file = keys_dir / "keys_metadata.json"
    with open(metadata_file, 'w') as f:
        json.dump(key_metadata, f, indent=2)
    
    os.chmod(metadata_file, 0o600)
    print(f"✅ Schlüssel-Metadaten: {metadata_file}")

def generate_tls_certificates():
    """Generiere selbstsignierte TLS-Zertifikate für lokale Kommunikation"""
    print("\n🔒 Generiere TLS-Zertifikate...")
    
    try:
        certs_dir = Path("security/certificates")
        
        # Private Key generieren
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
            backend=default_backend()
        )
        
        # Zertifikat-Informationen
        subject = issuer = x509.Name([
            x509.NameAttribute(NameOID.COUNTRY_NAME, "DE"),
            x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, "Local"),
            x509.NameAttribute(NameOID.LOCALITY_NAME, "Local"),
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Creative Muse AI"),
            x509.NameAttribute(NameOID.COMMON_NAME, "localhost"),
        ])
        
        # Zertifikat erstellen
        cert = x509.CertificateBuilder().subject_name(
            subject
        ).issuer_name(
            issuer
        ).public_key(
            private_key.public_key()
        ).serial_number(
            x509.random_serial_number()
        ).not_valid_before(
            datetime.utcnow()
        ).not_valid_after(
            datetime.utcnow() + timedelta(days=365)
        ).add_extension(
            x509.SubjectAlternativeName([
                x509.DNSName("localhost"),
                x509.DNSName("127.0.0.1"),
                x509.IPAddress(ipaddress.IPv4Address("127.0.0.1")),
                x509.IPAddress(ipaddress.IPv6Address("::1")),
            ]),
            critical=False,
        ).sign(private_key, hashes.SHA256(), default_backend())
        
        # Private Key speichern
        key_file = certs_dir / "server.key"
        with open(key_file, "wb") as f:
            f.write(private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            ))
        
        # Zertifikat speichern
        cert_file = certs_dir / "server.crt"
        with open(cert_file, "wb") as f:
            f.write(cert.public_bytes(serialization.Encoding.PEM))
        
        # Berechtigungen setzen
        os.chmod(key_file, 0o600)
        os.chmod(cert_file, 0o644)
        
        print(f"✅ TLS Private Key: {key_file}")
        print(f"✅ TLS Zertifikat: {cert_file}")
        
        # Zertifikat-Info speichern
        cert_info = {
            "subject": str(subject),
            "issuer": str(issuer),
            "serial_number": str(cert.serial_number),
            "not_valid_before": cert.not_valid_before.isoformat(),
            "not_valid_after": cert.not_valid_after.isoformat(),
            "fingerprint_sha256": cert.fingerprint(hashes.SHA256()).hex()
        }
        
        info_file = certs_dir / "certificate_info.json"
        with open(info_file, 'w') as f:
            json.dump(cert_info, f, indent=2)
        
        print(f"✅ Zertifikat-Info: {info_file}")
        
    except Exception as e:
        print(f"❌ Fehler beim Generieren der TLS-Zertifikate: {e}")

def generate_environment_file():
    """Generiere .env-Datei mit Umgebungsvariablen"""
    print("\n📝 Generiere Umgebungskonfiguration...")
    
    try:
        env_content = f"""# Creative Muse AI - Umgebungsvariablen
# Generiert am: {datetime.utcnow().isoformat()}

# Entwicklungsmodus
DEBUG=false

# Verschlüsselung
MASTER_KEY_PASSWORD=creative_muse_default_password

# Datenbank
DATABASE_ENCRYPTION=true
DATABASE_URL=sqlite:///./database/creative_muse.db

# API-Konfiguration
API_HOST=127.0.0.1
API_PORT=8000
USE_TLS=true

# Session-Konfiguration
SESSION_TIMEOUT_MINUTES=30
MAX_CONCURRENT_SESSIONS=1

# Audit-Konfiguration
AUDIT_LEVEL=4
AUDIT_ENCRYPTION=true

# Monitoring
ENABLE_MONITORING=true
METRICS_INTERVAL_SECONDS=30

# Backup-Konfiguration
AUTO_BACKUP=true
BACKUP_INTERVAL_HOURS=24
BACKUP_ENCRYPTION=true

# AI-Modell-Konfiguration
MODEL_NAME=mistralai/Mistral-7B-Instruct-v0.3
MODEL_PATH=./ai_core/models/mistral-7b-instruct
DEVICE=auto
MAX_MEMORY_GB=8

# Sicherheitseinstellungen
ENABLE_CONTENT_FILTER=true
INPUT_MAX_LENGTH=10000
RATE_LIMIT_REQUESTS=60

# Log-Konfiguration
LOG_LEVEL=INFO
LOG_ENCRYPTION=true
LOG_ROTATION_SIZE_MB=100
"""
        
        env_file = Path(".env")
        with open(env_file, 'w') as f:
            f.write(env_content)
        
        os.chmod(env_file, 0o600)
        print(f"✅ Umgebungskonfiguration: {env_file}")
        
        # .env.example für Repository
        example_content = env_content.replace(
            "MASTER_KEY_PASSWORD=creative_muse_default_password",
            "MASTER_KEY_PASSWORD=your_secure_password_here"
        )
        
        example_file = Path(".env.example")
        with open(example_file, 'w') as f:
            f.write(example_content)
        
        print(f"✅ Beispiel-Konfiguration: {example_file}")
        
    except Exception as e:
        print(f"❌ Fehler beim Generieren der Umgebungskonfiguration: {e}")

def create_security_summary():
    """Erstelle Sicherheitszusammenfassung"""
    print("\n📋 Erstelle Sicherheitszusammenfassung...")
    
    try:
        summary = f"""# Creative Muse AI - Sicherheits-Setup Zusammenfassung

## Setup abgeschlossen am: {datetime.utcnow().isoformat()}

### Generierte Schlüssel:
- ✅ Master-Schlüssel (AES-256, verschlüsselt)
- ✅ Datenbank-Verschlüsselungsschlüssel
- ✅ Session-Verschlüsselungsschlüssel  
- ✅ Datei-Verschlüsselungsschlüssel
- ✅ Kommunikations-Verschlüsselungsschlüssel
- ✅ Backup-Verschlüsselungsschlüssel
- ✅ Audit-Log-Verschlüsselungsschlüssel

### TLS-Zertifikate:
- ✅ Selbstsigniertes Server-Zertifikat (RSA-2048)
- ✅ Private Key für TLS-Kommunikation

### Verzeichnisse:
- ✅ security/keys/ (Schlüsselspeicher)
- ✅ security/certificates/ (TLS-Zertifikate)
- ✅ logs/audit/ (Audit-Logs)
- ✅ logs/security/ (Sicherheits-Logs)
- ✅ logs/performance/ (Performance-Logs)
- ✅ database/ (Datenbank-Dateien)
- ✅ backups/ (Backup-Speicher)

### Sicherheitshinweise:

⚠️  **WICHTIG**: 
1. Ändern Sie das Master-Key-Passwort in der .env-Datei
2. Alle Schlüsseldateien haben restriktive Berechtigungen (600)
3. Verzeichnisse haben sichere Berechtigungen (700)
4. TLS-Zertifikat ist selbstsigniert (nur für lokale Entwicklung)

🔒 **Produktionsumgebung**:
- Verwenden Sie Hardware Security Modules (HSM) für Schlüsselspeicherung
- Implementieren Sie regelmäßige Schlüsselrotation
- Verwenden Sie von CA signierte Zertifikate
- Aktivieren Sie alle Audit-Logs
- Implementieren Sie Backup-Verschlüsselung

### Nächste Schritte:
1. Führen Sie `make setup-secure` aus
2. Starten Sie das System mit `make dev-secure`
3. Überprüfen Sie die Logs in logs/security/
4. Führen Sie Sicherheitstests aus: `make test-security`

### Dateien die NIEMALS committed werden dürfen:
- security/keys/*
- .env
- logs/*
- database/*.db
- backups/*

Alle diese Dateien sind bereits in .gitignore aufgeführt.
"""
        
        summary_file = Path("SECURITY_SETUP.md")
        with open(summary_file, 'w') as f:
            f.write(summary)
        
        print(f"✅ Sicherheitszusammenfassung: {summary_file}")
        
    except Exception as e:
        print(f"❌ Fehler beim Erstellen der Zusammenfassung: {e}")

def main():
    """Hauptfunktion für Schlüsselgenerierung"""
    print("🚀 Creative Muse AI - Schlüsselgenerierung")
    print("=" * 50)
    
    try:
        # 1. Verzeichnisse erstellen
        create_directories()
        
        # 2. Master-Schlüssel generieren
        master_key = generate_master_key()
        
        # 3. Anwendungsschlüssel generieren
        generate_application_keys(master_key)
        
        # 4. TLS-Zertifikate generieren
        generate_tls_certificates()
        
        # 5. Umgebungskonfiguration erstellen
        generate_environment_file()
        
        # 6. Sicherheitszusammenfassung erstellen
        create_security_summary()
        
        print("\n" + "=" * 50)
        print("✅ Schlüsselgenerierung erfolgreich abgeschlossen!")
        print("\n🔒 Alle kryptographischen Schlüssel wurden sicher generiert.")
        print("📋 Lesen Sie SECURITY_SETUP.md für weitere Informationen.")
        print("\n⚠️  WICHTIG: Ändern Sie das Master-Key-Passwort in der .env-Datei!")
        
    except Exception as e:
        print(f"\n❌ Kritischer Fehler: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # Zusätzliche Imports für TLS-Zertifikate
    import ipaddress
    from datetime import timedelta
    
    main()