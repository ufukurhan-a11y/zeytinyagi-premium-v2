import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";
import { sendPurchaseViaConversionsApi } from "@/lib/conversions";

export const dynamic = "force-dynamic";

const RECEIPTS_DIR = join(process.cwd(), "public", "receipts");
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * POST /api/orders/receipt
 *
 * MÜŞTERİ tarafı dekont (IBAN/havale) yüklemesi — admin yetkisi GEREKMEZ.
 *
 * Form data alanları:
 *  - orderNo: string (sipariş numarası, zorunlu)
 *  - file: File (JPG/PNG/WEBP, ≤5MB)
 *
 * Akış:
 *  1) orderNo ile sipariş bulunur; mevcut değilse 404.
 *  2) Sipariş "delivered"/"cancelled" değilse kabul edilir; dekont önceki
 *     yükleme üzerine yazar (idempotent).
 *  3) Dosya `public/receipts/{orderNo}.{ext}` olarak kaydedilir;
 *     `receipt` + `receiptAt` + `receiptBy="customer"` + `status="paid"`
 *     güncellenir.
 *  4) Meta Conversions API ile Purchase tetiklenir (CAPI erişim anahtarı
 *     yoksa nazikçe atlanır, sipariş yine de "paid" kalır).
 */
export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek — form data bekleniyor" },
      { status: 400 }
    );
  }

  const orderNo = form.get("orderNo")?.toString().trim();
  if (!orderNo) {
    return NextResponse.json({ error: "orderNo eksik" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { orderNo },
    select: { id: true, orderNo: true, status: true, total: true, receipt: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
  }

  // Teslim edilmiş / iptal edilmiş siparişe dekont kabul et
  if (order.status === "delivered" || order.status === "cancelled") {
    return NextResponse.json(
      { error: "Bu siparişe dekont yüklenemez (teslim edildi / iptal)" },
      { status: 400 }
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Dekont dosyası eksik" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Yalnızca JPG / PNG / WEBP dekont kabul edilir" },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Dosya en fazla 5MB olabilir" },
      { status: 400 }
    );
  }

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";
  const safeOrderNo = order.orderNo.replace(/[^a-zA-Z0-9_-]/g, "");
  const fileName = `${safeOrderNo}.${ext}`;
  const receiptPath = `/receipts/${fileName}`;

  const bytes = Buffer.from(await file.arrayBuffer());
  await mkdir(RECEIPTS_DIR, { recursive: true });
  await writeFile(join(RECEIPTS_DIR, fileName), bytes);

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      receipt: receiptPath,
      receiptAt: new Date(),
      receiptBy: "customer",
      status: "paid",
    },
    select: { orderNo: true, status: true, total: true },
  });

  let capi: { sent: boolean; reason?: string } = { sent: false };
  try {
    capi = await sendPurchaseViaConversionsApi(order.id);
    if (!capi.sent) {
      console.warn(
        `[receipt-customer] Purchase CAPI gönderilemedi: ${capi.reason}`
      );
    }
  } catch (e) {
    console.error("[receipt-customer] CAPI hata:", e);
  }

  return NextResponse.json({
    orderNo: updated.orderNo,
    status: updated.status,
    receipt: receiptPath,
    receiptAt: new Date().toISOString(),
    capi: capi.sent
      ? { sent: true }
      : { sent: false, reason: capi.reason ?? "skipped" },
  });
}
