"use client";

import { useRouter } from "next/navigation";
import { ORDER_STATUSES, STATUS_LABELS } from "@/lib/orders";

interface OrdersFiltersProps {
  search?: string;
  status?: string;
}

export function OrdersFilters({ search, status }: OrdersFiltersProps) {
  const router = useRouter();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const v = (e.target as HTMLInputElement).value.trim();
      router.push(`/admin/orders${v ? `?search=${encodeURIComponent(v)}` : ""}`);
      router.refresh();
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const s = e.target.value;
    router.push(`/admin/orders${s ? `?status=${s}` : ""}`);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        defaultValue={search ?? ""}
        placeholder="Sipariş no, ad, telefon..."
        className="w-56 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
        onKeyDown={handleSearch}
      />
      <select
        defaultValue={status ?? ""}
        onChange={handleStatusChange}
        className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
      >
        <option value="">Tüm Durumlar</option>
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </div>
  );
}
