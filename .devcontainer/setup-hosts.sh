#!/bin/bash

# Creative Muse AI - Hosts Setup Script for Traefik Domains

echo "🌐 Setting up local domains for Creative Muse AI..."

# Define domains
DOMAINS=(
    "creative-muse.local"
    "api.creative-muse.local"
    "services.creative-muse.local"
    "traefik.creative-muse.local"
)

# Check if running on macOS or Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    HOSTS_FILE="/etc/hosts"
    SUDO_CMD="sudo"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    HOSTS_FILE="/etc/hosts"
    SUDO_CMD="sudo"
else
    echo "❌ Unsupported operating system: $OSTYPE"
    echo "Please manually add the following entries to your hosts file:"
    for domain in "${DOMAINS[@]}"; do
        echo "127.0.0.1 $domain"
    done
    exit 1
fi

echo "📝 Adding domains to $HOSTS_FILE..."

# Backup hosts file
echo "💾 Creating backup of hosts file..."
$SUDO_CMD cp $HOSTS_FILE $HOSTS_FILE.backup.$(date +%Y%m%d_%H%M%S)

# Remove existing Creative Muse AI entries
echo "🧹 Removing existing Creative Muse AI entries..."
$SUDO_CMD sed -i.tmp '/# Creative Muse AI DevContainer/,/# End Creative Muse AI DevContainer/d' $HOSTS_FILE

# Add new entries
echo "➕ Adding new domain entries..."
{
    echo ""
    echo "# Creative Muse AI DevContainer"
    for domain in "${DOMAINS[@]}"; do
        echo "127.0.0.1 $domain"
    done
    echo "# End Creative Muse AI DevContainer"
} | $SUDO_CMD tee -a $HOSTS_FILE > /dev/null

echo "✅ Hosts file updated successfully!"
echo ""
echo "🎯 Available domains:"
echo "  🌐 Frontend:  http://creative-muse.local"
echo "  🔌 Backend:   http://api.creative-muse.local"
echo "  ⚙️  Services:  http://services.creative-muse.local"
echo "  📊 Traefik:   http://traefik.creative-muse.local"
echo ""
echo "💡 To remove these entries later, run:"
echo "   sudo sed -i '/# Creative Muse AI DevContainer/,/# End Creative Muse AI DevContainer/d' $HOSTS_FILE"
echo ""
echo "🚀 You can now start the DevContainer and access the services via domains!"