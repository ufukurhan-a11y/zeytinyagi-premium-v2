import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";

// NOT: next/font/google importları bu ortamda derleme anında Google'a istek
// atıp asılı kalabildiği için kaldırıldı. Font değişkenleri
// globals.css'teki :root bloğunda fallback sistem fontlarıyla tanımlıdır.
export const metadata: Metadata = {
  title: "Yönetim Paneli — Zeytinci Yusuf",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // /admin/login sayfası kendi layout mantığını çocukta çözer;
  // bu kontrol sıradan /admin sayfaları için: oturum yoksa login'e git.
  // (Login sayfası kendi sayfasında authed kontrolü yapar, o yüzden
  //  layout'ta redirect yapıyoruz ama /admin/login'de redirect'e düşmeyelim.)
  const authed = await isAdminAuthed();

  return (
    <html
      lang="tr"
      className="font-sans"
    >
      <body className="antialiased">
        {authed ? (
          <div className="flex min-h-screen bg-neutral-100 text-neutral-900">
            <aside className="fixed inset-y-0 left-0 z-40 flex w-52 flex-col border-r border-neutral-200 bg-white print:hidden">
              <div className="border-b border-neutral-200 px-5 py-5">
                <div className="font-serif text-lg font-semibold tracking-tight">
                  Zeytinci Yusuf
                </div>
                <div className="text-[11px] text-neutral-500">Yönetim Paneli</div>
              </div>
              <div className="flex-1 px-3 py-4">
                <AdminNav />
              </div>
              <div className="border-t border-neutral-200 px-5 py-4 text-[11px] text-neutral-400">
                <a href="/" className="underline">
                  Mağazaya dön
                </a>
              </div>
            </aside>
            <main className="ml-52 min-h-screen px-8 py-8 print:ml-0 print:px-0 print:py-0">
              {children}
            </main>
          </div>
        ) : (
          // Oturum yok: yalnızca /admin/login veya /admin/orders/[id]/label
          // dışında login'e yönlendir. label yazdırma sayfası da oturum
          // gerektirir ama redirect kargaşası olmaması için login göster.
          children
        )}
      </body>
    </html>
  );
}
