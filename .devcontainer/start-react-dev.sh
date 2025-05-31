#!/bin/bash

# Creative Muse AI React Development Startup Script
echo "🚀 Starting Creative Muse AI React Development Environment..."

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️ Port $port is already in use"
        return 1
    else
        echo "✅ Port $port is available"
        return 0
    fi
}

# Check required ports
echo "🔍 Checking ports..."
check_port 8001 || echo "Backend might already be running on port 8001"
check_port 3000 || echo "Frontend might already be running on port 3000"

# Start backend in background if not running
if ! pgrep -f "main_llm.py" > /dev/null; then
    echo "🐍 Starting Python backend..."
    cd /workspace
    nohup python ai_core/main_llm.py > logs/backend.log 2>&1 &
    echo "✅ Backend started (PID: $!)"
    sleep 3
else
    echo "✅ Backend already running"
fi

# Start React frontend
echo "⚛️ Starting React development server..."
cd /workspace/creative-muse-react

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing React dependencies..."
    npm install
fi

# Start the development server
echo "🌐 Starting Vite development server on port 3000..."
npm run dev -- --host 0.0.0.0 --port 3000

echo "🎉 React development server started!"
echo "📱 Access the app at: http://localhost:3000"
echo "🔧 Backend API at: http://localhost:8001"
echo "📚 API Docs at: http://localhost:8001/docs"