"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  BUSINESS,
  PAYMENT,
  PAYMENT_METHODS,
  type PaymentMethod,
} from "@/lib/business";
import { trackMetaEvent, cartEventId } from "@/lib/meta-pixel-client";
import { META_EVENT_NAMES, type MetaProduct } from "@/lib/meta-pixel";

/** Sepet içeriğini Meta Product dizisine çevir — checkout olaylarında kullanılır. */
function toMetaContentsFromCart(
  items: ReturnType<typeof useCart>["items"]
): MetaProduct[] {
  const out: MetaProduct[] = [];
  for (const i of items) {
    out.push({
      id: i.product.id,
      name: `${i.product.label} ${i.product.sublabel}`.trim(),
      category: i.product.category,
      quantity: i.qty,
      price: i.product.price * i.qty,
      image: i.product.image,
      brand: "Zeytinci Yusuf",
    });
  }
  return out;
}

type Step = "cart" | "checkout" | "done";

export function CartDrawer() {
  const { items, isOpen, close, removeItem, updateQty, total, count, clear } =
    useCart();
  const [step, setStep] = useState<Step>("cart");
  const [orderNo, setOrderNo] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen && step !== "cart") {
    setTimeout(() => setStep("cart"), 300);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      {/* Drawer — mobilde tam genişlik, masaüstünde en fazla 420px */}
      <aside
        className="relative flex h-full w-full max-w-105 flex-col bg-canvas shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Sepet"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <div className="flex items-center gap-3">
            {step === "checkout" && (
              <button
                onClick={() => setStep("cart")}
                aria-label="Geri"
                className="flex h-8 w-8 items-center justify-center rounded-md text-ink-tertiary transition-colors hover:bg-ink/5 hover:text-ink"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            )}
            <h2 className="font-serif text-xl text-ink">
              {step === "cart" && "Sepetiniz"}
              {step === "checkout" && "Teslimat Bilgileri"}
              {step === "done" && "Sipariş Alındı"}
            </h2>
            {count > 0 && step === "cart" && (
              <span className="rounded-full bg-olive/10 px-2 py-0.5 text-[11px] font-medium text-olive">
                {count} ürün
              </span>
            )}
          </div>
          <button
            onClick={close}
            aria-label="Kapat"
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink-tertiary transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* İçerik */}
        <div className="flex-1 overflow-y-auto">
          {step === "cart" && (
            <CartStep
              items={items}
              removeItem={removeItem}
              updateQty={updateQty}
              total={total}
              onCheckout={() => setStep("checkout")}
              isEmpty={items.length === 0}
              onClose={close}
            />
          )}
          {step === "checkout" && (
            <CheckoutStep
              total={total}
              onBack={() => setStep("cart")}
              onComplete={(no) => {
                setOrderNo(no);
                setStep("done");
                clear();
              }}
            />
          )}
          {step === "done" && <DoneStep onClose={close} orderNo={orderNo} />}
        </div>
      </aside>
    </div>
  );
}

