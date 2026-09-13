import { redirect, notFound } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fmtTL } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/orders";
import { LabelToolbar } from "@/components/admin/LabelToolbar";
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

  return (
    <div className="admin-label-page">
      {/* Yazdırma araçları — ekranda görünür, basılmada gizli (client component) */}
      <LabelToolbar orderId={order.id} />

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
          {/* Kapıda Ödeme: müşteriye net tutar yazılır — çalışanlar kargoya
              "kapıda tahsil edilecek tutar" bilgisini baksız verir. (KDV hariç,
              müşteri toplamı) */}
          {order.paymentMethod === "cod" && (
            <div className="label-cod">
              <strong>KAPIDA ÖDEME: {fmtTL(order.total)}</strong>
            </div>
          )}
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
