#!/usr/bin/env python3
"""
Creative Muse AI - Database Update Script
Aggiorna lo schema del database per supportare le nuove funzionalità.
"""

import sqlite3
import sys
from pathlib import Path

def update_database():
    """Aggiorna lo schema del database."""
    print("🗄️ Aggiornamento database Creative Muse AI...")
    
    db_path = Path(__file__).parent.parent / "database" / "creative_muse.db"
    
    if not db_path.exists():
        print("❌ Database non trovato. Esegui prima l'inizializzazione.")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Controlla se la colonna generation_method esiste
        cursor.execute("PRAGMA table_info(simple_ideas)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'generation_method' not in columns:
            print("➕ Aggiunta colonna generation_method...")
            cursor.execute("""
                ALTER TABLE simple_ideas 
                ADD COLUMN generation_method TEXT DEFAULT 'api'
            """)
            print("✅ Colonna generation_method aggiunta")
        else:
            print("✅ Colonna generation_method già presente")
        
        # Controlla se la colonna language esiste
        if 'language' not in columns:
            print("➕ Aggiunta colonna language...")
            cursor.execute("""
                ALTER TABLE simple_ideas 
                ADD COLUMN language TEXT DEFAULT 'de'
            """)
            print("✅ Colonna language aggiunta")
        else:
            print("✅ Colonna language già presente")
        
        # Controlla se la colonna use_llm esiste
        if 'use_llm' not in columns:
            print("➕ Aggiunta colonna use_llm...")
            cursor.execute("""
                ALTER TABLE simple_ideas 
                ADD COLUMN use_llm BOOLEAN DEFAULT 1
            """)
            print("✅ Colonna use_llm aggiunta")
        else:
            print("✅ Colonna use_llm già presente")
        
        # Aggiorna i record esistenti
        cursor.execute("""
            UPDATE simple_ideas 
            SET generation_method = 'api', language = 'de', use_llm = 1 
            WHERE generation_method IS NULL
        """)
        
        conn.commit()
        conn.close()
        
        print("✅ Database aggiornato con successo!")
        return True
        
    except Exception as e:
        print(f"❌ Errore nell'aggiornamento del database: {e}")
        return False

def main():
    """Funzione principale."""
    if update_database():
        print("\n🎉 Aggiornamento completato!")
        sys.exit(0)
    else:
        print("\n❌ Aggiornamento fallito!")
        sys.exit(1)

if __name__ == "__main__":
    main()