"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import {
  useCart,
  PRODUCTS,
  CATEGORY_LABELS,
  type ProductCategory,
  type ProductOption,
} from "@/lib/cart-context";
import { cn } from "@/lib/utils";
import {
  trackMetaEvent,
  cartEventId,
} from "@/lib/meta-pixel-client";
import { META_EVENT_NAMES, type MetaProduct } from "@/lib/meta-pixel";

const TABS: { id: ProductCategory; label: string; short: string }[] = [
  { id: "oil-teneke", label: "Zeytinyağı — Teneke", short: "Teneke" },
  { id: "oil-pet", label: "Zeytinyağı — Pet Şişe", short: "Pet Şişe" },
  { id: "zeplin", label: "Sele Zeytin", short: "Sele Zeytin" },
];

function getSaving(p: ProductOption): number | null {
  if (!p.basePrice || p.basePrice <= p.price) return null;
  return p.basePrice - p.price;
}

/** Meta içerik yapısı — ürün kimliği, ad, kategori, tutar, miktar. */
function toMetaContent(p: ProductOption, qty: number): MetaProduct[] {
  return [
    {
      id: p.id,
      name: `${p.label} ${p.sublabel}`.trim(),
      category: CATEGORY_LABELS[p.category],
      quantity: qty,
      price: p.price * qty,
      image: p.image,
      brand: "Zeytinci Yusuf",
    },
  ];
}

export function OrderPanel() {
  const { addItem, setSelectedProduct } = useCart();
  const [tab, setTab] = useState<ProductCategory>("oil-teneke");
  const [selectedId, setSelectedId] = useState<string>("5l-teneke");
  const [qty, setQty] = useState(1);

  const tabProducts = PRODUCTS.filter((p) => p.category === tab);
  const current = PRODUCTS.find((p) => p.id === selectedId) ?? tabProducts[0];
  const lineTotal = current.price * qty;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const p = PRODUCTS.find((x) => x.id === id);
    if (p) {
      setSelectedProduct(p);
      // ViewContent — müşteri bir ürünün detayını görüntülüyor
      trackMetaEvent(META_EVENT_NAMES.ViewContent, {
        currency: "TRY",
        value: p.price,
        contents: toMetaContent(p, 1),
        numItems: 1,
      });
    }
  };

  const handleTabChange = (t: ProductCategory) => {
    setTab(t);
    const first = PRODUCTS.find((p) => p.category === t);
    if (first) {
      setSelectedId(first.id);
      setSelectedProduct(first);
    }
    setQty(1);
  };

  const handleAdd = () => {
    addItem(current, qty);
    // AddToCart — ürün gerçekten sepete eklendi.
    // Aynı ürün için sabit event_id → adet güncelleme / yeniden açma
    // aynı satın almayı tekrar saymaz.
    trackMetaEvent(
      META_EVENT_NAMES.AddToCart,
      {
        currency: "TRY",
        value: lineTotal,
        contents: toMetaContent(current, qty),
        numItems: qty,
      },
      { eventId: cartEventId(current.id) }
    );
  };

  return (
    <div className="mt-6">
      {/* ─────────── SEGMENTED CONTROL ─────────── */}
      <div
        role="tablist"
        aria-label="Ürün kategorisi"
        className="inline-flex w-full rounded-lg border border-border-primary bg-canvas-alt/60 p-1"
      >
        {TABS.map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabChange(t.id)}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-[12px] font-medium transition-all duration-200 sm:px-3 sm:text-[13px]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-olive focus-visible:ring-offset-1",
                isActive
                  ? "bg-surface text-ink shadow-sm"
                  : "text-ink-tertiary hover:text-ink-secondary"
              )}
            >
              {t.short}
            </button>
          );
        })}
      </div>

      {/* ─────────── ÜRÜN KARTLARI ─────────── */}
      <div className="mt-5">
        <div className="mb-2.5 text-[10px] font-medium uppercase tracking-[0.16em] text-ink-tertiary/80">
          {CATEGORY_LABELS[tab]}
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {tabProducts.map((p) => {
            const isActive = p.id === selectedId;
            const pSaving = getSaving(p);
            return (
              <button
                key={p.id}
                onClick={() => handleSelect(p.id)}
                aria-pressed={isActive}
                className={cn(
                  "relative rounded-lg border p-3.5 text-left transition-all duration-200",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-olive focus-visible:ring-offset-1",
                  isActive
                    ? "border-olive bg-olive/[0.06] ring-2 ring-olive"
                    : "border-border-primary bg-surface hover:border-ink/25 hover:bg-canvas-alt/40"
                )}
              >
                {/* Check ikonu — sağ üst */}
                {isActive && (
                  <span className="absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-olive text-canvas">
                    <svg
                      width="9"
                      height="9"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}

                {/* Rozet */}
                {p.badge && (
                  <span className="absolute -top-2 left-3 rounded-full border border-olive/30 bg-canvas px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.1em] text-olive">
                    {p.badge}
                  </span>
                )}
                {p.popular && !p.badge && (
                  <span className="absolute -top-2 left-3 rounded-full border border-olive/30 bg-canvas px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.1em] text-olive">
                    Popüler
                  </span>
                )}

                {/* Ürün görseli */}
                {p.image && (
                  <div className="mb-3 h-20 overflow-hidden rounded-md">
                    <Image
                      src={p.image}
                      alt={`${p.label} ${p.sublabel}`}
                      width={120}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="text-[14px] font-medium leading-tight text-ink">
                  {p.label}
                </div>
                <div className="mt-0.5 text-[12px] leading-tight text-ink-tertiary">
                  {p.sublabel}
                </div>

                <div className="mt-2.5 flex items-baseline justify-between">
                  <span className="font-serif text-lg text-ink tnum">
                    ₺{p.price.toLocaleString("tr-TR")}
                  </span>
                  {pSaving !== null && (
                    <span className="text-[10px] font-medium text-olive">
                      ₺{pSaving.toLocaleString("tr-TR")} kazancın
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-[11px] text-ink-tertiary tnum">
                  {p.unit}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────── ADET + SEPETE EKLE ─────────── */}
      <div className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-border-primary bg-canvas-alt/30 px-4 py-3.5">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-tertiary">
            Miktar
          </div>
          <div className="mt-1 flex items-center gap-2">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Azalt"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border-primary text-ink transition-colors hover:bg-neutral-50"
            >
              −
            </button>
            <span className="min-w-[2ch] text-center text-[15px] font-medium text-ink tnum">
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => Math.min(99, q + 1))}
              aria-label="Artır"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border-primary text-ink transition-colors hover:bg-neutral-50"
            >
              +
            </button>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-tertiary">
            Ara Toplam
          </div>
          <div className="mt-1 font-serif text-xl text-ink tnum">
            ₺{lineTotal.toLocaleString("tr-TR")}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Button
          size="lg"
          className="w-full"
          onClick={handleAdd}
          aria-label={`${current.label} ${qty} adet sepete ekle`}
        >
          Sepete Ekle — {qty} × {current.label}
        </Button>
      </div>
    </div>
  );
}
