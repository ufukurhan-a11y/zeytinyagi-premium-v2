#!/usr/bin/env bash
# ============================================================
# Zeytinyağı Premium — Hostinger VPS (Ubuntu/Debian) Kurulum
# Kullanım:
#   sudo ./deploy/setup-vps.sh <repo-url>
# Örneğin (token ile):
#   sudo ./deploy/setup-vps.sh https://ufukurhan-a11y:TOKEN@github.com/ufukurhan-a11y/zeytinyagi-premium-v2.git
# Veya SSH deploy key ile:
#   sudo ./deploy/setup-vps.sh git@github.com:ufukurhan-a11y/zeytinyagi-premium-v2.git
# ============================================================
set -euo pipefail

REPO_URL="${1:?Kullanım: sudo ./deploy/setup-vps.sh <github-repo-url>}"
APP_DIR="/opt/zeytinyagi-premium"
DOMAIN="${2:-}" # boştaysa SSL atlanır, manuel yapılandırılır

# 1) Temel paketler (better-sqlite3 derlemesi için build toolchain şart)
echo "==> Sistem paketleri kuruluyor..."
apt-get update -qq
apt-get install -y -qq curl git build-essential python3 ca-certificates

# 2) Node.js 22 (fnm ile, projede de fnm kullanılıyor)
export FNM_DIR="$HOME/.local/share/fnm"
export PATH="$FNM_DIR/aliases/default/bin:$PATH"
if ! command -v fnm >/dev/null 2>&1; then
  echo "==> fnm kuruluyor..."
  curl -fsSL https://fnm.vercel.app/install | bash
  export PATH="$FNM_DIR/bin:$PATH"
  eval "$(fnm env --shell bash)"
fi
eval "$(fnm env --shell bash)"
fnm install 22
fnm use 22
fnm alias default 22
node --version
npm --version

# 3) Repo'yu çek
echo "==> Repo klonlanıyor: $REPO_URL"
mkdir -p "$APP_DIR"
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" pull --ff-only
else
  git clone "$REPO_URL" "$APP_DIR"
fi
cd "$APP_DIR"

# 4) .env dosyası (varsa üzerine yazmaz)
if [ ! -f .env ]; then
  cp .env.example .env
  # DATABASE_URL'ı production'a çevir
  sed -i 's|file:./prisma/dev.db|file:./prisma/prod.db|' .env
  echo "==> .env oluşturuldu. Lütfen /opt/zeytinyagi-premium/.env içindeki"
  echo "    ADMIN_PASSWORD değerini değiştirmeyi UNUTMAYIN!"
else
  echo "==> .env zaten var, korunuyor."
fi

# 5) Bağımlılıklar
echo "==> npm ci çalıştırılıyor (better-sqlite3 derlenebilir, 1-2 dk sürebilir)..."
npm ci

# 6) Prisma client + veritabanı
echo "==> Prisma generate + db push..."
npx prisma generate
npx prisma db push --skip-generate

# 7) Build
echo "==> Next.js production build..."
export NEXT_TELEMETRY_DISABLED=1
export NEXT_NO_UPDATE_CHECK=1
npm run build

# 8) PM2 ile process yönetimi
echo "==> PM2 kuruluyor..."
npm install -g pm2
pm2 delete zeytinyagi-premium >/dev/null 2>&1 || true
pm2 start deploy/ecosystem.config.cjs --env production
pm2 save
pm2 startup
systemctl enable pm2-root 2>/dev/null || true

# 9) Nginx
echo "==> Nginx kuruluyor..."
apt-get install -y -qq nginx
# Proxy config'i yaz (port 3000)
cat > /etc/nginx/sites-available/zeytinyagi-premium <<'NGINX'
server {
    listen 80;
    server_name _;
    client_max_body_size 25m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX
ln -sf /etc/nginx/sites-available/zeytinyagi-premium /etc/nginx/sites-enabled/zeytinyagi-premium
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# 10) SSL (alan adı verildiyse)
if [ -n "$DOMAIN" ]; then
  echo "==> SSL sertifika alınıyor: $DOMAIN"
  apt-get install -y -qq certbot python3-certbot-nginx
  sed -i "s|server_name _;|server_name $DOMAIN;|" /etc/nginx/sites-available/zeytinyagi-premium
  nginx -t && systemctl reload nginx
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN" || true
fi

echo ""
echo "============================================================"
echo " Kurulum tamamlandı!"
echo "  Uygulama: $APP_DIR"
echo "  Port: 3000 (Nginx üzerinden 80'e proxy)"
echo "  Alan adınızı /etc/nginx/sites-available/zeytinyagi-premium içinde ayarlayın"
echo "  ve gerekirse SSL'i manuel alın (alan adınızı vermediyseniz):"
echo "     certbot --nginx -d alanadi.com -d www.alanadi.com"
echo "  PM2 durumu: pm2 status"
echo "  Loglar: pm2 logs zeytinyagi-premium"
echo "============================================================"
