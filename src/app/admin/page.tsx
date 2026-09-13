import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fmtTL } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalOrders,
    newOrders,
    preparing,
    shipped,
    revenueAgg,
    todayRevenueAgg,
    monthRevenueAgg,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "new" } }),
    prisma.order.count({ where: { status: "preparing" } }),
    prisma.order.count({ where: { status: "shipped" } }),
    prisma.order.aggregate({ _sum: { total: true } }).then((r) => r._sum.total ?? 0),
    prisma.order
      .aggregate({
        where: { createdAt: { gte: startOfDay } },
        _sum: { total: true },
      })
      .then((r) => r._sum.total ?? 0),
    prisma.order
      .aggregate({
        where: { createdAt: { gte: startOfMonth } },
        _sum: { total: true },
      })
      .then((r) => r._sum.total ?? 0),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { customer: true, items: true },
    }),
    prisma.orderItem
      .groupBy({ by: ["label"], _sum: { qty: true }, orderBy: { _sum: { qty: "desc" } }, take: 5 })
      .then((rows) =>
        rows.map((r) => ({ label: r.label, qty: r._sum.qty ?? 0 }))
      ),
  ]);

  // Her kartın üstünde "çalışan anlayacak" kısa açıklama — kartın ne anlama
  // geldiğini söyleyen cümle. Renk tonu da aynı anda verilir.
  const cards: Array<{
    label: string;
    value: string | number;
    tone: string;
    desc: string;
  }> = [
    {
      label: "Toplam Sipariş",
      value: totalOrders,
      tone: "neutral",
      desc: "Bugüne kadar siteden gelen tüm siparişler",
    },
    {
      label: "Yeni / Halledilmemiş",
      value: newOrders,
      tone: "amber",
      desc: "Arayın / WhatsApp açın / kargoya verin — ilk adım sizde",
    },
    {
      label: "Hazırlanıyor",
      value: preparing,
      tone: "blue",
      desc: "Paketleniyor — kargoya verilmeyi bekliyor",
    },
    {
      label: "Kargoda",
      value: shipped,
      tone: "green",
      desc: "Kargoda — müşteriye teslim bekleniyor",
    },
    {
      label: "Bugünkü Ciro",
      value: fmtTL(todayRevenueAgg),
      tone: "neutral",
      desc: "Bugün 00:00'dan beri gelen siparişlerin toplamı",
    },
    {
      label: "Bu Ayki Ciro",
      value: fmtTL(monthRevenueAgg),
      tone: "neutral",
      desc: "Ay başından beri gelen siparişlerin toplamı",
    },
    {
      label: "Toplam Ciro",
      value: fmtTL(revenueAgg),
      tone: "neutral",
      desc: "Baştan bu zamana gelen tüm siparişlerin toplamı",
    },
  ];

  const toneCls: Record<string, string> = {
    neutral: "border-neutral-200 bg-white",
    amber: "border-amber-300 bg-amber-50",
    blue: "border-sky-300 bg-sky-50",
    green: "border-emerald-300 bg-emerald-50",
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-serif text-2xl font-semibold tracking-tight">Genel Bakış</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Sipariş akışının özet durumu
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`rounded-lg border p-4 ${toneCls[c.tone]}`}
          >
            <div className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
              {c.label}
            </div>
            <div className="mt-1 font-serif text-2xl font-semibold tabular-nums text-neutral-900">
              {c.value}
            </div>
            <p className="mt-1.5 text-[11px] leading-snug text-neutral-500">{c.desc}</p>
          </div>
        ))}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-neutral-700">
            Son Siparişler
          </h2>
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            {recentOrders.length === 0 ? (
              <div className="p-6 text-sm text-neutral-500">
                Henüz sipariş yok. Mağazadan gelen ilk sipariş burada görünecek.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 text-[11px] uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-4 py-2.5">Sipariş</th>
                    <th className="px-4 py-2.5">Müşteri</th>
                    <th className="px-4 py-2.5">Durum</th>
                    <th className="px-4 py-2.5 text-right">Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <a
                          href={`/admin/orders/${o.id}`}
                          className="font-medium text-neutral-900 underline-offset-2 hover:underline"
                        >
                          {o.orderNo}
                        </a>
                        <div className="text-[11px] text-neutral-500">
                          {new Date(o.createdAt).toLocaleString("tr-TR")}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-700">
                        {o.customer.name}
                        <div className="text-[11px] text-neutral-400">
                          {o.customer.city} / {o.customer.district}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums text-neutral-900">
                        {fmtTL(o.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-neutral-700">
            En Çok Satanlar
          </h2>
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            {topProducts.length === 0 ? (
              <p className="text-sm text-neutral-500">Satış verisi yok.</p>
            ) : (
              <ul className="space-y-3">
                {topProducts.map((p, i) => (
                  <li key={p.label} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-600">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm text-neutral-800">
                      {p.label}
                    </span>
                    <span className="text-sm font-medium tabular-nums text-neutral-900">
                      {p.qty} adet
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "bg-amber-100 text-amber-800",
    paid: "bg-violet-100 text-violet-800",
    preparing: "bg-sky-100 text-sky-800",
    shipped: "bg-emerald-100 text-emerald-800",
    delivered: "bg-neutral-200 text-neutral-700",
    cancelled: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
        map[status] ?? "bg-neutral-100 text-neutral-700"
      }`}
    >
      {STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status}
    </span>
  );
}
