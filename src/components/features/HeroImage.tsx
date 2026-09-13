"use client";

import Image from "next/image";
import { useCart } from "@/lib/cart-context";

export function HeroImage() {
  const { selectedProduct } = useCart();
  const hasImage = !!selectedProduct.image;

  return (
    <div className="group relative aspect-[4/5] overflow-hidden rounded-lg border border-border-subtle bg-surface shadow-[0_8px_30px_-12px_rgba(20,20,19,0.12)]">
      {hasImage ? (
        <Image
          src={selectedProduct.image!}
          alt={`${selectedProduct.label} ${selectedProduct.sublabel}`}
          fill
          priority
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover transition-opacity duration-300"
          key={selectedProduct.id}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-canvas-alt">
          <svg width="56" height="56" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="ph-drop" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#73726C" stopOpacity="0.25"/>
                <stop offset="100%" stopColor="#3D4A2A" stopOpacity="0.3"/>
              </linearGradient>
            </defs>
            <path d="M16 3C10.8 8.5 8 13.8 8 19a8 8 0 0 0 16 0c0-5.2-2.8-10.5-8-16z" fill="url(#ph-drop)" />
            <circle cx="16" cy="22" r="1.6" fill="#9A7B3F" opacity="0.3" />
          </svg>
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/25 to-transparent" />

      {/* Üst sağ — 60 yıl mührü */}
      <div className="absolute right-3 top-3 flex h-12 w-12 flex-col items-center justify-center rounded-full border border-olive/25 bg-canvas/90 shadow-sm backdrop-blur-sm">
        <span className="font-serif text-[14px] leading-none text-olive">60</span>
        <span className="mt-0.5 text-[7px] font-medium uppercase tracking-[0.12em] text-ink-tertiary">
          yıl
        </span>
      </div>

      {/* Alt sol etiket — soğuk sıkım */}
      <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-md bg-canvas/90 px-3.5 py-2 shadow-sm backdrop-blur-sm">
        <svg width="14" height="14" viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
          <defs>
            <linearGradient id="tag-drop" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6B7A52"/>
              <stop offset="100%" stopColor="#3D4A2A"/>
            </linearGradient>
          </defs>
          <path d="M16 3C10.8 8.5 8 13.8 8 19a8 8 0 0 0 16 0c0-5.2-2.8-10.5-8-16z" fill="url(#tag-drop)" />
          <circle cx="16" cy="22" r="1.6" fill="#9A7B3F" opacity="0.6" />
        </svg>
        <span className="font-serif text-sm text-ink">Soğuk Sıkım</span>
      </div>
    </div>
  );
}
