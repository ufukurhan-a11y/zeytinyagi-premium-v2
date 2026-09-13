import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthed } from "@/lib/auth";
import { sendPurchaseViaConversionsApi } from "@/lib/conversions";

export const dynamic = "force-dynamic";

const VALID_STATUS = ["new", "paid", "preparing", "shipped", "delivered", "cancelled"];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Yetki gerekli" }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { customer: true, items: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
  }
  return NextResponse.json(order);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Yetki gerekli" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await req.json();
  if (!status || !VALID_STATUS.includes(status)) {
    return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: { customer: true, items: true },
  });

  // Ödeme doğrulandı (paid) olduğunda Purchase'ı Meta Conversions API ile gönder.
  // Havale/kapıda ödeme sonradan doğrulanacağı için satın alma yalnızca
  // bu aşamada, sunucudan Meta'ya işlenir. WhatsApp tıklaması, ödeme
  // yöntemi seçimi veya ödenmemiş sipariş asla Purchase tetiklemez.
  if (status === "paid") {
    const res = await sendPurchaseViaConversionsApi(id);
    if (!res.sent) {
      console.warn(`[admin] Purchase CAPI gönderilemedi: ${res.reason}`);
    }
  }

  return NextResponse.json(order);
}
