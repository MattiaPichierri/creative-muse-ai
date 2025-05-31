#!/bin/bash

# Creative Muse AI - Traefik Restart Script

echo "🔄 Restarting Traefik with updated configuration..."

# Stop and remove existing Traefik container
echo "🛑 Stopping existing Traefik container..."
docker stop creative-muse-traefik 2>/dev/null || true
docker rm creative-muse-traefik 2>/dev/null || true

# Restart the entire compose stack
echo "🚀 Restarting Docker Compose stack..."
cd /workspace
docker compose -f .devcontainer/docker-compose.yml down
docker compose -f .devcontainer/docker-compose.yml up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 5

# Check Traefik status
echo "🔍 Checking Traefik status..."
if docker ps | grep -q creative-muse-traefik; then
    echo "✅ Traefik is running"
    
    # Show network information
    echo "🌐 Network information:"
    docker network ls | grep creative-muse
    
    # Show container information
    echo "📦 Container information:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(traefik|creative-muse)"
    
    echo ""
    echo "🎯 Available services:"
    echo "  🌐 Frontend:  http://creative-muse.local"
    echo "  🔌 Backend:   http://api.creative-muse.local"
    echo "  📊 Traefik:   http://traefik.creative-muse.local"
    echo ""
    echo "💡 Don't forget to start your services:"
    echo "  start-backend"
    echo "  start-frontend"
else
    echo "❌ Traefik failed to start"
    echo "📋 Checking logs..."
    docker logs creative-muse-traefik 2>/dev/null || echo "No logs available"
fi