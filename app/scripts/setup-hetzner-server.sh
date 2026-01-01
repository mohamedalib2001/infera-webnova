#!/bin/bash
set -e

APP_NAME="infera-webnova"
APP_DIR="/var/www/infera-webnova"
DOMAIN="your-domain.com"
GIT_REPO="https://github.com/YOUR_USERNAME/YOUR_REPO.git"

echo "========================================="
echo "INFERA WebNova - Hetzner Server Setup"
echo "========================================="
echo ""
echo "Run this script on your Hetzner server to set up the environment."
echo ""

echo "Step 1: Updating system..."
apt update && apt upgrade -y

echo "Step 2: Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

echo "Step 3: Installing PM2..."
npm install -g pm2

echo "Step 4: Installing Nginx..."
apt install -y nginx

echo "Step 5: Creating app directory..."
mkdir -p "$APP_DIR"
cd "$APP_DIR"

echo "Step 6: Cloning repository..."
echo "NOTE: Update GIT_REPO variable with your actual repository URL"
git clone "$GIT_REPO" . || echo "Clone failed - you may need to do this manually"

echo "Step 7: Installing dependencies..."
npm ci --production || npm install

echo "Step 8: Setting up PM2..."
pm2 start npm --name "$APP_NAME" -- run start
pm2 startup
pm2 save

echo "Step 9: Creating Nginx config..."
cat > /etc/nginx/sites-available/infera-webnova << 'EOF'
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
EOF

ln -sf /etc/nginx/sites-available/infera-webnova /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo "Step 10: Installing Certbot for SSL..."
apt install -y certbot python3-certbot-nginx
echo "Run: certbot --nginx -d $DOMAIN"

echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Update GIT_REPO in this script with your actual repository"
echo "2. Add SSH public key to ~/.ssh/authorized_keys for GitHub Actions"
echo "3. Set up SSL with: certbot --nginx -d $DOMAIN"
echo "4. Configure environment variables in .env file"
echo ""
