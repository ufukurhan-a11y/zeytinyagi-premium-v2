import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";
import { isAdminAuthed } from "@/lib/auth";
import { sendPurchaseViaConversionsApi } from "@/lib/conversions";

export const dynamic = "force-dynamic";

const RECEIPTS_DIR = join(process.cwd(), "public", "receipts");
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * POST /api/admin/orders/[id]/receipt
 *
 * Dekont (IBAN/havale) yüklemesi:
 *  1) Dosya (jpeg/png/webp, ≤5MB) `public/receipts/{orderNo}.{ext}` olarak kaydedilir.
 *  2) Sipariş otomatik olarak "paid" durumuna geçirilir + dekont yolu/zamanı yazılır.
 *  3) Meta Conversions API ile Purchase tetiklenir (CAPI erişim anahtarı yoksa
 *     nazikçe atlanır, sipariş yine de paid kalır).
 *
 * Böylece IBAN/havale doğrulaması yöneticinin yerini sistem yapar:
 * dekont fotoğrafı geldiği an ödeme "alınmış" kabul edilir.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Yetki gerekli" }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    select: { orderNo: true, status: true, total: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek — form data bekleniyor" },
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

  // Güvenli dosya adı: orderNo + uzantı (orderNo cuid benzeri karakterlerden oluşur)
  const ext =
    file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const safeOrderNo = order.orderNo.replace(/[^a-zA-Z0-9_-]/g, "");
  const fileName = `${safeOrderNo}.${ext}`;
  const receiptPath = `/receipts/${fileName}`;

  const bytes = Buffer.from(await file.arrayBuffer());
  await mkdir(RECEIPTS_DIR, { recursive: true });
  await writeFile(join(RECEIPTS_DIR, fileName), bytes);

  // 1) Dekontu kaydet + otomatik "paid"
  const updated = await prisma.order.update({
    where: { id },
    data: {
      receipt: receiptPath,
      receiptAt: new Date(),
      receiptBy: "admin",
      status: "paid",
    },
    select: { orderNo: true, status: true, total: true },
  });

  // 2) CAPI Purchase — aslına bağlı olarak anahtar yoksa nazikçe atlanır
  let capi: { sent: boolean; reason?: string } = { sent: false };
  try {
    capi = await sendPurchaseViaConversionsApi(id);
    if (!capi.sent) {
      console.warn(`[receipt] Purchase CAPI gönderilemedi: ${capi.reason}`);
    }
  } catch (e) {
    console.error("[receipt] CAPI hata:", e);
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
