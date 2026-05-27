#!/bin/bash
# Run this ONCE on a fresh DigitalOcean droplet to set up the server.
# Assumes Ubuntu 22.04+ and that you are logged in as root or a sudo user.

set -e

echo "=== Installing Node.js 22 ==="
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

echo "=== Installing PM2 ==="
npm install -g pm2

echo "=== Cloning repo ==="
mkdir -p /opt/strata
cd /opt/strata
git clone https://github.com/AndyCascada/Strata.git .

echo "=== Installing dependencies ==="
npm install

echo "=== Creating .env file ==="
cat > apps/web/.env << 'EOF'
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY="your_anthropic_api_key_here"
NEWS_API_KEY="your_newsapi_key_here"
CRON_SECRET="your_cron_secret_here"
EOF
echo "  --> Edit apps/web/.env with your real API keys before continuing."
read -p "Press Enter once you've updated .env..."

echo "=== Generating Prisma client ==="
cd apps/web && npx prisma generate && cd ../..

echo "=== Running database migrations ==="
cd apps/web && npx prisma migrate deploy && cd ../..

echo "=== Building web app ==="
npm run build --workspace=apps/web

echo "=== Starting app with PM2 ==="
cd apps/web && pm2 start ecosystem.config.cjs && cd ../..
pm2 save
pm2 startup

echo ""
echo "=== Done! ==="
echo "The app is running on port 3000."
echo "Set up nginx to proxy port 80/443 to port 3000."