/* ─────────── SEPET ADIMI ─────────── */
function CartStep({
  items,
  removeItem,
  updateQty,
  total,
  onCheckout,
  isEmpty,
  onClose,
}: {
  items: ReturnType<typeof useCart>["items"];
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  total: number;
  onCheckout: () => void;
  isEmpty: boolean;
  onClose: () => void;
}) {
  if (isEmpty) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-canvas-alt">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink-tertiary/50" aria-hidden="true">
            <path d="M12 2C8 6 6 10 6 14a6 6 0 0 0 12 0c0-4-2-8-6-12z" />
          </svg>
        </div>
        <h3 className="font-serif text-lg text-ink">Sepetiniz boş</h3>
        <p className="mt-1.5 max-w-[15rem] text-[13px] leading-[1.6] text-ink-tertiary">
          Hacim seçip sepete ekleyerek siparişe başlayın.
        </p>
        <Button variant="outline" size="sm" className="mt-5" onClick={onClose}>
          Ürünlere Göz At
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 divide-y divide-border-subtle">
        {items.map((item) => (
          <div key={item.product.id} className="flex gap-4 px-5 py-4">
            {/* Mini görsel */}
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-border-subtle bg-canvas-alt">
              {item.product.image ? (
                <Image
                  src={item.product.image}
                  alt={`${item.product.label} ${item.product.sublabel}`}
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="font-serif text-lg text-olive">
                    {item.product.label.split(" ")[0]}
                    {item.product.category === "zeplin" ? "kg" : "L"}
                  </span>
                </div>
              )}
            </div>

            {/* Bilgi */}
            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[14px] font-medium text-ink">
                    {item.product.label}
                  </div>
                  <div className="text-[11px] text-ink-tertiary">
                    {item.product.sublabel} · {item.product.unit}
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.product.id)}
                  aria-label="Kaldır"
                  className="text-[11px] text-ink-tertiary underline-offset-2 transition-colors hover:text-olive hover:underline"
                >
                  Kaldır
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between">
                {/* Adet */}
                <div className="flex h-8 items-center rounded-md border border-border-primary">
                  <button
                    aria-label="Azalt"
                    onClick={() => updateQty(item.product.id, item.qty - 1)}
                    className="flex h-full w-8 items-center justify-center text-ink-secondary transition-colors hover:text-olive"
                  >
                    −
                  </button>
                  <span className="w-7 text-center font-mono text-xs tnum">
                    {item.qty}
                  </span>
                  <button
                    aria-label="Artır"
                    onClick={() => updateQty(item.product.id, item.qty + 1)}
                    className="flex h-full w-8 items-center justify-center text-ink-secondary transition-colors hover:text-olive"
                  >
                    +
                  </button>
                </div>
                {/* Satır toplam */}
                <span className="font-serif text-base text-ink tnum">
                  ₺{(item.product.price * item.qty).toLocaleString("tr-TR")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alt — toplam + devam */}
      <div className="border-t border-border-primary bg-canvas-alt/50 px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-ink-tertiary">Toplam</span>
          <span className="font-serif text-2xl text-ink tnum">
            ₺{total.toLocaleString("tr-TR")}
          </span>
        </div>
        <Button
          size="md"
          className="mt-3 w-full"
          onClick={() => {
            onCheckout();
            // InitiateCheckout — müşteri teslimat/ödeme adımına geçti.
            // Sepet toplamına göre bir kez tetiklenir.
            trackMetaEvent(
              META_EVENT_NAMES.InitiateCheckout,
              {
                currency: "TRY",
                value: total,
                contents: toMetaContentsFromCart(items),
                numItems: items.reduce((s, i) => s + i.qty, 0),
              },
              { eventId: cartEventId(items.map((i) => i.product.id).join(",")) }
            );
          }}
        >
          Devam Et
        </Button>
        <p className="mt-2.5 text-center text-[11px] text-ink-tertiary">
          Ücretsiz kargo · Kapıda ödeme imkânı
        </p>
      </div>
    </div>
  );
}

