// İşletme bilgileri — tek kaynak, kolay güncelleme

export const BUSINESS = {
  brand: "Zeytinci Yusuf",
  whatsapp: "905444880979", // 0 544 488 09 79
  whatsappDisplay: "0 544 488 09 79",
  instagram: "zeytinciyusuf45",
  instagramUrl: "https://instagram.com/zeytinciyusuf45",
  facebook: "Zeytinci Yusuf",
  origin: "Manisa Kırkağaç · Bakır Mahallesi",
};

export const PAYMENT = {
  iban: "TR55 0001 5001 5800 7352 3275 46",
  ibanRaw: "TR550001500158007352327546",
  accountHolder: "Yusuf Çakıcı",
  bank: "VakıfBank",
};

export type PaymentMethod = "whatsapp" | "iban" | "cod";

export const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  description: string;
}[] = [
  {
    id: "whatsapp",
    label: "WhatsApp ile Sipariş",
    description: "Sipariş WhatsApp'a iletilir, ödemeyi konuşurken alırız.",
  },
  {
    id: "iban",
    label: "Havale / EFT",
    description: "IBAN'a ödeme yapın, dekontu WhatsApp'tan iletin.",
  },
  {
    id: "cod",
    label: "Kapıda Ödeme",
    description: "Ürünü teslim alırken nakit ödeme.",
  },
];
