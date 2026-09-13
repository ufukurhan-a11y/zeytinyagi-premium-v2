# 🚀 Zeytinyağı Premium — Hostinger VPS Canlıya Alma Rehberi

> **Yöntem:** GitHub deposundan Hostinger KVM VPS'ye kurulum.
> Proje Next.js 16 + Prisma (SQLite) kullanıyor — paylaşımlı hosting (cPanel/PHP)
> **desteklemez**, bu yüzden **VPS** (KVM 2 veya üstü) gerekir.

---

## 1. Hostinger'da VPS Alma

1. Hostinger hesabınızla giriş yapın → **VPS** bölümü
2. Plan: **KVM 2** (2 vCPU, 4GB RAM) yeterli — daha düşük planlar build sırasında
   bellek sorunu yaşatabilir
3. OS: **Ubuntu 24.04** seçin
4. Konum: **Istanbul / Frankfurt** (Türkiye müşterilerine yakın)
5. Kurulum sonunda SSH bilgilerini (IP, root şifresi) not edin

---

## 2. GitHub'a Erişim (VPS'ten)

VPS'ten GitHub'a erişmek için iki yol var:

### Yol A: Personal Access Token (en kolayı)
1. GitHub → Settings → Developer settings → **Personal access tokens** →
   **Tokens (classic)** → **Generate new token (classic)**
2. İsim: `hostinger-vps`, scope: **repo** (read-only yeterli)
3. Token'ı kopyalayın (bir daha gösterilmez!)

### Yol B: SSH Deploy Key
```bash
# VPS'te (root ile):
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N ""
cat ~/.ssh/github_deploy.pub
# İçeriği GitHub → repo → Settings → Deploy keys'e ekleyin
```

---

## 3. VPS Kurulumu (5 dakika)

Hostinger panelinden VPS'e **SSH** ile bağlanın:
```bash
ssh root@SUNUCU_IP
```

Ardından:
```bash
# 1) Gerekli bağımlılıkları tek seferde kuralım (opsiyonel, setup script zaten kurar)

# 2) Repo'yu klonlayın (token ile):
cd /opt
git clone https://TOKEN_GIRIN@github.com/ufukurhan-a11y/zeytinyagi-premium-v2.git zeytinyagi-premium

# 3) .env hazırlayın:
cd zeytinyagi-premium
cp .env.example .env
nano .env
```

`.env` içeriği:
```ini
DATABASE_URL="file:./prisma/prod.db"
ADMIN_PASSWORD="buraya_guclu_sifre_yazin"
```
> ⚠️ `DATABASE_URL`'yi **prod.db** olarak değiştirin ve
> `ADMIN_PASSWORD`'u dev aynısını bırakmayın.

```bash
# 4) Bağımlılıklar + build + prisma:
npm ci
npx prisma generate
npx prisma db push
npm run build

# 5) PM2 ile process yönetimi:
npm i -g pm2
mkdir -p logs
pm2 start node_modules/.bin/next --name zeytinyagi-premium -p 3000
pm2 save
pm2 startup   # reboot sonrası otomatik başlat

# 6) Nginx reverse proxy:
apt update && apt install -y nginx certbot python3-certbot-nginx
cp deploy/nginx.conf /etc/nginx/sites-available/zeytinyagi-premium
# Alan adınızı düzenleyin:
nano /etc/nginx/sites-available/zeytinyagi-premium
ln -s /etc/nginx/sites-available/zeytinyagi-premium /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

### SSL (alan adınız VPS IP'sine işaret ediyorsa)
```bash
certbot --nginx -d zeytinyagi.com -d www.zeytinyagi.com
```

---

## 4. DNS Yönlendirmesi (Hostinger veya alan adı sağlayıcınızda)

| Kayıt | Tür  | Değer        |
|-------|------|--------------|
| `@`   | A    | `SUNUCU_IP`  |
| `www` | CNAME| `@`          |

DNS 10 dk–24 saat içinde yayılır.

---

## 5. Günlük İşlemler

```bash
pm2 status                      # uygulama durumu
pm2 logs zeytinyagi-premium    # loglar
pm2 restart zeytinyagi-premium # yeniden başlat

# Yeni kod yayınlamak için:
cd /opt/zeytinyagi-premium
git pull
npm ci            # sadece package.json değiştiyse
npx prisma db push # sadece schema değiştiyse
npm run build
pm2 restart zeytinyagi-premium
```

---

## 6. Yedekleme (SQLite veritabanı)

```bash
# Günlük otomatik yedek (cron):
crontab -e
# Ekleyin:
0 3 * * * sqlite3 /opt/zeytinyagi-premium/prisma/prod.db ".backup '/opt/backup/zeytinyagi_$(date +\%F).db'"
# (önce: mkdir -p /opt/backup)
```

---

## ⚠️ Sık Karşılaşılan Sorunlar

| Sorun | Çözüm |
|-------|-------|
| `better-sqlite3` native modül hata veriyor | `apt install -y build-essential python3` sonrası `npm rebuild better-sqlite3` |
| Build sırasında OOM (bellegi doldurdu) | Swap ekleyin: `fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile` |
| Site açılmıyor | `pm2 status` → süreç dead mi? `pm2 logs` ile hata mesajına bakın |
| HTTPS reddediliyor | `certbot renew` çalıştırın, `nginx -t` ile config hatası kontrol edin |
| Yükleme yavaş | `npm ci` ilk seferinde daha uzun sürer, cache oluşunca hızlılaşır |

---

*Rehber: Next.js 16.3.4, Prisma 7 (better-sqlite3), Node 22 üzerine yazılmıştır.*