/* ─────────── CHECKOUT ADIMI ─────────── */
function CheckoutStep({
  total,
  onComplete,
}: {
  total: number;
  onBack: () => void;
  onComplete: (orderNo: string) => void;
}) {
  const { items } = useCart();
  const [payment, setPayment] = useState<PaymentMethod>("whatsapp");
  const [ibanCopied, setIbanCopied] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    district: "",
    address: "",
    note: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const copyIban = async () => {
    try {
      await navigator.clipboard.writeText(PAYMENT.iban.replace(/\s/g, ""));
      setIbanCopied(true);
      setTimeout(() => setIbanCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const set = (k: string, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Ad soyad gerekli";
    if (!form.phone.trim()) e.phone = "Telefon gerekli";
    else if (form.phone.replace(/\D/g, "").length < 10)
      e.phone = "Geçerli bir telefon girin";
    if (!form.city.trim()) e.city = "İl gerekli";
    if (!form.district.trim()) e.district = "İlçe gerekli";
    if (!form.address.trim()) e.address = "Adres gerekli";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    // 1) Siparişi veritabanına kaydet (admin panelde görünür + kargo etiketi basılır)
    let orderNo = `ZY-${Date.now().toString().slice(-4)}`;
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.product.id,
            label: i.product.label,
            sublabel: i.product.sublabel,
            price: i.product.price,
            qty: i.qty,
          })),
          customer: {
            name: form.name.trim(),
            phone: form.phone.trim(),
            city: form.city.trim(),
            district: form.district.trim(),
            address: form.address.trim(),
            note: form.note?.trim() || undefined,
          },
          paymentMethod: payment,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        orderNo = data.orderNo;
      }
    } catch {
      // DB yazımı başarısızsa yine de WhatsApp'a gönder (graceful degrade)
      console.warn("Sipariş DB'ye kaydedilemedi, yalnızca WhatsApp'a gönderilecek");
    }

    const SEP = "━━━━━━━━━━━━━━━━━";
    const LINE = "───────────────";

    // Sipariş satırları — hizalı
    const orderLines = items
      .map((i) => {
        const name = `${i.product.label} ${i.product.sublabel}`;
        const qty = `× ${i.qty}`;
        const price = `₺${(i.product.price * i.qty).toLocaleString("tr-TR")}`;
        return `${name} ${qty}  →  ${price}`;
      })
      .join("%0A");

    // Ödeme yöntemi detayı
    // Kapıda Ödeme'de müşteriye NET tutar net yazılır (müşterinin ne
    // sipariş verdiğinin toplamı, KDV hariç) — hem etikette hem
    // WhatsApp'ta aynı tutar görünsün.
    const codAmount = `₺${total.toLocaleString("tr-TR")}`;
    const paymentDetail =
      payment === "iban"
        ? `Havale/EFT%0A${LINE}%0AIBAN: ${PAYMENT.iban.replace(/\s/g, "")}%0AHesap: ${PAYMENT.accountHolder} · ${PAYMENT.bank}%0A(Dekontu iletin, sipariş hazırlanır)`
        : payment === "cod"
          ? `Kapıda Ödeme (Nakit)%0A%0ATeslimatta ${codAmount} ödeyeceksiniz (kapıda tahsil tutarı)`
          : "WhatsApp Üzerinden%0A(Ödemeyi konuşurken belirleyelim)";

    const msg =
      `${SEP}%0A` +
      `🫒 ZEYTİNCİ YUSUF%0A` +
      `Kırkağaç · Bakır Mahallesi%0A` +
      `${SEP}%0A%0A` +
      `SİPARİŞ NO: ${orderNo}%0A%0A` +
      `SİPARİŞ ÖZETİ%0A` +
      `${LINE}%0A` +
      `${orderLines}%0A` +
      `${LINE}%0A` +
      `Toplam: ₺${total.toLocaleString("tr-TR")}%0A%0A` +
      `TESLİMAT%0A` +
      `${LINE}%0A` +
      `Ad Soyad: ${form.name}%0A` +
      `Telefon: ${form.phone}%0A` +
      `Adres: ${form.city} / ${form.district}%0A${form.address}%0A%0A` +
      `ÖDEME%0A` +
      `${LINE}%0A` +
      `${paymentDetail}` +
      (form.note ? `%0A%0ANOT%0A${LINE}%0A${form.note}` : "") +
      `%0A%0A${SEP}%0A` +
      `Ücretsiz kargo · 1 iş gününde kargoda%0A` +
      `WhatsApp: ${BUSINESS.whatsappDisplay}%0A` +
      `${SEP}`;

    window.open(`https://wa.me/${BUSINESS.whatsapp}?text=${msg}`, "_blank");
    onComplete(orderNo);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {/* Sipariş özeti */}
        <div className="mb-5 rounded-lg border border-border-subtle bg-canvas-alt/40 p-4">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-tertiary">
              Sipariş Özeti
            </div>
            <div className="text-[11px] text-ink-tertiary">
              {items.length} kalem
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {items.map((i) => (
              <div
                key={i.product.id}
                className="flex justify-between text-[13px]"
              >
                <span className="text-ink-secondary">
                  {i.product.label} × {i.qty}
                </span>
                <span className="font-mono tnum text-ink">
                  ₺{(i.product.price * i.qty).toLocaleString("tr-TR")}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t border-border-subtle pt-2.5">
            <span className="text-[13px] font-medium text-ink">Toplam</span>
            <span className="font-serif text-lg text-ink tnum">
              ₺{total.toLocaleString("tr-TR")}
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <Field
            label="Ad Soyad"
            id="name"
            value={form.name}
            onChange={(v) => set("name", v)}
            error={errors.name}
            placeholder="Adınız soyadınız"
          />
          <Field
            label="Telefon"
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(v) => set("phone", v)}
            error={errors.phone}
            placeholder="0 5xx xxx xx xx"
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="İl"
              id="city"
              value={form.city}
              onChange={(v) => set("city", v)}
              error={errors.city}
              placeholder="İl"
            />
            <Field
              label="İlçe"
              id="district"
              value={form.district}
              onChange={(v) => set("district", v)}
              error={errors.district}
              placeholder="İlçe"
            />
          </div>
          <Field
            label="Adres"
            id="address"
            value={form.address}
            onChange={(v) => set("address", v)}
            error={errors.address}
            placeholder="Mahalle, sokak, kapı no"
            textarea
          />
          <Field
            label="Not (opsiyonel)"
            id="note"
            value={form.note}
            onChange={(v) => set("note", v)}
            placeholder="Siparişle ilgili notunuz"
            textarea
          />
        </div>

        {/* Ödeme yöntemi */}
        <div className="mt-6">
          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-tertiary">
            Ödeme Yöntemi
          </div>
          <div className="mt-3 space-y-2.5">
            {PAYMENT_METHODS.map((m) => {
              const isActive = m.id === payment;
              return (
                <button
                  key={m.id}
                  onClick={() => setPayment(m.id)}
                  aria-pressed={isActive}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border p-3.5 text-left transition-all duration-200",
                    isActive
                      ? "border-olive bg-olive/[0.04] ring-1 ring-olive"
                      : "border-border-primary bg-surface hover:border-ink/30"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border",
                      isActive ? "border-olive" : "border-ink/25"
                    )}
                  >
                    {isActive && (
                      <span className="h-2 w-2 rounded-full bg-olive" />
                    )}
                  </span>
                  <span className="flex-1">
                    <span className="block text-[14px] font-medium text-ink">
                      {m.label}
                    </span>
                    <span className="mt-0.5 block text-[12px] leading-[1.5] text-ink-tertiary">
                      {m.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* IBAN bilgisi — sadece havale seçilince */}
          {payment === "iban" && (
            <div className="mt-3 overflow-hidden rounded-lg border border-olive/25 bg-olive/[0.03]">
              <div className="border-b border-olive/15 px-4 py-2.5">
                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-olive">
                  Havale / EFT Bilgileri
                </div>
              </div>
              <div className="px-4 py-3.5">
                <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-tertiary">
                  IBAN Numarası
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-3">
                  <div className="select-all font-mono text-[15px] font-medium break-all text-ink tnum">
                    {PAYMENT.iban}
                  </div>
                  <button
                    onClick={copyIban}
                    aria-label="IBAN numarasını kopyala"
                    className="flex-shrink-0 rounded-md border border-olive/40 bg-canvas px-3 py-1.5 text-[11px] font-medium text-olive transition-all hover:border-olive hover:bg-olive hover:text-canvas active:scale-[0.97]"
                  >
                    {ibanCopied ? "Kopyalandı ✓" : "Kopyala"}
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-olive/10 pt-3">
                  <div>
                    <div className="text-[9px] font-medium uppercase tracking-[0.14em] text-ink-tertiary">
                      Hesap Sahibi
                    </div>
                    <div className="mt-0.5 text-[13px] font-medium text-ink">
                      {PAYMENT.accountHolder}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-medium uppercase tracking-[0.14em] text-ink-tertiary">
                      Banka
                    </div>
                    <div className="mt-0.5 text-[13px] font-medium text-ink">
                      {PAYMENT.bank}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-[11px] leading-[1.5] text-ink-tertiary">
                  Ödemeyi yaptıktan sonra dekontu WhatsApp üzerinden iletin,
                  siparişiniz hazırlanır.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alt — tamamla */}
      <div className="border-t border-border-primary bg-canvas-alt/50 px-5 py-4">
        <Button size="md" className="w-full" onClick={handleSubmit}>
          Siparişi Tamamla — ₺{total.toLocaleString("tr-TR")}
        </Button>
        <p className="mt-2.5 text-center text-[11px] text-ink-tertiary">
          Siparişiniz WhatsApp üzerinden iletilir
        </p>
      </div>
    </div>
  );
}

/* ─────────── FORM ALANI ─────────── */
function Field({
  label,
  id,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  textarea = false,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-tertiary"
      >
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className={cn(
            "mt-1.5 w-full resize-none rounded-md border bg-surface px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-tertiary/60 focus:outline-none focus:ring-1 focus:ring-olive",
            error ? "border-destructive" : "border-border-primary"
          )}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "mt-1.5 h-11 w-full rounded-md border bg-surface px-3 text-[14px] text-ink placeholder:text-ink-tertiary/60 focus:outline-none focus:ring-1 focus:ring-olive",
            error ? "border-destructive" : "border-border-primary"
          )}
        />
      )}
      {error && (
        <p className="mt-1 text-[11px] text-destructive">{error}</p>
      )}
    </div>
  );
}

