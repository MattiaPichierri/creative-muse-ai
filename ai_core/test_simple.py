#!/usr/bin/env python3
"""
Test semplice per il backend unificato (senza dipendenze esterne)
"""

import subprocess
import time
import sys
import signal
import os

def test_server_startup():
    """Test che il server si avvii correttamente"""
    print("🧪 Testing server startup...")
    
    try:
        # Avvia il server in background
        process = subprocess.Popen(
            [sys.executable, "main.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Aspetta un po' per l'avvio
        time.sleep(3)
        
        # Controlla se il processo è ancora in esecuzione
        if process.poll() is None:
            print("✅ Server started successfully")
            
            # Termina il processo
            process.terminate()
            process.wait(timeout=5)
            print("✅ Server stopped cleanly")
            return True
        else:
            stdout, stderr = process.communicate()
            print(f"❌ Server failed to start")
            print(f"STDOUT: {stdout}")
            print(f"STDERR: {stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing server: {e}")
        return False

def test_import():
    """Test che tutti i moduli si importino correttamente"""
    print("🧪 Testing imports...")
    
    try:
        import main
        print("✅ Main module imported successfully")
        
        from models import api_models
        print("✅ API models imported successfully")
        
        from routers import auth, ai, admin, subscription, training
        print("✅ All routers imported successfully")
        
        return True
        
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False

def main():
    """Funzione principale di test"""
    print("🚀 Avvio test backend unificato...")
    print("=" * 50)
    
    tests_passed = 0
    total_tests = 2
    
    # Test 1: Import
    if test_import():
        tests_passed += 1
    
    print("-" * 50)
    
    # Test 2: Server startup
    if test_server_startup():
        tests_passed += 1
    
    print("=" * 50)
    print(f"📊 Test Results: {tests_passed}/{total_tests} passed")
    
    if tests_passed == total_tests:
        print("🎉 All tests passed! Backend unificato is working correctly.")
        return 0
    else:
        print("❌ Some tests failed. Check the output above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())