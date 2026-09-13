import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminAuthed } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { fmtTL } from "@/lib/format";
import { PAYMENT_LABELS } from "@/lib/orders";
import { StatusBadge } from "@/app/admin/page";
import { StatusChanger } from "@/components/admin/StatusChanger";
import { ReceiptCard } from "@/components/admin/ReceiptCard";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
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

  return (
    <div>
      <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl font-semibold tracking-tight">
              {order.orderNo}
            </h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            {new Date(order.createdAt).toLocaleString("tr-TR")} ·{" "}
            {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
          </p>
          {/* Kapıda Ödeme netleştirme — çalışan "ne kadar tahsil edilecek"i
              buradan görür. Tutar müşteriye yazılacak NET toplamdır (KDV hariç). */}
          {order.paymentMethod === "cod" && (
            <div className="mt-2 rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white">
              KAPIYA ÖDENECEK TUTAR: {fmtTL(order.total)}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/orders/${order.id}/label`}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 print:hidden"
          >
            🖨 Kargo Etiketi Yazdır
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-700 transition hover:bg-neutral-50 print:hidden"
          >
            ← Listeye Dön
          </Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Müşteri + Teslimat */}
        <section className="lg:col-span-1">
          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Müşteri & Teslimat
            </h2>
            <dl className="space-y-2.5 text-sm">
              <div>
                <dt className="text-[11px] text-neutral-400">Ad Soyad</dt>
                <dd className="font-medium text-neutral-900">{order.customer.name}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-neutral-400">Telefon</dt>
                <dd className="font-mono text-neutral-800">{order.customer.phone}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-neutral-400">Teslimat Adresi</dt>
                <dd className="text-neutral-800">
                  {order.customer.city} / {order.customer.district}
                  <br />
                  {order.customer.address}
                </dd>
              </div>
              {order.note && (
                <div>
                  <dt className="text-[11px] text-neutral-400">Müşteri Notu</dt>
                  <dd className="text-neutral-800">{order.note}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Durum Değiştir
            </h2>
            <StatusChanger
              orderId={order.id}
              currentStatus={order.status}
            />
          </div>

          {/* Dekont — IBAN/havale siparişlerinde dekont fotoğrafı yüklendiğinde
              sipariş otomatik "paid" olur ve Meta CAPI Purchase tetiklenir. */}
          <ReceiptCard
            orderId={order.id}
            orderNo={order.orderNo}
            receipt={order.receipt}
            receiptAt={order.receiptAt ? order.receiptAt.toISOString() : null}
            receiptBy={order.receiptBy}
            paymentMethod={order.paymentMethod}
            status={order.status}
          />
        </section>

        {/* Ürünler + Ödeme */}
        <section className="lg:col-span-2">
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <div className="border-b border-neutral-100 px-5 py-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Sipariş Ürünleri
              </h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-[11px] uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-2 text-left">Ürün</th>
                  <th className="px-4 py-2 text-center">Adet</th>
                  <th className="px-4 py-2 text-right">Birim</th>
                  <th className="px-4 py-2 text-right">Toplam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {order.items.map((i) => (
                  <tr key={i.id}>
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-neutral-900">{i.label}</div>
                      <div className="text-[11px] text-neutral-500">{i.sublabel}</div>
                    </td>
                    <td className="px-4 py-2.5 text-center tabular-nums text-neutral-700">
                      {i.qty}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-neutral-700">
                      {fmtTL(i.price)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium tabular-nums text-neutral-900">
                      {fmtTL(i.price * i.qty)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-neutral-200 bg-neutral-50">
                  <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-neutral-700">
                    Toplam
                  </td>
                  <td className="px-4 py-3 text-right font-serif text-lg font-semibold tabular-nums text-neutral-900">
                    {fmtTL(order.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
