export const ORDER_STATUSES = ["new", "paid", "preparing", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Yeni",
  paid: "Ödeme Alındı",
  preparing: "Hazırlanıyor",
  shipped: "Kargoda",
  delivered: "Teslim Edildi",
  cancelled: "İptal",
};

export const PAYMENT_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  iban: "Havale / EFT (IBAN)",
  cod: "Kapıda Ödeme",
};
