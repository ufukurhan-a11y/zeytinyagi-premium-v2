import { cookies } from "next/headers";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const SESSION_COOKIE = "admin_session";
const SESSION_TTL_SEC = 24 * 60 * 60; // 24 saat

/**
 * Admin şifresi — .env üzerinden, sabit varsayılan yok.
 * ADMIN_PASSWORD env değişkeni zorunludur; tanımlı değilse login başarısız.
 */
function getAdminPassword(): string {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd || pwd.length < 8) return "";
  return pwd;
}

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) return "";
  return secret;
}

function computeHmac(input: string, secret: string): string {
  return createHmac("sha256", secret).update(input).digest("hex");
}

function timingSafeHmacEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Güvenli oturum cookie'si üret.
 * Token: sessionId.expiryHmac
 * - sessionId: 32-byte random (hex, 64 char)
 * - expiryHmac: HMAC-SHA256(secret, sessionId.expiryUnix)
 *
 * Sunucu, cookie'deki expiry değerini tekrar hesaplayarak doğrular.
 */
export function createSessionCookieValue(): string | null {
  const secret = getSessionSecret();
  if (!secret) return null;
  const sessionId = randomBytes(32).toString("hex");
  const expiryUnix = Math.floor(Date.now() / 1000) + SESSION_TTL_SEC;
  const hmac = computeHmac(`${sessionId}.${expiryUnix}`, secret);
  return `${sessionId}.${expiryUnix}.${hmac}`;
}

export async function setAdminSessionCookie(): Promise<boolean> {
  const value = createSessionCookieValue();
  if (!value) return false;
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SEC,
  });
  return true;
}

/**
 * Şifre doğruysa güvenli cookie set et.
 */
export async function login(password: string): Promise<boolean> {
  const expected = getAdminPassword();
  if (!expected || password !== expected) return false;
  return await setAdminSessionCookie();
}

/**
 * Cookie doğrulama: token'ı sunucu tarafında tekrar hesapla.
 * Format: sessionId.expiryUnix.hmac
 */
export async function isAdminAuthed(): Promise<boolean> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return false;
  const parts = raw.split(".");
  if (parts.length !== 3) return false;
  const [sessionId, expiryStr, providedHmac] = parts;
  const expiryUnix = Number(expiryStr);
  if (!Number.isInteger(expiryUnix) || expiryUnix * 1000 < Date.now()) {
    return false; // süresi dolmuş
  }
  if (sessionId.length !== 64) return false;
  const secret = getSessionSecret();
  if (!secret) return false;
  const expectedHmac = computeHmac(`${sessionId}.${expiryStr}`, secret);
  return timingSafeHmacEqual(providedHmac, expectedHmac);
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
