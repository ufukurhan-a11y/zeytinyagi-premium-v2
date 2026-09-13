import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { fmtTL } from "@/lib/format";
import { STATUS_LABELS, PAYMENT_LABELS } from "@/lib/orders";
import "@/app/admin/admin-label.css";

export const dynamic = "force-dynamic";

export default async function ShippingLabelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { customer: true, items: true },
  });
  if (!order) notFound();

  const c = order.customer;
  const fullAddress = `${c.address}, ${c.district} / ${c.city}`;

  return (
    <div className="admin-label-page">
      {/* Yazdırma araçları — ekranda görünür, basılmada gizli */}
      <div className="label-toolbar print:hidden">
        <button
          onClick={() => window.print()}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700"
        >
          🖨 Yazdır
        </button>
        <a
          href={`/admin/orders/${order.id}`}
          className="ml-2 rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-700 transition hover:bg-neutral-50"
        >
          ← Detaya Dön
        </a>
      </div>

      {/* Etiket — A6 (105×148 mm) */}
      <div className="shipping-label mx-auto mt-6 print:mt-0">
        {/* Başlık */}
        <div className="label-head">
          <div className="label-brand">ZEYTİNCİ YUSUF</div>
          <div className="label-sub">Manisa · Kırkağaç · Bakır Mah.</div>
          <div className="label-order-no">
            SİPARİŞ <strong>{order.orderNo}</strong>
          </div>
        </div>

        <hr className="label-rule" />

        {/* Adres bloğu — büyük, okunur */}
        <div className="label-address-block">
          <div className="label-name">{c.name}</div>
          <div className="label-phone">📞 {c.phone}</div>
          <div className="label-city">{c.city} / {c.district}</div>
          <div className="label-street">{c.address}</div>
        </div>

        <hr className="label-rule" />

        {/* Ürün özeti */}
        <div className="label-items">
          {order.items.map((i) => (
            <div key={i.id} className="label-item-row">
              <span className="label-item-name">
                {i.label} {i.sublabel}
              </span>
              <span className="label-item-qty">× {i.qty}</span>
            </div>
          ))}
        </div>

        <div className="label-foot">
          <div>
            Toplam: <strong>{fmtTL(order.total)}</strong>
          </div>
          <div>
            Ödeme: {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
          </div>
          <div>Durum: {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS] ?? order.status}</div>
          {order.note && <div className="label-note">Not: {order.note}</div>}
        </div>

        {/* Kod alanı — el yazımı kargoya geçiş için */}
        <div className="label-scan">
          <span>{order.orderNo}</span>
        </div>
      </div>
    </div>
  );
}
