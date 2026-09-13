import { NextResponse } from "next/server";
import { login } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/login
 * Body: { password }
 */
export async function POST(req: Request) {
  const { password } = await req.json();
  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "Şifre gerekli" }, { status: 400 });
  }
  const ok = await login(password);
  if (!ok) {
    return NextResponse.json({ error: "Hatalı şifre" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
