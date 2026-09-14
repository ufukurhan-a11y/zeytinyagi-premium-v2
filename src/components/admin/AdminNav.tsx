"use client";

import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/admin/LogoutButton";

const LINKS = [
  { href: "/admin", label: "Genel Bakış", exact: true },
  { href: "/admin/orders", label: "Siparişler", exact: false },
];

/**
 * Admin navigasyonu.
 * - vertical (varsayılan): masaüstü kenar çubuğu içinde dikey liste
 * - horizontal: mobilde üst çubukta yatay, kaydırılabilir liste
 */
export function AdminNav({ horizontal = false }: { horizontal?: boolean }) {
  const pathname = usePathname();

  const linkCls = (active: boolean) =>
    horizontal
      ? "whitespace-nowrap rounded-md px-3 py-2 text-[13px] font-medium transition-colors " +
        (active
          ? "bg-neutral-900 text-white"
          : "text-neutral-600 hover:bg-neutral-100")
      : "block rounded-md px-3 py-2 text-sm transition-colors " +
        (active
          ? "bg-neutral-900 text-white"
          : "text-neutral-700 hover:bg-neutral-100");

  if (horizontal) {
    return (
      <nav className="flex items-center gap-1 overflow-x-auto">
        {LINKS.map((l) => {
          const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <a key={l.href} href={l.href} className={linkCls(active)}>
              {l.label}
            </a>
          );
        })}
        <div className="ml-2 border-l border-neutral-200 pl-2">
          <LogoutButton />
        </div>
      </nav>
    );
  }

  return (
    <nav className="space-y-1">
      {LINKS.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <a key={l.href} href={l.href} className={linkCls(active)}>
            {l.label}
          </a>
        );
      })}
      <div className="mt-3 border-t border-neutral-200 pt-3">
        <LogoutButton />
      </div>
    </nav>
  );
}
