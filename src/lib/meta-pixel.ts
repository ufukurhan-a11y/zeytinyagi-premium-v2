// Meta Pixel — ortak kimlik (tarayıcı + sunucu tarafı tek kaynak)
// Pixel ID buradan beslenir; admin/sunucu olaylarında aynı event_id üretimi
// tarayıcı ile birebir aynı olmalı ki Meta dedup (event_id eşleşmesi) yapsın.

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "2427655271096487";

/** Sipariş başına sabit, deterministik event_id — tarayıcı ve sunucu aynı değeri üretir. */
export function orderEventId(orderNo: string): string {
  return `meta-zyusuf-${orderNo.toLowerCase()}`;
}

/** Sepet satırı için deterministik event_id (AddToCart tekilleştirmesi). */
export function cartEventId(productId: string): string {
  return `meta-zyusuf-cart-${productId}`;
}

/** Çekirme için ortak durum adları (Meta standard event set). */
export const META_EVENT_NAMES = {
  PageView: "PageView",
  ViewContent: "ViewContent",
  AddToCart: "AddToCart",
  InitiateCheckout: "InitiateCheckout",
  Purchase: "Purchase",
} as const;

export type MetaEventName = (typeof META_EVENT_NAMES)[keyof typeof META_EVENT_NAMES];

export type MetaProduct = {
  id: string;
  quantity: number;
  price: number;
  name: string;
  category: string;
  brand?: string;
  url?: string;
  image?: string;
};

export type MetaEventPayload = {
  currency: string;
  value: number;
  contents: MetaProduct[];
  numItems: number;
};

/** KVKK: pazarlama izni durumunu sunucu tarafı da gözetir. */
export const CONSENT_COOKIE = "zyusuf_konsent";
