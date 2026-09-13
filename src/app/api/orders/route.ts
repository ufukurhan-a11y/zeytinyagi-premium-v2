import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/orders
 * Müşteri siparişini DB'ye kaydeder.
 * Body: { items: [{productId, label, sublabel, price, qty}], customer: {name, phone, city, district, address, note?}, paymentMethod }
 * Dönüş: { id, orderNo }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, customer, paymentMethod } = body;

    // Doğrulama
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Sepet boş" }, { status: 400 });
    }
    if (!customer?.name || !customer?.phone || !customer?.city || !customer?.district || !customer?.address) {
      return NextResponse.json({ error: "Teslimat bilgileri eksik" }, { status: 400 });
    }
    if (!paymentMethod || !["whatsapp", "iban", "cod"].includes(paymentMethod)) {
      return NextResponse.json({ error: "Geçersiz ödeme yöntemi" }, { status: 400 });
    }

    // Tel validasyonu
    const phoneDigits = customer.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      return NextResponse.json({ error: "Geçersiz telefon numarası" }, { status: 400 });
    }

    // Müşteri upsert (phone unique)
    const normalizedPhone = phoneDigits;
    let cust = await prisma.customer.findUnique({ where: { phone: normalizedPhone } });
    if (!cust) {
      cust = await prisma.customer.create({
        data: {
          name: customer.name.trim(),
          phone: normalizedPhone,
          city: customer.city.trim(),
          district: customer.district.trim(),
          address: customer.address.trim(),
        },
      });
    }

    // Sipariş no üret: ZY + timestamp'in son 4 hanesi
    const orderNo = `ZY-${Date.now().toString().slice(-4)}`;

    type OrderItemPayload = { productId: string; label: string; sublabel: string; price: number; qty: number };
    const total = items.reduce(
      (sum: number, i: OrderItemPayload) => sum + i.price * i.qty,
      0
    );

    const order = await prisma.order.create({
      data: {
        orderNo,
        status: "new",
        total,
        paymentMethod,
        note: customer.note?.trim() || null,
        customer: { connect: { id: cust.id } },
        items: {
          create: items.map((i: OrderItemPayload) => ({
            productId: i.productId,
            label: i.label,
            sublabel: i.sublabel,
            price: i.price,
            qty: i.qty,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ id: order.id, orderNo }, { status: 201 });
  } catch (e) {
    console.error("POST /api/orders hata:", e);
    return NextResponse.json({ error: "Sipariş oluşturulamadı" }, { status: 500 });
  }
}
