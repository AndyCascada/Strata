# Server Setup

One-time steps to provision a DigitalOcean droplet and wire up GitHub Actions for deploy and nightly analysis.

---

## 1. Create the Droplet

- **Image**: Ubuntu 22.04 LTS
- **Plan**: Basic, 1GB RAM minimum (2GB recommended)
- **Authentication**: SSH key — add your public key at creation time
- **Hostname**: `strata` (or whatever you like)

---

## 2. Point Your Domain (optional)

In your DNS provider, add an A record pointing your domain to the droplet's IP address.

---

## 3. Run the Setup Script

SSH into the droplet and run the one-time setup script:

```bash
ssh root@YOUR_DROPLET_IP
bash <(curl -fsSL https://raw.githubusercontent.com/AndyCascada/Strata/main/scripts/setup-server.sh)
```

Or copy it manually:

```bash
scp scripts/setup-server.sh root@YOUR_DROPLET_IP:~
ssh root@YOUR_DROPLET_IP
bash setup-server.sh
```

The script will:
- Install Node.js 22 and PM2
- Clone the repo to `/opt/strata`
- Prompt you to fill in `.env` with real API keys
- Generate the Prisma client and run migrations
- Build the Next.js app
- Start the app on port 3000 with PM2
- Configure PM2 to restart on server reboot

---

## 4. Fill In the .env File

The setup script pauses and asks you to edit `/opt/strata/apps/web/.env`:

```
ANTHROPIC_API_KEY="your_key_here"
NEWS_API_KEY="your_key_here"
CRON_SECRET="a_long_random_string"
DATABASE_URL="file:./dev.db"
```

Generate a secure `CRON_SECRET` with:

```bash
openssl rand -hex 32
```

---

## 5. Set Up Nginx (reverse proxy)

Install nginx and proxy port 80 to the app on port 3000:

```bash
apt-get install -y nginx

cat > /etc/nginx/sites-available/strata << 'EOF'
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -s /etc/nginx/sites-available/strata /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### Add HTTPS with Let's Encrypt (recommended)

```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d YOUR_DOMAIN
```

Certbot will auto-renew. HTTPS will work once DNS is pointed at the droplet.

---

## 6. Add GitHub Secrets

In your GitHub repo go to **Settings → Secrets and variables → Actions** and add:

| Secret | Value |
|---|---|
| `DO_SSH_HOST` | Your droplet's IP address |
| `DO_SSH_USER` | `root` (or your deploy user) |
| `DO_SSH_PRIVATE_KEY` | Contents of your `~/.ssh/id_rsa` (private key) |

---

## 7. Verify the Deploy Workflow

Push any change to `main`. GitHub Actions will:

1. SSH into the droplet
2. Pull latest code
3. Install dependencies
4. Run Prisma migrations
5. Build the Next.js app
6. Reload PM2 (zero downtime)

Check the Actions tab in GitHub to confirm it passes.

---

## 8. Verify the Nightly Analysis

The analysis runs daily at 2am ET via the `daily-analysis.yml` workflow.

To trigger it manually:

1. Go to **Actions → Daily Analysis → Run workflow**
2. Optionally enter a date (YYYY-MM-DD) — leave blank to use yesterday

To check what's in the database on the server:

```bash
ssh root@YOUR_DROPLET_IP
cd /opt/strata/apps/web
npx tsx -e "
const { createClient } = require('@libsql/client');
const db = createClient({ url: 'file:./dev.db' });
db.execute('SELECT forDate, COUNT(*) as count FROM Headline GROUP BY forDate ORDER BY forDate DESC LIMIT 7')
  .then(r => r.rows.forEach(row => console.log(row)))
  .then(() => process.exit(0));
"
```

---

## Useful PM2 Commands

```bash
pm2 status           # check if the app is running
pm2 logs strata      # tail app logs
pm2 restart strata   # hard restart
pm2 reload strata    # zero-downtime reload
```
