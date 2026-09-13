# Admin Paneli + Sipariş Akışı — Mimari Plan

## 1. Mevcut Durum (Teşhis)
- `prisma/schema.prisma`: `Customer`, `Order`, `OrderItem` modelleri hazır, ama `datasource` bloğunda **`url` alanı eksik** → Prisma CLI (`prisma migrate`, `prisma db push`) çalışmaz.
- `src/lib/auth.ts`: cookie tabanlı admin auth hazır (`login()`, `isAdminAuthed()`, `logout()`), ama hiçbir route onu kullanmıyor.
- `src/components/features/CartDrawer.tsx`: Müşteri formu (ad soyad, telefon, il, ilçe, adres, not, ödeme yöntemi) → **sadece WhatsApp'a mesaj göndertiyor**, veritabanına hiçbir şey yazmıyor.
- Hiç API route yok, hiç `/admin` sayfası yok.

## 2. Hedef Akış
1. **Müşteri** `CartDrawer` içinde siparişi onaylar → `POST /api/orders` ile DB'ye yazılır **VE** aynı aninda WhatsApp açılır (mevcut akış korunur, ama artık `orderNo` gerçek DB'den gelir: `ZY-XXXX`).
2. **Admin** `./start-dev.zsh` ile sunucuyu başlatır → tarayıcıda `http://127.0.0.1:3000/admin` açar → şifre girer (`ADMIN_PASSWORD` env'i, default `yusuf2024`).
3. **Dashboard**: toplam sipariş, bekleyen sipariş, ciro, en çok satan ürün.
4. **Sipariş listesi** (`/admin/orders`): durum filtresi (yeni / hazırlanıyor / kargoda / teslim edildi), arama, sayfalama.
5. **Sipariş detayı** (`/admin/orders/[id]`): müşteri bilgileri + ürün listesi + durum değiştirme butonları + **Kargolama Etiketi** basım düğmesi.
6. **Kargolama etiketi** (`/admin/orders/[id]/label`): A6 boy, `@media print` ile **sadece etiket** basılır; `window.print()` tetiklenir. Ad soyad / telefon / il / ilçe / adres / sipariş no / ürün özeti gösterilir.

## 3. Dosya Planı (Oluşturulacak / Değiştirilecek)

### A. Prisma (Altyapı)
- `prisma/schema.prisma`
  - `datasource db { provider = "sqlite"; url = "file:./dev.db" }` eklenir (CLI için gerekli; runtime driver adapter olduğu için uygulama tarafında `DATABASE_URL` env'i de tanımlanacak: `prisma/dev.db` göreceli yolu).
  - `Order.status` String → enum gibi davranacak, ama `new|preparing|shipped|delivered|cancelled` değerlerini sabitleyen bir `OrderStatus` enum eklenir (SQLite enum desteklemez; string + uygulama tarafında enum tipi kullanılır, şemada `String` kalır ama TS tarafında enum sabiti tanımlanır).
  - `Customer.phone` unique kalır (yeniden siparişte aynı müşteri buluşsun).
- `prisma/dev.db`: `prisma db push` ile şema uygulanır (migration değil, dev ortam).
- `.env` (yeni, .gitignore'lu): `DATABASE_URL="file:./prisma/dev.db"` ve `ADMIN_PASSWORD="yusuf2024"` (sonra kullanıcı kendi şifresini koyacak).

### B. API Route'lar (Next.js App Router, `route.ts` — Node.js runtime varsayılan)
- `src/app/api/orders/route.ts` — `POST`: sepet + teslimat + ödeme → `customer` (upsert by phone) + `order` + `orderItems` yazar; `{ orderNo, id }` döner. (Auth gereksiz, public.)
- `src/app/api/admin/login/route.ts` — `POST`: şifre kontrolü → `auth.ts`'in `login()` fonksiyonunu kullanır.
- `src/app/api/admin/logout/route.ts` — `POST`: `auth.ts`'in `logout()`.
- `src/app/api/admin/orders/route.ts` — `GET`: liste (`?status=`, `?search=`, `?page=`, `?limit=`); `isAdminAuthed()` guard'ı.
- `src/app/api/admin/orders/[id]/route.ts` — `GET` (detay, müşteri+ürünler ile) + `PATCH` (status değiştirmek); `isAdminAuthed()`.
- `src/app/api/admin/summary/route.ts` — `GET`: dashboard verileri (toplam, bekleyen, ciro, en çok satan ürün). `isAdminAuthed()`.

### C. Admin Sayfaları (Tailwind, App Router, layout + `loading.tsx` seçeneği)
- `src/app/admin/layout.tsx` — Admin'e özel layout (sidebar: Dashboard, Siparişler, Çıkış; `isAdminAuthed()` kontrolü, oturum yoksa redirect `/admin/login`).
- `src/app/admin/page.tsx` — Dashboard (yukarıdaki metrikler, son 5 sipariş).
- `src/app/admin/orders/page.tsx` — Liste (tablo, durum badge'leri, arama kutusu, sayfalama, detaya link).
- `src/app/admin/orders/[id]/page.tsx` — Detay (müşteri, ürünler, ödeme, durum değiştirme butonları, **"Etiketi Yazdır"** butonu → `/admin/orders/[id]/label`).
- `src/app/admin/orders/[id]/label/page.tsx` — **Kargolama etiketi** (A6, `@media print` ile sayfa temizlenir, sadece etiket basılır; `useEffect` ile otomatik `window.print()` tetikler + manuel basım butonu + "Geri" butonu).
- `src/app/admin/login/page.tsx` — Login formu (şifre, `POST /api/admin/login`, hata mesajı).

### D. Front-End (Müşteri Tarafı)
- `src/components/features/CartDrawer.tsx` — `CheckoutStep.handleSubmit`:
  1. `POST /api/orders` ile siparişi DB'ye yazar (response `orderNo` döner).
  2. `orderNo` alınınca mevcut WhatsApp akışını aynen korur, ama `orderNo` artık gerçek (ZY-XXXX) → mesajda kullanılır.
  3. `onComplete(orderNo)` ile "done" adımı gösterilir; müşteriye "Sipariş No: ZY-XXXX · Kargonuz hazırlanacak" + IBAN/havale dekontu ibaresi eklenir (mevcut "Dekontu iletin" notu korunur).
- `src/lib/business.ts` — değişiklik yok, ama gerekirse `LABEL_PRINT` yapılandırması eklenir (etiket şablonu ayarları: A6).

### E. Güvenlik
- `auth.ts` zaten cookie tabanlı; `isAdminAuthed()` her admin API route'unda ve admin layout'unda kontrol edilecek.
- `ADMIN_PASSWORD` env'i, `.env` dosyasında (default `yusuf2024`, kullanıcı değiştirir).
- `.env` `.gitignore`'a eklenir (zaten var mı kontrol edilecek).
- Public `/api/orders` endpoint'inde basit rate-limit değil, ama `note` alanı `trim()` + max 200 karakter (SQL injection değil, ama spam için).
- Admin tarafında `Order.status` yalnızca tanımlı enum değerleri kabul edilir (PATCH'te doğrulama).

## 4. Uygulama Adımları (Bağımlılık Sırası)
1. `prisma/schema.prisma` onarımı (`url` alanı) + `.env` oluşturma + `prisma db push`.
2. `src/app/api/orders/route.ts` (public POST) — en önce, müşteri akışını çalıştırmak için.
3. `src/app/api/admin/*` route'ları (login, logout, orders, summary).
4. Admin layout + login + dashboard + sipariş listesi + detay + etiket sayfaları.
5. `CartDrawer`'a DB entegrasyonu (`POST /api/orders` çağrısı, orderNo ile devam).
6. `tsc --noEmit` + `eslint` + `curl` ile tüm endpoint'lerin 200/401/403 doğrulaması.
7. Rapor.

## 5. Risk / Not
- SQLite `unique` constraint'de `phone` (müşteri yeniden siparişte aynı phone ile gelir → upsert, yeni müşteri değil).
- `Order` model adı SQLite'da saklı kelime olabilir; Prisma 7 bunu otomatik tırnakla yansıtır (şema çalışır, test edilir).
- Etiket basımı için `@media print` CSS'i `src/app/globals.css` içinde eklenir; sadece etiket sayfasını hedefler.
- Müşteri tarafında DB yazımı başarısız olursa (network, vs.), sipariş yine de WhatsApp'a gönderilir (degrade gracefully), ama `orderNo` "ZY-TS" (timestamp) fallback kullanılır ve müşteriye "Sipariş alındı, WhatsApp'tan onaylıyor olacağız" denir.
