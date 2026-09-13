"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loggingOut}
      className="block w-full rounded-md px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-50"
    >
      {loggingOut ? "Çıkılıyor..." : "Çıkış Yap"}
    </button>
  );
}
