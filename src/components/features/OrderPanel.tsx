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

const TABS: { id: ProductCategory; label: string; short: string }[] = [
  { id: "oil-teneke", label: "Zeytinyağı — Teneke", short: "Teneke" },
  { id: "oil-pet", label: "Zeytinyağı — Pet", short: "Pet Şişe" },
  { id: "zeplin", label: "Sele Zeytin", short: "Sele Zeytin" },
];

function getSaving(p: ProductOption): number | null {
  if (!p.basePrice || p.basePrice <= p.price) return null;
  return p.basePrice - p.price;
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
    if (p) setSelectedProduct(p);
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
          const isActive = t.id === tab;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabChange(t.id)}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-[12px] font-medium transition-all duration-200 sm:text-[13px]",
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
                {p.image ? (
                  <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-md bg-canvas-alt">
                    <Image
                      src={p.image}
                      alt={`${p.label} ${p.sublabel}`}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-contain p-2"
                    />
                  </div>
                ) : (
                  <div className="mb-3 flex aspect-square w-full items-center justify-center rounded-md bg-canvas-alt">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                      <defs>
                        <linearGradient id="op-ph" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#73726C" stopOpacity="0.25"/>
                          <stop offset="100%" stopColor="#3D4A2A" stopOpacity="0.3"/>
                        </linearGradient>
                      </defs>
                      <path d="M16 3C10.8 8.5 8 13.8 8 19a8 8 0 0 0 16 0c0-5.2-2.8-10.5-8-16z" fill="url(#op-ph)" />
                    </svg>
                  </div>
                )}

                {/* Litre */}
                <div className="font-serif text-lg leading-tight text-ink">
                  {p.label}
                </div>
                <div className="mt-0.5 text-[10px] text-ink-tertiary">
                  {p.sublabel}
                </div>

                {/* Fiyat */}
                <div className="mt-2.5 flex items-baseline gap-1.5">
                  <span
                    className={cn(
                      "font-mono text-base tnum",
                      isActive ? "text-olive" : "text-ink"
                    )}
                  >
                    ₺{p.price.toLocaleString("tr-TR")}
                  </span>
                  {pSaving && (
                    <span className="font-mono text-[11px] text-ink-tertiary line-through tnum">
                      ₺{p.basePrice!.toLocaleString("tr-TR")}
                    </span>
                  )}
                </div>

                {/* Litre başı + tasarruf */}
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-ink-tertiary">
                  <span>{p.unit}</span>
                  {pSaving && (
                    <>
                      <span className="text-ink-tertiary/40">·</span>
                      <span className="font-medium text-olive">
                        ₺{pSaving.toLocaleString("tr-TR")} tasarruf
                      </span>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────── ÜRÜN ÖZETİ + ADET + SEPETE EKLE ─────────── */}
      {/* Masaüstü: normal akışta, Mobil: sticky alt bar */}
      <div className="mt-6 border-t border-border-subtle pt-4 sm:static sm:border-0 sm:pt-0">
        <div className="flex items-center justify-between gap-3">
          {/* Seçilen ürün özeti */}
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-tertiary">
              Seçilen
            </div>
            <div className="mt-0.5 truncate font-serif text-base text-ink">
              {current.label}
              <span className="ml-1.5 text-[12px] font-normal text-ink-tertiary">
                {current.sublabel}
              </span>
            </div>
          </div>

          {/* Adet */}
          <div className="flex h-10 items-center rounded-md border border-border-primary sm:h-11">
            <button
              aria-label="Azalt"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-full w-10 items-center justify-center text-lg text-ink-secondary transition-colors hover:text-olive focus:outline-none focus-visible:ring-2 focus-visible:ring-olive"
            >
              −
            </button>
            <span
              className="w-8 text-center font-mono text-sm tnum"
              aria-live="polite"
            >
              {qty}
            </span>
            <button
              aria-label="Artır"
              onClick={() => setQty((q) => q + 1)}
              className="flex h-full w-10 items-center justify-center text-lg text-ink-secondary transition-colors hover:text-olive focus:outline-none focus-visible:ring-2 focus-visible:ring-olive"
            >
              +
            </button>
          </div>
        </div>

        {/* Toplam + Sepete Ekle — masaüstü */}
        <div className="mt-4 hidden items-center gap-3 sm:flex">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-tertiary">
              Toplam
            </span>
            <span className="font-serif text-2xl text-ink tnum">
              ₺{lineTotal.toLocaleString("tr-TR")}
            </span>
          </div>
          <Button
            size="md"
            className="flex-1"
            onClick={handleAdd}
          >
            Sepete Ekle — ₺{lineTotal.toLocaleString("tr-TR")}
          </Button>
        </div>
      </div>

      {/* Sticky mobil alt bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border-primary bg-canvas/95 p-3 backdrop-blur-md sm:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-ink-tertiary">
              Toplam
            </span>
            <span className="font-serif text-lg text-ink tnum">
              ₺{lineTotal.toLocaleString("tr-TR")}
            </span>
          </div>
          <Button
            size="md"
            className="flex-1"
            onClick={handleAdd}
          >
            Sepete Ekle
          </Button>
        </div>
      </div>
      {/* Sticky bar boşluğu (mobil) */}
      <div className="h-16 sm:hidden" aria-hidden="true" />
    </div>
  );
}
