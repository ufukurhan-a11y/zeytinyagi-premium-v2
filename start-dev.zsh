#!/bin/zsh
# Zeytinci Yusuf v2 — Geliştirme sunucusu başlatıcı (ön plan)
# Kullanım:
#   ./start-dev.zsh                 # varsayılan: 3001 portu, güvenli admin env'lerini oluşturur
#   PORT=3002 ./start-dev.zsh       # farklı port
#   ADMIN_PASSWORD=xyz12345678 ./start-dev.zsh   # kendi şifreni kullan

set -e

# Proje dizinine geç
cd "$(dirname "$0")" || {
  echo "HATA: Proje dizinine gidilemedi: $(dirname "$0")"
  exit 1
}

# Node sürümü
NODE_VER=$(node --version 2>/dev/null || echo "bulunamadı")
echo "Node: ${NODE_VER}"

# Telemetri ve güncelleme kontrolü kapalı
export NEXT_TELEMETRY_DISABLED=1
export NEXT_NO_UPDATE_CHECK=1

# Varsayılan port 3001 (3000 eski projede kullanılıyor)
PORT="${PORT:-3001}"

# Port doluysa yeni sunucu başlatma
if lsof -nP -iTCP:${PORT} -sTCP:LISTEN >/dev/null 2>&1; then
  PID=$(lsof -nP -iTCP:${PORT} -sTCP:LISTEN | tail -1 | awk '{print $2}')
  echo "PORT_DOLU: ${PORT} üzerinde zaten sunucu çalışıyor (PID ${PID})."
  echo "Yeni sunucu başlatılmadı. Adres: http://127.0.0.1:${PORT}"
  exit 0
fi

# Bağımlılıklar hazır mı
if [ ! -d node_modules ]; then
  echo "node_modules bulunamadı, npm ci çalıştırılıyor..."
  npm ci
fi

# Prisma client
if [ -f "prisma/schema.prisma" ] && [ ! -f "node_modules/.prisma/client/index.js" ]; then
  echo "Prisma client oluşturuluyor..."
  npx prisma generate
fi

# ---- GÜVENLİ ADMIN ENV (yalnızca geliştirme) ----
# Öncelik sırası:
#   1) Zaten ortamda tanımlı değişkenler (örn. komut satırından gelenler)
#   2) .env.local dosyası (Git'e eklenmez; proje kökünde)
#   3) Varsayılan geliştirme değerleri
#
# Geliştirme ortamında admin paneli tarayıcıdan test edilebilsin diye
# .env.local'da ADMIN_PASSWORD, ADMIN_SESSION_SECRET ve DATABASE_URL
# tanımlı olmalıdır. .env.local yoksa yalnızca şifre üretir;
# bu değerler git'e eklenmez.
if [ -f .env.local ]; then
  # .env.local'dan tanımlanmamış değişkenleri oku (override etme)
  if [ -z "${ADMIN_PASSWORD:-}" ]; then
    _val=$(grep -E '^ADMIN_PASSWORD=' .env.local 2>/dev/null | head -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//')
    [ -n "$_val" ] && export ADMIN_PASSWORD="$_val"
  fi
  if [ -z "${ADMIN_SESSION_SECRET:-}" ]; then
    _val=$(grep -E '^ADMIN_SESSION_SECRET=' .env.local 2>/dev/null | head -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//')
    [ -n "$_val" ] && export ADMIN_SESSION_SECRET="$_val"
  fi
  if [ -z "${DATABASE_URL:-}" ]; then
    _val=$(grep -E '^DATABASE_URL=' .env.local 2>/dev/null | head -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//')
    [ -n "$_val" ] && export DATABASE_URL="$_val"
  fi
fi

# Varsayılanlar (yalnızca .env.local yoksa / tanımsızsa)
if [ -z "${DATABASE_URL:-}" ]; then
  export DATABASE_URL="file:./prisma/dev.db"
fi

# .env.local yoksa admin şifre/secret üret ve kullanıcıya bildir
if [ ! -f .env.local ]; then
  if [ -z "${ADMIN_PASSWORD:-}" ]; then
    export ADMIN_PASSWORD="$(openssl rand -base64 18 | tr -d '/+=' | cut -c1-16)"
    _NEW_PWD=1
  fi
  if [ -z "${ADMIN_SESSION_SECRET:-}" ]; then
    export ADMIN_SESSION_SECRET="$(openssl rand -hex 32)"
  fi
fi

if [ -n "${NEW_PWD:-}" ]; then
  # Üretilen değerleri .env.local'a yazarak kalıcılaştırmak
  # istenir; ancak betik yalnızca geliştirme ortamındadır.
  echo "NOT: .env.local bulunamadı; geçici şifre üretildi."
  echo "Kalıcı şifre için .env.local dosyası oluşturun:"
  echo "  ADMIN_PASSWORD=\"<şifre>\""
  echo "  ADMIN_SESSION_SECRET=\"<uzun-rastgele-dizil>\""
  echo "  DATABASE_URL=\"file:./prisma/dev.db\""
  # Geçici üretimi .env.local'a da yaz (bir sonraki çalıştırmada da aynı olsun)
  printf 'DATABASE_URL="%s"\nADMIN_PASSWORD="%s"\nADMIN_SESSION_SECRET="%s"\n' \
    "${DATABASE_URL}" "${ADMIN_PASSWORD}" "${ADMIN_SESSION_SECRET}" > .env.local
fi

# Kullanıcıya loga değil, .env.local'a yönlendir
echo "============================================================"
echo " GELİŞTİRME SUNUCU BAŞLATILIYOR"
echo " Adres      : http://127.0.0.1:${PORT}"
echo " Admin      : http://127.0.0.1:${PORT}/admin/login"
echo " Şifre kaydı: .env.local (ADMIN_PASSWORD)"
echo "============================================================"

echo "Sunucu başlatılıyor (Turbopack, localhost:${PORT})..."
exec npx next dev --turbopack --hostname 127.0.0.1 --port ${PORT}
