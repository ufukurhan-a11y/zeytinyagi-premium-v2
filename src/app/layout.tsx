import type { Metadata, Viewport } from "next";
import { CartProvider } from "@/lib/cart-context";
import { CartDrawer } from "@/components/features/CartDrawer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zeytinci Yusuf — Manisa Kırkağaç Bakır Mahallesi Zeytinyağı",
  description:
    "Manisa Kırkağaç Bakır Mahallesinde, dededen toruna 60 yıllık bir ticaret geleneğiyle üretilen natürel sızma zeytinyağı. Kendi bahçemizden, kendi sıkımımızdan.",
  keywords: [
    "zeytinyağı",
    "natürel sızma",
    "Manisa zeytinyağı",
    "Kırkağaç zeytinyağı",
    "Bakır Mahallesi",
    "Zeytinci Yusuf",
    "soğuk sıkım",
  ],
  openGraph: {
    title: "Zeytinci Yusuf — Manisa Kırkağaç Bakır Mahallesi Zeytinyağı",
    description:
      "Dededen toruna 60 yıllık bir ticaret geleneğiyle, kendi bahçemizden üretilen natürel sızma zeytinyağı.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FAF9F5",
};

// NOTE: next/font/google (Inter, Instrument_Serif, Geist_Mono) derleme sırasında
// Google'a istek atar; bu ortamda o istek asılı kalabiliyor ve ilk sayfa
// derlemesini 120+ saniyeye taşıyordu. Dizaynı bozmamak için font değişkenleri
// globals.css içinde aynı isimlerle tanımlıdır; aşağıda <html> sınıfı yerine
// CSS tarafında (root) tanımlanmış fallback değişkenler kullanılır.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className="font-vars">
      <body className="antialiased">
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
