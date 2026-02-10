#!/bin/bash

# Local development setup script

set -e

echo "🚀 Starting local development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start PostgreSQL
echo "📦 Starting PostgreSQL..."
docker compose -f docker-compose.dev.yml up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
sleep 3

# Run migrations
echo "🔄 Running database migrations..."
cd server
npx prisma db push --skip-generate

# Seed prompts
echo "🌱 Database ready!"

echo ""
echo "✅ Local environment ready!"
echo ""
echo "Next steps:"
echo "  1. Update server/.env with your Polar sandbox credentials"
echo "  2. Run 'npm run dev' in /server directory"
echo "  3. Run 'npm run dev' in root directory (frontend)"
echo "  4. For webhooks, use ngrok: ngrok http 3001"
echo ""
