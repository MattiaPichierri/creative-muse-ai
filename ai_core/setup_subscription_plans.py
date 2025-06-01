#!/usr/bin/env python3
"""
Creative Muse AI - Database Setup Script
Inizializza le tabelle del database per il sistema di abbonamenti
"""

import sqlite3
import json
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def setup_database():
    """Inizializza tutte le tabelle necessarie per il sistema di abbonamenti"""
    
    # Crea la directory database se non esiste
    db_dir = Path("database")
    db_dir.mkdir(exist_ok=True)
    
    db_path = "database/creative_muse.db"
    
    try:
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()
            
            # 1. Tabella users
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    uuid TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    username TEXT UNIQUE,
                    first_name TEXT,
                    last_name TEXT,
                    password_hash TEXT NOT NULL,
                    salt TEXT NOT NULL,
                    is_active BOOLEAN DEFAULT 1,
                    email_verified BOOLEAN DEFAULT 0,
                    subscription_tier TEXT DEFAULT 'free',
                    stripe_customer_id TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login_at TIMESTAMP
                )
            """)
            
            # 2. Tabella subscription_plans
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS subscription_plans (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    plan_code TEXT UNIQUE NOT NULL,
                    plan_name TEXT NOT NULL,
                    description TEXT,
                    price_monthly DECIMAL(10,2) DEFAULT 0.00,
                    price_yearly DECIMAL(10,2) DEFAULT 0.00,
                    daily_ideas_limit INTEGER DEFAULT 5,
                    monthly_ideas_limit INTEGER DEFAULT 150,
                    max_team_members INTEGER DEFAULT 1,
                    max_projects INTEGER DEFAULT 3,
                    features TEXT, -- JSON string
                    is_active BOOLEAN DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # 3. Tabella user_usage
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_usage (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    date DATE NOT NULL,
                    ideas_generated INTEGER DEFAULT 0,
                    api_calls INTEGER DEFAULT 0,
                    storage_used INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id),
                    UNIQUE(user_id, date)
                )
            """)
            
            # 4. Tabella ideas (per tracciare le idee generate)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS ideas (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    uuid TEXT UNIQUE NOT NULL,
                    user_id INTEGER NOT NULL,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    category TEXT DEFAULT 'general',
                    rating INTEGER,
                    generation_method TEXT DEFAULT 'ai',
                    model_used TEXT,
                    prompt_used TEXT,
                    language TEXT DEFAULT 'it',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """)
            
            # 5. Inserisci i piani di abbonamento predefiniti
            plans_data = [
                {
                    'plan_code': 'free',
                    'plan_name': 'Free',
                    'description': 'Piano gratuito con funzionalità di base',
                    'price_monthly': 0.00,
                    'price_yearly': 0.00,
                    'daily_ideas_limit': 5,
                    'monthly_ideas_limit': 150,
                    'max_team_members': 1,
                    'max_projects': 3,
                    'features': {
                        'ai_models': ['mock'],
                        'export_formats': ['json'],
                        'advanced_analytics': False,
                        'priority_support': False,
                        'api_access': False,
                        'team_collaboration': False
                    }
                },
                {
                    'plan_code': 'creator',
                    'plan_name': 'Creator',
                    'description': 'Piano per creatori con più funzionalità',
                    'price_monthly': 9.99,
                    'price_yearly': 99.99,
                    'daily_ideas_limit': 25,
                    'monthly_ideas_limit': 750,
                    'max_team_members': 3,
                    'max_projects': 10,
                    'features': {
                        'ai_models': ['mock', 'microsoft-dialoGPT-medium'],
                        'export_formats': ['json', 'markdown', 'pdf'],
                        'advanced_analytics': True,
                        'priority_support': False,
                        'api_access': False,
                        'team_collaboration': True
                    }
                },
                {
                    'plan_code': 'pro',
                    'plan_name': 'Pro',
                    'description': 'Piano professionale con tutte le funzionalità',
                    'price_monthly': 29.99,
                    'price_yearly': 299.99,
                    'daily_ideas_limit': 100,
                    'monthly_ideas_limit': 3000,
                    'max_team_members': 10,
                    'max_projects': 50,
                    'features': {
                        'ai_models': ['mock', 'microsoft-dialoGPT-medium', 'mistral-7b-instruct-v0.3'],
                        'export_formats': ['json', 'markdown', 'pdf', 'docx'],
                        'advanced_analytics': True,
                        'priority_support': True,
                        'api_access': True,
                        'team_collaboration': True
                    }
                },
                {
                    'plan_code': 'enterprise',
                    'plan_name': 'Enterprise',
                    'description': 'Piano enterprise con limiti illimitati',
                    'price_monthly': 99.99,
                    'price_yearly': 999.99,
                    'daily_ideas_limit': -1,  # -1 = illimitato
                    'monthly_ideas_limit': -1,  # -1 = illimitato
                    'max_team_members': -1,  # -1 = illimitato
                    'max_projects': -1,  # -1 = illimitato
                    'features': {
                        'ai_models': ['mock', 'microsoft-dialoGPT-medium', 'mistral-7b-instruct-v0.3'],
                        'export_formats': ['json', 'markdown', 'pdf', 'docx', 'xlsx'],
                        'advanced_analytics': True,
                        'priority_support': True,
                        'api_access': True,
                        'team_collaboration': True,
                        'custom_models': True,
                        'dedicated_support': True
                    }
                }
            ]
            
            # Inserisci i piani (se non esistono già)
            for plan in plans_data:
                cursor.execute("""
                    INSERT OR IGNORE INTO subscription_plans 
                    (plan_code, plan_name, description, price_monthly, price_yearly,
                     daily_ideas_limit, monthly_ideas_limit, max_team_members, 
                     max_projects, features)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    plan['plan_code'],
                    plan['plan_name'],
                    plan['description'],
                    plan['price_monthly'],
                    plan['price_yearly'],
                    plan['daily_ideas_limit'],
                    plan['monthly_ideas_limit'],
                    plan['max_team_members'],
                    plan['max_projects'],
                    json.dumps(plan['features'])
                ))
            
            # 6. Crea un utente di test con piano enterprise
            import uuid
            import bcrypt
            
            test_email = "test@enterprise.com"
            test_password = "password123"
            test_uuid = str(uuid.uuid4())
            
            # Hash password
            salt = bcrypt.gensalt()
            password_hash = bcrypt.hashpw(test_password.encode('utf-8'), salt).decode('utf-8')
            
            cursor.execute("""
                INSERT OR IGNORE INTO users 
                (uuid, email, username, password_hash, salt, subscription_tier, email_verified)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                test_uuid,
                test_email,
                "enterprise_user",
                password_hash,
                salt.decode('utf-8'),
                "enterprise",
                True
            ))
            
            conn.commit()
            
            logger.info("✅ Database inizializzato con successo!")
            logger.info("✅ Piani di abbonamento creati:")
            
            # Mostra i piani creati
            cursor.execute("SELECT plan_code, plan_name, daily_ideas_limit, monthly_ideas_limit FROM subscription_plans")
            plans = cursor.fetchall()
            for plan in plans:
                daily_limit = "∞" if plan[2] == -1 else str(plan[2])
                monthly_limit = "∞" if plan[3] == -1 else str(plan[3])
                logger.info(f"  - {plan[1]} ({plan[0]}): {daily_limit} idee/giorno, {monthly_limit} idee/mese")
            
            logger.info(f"✅ Utente di test creato: {test_email} (password: {test_password}) - Piano: enterprise")
            
    except Exception as e:
        logger.error(f"❌ Errore durante l'inizializzazione del database: {e}")
        raise

if __name__ == "__main__":
    setup_database()