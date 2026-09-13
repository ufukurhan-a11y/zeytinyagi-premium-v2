"use client";

import { useState } from "react";
import { STATUS_LABELS, ORDER_STATUSES, type OrderStatus } from "@/lib/orders";

export function StatusChanger({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [busy, setBusy] = useState(false);

  const change = async (status: OrderStatus) => {
    if (status === currentStatus) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      window.location.reload();
    } catch {
      setBusy(false);
      alert("Durum değiştirilemedi, tekrar deneyin");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {ORDER_STATUSES.map((s) => {
          const active = s === currentStatus;
          return (
            <button
              key={s}
              onClick={() => change(s)}
              disabled={busy || active}
              className={
                "rounded-full px-3 py-1.5 text-xs font-medium transition " +
                (active
                  ? "bg-neutral-900 text-white"
                  : "border border-neutral-300 text-neutral-700 hover:bg-neutral-100 disabled:opacity-40")
              }
            >
              {STATUS_LABELS[s]}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-neutral-400">
        Durumu değiştirdiğinizde sayfa otomatik yenilenir.
      </p>
    </div>
  );
}
