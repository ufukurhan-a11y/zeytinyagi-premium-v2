import { cookies } from "next/headers";

const SESSION_COOKIE = "admin_session";
const SESSION_KEY = "yusuf2024"; // şifre .env üzerinden okunur, default bu

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? SESSION_KEY;
}

/**
 * Basit cookie tabanlı auth kontrolü.
 * /admin/* route'larında ve admin API route'larında kullanılır.
 */
export async function isAdminAuthed(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  // Basit: token = sha256(password + salt) gibi bir değer değil,
  // sadece "authenticated" flag'i — şifre kontrolü login route'unda yapılır.
  return token === "active";
}

/**
 * Login API route'unda: şifre doğruysa cookie set et.
 */
export async function login(password: string): Promise<boolean> {
  if (password !== getAdminPassword()) return false;
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "active", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 gün
  });
  return true;
}

/**
 * Çıkış: cookie'yi sil.
 */
export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}