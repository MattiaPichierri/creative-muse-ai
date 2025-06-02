#!/usr/bin/env python3
"""
Creative Muse AI - Feature Flags Service
Verwaltet Feature-Flags für granulare Funktionskontrolle
"""

import sqlite3
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class FeatureFlag:
    """Feature Flag Datenstruktur"""
    flag_key: str
    name: str
    description: str
    is_enabled: bool
    allowed_tiers: List[str]
    config: Dict[str, Any]


@dataclass
class UserFeatureOverride:
    """Benutzer-spezifische Feature Override"""
    user_id: int
    flag_key: str
    is_enabled: bool
    expires_at: Optional[datetime] = None


class FeatureFlagsService:
    """Service für Feature-Flag-Management"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self._cache: Dict[str, FeatureFlag] = {}
        self._cache_timestamp = None
        self._cache_ttl = 300  # 5 Minuten Cache
    
    def _get_connection(self):
        """Datenbankverbindung erstellen"""
        return sqlite3.connect(self.db_path)
    
    def _refresh_cache(self):
        """Feature-Flags Cache aktualisieren"""
        now = datetime.now()
        if (self._cache_timestamp is None or 
            (now - self._cache_timestamp).seconds > self._cache_ttl):
            
            try:
                with self._get_connection() as conn:
                    cursor = conn.cursor()
                    cursor.execute("""
                        SELECT flag_key, name, description, is_enabled, 
                               allowed_tiers, config
                        FROM feature_flags
                        WHERE is_enabled = 1
                    """)
                    
                    self._cache = {}
                    for row in cursor.fetchall():
                        flag = FeatureFlag(
                            flag_key=row[0],
                            name=row[1],
                            description=row[2],
                            is_enabled=bool(row[3]),
                            allowed_tiers=json.loads(row[4]) if row[4] else [],
                            config=json.loads(row[5]) if row[5] else {}
                        )
                        self._cache[flag.flag_key] = flag
                    
                    self._cache_timestamp = now
                    logger.info(f"✅ Feature flags cache refreshed: {len(self._cache)} flags")
                    
            except Exception as e:
                logger.error(f"❌ Fehler beim Cache-Refresh: {e}")
    
    def is_feature_enabled(self, flag_key: str, user_tier: str, 
                          user_id: Optional[int] = None) -> bool:
        """Prüft ob ein Feature für einen Benutzer aktiviert ist"""
        try:
            # Cache aktualisieren
            self._refresh_cache()
            
            # Feature Flag existiert?
            if flag_key not in self._cache:
                logger.warning(f"⚠️  Feature flag nicht gefunden: {flag_key}")
                return False
            
            flag = self._cache[flag_key]
            
            # Global deaktiviert?
            if not flag.is_enabled:
                return False
            
            # Benutzer-spezifische Overrides prüfen
            if user_id:
                override = self._get_user_override(user_id, flag_key)
                if override:
                    # Ablaufzeit prüfen
                    if override.expires_at and override.expires_at < datetime.now():
                        self._remove_expired_override(user_id, flag_key)
                    else:
                        return override.is_enabled
            
            # Tier-basierte Berechtigung prüfen
            return user_tier in flag.allowed_tiers
            
        except Exception as e:
            logger.error(f"❌ Fehler bei Feature-Check {flag_key}: {e}")
            return False
    
    def get_feature_config(self, flag_key: str) -> Dict[str, Any]:
        """Holt die Konfiguration für ein Feature"""
        self._refresh_cache()
        if flag_key in self._cache:
            return self._cache[flag_key].config
        return {}
    
    def get_user_features(self, user_tier: str, user_id: Optional[int] = None) -> Dict[str, bool]:
        """Holt alle verfügbaren Features für einen Benutzer"""
        self._refresh_cache()
        features = {}
        
        for flag_key, flag in self._cache.items():
            features[flag_key] = self.is_feature_enabled(flag_key, user_tier, user_id)
        
        return features
    
    def _get_user_override(self, user_id: int, flag_key: str) -> Optional[UserFeatureOverride]:
        """Holt benutzer-spezifische Override"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT user_id, flag_key, is_enabled, expires_at
                    FROM user_feature_overrides
                    WHERE user_id = ? AND flag_key = ?
                """, (user_id, flag_key))
                
                row = cursor.fetchone()
                if row:
                    expires_at = None
                    if row[3]:
                        expires_at = datetime.fromisoformat(row[3])
                    
                    return UserFeatureOverride(
                        user_id=row[0],
                        flag_key=row[1],
                        is_enabled=bool(row[2]),
                        expires_at=expires_at
                    )
                return None
                
        except Exception as e:
            logger.error(f"❌ Fehler beim Laden der User Override: {e}")
            return None
    
    def _remove_expired_override(self, user_id: int, flag_key: str):
        """Entfernt abgelaufene Override"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    DELETE FROM user_feature_overrides
                    WHERE user_id = ? AND flag_key = ? AND expires_at < ?
                """, (user_id, flag_key, datetime.now().isoformat()))
                conn.commit()
                
        except Exception as e:
            logger.error(f"❌ Fehler beim Entfernen abgelaufener Override: {e}")
    
    def set_user_override(self, user_id: int, flag_key: str, is_enabled: bool,
                         expires_at: Optional[datetime] = None):
        """Setzt benutzer-spezifische Feature Override"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT OR REPLACE INTO user_feature_overrides
                    (user_id, flag_key, is_enabled, expires_at)
                    VALUES (?, ?, ?, ?)
                """, (
                    user_id, flag_key, is_enabled,
                    expires_at.isoformat() if expires_at else None
                ))
                conn.commit()
                logger.info(f"✅ User override gesetzt: {user_id} -> {flag_key} = {is_enabled}")
                
        except Exception as e:
            logger.error(f"❌ Fehler beim Setzen der User Override: {e}")
    
    def create_feature_flag(self, flag_key: str, name: str, description: str,
                           allowed_tiers: List[str], config: Dict[str, Any] = None):
        """Erstellt einen neuen Feature Flag"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO feature_flags
                    (flag_key, name, description, allowed_tiers, config)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    flag_key, name, description,
                    json.dumps(allowed_tiers),
                    json.dumps(config or {})
                ))
                conn.commit()
                
                # Cache invalidieren
                self._cache_timestamp = None
                logger.info(f"✅ Feature flag erstellt: {flag_key}")
                
        except Exception as e:
            logger.error(f"❌ Fehler beim Erstellen des Feature Flags: {e}")
    
    def update_feature_flag(self, flag_key: str, **kwargs):
        """Aktualisiert einen Feature Flag"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                # Dynamisches Update basierend auf kwargs
                updates = []
                values = []
                
                for key, value in kwargs.items():
                    if key in ['name', 'description', 'is_enabled']:
                        updates.append(f"{key} = ?")
                        values.append(value)
                    elif key == 'allowed_tiers':
                        updates.append("allowed_tiers = ?")
                        values.append(json.dumps(value))
                    elif key == 'config':
                        updates.append("config = ?")
                        values.append(json.dumps(value))
                
                if updates:
                    updates.append("updated_at = ?")
                    values.append(datetime.now().isoformat())
                    values.append(flag_key)
                    
                    query = f"UPDATE feature_flags SET {', '.join(updates)} WHERE flag_key = ?"
                    cursor.execute(query, values)
                    conn.commit()
                    
                    # Cache invalidieren
                    self._cache_timestamp = None
                    logger.info(f"✅ Feature flag aktualisiert: {flag_key}")
                
        except Exception as e:
            logger.error(f"❌ Fehler beim Aktualisieren des Feature Flags: {e}")
    
    def get_all_flags(self) -> List[FeatureFlag]:
        """Holt alle Feature Flags"""
        self._refresh_cache()
        return list(self._cache.values())


# Globale Service-Instanz
feature_flags_service: Optional[FeatureFlagsService] = None


def init_feature_flags_service(db_path: str):
    """Initialisiert den globalen Feature Flags Service"""
    global feature_flags_service
    feature_flags_service = FeatureFlagsService(db_path)
    logger.info("✅ Feature Flags Service initialisiert")


def get_feature_flags_service() -> FeatureFlagsService:
    """Holt den globalen Feature Flags Service"""
    if feature_flags_service is None:
        raise RuntimeError("Feature Flags Service nicht initialisiert")
    return feature_flags_service