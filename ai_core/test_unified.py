#!/usr/bin/env python3
"""
Test script per il backend unificato Creative Muse AI
"""

import asyncio
import aiohttp
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_URL = "http://localhost:8000"


async def test_endpoints():
    """Test degli endpoint principali"""
    
    async with aiohttp.ClientSession() as session:
        
        # Test root endpoint
        logger.info("🧪 Testing root endpoint...")
        async with session.get(f"{BASE_URL}/") as resp:
            data = await resp.json()
            logger.info(f"✅ Root: {data}")
        
        # Test health check
        logger.info("🧪 Testing health check...")
        async with session.get(f"{BASE_URL}/health") as resp:
            data = await resp.json()
            logger.info(f"✅ Health: {data['status']}")
        
        # Test API info
        logger.info("🧪 Testing API info...")
        async with session.get(f"{BASE_URL}/api/v1/info") as resp:
            data = await resp.json()
            logger.info(f"✅ API Info: {data['api_version']}")
        
        # Test auth endpoints (senza autenticazione)
        logger.info("🧪 Testing auth endpoints...")
        
        # Test registration (dovrebbe fallire senza dati validi)
        try:
            async with session.post(
                f"{BASE_URL}/api/v1/auth/register",
                json={"email": "test@example.com", "password": "test123"}
            ) as resp:
                if resp.status == 422:  # Validation error expected
                    logger.info("✅ Auth registration endpoint responsive")
                else:
                    data = await resp.json()
                    logger.info(f"✅ Auth registration: {resp.status}")
        except Exception as e:
            logger.warning(f"⚠️ Auth test failed: {e}")
        
        # Test AI endpoints (dovrebbe richiedere autenticazione)
        logger.info("🧪 Testing AI endpoints...")
        try:
            async with session.get(f"{BASE_URL}/api/v1/ai/models") as resp:
                if resp.status == 401:  # Unauthorized expected
                    logger.info("✅ AI models endpoint requires auth (correct)")
                else:
                    logger.info(f"✅ AI models: {resp.status}")
        except Exception as e:
            logger.warning(f"⚠️ AI test failed: {e}")


async def main():
    """Funzione principale di test"""
    logger.info("🚀 Avvio test backend unificato...")
    
    try:
        await test_endpoints()
        logger.info("✅ Test completati con successo!")
        
    except Exception as e:
        logger.error(f"❌ Errore durante i test: {e}")


if __name__ == "__main__":
    asyncio.run(main())