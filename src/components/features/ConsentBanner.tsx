"use client";

import { useState } from "react";
import { setMetaConsent } from "@/lib/meta-pixel-client";

function readCookieDecided(): boolean | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith("zyusuf_konsent="));
  const v = m?.split("=")[1];
  if (v === "1") return true;
  if (v === "0") return false;
  return null;
}

/**
 * KVKK / Meta Pixel onay bandı.
 * Yalnızca mağaza sayfasında kök layout'a monte edilir (admin'de YOK).
 * Ziyaretçi reddedince pixel script yüklenmez ve hiçbir istek gitmez.
 */
export function ConsentBanner() {
  const [decided, setDecided] = useState<boolean | null>(() => readCookieDecided());

  // Admin rotasında KVKK bandı gösterilmez (pixel de çalışmaz).
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
    return null;
  }

  if (decided !== null) return null;

  const accept = () => {
    setMetaConsent(true);
    setDecided(true);
  };
  const decline = () => {
    setMetaConsent(false);
    setDecided(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-olive/20 bg-canvas/95 p-4 shadow-lg backdrop-blur-md sm:p-6 print:hidden">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] leading-[1.55] text-ink-secondary">
          Reklamlarımızı ölçmek için{" "}
          <strong className="text-ink">Meta (Facebook) Pixel</strong> kullanıyoruz.
          Pazarlama amaçlı çerez ve olay takibi{" "}
          <strong className="text-ink">yalnızca onayınızla</strong> başlar. Reddederseniz
          hiçbir takip istemi yapılmaz.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={accept}
            className="rounded-md bg-olive px-4 py-2 text-[13px] font-medium text-white shadow-sm transition-transform hover:scale-[1.02]"
          >
            Kabul et
          </button>
          <button
            onClick={decline}
            className="rounded-md border border-border-primary px-4 py-2 text-[13px] font-medium text-ink-tertiary transition-colors hover:bg-neutral-50"
          >
            Reddet
          </button>
        </div>
      </div>
    </div>
  );
}
