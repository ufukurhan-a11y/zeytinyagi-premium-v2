#!/bin/zsh
# ============================================================
# Zeytinci Yusuf — Geliştirme Sunucusu Başlatıcı
# Kullanım: ./start-dev.zsh
# Adres:   http://127.0.0.1:3000
# ============================================================
set -e

# 1) Projeye güvenli geç (başarısız olursa durdur)
cd /Users/ufukurhan/Desktop/zeytinyagi-premium || {
  echo "HATA: Proje dizinine gecilemedi"
  exit 1
}

# 2) Node sürümü — fnm varsayılanı (Node 22.x). Node 24 bu projede sorun yaratabilir.
export PATH="$HOME/.local/share/fnm/aliases/default/bin:$PATH"
NODE_VER=$(node --version 2>/dev/null || echo "bulunamadı")
echo "Node: ${NODE_VER}"

# 3) Telemetri ve güncel kontrol kapalı (takılmayı önler)
export NEXT_TELEMETRY_DISABLED=1
export NEXT_NO_UPDATE_CHECK=1

PORT=3000

# 4) Zaten çalışıyor mu? (çift sunucu çakışmasını önle)
if lsof -nP -iTCP:${PORT} -sTCP:LISTEN >/dev/null 2>&1; then
  PID=$(lsof -nP -iTCP:${PORT} -sTCP:LISTEN | tail -1 | awk '{print $2}')
  echo "⚠ Port ${PORT} üzerinde zaten bir sunucu çalışıyor (PID ${PID})."
  echo "  Yenisini başlatmiyorum. Adres: http://127.0.0.1:${PORT}"
  exit 0
fi

# 5) Bağımlılıklar hazır mı?
if [ ! -d node_modules ]; then
  echo "node_modules yok, npm ci ile kuruluyor..."
  npm ci
fi

# 6) Prisma client mevcut mu?
if [ ! -f node_modules/.prisma/client/index.js ]; then
  echo "Prisma client oluşturuluyor..."
  npx prisma generate
fi

# 7) Sunucuyu ÖNPLANDA başlat (hatalar görünsün, hang olursa belli olsun)
#    --turbopack: Next 16 varsayılanı, temiz kurulumda sorunsuz çalışıyor.
#    Hang olursa: ./start-dev.zsh --webpack  (yedek mod)
if [ "$1" = "--webpack" ]; then
  echo "Sunucu başlatılıyor (webpack modu, localhost:3000)..."
  npx next dev --webpack --hostname 127.0.0.1 --port ${PORT}
else
  echo "Sunucu başlatılıyor (Turbopack modu, localhost:3000)..."
  npx next dev --turbopack --hostname 127.0.0.1 --port ${PORT}
fi
