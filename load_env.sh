#!/bin/bash
# Creative Muse AI - Environment Variables
# Source this file: source load_env.sh

export SECRET_KEY="creative_muse_ai_secret_key_2025"
export DATABASE_URL="sqlite:///database/creative_muse.db"
export API_HOST="localhost"
export API_PORT="8000"
export FRONTEND_PORT="3000"
export DEBUG="true"
export LOG_LEVEL="INFO"
export ENABLE_CORS="true"
export CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
export DEFAULT_MODEL="mistral-7b-instruct-v0.3"
export MODEL_CACHE_DIR="./models"
export MAX_TOKENS="2048"
export TEMPERATURE="0.7"
export DB_ENCRYPTION="true"
export DB_BACKUP_ENABLED="true"
export DB_BACKUP_INTERVAL="24h"
export LOG_DIR="./logs"
export AUDIT_LOG_ENABLED="true"
export SECURITY_LOG_ENABLED="true"
