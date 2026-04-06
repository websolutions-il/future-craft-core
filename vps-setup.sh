#!/bin/bash
# =============================================================
# VPS First-Time Setup Script — future-craft-core
# Run this ONCE on your Hostinger VPS as root
# Usage: bash vps-setup.sh
# =============================================================

set -e

DOMAIN="dalia-car.online"
APP_NAME="future-craft-core"
APP_DIR="/var/www/$APP_NAME"
NGINX_CONF="/etc/nginx/sites-available/$APP_NAME"

echo "==> Updating system packages..."
apt-get update -y && apt-get upgrade -y

echo "==> Installing Nginx and Certbot..."
apt-get install -y nginx certbot python3-certbot-nginx

echo "==> Creating web root directory..."
mkdir -p "$APP_DIR"
chown -R www-data:www-data "$APP_DIR"

echo "==> Creating temporary HTTP-only Nginx config for Certbot..."
cat > "$NGINX_CONF" <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    root $APP_DIR;
    index index.html;
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

echo "==> Enabling site..."
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
[ -f /etc/nginx/sites-enabled/default ] && rm /etc/nginx/sites-enabled/default

echo "==> Testing and starting Nginx..."
nginx -t
systemctl enable nginx
systemctl restart nginx

echo "==> Obtaining SSL certificate from Let's Encrypt..."
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email admin@dalia-car.online --redirect

echo "==> Deploying final Nginx config with SSL..."
cp nginx.conf "$NGINX_CONF"
nginx -t && systemctl reload nginx

echo "==> Allowing sudo reload of Nginx for GitHub Actions..."
echo "root ALL=(ALL) NOPASSWD: /usr/bin/systemctl reload nginx" >> /etc/sudoers

echo ""
echo "=============================================="
echo "  VPS setup complete!"
echo "  Site:     https://$DOMAIN"
echo "  Web root: $APP_DIR"
echo ""
echo "  Next steps:"
echo "  1. Add GitHub Secrets (see DEPLOYMENT.md)"
echo "  2. Push to main to trigger first deployment"
echo "  3. Visit https://$DOMAIN"
echo "=============================================="