/* ─────────── TAMAMLANDI ─────────── */
function DoneStep({ onClose, orderNo }: { onClose: () => void; orderNo: string }) {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<"idle" | "success" | "error">("idle");
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !orderNo) return;

    const okTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!okTypes.includes(file.type) || file.size > 5 * 1024 * 1024) {
      setUploadResult("error");
      return;
    }

    setUploading(true);
    setUploadResult("idle");
    try {
      const fd = new FormData();
      fd.append("orderNo", orderNo);
      fd.append("file", file);
      const res = await fetch("/api/orders/receipt", {
        method: "POST",
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        setUploadResult("success");
        setReceiptUrl(data.receipt ? `${data.receipt}?t=${Date.now()}` : null);
      } else {
        setUploadResult("error");
      }
    } catch {
      setUploadResult("error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-olive/10">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-olive" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <h3 className="font-serif text-xl text-ink">Siparişiniz alındı</h3>
      {orderNo && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-border-primary bg-canvas-alt/50 px-3 py-1.5">
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-tertiary">
            Sipariş No
          </span>
          <span className="font-mono text-[13px] font-medium text-olive tnum">
            {orderNo}
          </span>
        </div>
      )}
      <p className="mt-4 max-w-[17rem] text-[13px] leading-[1.6] text-ink-tertiary">
        Sipariş <strong className="text-ink">kaydedildi</strong> ve WhatsApp'a
        iletildi. Havale/EFT yapıyorsanız dekontu aşağıya yükleyin; dekontunuz
        kaydedilince siparişiniz otomatik olarak{" "}
        <strong className="text-ink">ÖDEME ALINDI</strong> durumuna geçer.
      </p>

      {/* Dekont yükleme alanı */}
      {orderNo && (
        <div className="mt-5 w-full max-w-[17rem]">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFile}
            disabled={uploading || uploadResult === "success"}
            className="sr-only"
            aria-label="Dekont fotoğrafı seçin"
          />
          {uploadResult === "success" ? (
            <div className="space-y-2 rounded-lg border border-olive/30 bg-olive/5 p-4">
              <div className="flex items-center justify-center gap-2 text-[13px] font-medium text-olive">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>Dekont kaydedildi</span>
              </div>
              {receiptUrl && (
                <img
                  src={receiptUrl}
                  alt="Yüklenen dekont önizleme"
                  className="mx-auto max-h-40 rounded-md border border-border-primary"
                />
              )}
              <p className="text-[11px] text-ink-tertiary">
                Siparişiniz ödeme alındı olarak işaretlendi.
              </p>
            </div>
          ) : (
            <Button
              variant={uploadResult === "error" ? "outline" : "primary"}
              size="sm"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="w-full"
            >
              {uploading ? (
                <>
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Yükleniyor...
                </>
              ) : (
                "Dekont Fotoğrafı Yükle"
              )}
            </Button>
          )}
          {uploadResult === "error" && (
            <p className="mt-2 text-[11px] text-destructive">
              Yükleme başarısız oldu — JPG/PNG/WEBP, en fazla 5MB. Tekrar
              deneyin veya WhatsApp üzerinden iletin.
            </p>
          )}
          <p className="mt-2 text-[11px] text-ink-tertiary">
            WhatsApp üzerinden dekont gönderebilirsiniz; dekontunuz bize
            ulaşınca sipariş hazırlanır.
          </p>
        </div>
      )}

      <div className="mt-5 flex items-center gap-2 text-[11px] text-ink-tertiary">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span>Ücretsiz kargo · 1 iş gününde kargoda</span>
      </div>
      <Button variant="outline" size="sm" className="mt-6" onClick={onClose}>
        Kapat
      </Button>
    </div>
  );
}
