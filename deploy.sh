#!/usr/bin/env bash
# ==============================================================================
# Medix Production Deployment Script (for Ubuntu VPS)
# ==============================================================================
set -e

echo "🚀 Starting Medix VPS Deployment..."

# 1. Check & Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "📦 Docker not found. Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    usermod -aG docker "$USER" || true
    echo "✅ Docker installed successfully."
fi

# 2. Check & Install Node.js if not present (for frontend builds)
if ! command -v node &> /dev/null; then
    echo "📦 Node.js not found. Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    echo "✅ Node.js installed."
fi

# 3. Build Customer PWA Frontend
echo "🔨 Building Customer PWA..."
npm --prefix apps/customer install
npm --prefix apps/customer run build
echo "✅ Customer PWA built to apps/customer/dist"

# 4. Boot or Update Docker Compose Stack
echo "🐳 Launching Docker Compose Stack (MongoDB + Express API + Nginx)..."
docker compose down || true
docker compose up -d --build

# 5. Verify Health
echo "⏳ Waiting for health checks..."
sleep 5
docker compose ps

echo "=============================================================================="
echo "🎉 Medix is live on your VPS!"
echo "   - Web & API: http://$(curl -s ifconfig.me)"
echo "   - Health Check: http://$(curl -s ifconfig.me)/health"
echo "=============================================================================="
