"use client";

import { useEffect, useRef } from "react";
import {
  META_PIXEL_ID,
  CONSENT_COOKIE,
  orderEventId,
  cartEventId,
  type MetaEventName,
  type MetaProduct,
} from "@/lib/meta-pixel";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown[];
  }
}

/**
 * Çerezden onay durumunu okur: true (kabul) / false (red) / null (karar yok).
 * Sunucuda güvenli varsayılan "null" döner; hiçbir şey yüklenmez.
 */
export function readMetaConsent(): boolean | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${CONSENT_COOKIE}=`));
  const v = m?.split("=")[1];
  if (v === "1") return true;
  if (v === "0") return false;
  return null;
}

/**
 * Onay kararını çereze yazar (1 yıl).
 * Kabul edildiyse pixel'İ ANINDA başlatır; reddedildiyse hiçbir şey yapmaz —
 * zaten hiç yüklenmemiş olan script için temizlik gerekmez.
 */
export function setMetaConsent(granted: boolean) {
  if (typeof window === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${granted ? "1" : "0"}; path=/; max-age=31536000; samesite=lax${secure}`;
  if (granted) initMetaPixel();
}

/** /admin altındakı rotalarda pixel asla çalışmaz (özellik gereği). */
function isAdminRoute(): boolean {
  return (
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/admin")
  );
}

/** fbq()'u tanımlar; henüz yoksa kuyruk kurar ve fbevents.js'i yükler. */
function defineFbq(): (...args: unknown[]) => void {
  const w = window;
  if (typeof w.fbq === "function") {
    return w.fbq;
  }
  w._fbq = [];
  const fbq = ((...args: unknown[]) => {
    (w._fbq ??= []).push(args);
  }) as (...args: unknown[]) => void;
  w.fbq = fbq;
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  const first = document.getElementsByTagName("script")[0];
  first?.parentNode?.insertBefore(script, first ?? undefined);
  return fbq;
}

/**
 * Pixel'i başlatır. YALNIZCA onay verildikten sonra çağrılmalı:
 * onay yokken bu fonksiyon hiçbir yerden tetiklenmez, script yüklenmez,
 * Meta'ya hiçbir istek gitmez (KVKK).
 */
function initMetaPixel() {
  if (isAdminRoute()) return;
  const f = defineFbq();
  f("init", META_PIXEL_ID);
  f("track", "PageView");
}

/**
 * Kök layout'a monte edilir; ekranda hiçbir şey çizmez.
 * Sayfa açılışında yalnızca DAHA ÖNCE onay verilmişse (çerez "1")
 * pixel başlatılır. Onay yoksa hiçbir şey yapılmaz.
 */
export function MetaPixelProvider() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    if (readMetaConsent() === true) {
      initMetaPixel();
    }
  }, []);

  return null;
}

/**
 * Tarayıcıdan olay gönder. Onay verilmemişse window.fbq hiç tanımlı
 * olmadığı için bu fonksiyon sessizce çıkar — olay kaybolur, istek gitmez.
 */
export function trackMetaEvent(
  name: MetaEventName,
  payload: { currency: string; value: number; contents: MetaProduct[]; numItems: number },
  opts?: { eventId?: string }
) {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/admin")) return;
  if (typeof window.fbq !== "function") return;
  window.fbq("track", name, {
    currency: payload.currency,
    value: payload.value,
    contents: payload.contents,
    num_items: payload.numItems,
    event_id: opts?.eventId,
  });
}

export { orderEventId, cartEventId };
