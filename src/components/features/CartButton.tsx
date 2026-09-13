"use client";

import { useCart } from "@/lib/cart-context";

export function CartButton() {
  const { count, open } = useCart();

  return (
    <button
      onClick={open}
      aria-label={`Sepet — ${count} ürün`}
      className="relative ml-1 inline-flex h-9 items-center justify-center rounded-md bg-olive px-3.5 text-[13px] font-medium text-canvas transition-all duration-200 hover:bg-olive-deep active:scale-[0.98]"
    >
      <span className="flex items-center gap-1.5">
        Sepet
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      </span>
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-olive px-1 text-[10px] font-medium text-canvas">
          {count}
        </span>
      )}
    </button>
  );
}
