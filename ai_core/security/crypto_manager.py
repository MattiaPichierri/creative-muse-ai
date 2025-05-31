"""
Creative Muse AI - Verschlüsselungsmanager
Zentrale Verwaltung aller kryptographischen Operationen
"""

import os
import hashlib
import secrets
from typing import Optional, Tuple, Dict, Any
from pathlib import Path
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import base64
import json
import logging
from datetime import datetime, timedelta

logger = logging.getLogger('security.crypto')

class CryptoManager:
    """Zentraler Verschlüsselungsmanager für alle kryptographischen Operationen"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.encryption_config = config.get('encryption', {})
        self.algorithm = self.encryption_config.get('algorithm', 'AES-256-GCM')
        self.key_derivation_config = self.encryption_config.get('key_derivation', {})
        
        # Schlüssel-Cache
        self._key_cache: Dict[str, bytes] = {}
        self._fernet_cache: Dict[str, Fernet] = {}
        
        # Initialisierung
        self._setup_crypto_environment()
        
    def _setup_crypto_environment(self):
        """Kryptographische Umgebung einrichten"""
        try:
            # Schlüsselverzeichnis erstellen
            keys_dir = Path("security/keys")
            keys_dir.mkdir(parents=True, exist_ok=True)
            
            # Berechtigungen setzen (nur Besitzer kann lesen/schreiben)
            os.chmod(keys_dir, 0o700)
            
            logger.info("Kryptographische Umgebung erfolgreich eingerichtet")
            
        except Exception as e:
            logger.error(f"Fehler beim Einrichten der kryptographischen Umgebung: {e}")
            raise
    
    def generate_key(self, key_type: str = "default") -> bytes:
        """
        Generiere einen neuen kryptographischen Schlüssel
        
        Args:
            key_type: Typ des Schlüssels (default, database, file, communication)
            
        Returns:
            Generierter Schlüssel als bytes
        """
        try:
            # 256-bit Schlüssel für AES-256
            key = secrets.token_bytes(32)
            
            # Schlüssel im Cache speichern
            self._key_cache[key_type] = key
            
            # Audit-Log
            self._log_crypto_event("key_generated", {
                "key_type": key_type,
                "key_length": len(key) * 8,
                "timestamp": datetime.utcnow().isoformat()
            })
            
            logger.info(f"Neuer {key_type}-Schlüssel generiert")
            return key
            
        except Exception as e:
            logger.error(f"Fehler beim Generieren des Schlüssels: {e}")
            raise
    
    def derive_key_from_password(self, password: str, salt: Optional[bytes] = None) -> Tuple[bytes, bytes]:
        """
        Leite einen Schlüssel aus einem Passwort ab
        
        Args:
            password: Passwort als String
            salt: Optionales Salt (wird generiert wenn nicht angegeben)
            
        Returns:
            Tuple aus (abgeleiteter_schlüssel, salt)
        """
        try:
            # Salt generieren wenn nicht angegeben
            if salt is None:
                salt_length = self.key_derivation_config.get('salt_length', 32)
                salt = secrets.token_bytes(salt_length)
            
            # PBKDF2 Konfiguration
            iterations = self.key_derivation_config.get('iterations', 100000)
            algorithm = self.key_derivation_config.get('hash_algorithm', 'SHA-256')
            
            # Hash-Algorithmus auswählen
            if algorithm == 'SHA-256':
                hash_algo = hashes.SHA256()
            elif algorithm == 'SHA-512':
                hash_algo = hashes.SHA512()
            else:
                hash_algo = hashes.SHA256()
            
            # Schlüsselableitung
            kdf = PBKDF2HMAC(
                algorithm=hash_algo,
                length=32,  # 256 bits
                salt=salt,
                iterations=iterations,
                backend=default_backend()
            )
            
            key = kdf.derive(password.encode('utf-8'))
            
            # Audit-Log
            self._log_crypto_event("key_derived", {
                "iterations": iterations,
                "salt_length": len(salt),
                "algorithm": algorithm,
                "timestamp": datetime.utcnow().isoformat()
            })
            
            logger.info("Schlüssel erfolgreich aus Passwort abgeleitet")
            return key, salt
            
        except Exception as e:
            logger.error(f"Fehler bei der Schlüsselableitung: {e}")
            raise
    
    def encrypt_data(self, data: bytes, key: Optional[bytes] = None, key_type: str = "default") -> Dict[str, Any]:
        """
        Verschlüssele Daten mit AES-256-GCM
        
        Args:
            data: Zu verschlüsselnde Daten
            key: Verschlüsselungsschlüssel (optional)
            key_type: Typ des Schlüssels wenn key nicht angegeben
            
        Returns:
            Dictionary mit verschlüsselten Daten und Metadaten
        """
        try:
            # Schlüssel abrufen oder verwenden
            if key is None:
                key = self._get_key(key_type)
            
            # IV/Nonce generieren (96 bits für GCM)
            iv = secrets.token_bytes(12)
            
            # AES-256-GCM Verschlüsselung
            cipher = Cipher(
                algorithms.AES(key),
                modes.GCM(iv),
                backend=default_backend()
            )
            
            encryptor = cipher.encryptor()
            ciphertext = encryptor.update(data) + encryptor.finalize()
            
            # Authentifizierungs-Tag
            auth_tag = encryptor.tag
            
            # Ergebnis zusammenstellen
            result = {
                'ciphertext': base64.b64encode(ciphertext).decode('utf-8'),
                'iv': base64.b64encode(iv).decode('utf-8'),
                'auth_tag': base64.b64encode(auth_tag).decode('utf-8'),
                'algorithm': 'AES-256-GCM',
                'timestamp': datetime.utcnow().isoformat(),
                'version': 1
            }
            
            # Audit-Log
            self._log_crypto_event("data_encrypted", {
                "data_size": len(data),
                "key_type": key_type,
                "algorithm": "AES-256-GCM",
                "timestamp": datetime.utcnow().isoformat()
            })
            
            return result
            
        except Exception as e:
            logger.error(f"Fehler bei der Verschlüsselung: {e}")
            raise
    
    def decrypt_data(self, encrypted_data: Dict[str, Any], key: Optional[bytes] = None, key_type: str = "default") -> bytes:
        """
        Entschlüssele Daten
        
        Args:
            encrypted_data: Verschlüsselte Daten (Dictionary)
            key: Entschlüsselungsschlüssel (optional)
            key_type: Typ des Schlüssels wenn key nicht angegeben
            
        Returns:
            Entschlüsselte Daten als bytes
        """
        try:
            # Schlüssel abrufen oder verwenden
            if key is None:
                key = self._get_key(key_type)
            
            # Daten extrahieren
            ciphertext = base64.b64decode(encrypted_data['ciphertext'])
            iv = base64.b64decode(encrypted_data['iv'])
            auth_tag = base64.b64decode(encrypted_data['auth_tag'])
            
            # AES-256-GCM Entschlüsselung
            cipher = Cipher(
                algorithms.AES(key),
                modes.GCM(iv, auth_tag),
                backend=default_backend()
            )
            
            decryptor = cipher.decryptor()
            plaintext = decryptor.update(ciphertext) + decryptor.finalize()
            
            # Audit-Log
            self._log_crypto_event("data_decrypted", {
                "data_size": len(plaintext),
                "key_type": key_type,
                "algorithm": encrypted_data.get('algorithm', 'AES-256-GCM'),
                "timestamp": datetime.utcnow().isoformat()
            })
            
            return plaintext
            
        except Exception as e:
            logger.error(f"Fehler bei der Entschlüsselung: {e}")
            raise
    
    def encrypt_string(self, text: str, key_type: str = "default") -> str:
        """
        Verschlüssele einen String (Convenience-Methode)
        
        Args:
            text: Zu verschlüsselnder Text
            key_type: Typ des Schlüssels
            
        Returns:
            Base64-kodierte verschlüsselte Daten als JSON-String
        """
        try:
            data = text.encode('utf-8')
            encrypted = self.encrypt_data(data, key_type=key_type)
            return json.dumps(encrypted)
            
        except Exception as e:
            logger.error(f"Fehler bei der String-Verschlüsselung: {e}")
            raise
    
    def decrypt_string(self, encrypted_text: str, key_type: str = "default") -> str:
        """
        Entschlüssele einen String (Convenience-Methode)
        
        Args:
            encrypted_text: Verschlüsselter Text als JSON-String
            key_type: Typ des Schlüssels
            
        Returns:
            Entschlüsselter Text
        """
        try:
            encrypted_data = json.loads(encrypted_text)
            decrypted = self.decrypt_data(encrypted_data, key_type=key_type)
            return decrypted.decode('utf-8')
            
        except Exception as e:
            logger.error(f"Fehler bei der String-Entschlüsselung: {e}")
            raise
    
    def create_fernet_key(self, key_type: str = "fernet") -> Fernet:
        """
        Erstelle einen Fernet-Schlüssel für einfache Verschlüsselung
        
        Args:
            key_type: Typ des Schlüssels
            
        Returns:
            Fernet-Instanz
        """
        try:
            # Prüfe Cache
            if key_type in self._fernet_cache:
                return self._fernet_cache[key_type]
            
            # Neuen Schlüssel generieren oder laden
            if key_type not in self._key_cache:
                self.generate_key(key_type)
            
            # Fernet-kompatiblen Schlüssel erstellen
            key = self._key_cache[key_type]
            fernet_key = base64.urlsafe_b64encode(key)
            fernet = Fernet(fernet_key)
            
            # Cache speichern
            self._fernet_cache[key_type] = fernet
            
            logger.info(f"Fernet-Schlüssel für {key_type} erstellt")
            return fernet
            
        except Exception as e:
            logger.error(f"Fehler beim Erstellen des Fernet-Schlüssels: {e}")
            raise
    
    def hash_data(self, data: bytes, algorithm: str = "SHA-256") -> str:
        """
        Erstelle einen Hash von Daten
        
        Args:
            data: Zu hashende Daten
            algorithm: Hash-Algorithmus (SHA-256, SHA-512)
            
        Returns:
            Hexadezimaler Hash-String
        """
        try:
            if algorithm == "SHA-256":
                hash_obj = hashlib.sha256()
            elif algorithm == "SHA-512":
                hash_obj = hashlib.sha512()
            else:
                raise ValueError(f"Nicht unterstützter Hash-Algorithmus: {algorithm}")
            
            hash_obj.update(data)
            hash_hex = hash_obj.hexdigest()
            
            # Audit-Log
            self._log_crypto_event("data_hashed", {
                "data_size": len(data),
                "algorithm": algorithm,
                "timestamp": datetime.utcnow().isoformat()
            })
            
            return hash_hex
            
        except Exception as e:
            logger.error(f"Fehler beim Hashen der Daten: {e}")
            raise
    
    def verify_integrity(self, data: bytes, expected_hash: str, algorithm: str = "SHA-256") -> bool:
        """
        Überprüfe die Integrität von Daten
        
        Args:
            data: Zu überprüfende Daten
            expected_hash: Erwarteter Hash
            algorithm: Hash-Algorithmus
            
        Returns:
            True wenn Integrität bestätigt, False sonst
        """
        try:
            actual_hash = self.hash_data(data, algorithm)
            is_valid = actual_hash == expected_hash
            
            # Audit-Log
            self._log_crypto_event("integrity_check", {
                "is_valid": is_valid,
                "algorithm": algorithm,
                "timestamp": datetime.utcnow().isoformat()
            })
            
            return is_valid
            
        except Exception as e:
            logger.error(f"Fehler bei der Integritätsprüfung: {e}")
            return False
    
    def _get_key(self, key_type: str) -> bytes:
        """
        Hole einen Schlüssel aus dem Cache oder generiere einen neuen
        
        Args:
            key_type: Typ des Schlüssels
            
        Returns:
            Schlüssel als bytes
        """
        if key_type not in self._key_cache:
            self.generate_key(key_type)
        return self._key_cache[key_type]
    
    def _log_crypto_event(self, event_type: str, details: Dict[str, Any]):
        """
        Logge kryptographische Ereignisse für Audit-Zwecke
        
        Args:
            event_type: Typ des Ereignisses
            details: Ereignis-Details
        """
        try:
            audit_logger = logging.getLogger('audit')
            audit_logger.info(f"CRYPTO_EVENT: {event_type} - {json.dumps(details)}")
            
        except Exception as e:
            logger.error(f"Fehler beim Loggen des Crypto-Ereignisses: {e}")
    
    def rotate_key(self, key_type: str) -> bytes:
        """
        Rotiere einen Schlüssel (generiere neuen und archiviere alten)
        
        Args:
            key_type: Typ des zu rotierenden Schlüssels
            
        Returns:
            Neuer Schlüssel
        """
        try:
            # Alten Schlüssel archivieren
            if key_type in self._key_cache:
                old_key = self._key_cache[key_type]
                timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
                archived_key_type = f"{key_type}_archived_{timestamp}"
                self._key_cache[archived_key_type] = old_key
            
            # Neuen Schlüssel generieren
            new_key = self.generate_key(key_type)
            
            # Fernet-Cache leeren
            if key_type in self._fernet_cache:
                del self._fernet_cache[key_type]
            
            # Audit-Log
            self._log_crypto_event("key_rotated", {
                "key_type": key_type,
                "timestamp": datetime.utcnow().isoformat()
            })
            
            logger.info(f"Schlüssel {key_type} erfolgreich rotiert")
            return new_key
            
        except Exception as e:
            logger.error(f"Fehler bei der Schlüsselrotation: {e}")
            raise
    
    def cleanup_old_keys(self, max_age_days: int = 365):
        """
        Bereinige alte archivierte Schlüssel
        
        Args:
            max_age_days: Maximales Alter in Tagen
        """
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=max_age_days)
            keys_to_remove = []
            
            for key_type in self._key_cache:
                if "_archived_" in key_type:
                    # Extrahiere Datum aus Schlüssel-Name
                    try:
                        date_str = key_type.split("_archived_")[1]
                        key_date = datetime.strptime(date_str, "%Y%m%d_%H%M%S")
                        
                        if key_date < cutoff_date:
                            keys_to_remove.append(key_type)
                    except (IndexError, ValueError):
                        # Ungültiges Datumsformat, Schlüssel entfernen
                        keys_to_remove.append(key_type)
            
            # Alte Schlüssel entfernen
            for key_type in keys_to_remove:
                del self._key_cache[key_type]
                logger.info(f"Alter Schlüssel entfernt: {key_type}")
            
            # Audit-Log
            self._log_crypto_event("old_keys_cleaned", {
                "removed_count": len(keys_to_remove),
                "max_age_days": max_age_days,
                "timestamp": datetime.utcnow().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Fehler bei der Schlüsselbereinigung: {e}")
            raise