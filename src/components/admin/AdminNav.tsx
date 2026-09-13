"use client";

import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/admin/LogoutButton";

const LINKS = [
  { href: "/admin", label: "Genel Bakış", exact: true },
  { href: "/admin/orders", label: "Siparişler", exact: false },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {LINKS.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <a
            key={l.href}
            href={l.href}
            className={
              "block rounded-md px-3 py-2 text-sm transition-colors " +
              (active
                ? "bg-neutral-900 text-white"
                : "text-neutral-700 hover:bg-neutral-100")
            }
          >
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
