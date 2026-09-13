import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fmtTL } from "@/lib/format";
import { PAYMENT_LABELS, ORDER_STATUSES, type OrderStatus } from "@/lib/orders";
import { OrdersFilters } from "@/components/admin/OrdersFilters";
import { StatusBadge } from "@/app/admin/page";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1", 10));
  const limit = 20;
  const skip = (page - 1) * limit;

  const status: OrderStatus | undefined = sp.status && ORDER_STATUSES.includes(sp.status as OrderStatus)
    ? (sp.status as OrderStatus)
    : undefined;
  const search = sp.search?.trim() || undefined;

  // Prisma 7: where input type'i clientten türetiyoruz; basit string tabanli
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    const digits = search.replace(/\D/g, "");
    where.OR = [
      { orderNo: { contains: search } },
      { customer: { name: { contains: search } } },
      ...(digits ? [{ customer: { phone: { contains: digits } } }] : []),
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { customer: true, items: true },
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight">Siparişler</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Toplam {total} sipariş · Sayfa {page} / {totalPages}
          </p>
        </div>
        <OrdersFilters search={search} status={status} />
      </header>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-sm text-neutral-500">
            Filtreye uygun sipariş bulunamadı.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-[11px] uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-2.5">Sipariş</th>
                <th className="px-4 py-2.5">Müşteri</th>
                <th className="px-4 py-2.5">Ürün</th>
                <th className="px-4 py-2.5">Ödeme</th>
                <th className="px-4 py-2.5">Durum</th>
                <th className="px-4 py-2.5 text-right">Tutar</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <a
                      href={`/admin/orders/${o.id}`}
                      className="font-medium text-neutral-900 underline-offset-2 hover:underline"
                    >
                      {o.orderNo}
                    </a>
                    <div className="text-[11px] text-neutral-500">
                      {new Date(o.createdAt).toLocaleDateString("tr-TR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-neutral-900">{o.customer.name}</div>
                    <div className="text-[11px] text-neutral-500">{o.customer.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {o.items
                      .map((i) => `${i.label} × ${i.qty}`)
                      .join(", ")}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">
                    {fmtTL(o.total)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`/admin/orders/${o.id}`}
                      className="text-xs font-medium text-neutral-600 underline-offset-2 hover:text-neutral-900 hover:underline"
                    >
                      Detay →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <nav className="mt-4 flex items-center gap-2 text-sm">
          {page > 1 && (
            <a
              href={`/admin/orders${status ? `?status=${status}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}&page=${page - 1}`}
              className="rounded-md border border-neutral-300 px-3 py-1.5 hover:bg-neutral-50"
            >
              ← Önceki
            </a>
          )}
          <span className="text-neutral-500">
            Sayfa {page} / {totalPages}
          </span>
          {page < totalPages && (
            <a
              href={`/admin/orders${status ? `?status=${status}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}&page=${page + 1}`}
              className="rounded-md border border-neutral-300 px-3 py-1.5 hover:bg-neutral-50"
            >
              Sonraki →
            </a>
          )}
        </nav>
      )}
    </div>
  );
}
