import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthed } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/summary
 * Dashboard verileri.
 */
export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Yetki gerekli" }, { status: 401 });
  }

  const [totalOrders, newOrders, preparingOrders, shippedOrders, totalRevenue, recentOrders, topProducts] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "new" } }),
      prisma.order.count({ where: { status: "preparing" } }),
      prisma.order.count({ where: { status: "shipped" } }),
      prisma.order.aggregate({ _sum: { total: true } }).then((r) => r._sum.total ?? 0),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { customer: true, items: true },
      }),
      // En çok satan ürün (qty toplamına göre)
      prisma.orderItem.groupBy({
        by: ["label"],
        _sum: { qty: true, price: true },
        orderBy: { _sum: { qty: "desc" } },
        take: 5,
      }),
    ]);

  return NextResponse.json({
    totalOrders,
    newOrders,
    preparingOrders,
    shippedOrders,
    totalRevenue,
    recentOrders,
    topProducts: topProducts.map((t) => ({
      label: t.label,
      totalQty: t._sum.qty ?? 0,
    })),
  });
}
