"""
Admin Service per la gestione dei feature flags
"""
import sqlite3
import json
from typing import List, Dict, Optional
from datetime import datetime
from fastapi import HTTPException
from pydantic import BaseModel


class AdminUser(BaseModel):
    id: int
    email: str
    is_admin: bool
    subscription_tier: str


class FeatureFlagAdmin(BaseModel):
    id: int
    flag_key: str
    name: str
    description: str
    is_enabled: bool
    allowed_tiers: List[str]
    config: Dict
    created_at: str
    updated_at: str


class UserOverride(BaseModel):
    id: int
    user_id: int
    user_email: str
    flag_key: str
    is_enabled: bool
    expires_at: Optional[str]
    created_at: str


class FeatureFlagUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_enabled: Optional[bool] = None
    allowed_tiers: Optional[List[str]] = None
    config: Optional[Dict] = None


class UserOverrideCreate(BaseModel):
    user_id: int
    flag_key: str
    is_enabled: bool
    expires_at: Optional[str] = None


class AdminService:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self._init_admin_tables()

    def _init_admin_tables(self):
        """Inizializza le tabelle admin se non esistono"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Aggiungi colonna is_admin alla tabella users se non esiste
            cursor.execute("PRAGMA table_info(users)")
            columns = [column[1] for column in cursor.fetchall()]
            
            if 'is_admin' not in columns:
                cursor.execute("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0")
                
                # Crea un admin di default
                cursor.execute("""
                    INSERT OR IGNORE INTO users (email, password_hash, subscription_tier, is_admin)
                    VALUES (?, ?, ?, ?)
                """, ('admin@creativemuse.com', 
                     '$2b$12$LQv3c1yqBwEHxPuNYjHNTO.eMQZRVX/BUcwUBZC/PuaHO6QhO6L4e',  # password: admin123
                     'enterprise', 1))
                
            conn.commit()

    def is_admin(self, user_id: int) -> bool:
        """Verifica se un utente è admin"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT is_admin FROM users WHERE id = ?", (user_id,))
            result = cursor.fetchone()
            return bool(result[0]) if result else False

    def get_all_feature_flags(self) -> List[FeatureFlagAdmin]:
        """Ottieni tutti i feature flags per l'admin"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, flag_key, name, description, is_enabled, 
                       allowed_tiers, config, created_at, updated_at
                FROM feature_flags
                ORDER BY name
            """)
            
            flags = []
            for row in cursor.fetchall():
                flags.append(FeatureFlagAdmin(
                    id=row[0],
                    flag_key=row[1],
                    name=row[2],
                    description=row[3] or "",
                    is_enabled=bool(row[4]),
                    allowed_tiers=json.loads(row[5]) if row[5] else [],
                    config=json.loads(row[6]) if row[6] else {},
                    created_at=row[7],
                    updated_at=row[8]
                ))
            
            return flags

    def update_feature_flag(self, flag_id: int, update_data: FeatureFlagUpdate) -> bool:
        """Aggiorna un feature flag"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Costruisci la query di update dinamicamente
            updates = []
            params = []
            
            if update_data.name is not None:
                updates.append("name = ?")
                params.append(update_data.name)
            
            if update_data.description is not None:
                updates.append("description = ?")
                params.append(update_data.description)
            
            if update_data.is_enabled is not None:
                updates.append("is_enabled = ?")
                params.append(update_data.is_enabled)
            
            if update_data.allowed_tiers is not None:
                updates.append("allowed_tiers = ?")
                params.append(json.dumps(update_data.allowed_tiers))
            
            if update_data.config is not None:
                updates.append("config = ?")
                params.append(json.dumps(update_data.config))
            
            if not updates:
                return False
            
            updates.append("updated_at = ?")
            params.append(datetime.now().isoformat())
            params.append(flag_id)
            
            query = f"UPDATE feature_flags SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(query, params)
            
            return cursor.rowcount > 0

    def get_all_users(self) -> List[AdminUser]:
        """Ottieni tutti gli utenti per l'admin"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, email, is_admin, subscription_tier
                FROM users
                ORDER BY email
            """)
            
            users = []
            for row in cursor.fetchall():
                users.append(AdminUser(
                    id=row[0],
                    email=row[1],
                    is_admin=bool(row[2]) if row[2] is not None else False,
                    subscription_tier=row[3] or 'free'
                ))
            
            return users

    def get_user_overrides(self, user_id: Optional[int] = None) -> List[UserOverride]:
        """Ottieni gli override degli utenti"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            if user_id:
                cursor.execute("""
                    SELECT uo.id, uo.user_id, u.email, uo.flag_key, 
                           uo.is_enabled, uo.expires_at, uo.created_at
                    FROM user_feature_overrides uo
                    JOIN users u ON uo.user_id = u.id
                    WHERE uo.user_id = ?
                    ORDER BY uo.created_at DESC
                """, (user_id,))
            else:
                cursor.execute("""
                    SELECT uo.id, uo.user_id, u.email, uo.flag_key, 
                           uo.is_enabled, uo.expires_at, uo.created_at
                    FROM user_feature_overrides uo
                    JOIN users u ON uo.user_id = u.id
                    ORDER BY uo.created_at DESC
                """)
            
            overrides = []
            for row in cursor.fetchall():
                overrides.append(UserOverride(
                    id=row[0],
                    user_id=row[1],
                    user_email=row[2],
                    flag_key=row[3],
                    is_enabled=bool(row[4]),
                    expires_at=row[5],
                    created_at=row[6]
                ))
            
            return overrides

    def create_user_override(self, override_data: UserOverrideCreate) -> bool:
        """Crea un override per un utente"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            try:
                cursor.execute("""
                    INSERT OR REPLACE INTO user_feature_overrides 
                    (user_id, flag_key, is_enabled, expires_at, created_at)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    override_data.user_id,
                    override_data.flag_key,
                    override_data.is_enabled,
                    override_data.expires_at,
                    datetime.now().isoformat()
                ))
                
                return cursor.rowcount > 0
            except sqlite3.Error:
                return False

    def delete_user_override(self, override_id: int) -> bool:
        """Elimina un override utente"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM user_feature_overrides WHERE id = ?", (override_id,))
            return cursor.rowcount > 0

    def get_admin_stats(self) -> Dict:
        """Ottieni statistiche per l'admin dashboard"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Conta feature flags
            cursor.execute("SELECT COUNT(*) FROM feature_flags")
            total_flags = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM feature_flags WHERE is_enabled = 1")
            enabled_flags = cursor.fetchone()[0]
            
            # Conta utenti
            cursor.execute("SELECT COUNT(*) FROM users")
            total_users = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM users WHERE is_admin = 1")
            admin_users = cursor.fetchone()[0]
            
            # Conta override
            cursor.execute("SELECT COUNT(*) FROM user_feature_overrides")
            total_overrides = cursor.fetchone()[0]
            
            # Distribuzione subscription tiers
            cursor.execute("""
                SELECT subscription_tier, COUNT(*) 
                FROM users 
                GROUP BY subscription_tier
            """)
            tier_distribution = dict(cursor.fetchall())
            
            return {
                "total_flags": total_flags,
                "enabled_flags": enabled_flags,
                "disabled_flags": total_flags - enabled_flags,
                "total_users": total_users,
                "admin_users": admin_users,
                "regular_users": total_users - admin_users,
                "total_overrides": total_overrides,
                "tier_distribution": tier_distribution
            }