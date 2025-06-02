#!/bin/bash

# Simple Creative Muse AI Setup Test
echo "🧪 Testing Creative Muse AI Setup..."

# Test basic commands
echo "Testing commands..."
python3 --version && echo "✅ Python3 OK" || echo "❌ Python3 FAIL"
node --version && echo "✅ Node.js OK" || echo "❌ Node.js FAIL"
npm --version && echo "✅ NPM OK" || echo "❌ NPM FAIL"
git --version && echo "✅ Git OK" || echo "❌ Git FAIL"

# Test files
echo "Testing files..."
[[ -f ".env" ]] && echo "✅ .env exists" || echo "❌ .env missing"
[[ -f "pyproject.toml" ]] && echo "✅ pyproject.toml exists" || echo "❌ pyproject.toml missing"
[[ -f ".pre-commit-config.yaml" ]] && echo "✅ pre-commit config exists" || echo "❌ pre-commit config missing"

# Test directories
echo "Testing directories..."
[[ -d "ai_core" ]] && echo "✅ ai_core directory exists" || echo "❌ ai_core directory missing"
[[ -d "creative-muse-modern" ]] && echo "✅ frontend directory exists" || echo "❌ frontend directory missing"
[[ -d "database" ]] && echo "✅ database directory exists" || echo "❌ database directory missing"

# Test Python packages
echo "Testing Python packages..."
python3 -c "import fastapi" 2>/dev/null && echo "✅ FastAPI installed" || echo "❌ FastAPI missing"
python3 -c "import black" 2>/dev/null && echo "✅ Black installed" || echo "❌ Black missing"
python3 -c "import pytest" 2>/dev/null && echo "✅ Pytest installed" || echo "❌ Pytest missing"

# Test Node.js packages
echo "Testing Node.js packages..."
if [[ -d "creative-muse-modern/node_modules" ]]; then
    echo "✅ Node modules installed"
else
    echo "❌ Node modules missing"
fi

echo "🎉 Basic test completed!"
