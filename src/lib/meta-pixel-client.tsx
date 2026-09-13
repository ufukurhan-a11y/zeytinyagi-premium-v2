"use client";

import { useEffect, useRef } from "react";
import {
  META_PIXEL_ID,
  orderEventId,
  cartEventId,
  type MetaEventName,
  type MetaProduct,
} from "@/lib/meta-pixel";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown[];
    metaConsent?: boolean;
  }
}

// KVKK consent — cookie ile kalıcı, sunucu tarafı da okuyabilir.
const CONSENT_KEY = "zyusuf_konsent";

/**
 * Meta Pixel'i KVKK onayı kapılı şekilde yükler.
 * - /admin altındaki rotalarda hiç çalışmaz (özellik gereği).
 * - Onay yoksa pixel script yüklenmez ve hiçbir istek gitmez.
 * - Onay verilince PageView gönderilir, ürün/sepet olayları tarayıcıdan tetiklenir.
 */
export function MetaPixelProvider() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Admin rotasında pixel asla çalışmasın
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
      window.metaConsent = false;
      return;
    }

    const consent = readConsent();
    if (!consent) {
      window.metaConsent = false;
      return;
    }
    window.metaConsent = true;

    const f = defineFbq();
    f("init", META_PIXEL_ID);
    f("track", "PageView");
  }, []);

  return null;
}

/** fbq()'u tanımlar; henüz yoksa kuyruk kur. */
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

function readConsent(): boolean {
  if (typeof document === "undefined") return false;
  const m = document.cookie
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${CONSENT_KEY}=`));
  return m?.split("=")[1] === "1";
}

/** KVKK onay/ret — cookie yaz. */
export function setMetaConsent(granted: boolean) {
  if (typeof document === "undefined") return;
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
    // admin rotasında izinsiz takip yok
    return;
  }
  const value = granted ? "1" : "0";
  document.cookie = `${CONSENT_KEY}=${value};path=/;max-age=${
    granted ? 60 * 60 * 24 * 30 : 0
  };SameSite=Lax`;
  window.metaConsent = granted;
  if (granted && typeof window.fbq === "function") {
    // Geç onayda PageView telafi
    window.fbq("track", "PageView");
  }
}

/** Tarayıcıdan olay gönder — yalnızca onay varsa ve admin rotasında değilse. */
export function trackMetaEvent(
  name: MetaEventName,
  payload: { currency: string; value: number; contents: MetaProduct[]; numItems: number },
  opts?: { eventId?: string }
) {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/admin")) return;
  if (!window.metaConsent || typeof window.fbq !== "function") return;
  window.fbq("track", name, {
    currency: payload.currency,
    value: payload.value,
    contents: payload.contents,
    num_items: payload.numItems,
    event_id: opts?.eventId,
  });
}

export { orderEventId, cartEventId };
