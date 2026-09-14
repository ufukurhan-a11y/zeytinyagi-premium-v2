"use client";

import { useEffect, useState } from "react";
import {
  setMetaConsent,
  readMetaConsent,
} from "@/lib/meta-pixel-client";

/**
 * KVKK / Meta Pixel onay bandı.
 * - Kök layout'a monte edilir; /admin altında gösterilmez (pixel de çalışmaz).
 * - Karar çereze yazılır; onay yokken pixel script yüklenmez, istek gitmez.
 * - Çerez okuma mount sonrası yapılır; SSR/istemci eşleşmezse hıza karşı
 *   bant bir kare görünse de "hydration mismatch" oluşmaz.
 */
export function ConsentBanner() {
  // null: henüz karar yok (bant görünür) · true/false: karar verildi (gizli)
  const [decided, setDecided] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (window.location.pathname.startsWith("/admin")) return;
    setDecided(readMetaConsent());
  }, []);

  if (!mounted || decided !== null) return null;

  const accept = () => {
    setMetaConsent(true);
    setDecided(true);
  };
  const decline = () => {
    setMetaConsent(false);
    setDecided(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Çerez ve pazarlama onayı"
      className="fixed inset-x-0 bottom-0 z-90 border-t border-olive/20 bg-canvas/95 p-4 shadow-lg backdrop-blur-md sm:p-6 print:hidden"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
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
            className="min-h-11 flex-1 rounded-md bg-olive px-5 py-2.5 text-[13px] font-medium text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] sm:flex-none"
          >
            Kabul et
          </button>
          <button
            onClick={decline}
            className="min-h-11 flex-1 rounded-md border border-border-primary px-5 py-2.5 text-[13px] font-medium text-ink-tertiary transition-colors hover:bg-neutral-50 active:scale-[0.98] sm:flex-none"
          >
            Reddet
          </button>
        </div>
      </div>
    </div>
  );
}
