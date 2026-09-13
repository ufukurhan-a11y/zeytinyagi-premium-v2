import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthed } from "@/lib/auth";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const VALID_STATUS = ["new", "preparing", "shipped", "delivered", "cancelled"];

/**
 * GET /api/admin/orders
 * Query: ?status= ?search= ?page=1 &limit=20
 */
export async function GET(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Yetki gerekli" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const search = searchParams.get("search")?.trim() || undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const skip = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = {};
  if (status && VALID_STATUS.includes(status)) where.status = status;
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

  return NextResponse.json({ orders, total, page, limit, totalPages: Math.ceil(total / limit) });
}
