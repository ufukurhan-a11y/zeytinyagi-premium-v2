"use client";

import Link from "next/link";

type LabelToolbarProps = {
  orderId: string;
};

/**
 * Kargo etiketi yazdırma araç çubuğu — client component.
 * Yalnızca bu araç çubuğu etkileşimli; etiketin kendisi server
 * tarafında, server component'te kalır.
 */
export function LabelToolbar({ orderId }: LabelToolbarProps) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="label-toolbar print:hidden">
      <button
        type="button"
        onClick={handlePrint}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700"
      >
        🖨 Yazdır
      </button>
      <Link
        href={`/admin/orders/${orderId}`}
        className="ml-2 rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-700 transition hover:bg-neutral-50"
      >
        ← Detaya Dön
      </Link>
    </div>
  );
}
