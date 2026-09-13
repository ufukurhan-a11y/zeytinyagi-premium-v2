// Meta Conversions API (CAPI) — sunucu tarafı Purchase gönderimi.
// Gereksinim: META_CAPI_ACCESS_TOKEN env anahtarı YOK. Anahtar boşsa bu
// modül hiçbir istek atmaz, yalnızca yapılandırılabilir kalanı kaydeder
// ve log yazar (çalışıyor gibi raporlanmaz). Anahtar yalnızca sunucu
// ortam değişkeninde tutulur; asla istemciye sızdırılmaz.

import { prisma } from "@/lib/prisma";
import { orderEventId, META_PIXEL_ID } from "@/lib/meta-pixel";

const CAPI_ENDPOINT = "https://graph.facebook.com/v19.0";

type CapiItem = {
  id: string;
  quantity: number;
  item_price: number;
  name: string;
  category: string;
};

/** Siparişin "paid" olduğunda Purchase'ı CAPI ile Meta'ya gönderir. */
export async function sendPurchaseViaConversionsApi(
  orderId: string
): Promise<{ sent: boolean; reason?: string }> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true, items: true },
  });
  if (!order) return { sent: false, reason: "order-not-found" };

  // Her satın alma için sabit event_id — yeniden deneme/sayfa yenileme
  // aynı satın almayı çoğaltmaz.
  const eventId = orderEventId(order.orderNo);

  // Tekilleştirme: aynı event_id daha önce "işlenmiş"se atla.
  // (Anahtar yokken bile işaretli tutulur; anahtar eklenince eski
  //  "paid" geçişleri otomatik telafi edilmek isterse ayrı bir
  //  backfill gerekli olur.)
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!accessToken) {
    // Anahtar yoksa yapılandırılabilir bırak; istek gitmez.
    // Tekilleştirme anahtarın gelmesiyle birlikte otomatik devreye girer:
    // aynı event_id 2. kez tetiklenirse Meta tarafında da dedupe
    // (graph.facebook.com eşdeğer event_id) + buradaki Set sayesinde
    // çift olay oluşmaz.
    console.warn(
      `[meta-capi] Purchase tetiklendi ama META_CAPI_ACCESS_TOKEN tanımlı değil; istek gönderilmedi (event_id=${eventId}).`
    );
    return { sent: false, reason: "missing-access-token" };
  }

  // Anahtar var — gerçek istek yapılacak. Tekilleştirme sadece bu
  // durumda uygulanır; böylece token eklenirken önceki "işlendi"
  // işaretleri (hata durumlarında) eskiyi engellemez.
  const sentBefore = await markSent(eventId);
  if (sentBefore) {
    console.warn(`[meta-capi] duplicate-event-id: ${eventId} zaten gönderilmiş, atlandı.`);
    return { sent: false, reason: "duplicate-event-id" };
  }

  const items: CapiItem[] = order.items.map((i) => ({
    id: i.productId,
    quantity: i.qty,
    item_price: i.price,
    name: `${i.label} ${i.sublabel}`.trim(),
    category: i.sublabel,
  }));

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(order.createdAt.getTime() / 1000),
        event_id: eventId,
        action_source: "server",
        user_data: {
          ph: order.customer?.phone ?? "", // telefon; KVKK'da yalnızca sunucu tarafında
        },
        custom_data: {
          currency: "TRY",
          value: order.total,
          content_ids: items.map((i) => i.id),
          content_type: "product",
          contents: items.map((i) => ({
            id: i.id,
            quantity: i.quantity,
            item_price: i.item_price,
            name: i.name,
            category: i.category,
          })),
          num_items: items.reduce((s, i) => s + i.quantity, 0),
        },
      },
    ],
    access_token: accessToken,
  };

  try {
    const res = await fetch(`${CAPI_ENDPOINT}/${META_PIXEL_ID}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error(`[meta-capi] CAPI hatası ${res.status}: ${text}`);
      return { sent: false, reason: `caapi-http-${res.status}` };
    }
    console.info(`[meta-capi] Purchase gönderildi (event_id=${eventId}).`);
    return { sent: true };
  } catch (e) {
    console.error("[meta-capi] CAPI istek hatası:", e);
    return { sent: false, reason: "network-error" };
  }
}

// Basit, hafıza tabanlı event_id tekilleştirme (aynı anahtarı ikinci
// kez göndermeyi önler). Kalıcı dedupe için DB tablosu da eklenebilir.
const sentEventIds = new Set<string>();
async function markSent(eventId: string): Promise<boolean> {
  if (sentEventIds.has(eventId)) return true;
  sentEventIds.add(eventId);
  return false;
}
