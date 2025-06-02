#!/usr/bin/env python3
"""
Test Script für Rate Limiting System
Testet die Funktionalität des Rate Limiting Systems
"""

import requests
import time
import json
from typing import Dict, Any

# Konfiguration
BASE_URL = "http://localhost:8000"
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "wrongpassword"
ADMIN_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo2LCJlbWFpbCI6ImFkbWluQGNyZWF0aXZlbXVzZS5jb20iLCJleHAiOjE3NDg5MDQ2ODYsImlhdCI6MTc0ODgxODI4Nn0.Ej1cZWF0aXZlbXVzZS5jb20iLCJleHAiOjE3NDg5MDQ2ODYsImlhdCI6MTc0ODgxODI4Nn0"


def test_login_rate_limiting():
    """Testa il rate limiting per login"""
    print("🧪 Test Rate Limiting Login...")
    
    # Prova 6 login falliti (limite è 5)
    for i in range(6):
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/login",
            json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            }
        )
        
        print(f"Tentativo {i+1}: Status {response.status_code}")
        if response.status_code == 429:
            print(f"✅ Rate limiting attivato al tentativo {i+1}")
            print(f"Messaggio: {response.json().get('detail', 'N/A')}")
            break
        elif response.status_code == 401:
            print(f"❌ Login fallito (normale)")
        
        time.sleep(1)  # Pausa tra tentativi
    
    return response.status_code == 429


def test_registration_rate_limiting():
    """Testa il rate limiting per registrazione"""
    print("\n🧪 Test Rate Limiting Registrazione...")
    
    # Prova 4 registrazioni fallite (limite è 3)
    for i in range(4):
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/register",
            json={
                "email": f"invalid_email_{i}",  # Email non valida
                "password": "test123",
                "subscription_tier": "free"
            }
        )
        
        print(f"Tentativo {i+1}: Status {response.status_code}")
        if response.status_code == 429:
            print(f"✅ Rate limiting attivato al tentativo {i+1}")
            print(f"Messaggio: {response.json().get('detail', 'N/A')}")
            break
        
        time.sleep(1)
    
    return response.status_code == 429


def test_admin_endpoints():
    """Testa gli endpoint admin per rate limiting"""
    print("\n🧪 Test Admin Endpoints...")
    
    headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"}
    
    # Test overview
    response = requests.get(
        f"{BASE_URL}/api/v1/admin/rate-limits/overview",
        headers=headers
    )
    
    if response.status_code == 200:
        print("✅ Admin overview funziona")
        data = response.json()
        print(f"Tentativi 24h: {data.get('total_attempts_24h', 0)}")
        print(f"Blocchi attivi: {data.get('total_blocks_active', 0)}")
    else:
        print(f"❌ Admin overview fallito: {response.status_code}")
    
    # Test blocked identifiers
    response = requests.get(
        f"{BASE_URL}/api/v1/admin/rate-limits/blocked",
        headers=headers
    )
    
    if response.status_code == 200:
        print("✅ Admin blocked identifiers funziona")
        blocked = response.json()
        print(f"Identificatori bloccati: {len(blocked)}")
    else:
        print(f"❌ Admin blocked identifiers fallito: {response.status_code}")
    
    return response.status_code == 200


def test_unblock_functionality():
    """Testa la funzionalità di sblocco"""
    print("\n🧪 Test Sblocco Manuale...")
    
    headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"}
    
    # Prova a sbloccare l'email di test
    response = requests.post(
        f"{BASE_URL}/api/v1/admin/rate-limits/unblock",
        headers=headers,
        json={
            "identifier": TEST_EMAIL,
            "limit_type": "login_attempts"
        }
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Sblocco riuscito: {result.get('message', 'N/A')}")
        return True
    else:
        print(f"❌ Sblocco fallito: {response.status_code}")
        return False


def test_rate_limit_stats():
    """Testa le statistiche rate limiting"""
    print("\n🧪 Test Statistiche Rate Limiting...")
    
    headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"}
    
    response = requests.get(
        f"{BASE_URL}/api/v1/admin/rate-limits/stats/{TEST_EMAIL}",
        headers=headers,
        params={"limit_type": "login_attempts"}
    )
    
    if response.status_code == 200:
        stats = response.json()
        print("✅ Statistiche recuperate:")
        print(f"  - Tentativi totali: {stats.get('total_attempts', 0)}")
        print(f"  - Tentativi falliti: {stats.get('failed_attempts', 0)}")
        print(f"  - Tentativi rimanenti: {stats.get('remaining_attempts', 0)}")
        print(f"  - È bloccato: {stats.get('is_blocked', False)}")
        return True
    else:
        print(f"❌ Statistiche fallite: {response.status_code}")
        return False


def main():
    """Esegue tutti i test"""
    print("🚀 Avvio Test Suite Rate Limiting\n")
    
    results = {
        "login_rate_limiting": test_login_rate_limiting(),
        "registration_rate_limiting": test_registration_rate_limiting(),
        "admin_endpoints": test_admin_endpoints(),
        "unblock_functionality": test_unblock_functionality(),
        "rate_limit_stats": test_rate_limit_stats()
    }
    
    print("\n📊 Risultati Test:")
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {test_name}: {status}")
    
    passed = sum(results.values())
    total = len(results)
    print(f"\n🎯 Test passati: {passed}/{total}")
    
    if passed == total:
        print("🎉 Tutti i test sono passati!")
    else:
        print("⚠️  Alcuni test sono falliti")


if __name__ == "__main__":
    main()