"use client";

import { useRef, useState } from "react";

interface ReceiptCardProps {
  orderId: string;
  orderNo: string;
  /** Şimdiki dekont yolu (/receipts/...) — null/undefined ise dekont yok */
  receipt?: string | null;
  /** Dekont ne zaman yüklendi */
  receiptAt?: string | null;
  /** Kim yükledi: "customer" (siteden) veya "admin" (panelden) */
  receiptBy?: string | null;
  paymentMethod: string;
  status: string;
}

/**
 * Dekont kartı — IBAN/havale siparişleri için fotoğraf yükleme.
 *
 * Davranış:
 *  - Yükleme yapınca POST /api/admin/orders/{id}/receipt → sunucu dosyayı kaydeder,
 *    siparişi otomatik "paid" yapar ve CAPI Purchase'ı tetikler.
 *  - Zaten dekont varsa: önizleme + "dekont alındı" durumu + değiştir butonu.
 *  - İptal/teslim edilmiş siparişlerde yükleme pasif (değişiklik istenirse önce
 *    durumu "new"e döndürmek gerekir — bunu arayüz değil admin manuel yapar).
 */
export function ReceiptCard({
  orderId,
  orderNo,
  receipt,
  receiptAt,
  receiptBy,
  paymentMethod,
  status,
}: ReceiptCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(receipt ?? null);

  const locked = status === "cancelled" || status === "delivered";
  const isHavale = paymentMethod === "iban";
  const customerUploaded = receiptBy === "customer";
  // Müşteri siteden dekont yüklediyse admin tekrar yükleyemez — sadece görüntüler
  const readonly = locked || customerUploaded;

  const pick = () => inputRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Sıfırla, aynı dosya tekrar seçilebilsin
    e.target.value = "";
    setBusy(true);
    setError(null);
    setMsg(null);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/receipt`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Dekont yüklenemedi");
        return;
      }
      // Sunucu dekontu kaydetti + siparişi paid yaptı + CAPI'yi tetikledi.
      setPreview(data.receipt ?? `/receipts/${orderNo}.jpg`);
      setMsg(
        data.capi?.sent
          ? "Dekont yüklendi · sipariş ÖDEME ALINDI · Meta'ya satın alma gönderildi"
          : "Dekont yüklendi · sipariş ÖDEME ALINDI · Meta gönderimi ertelendi (erişim anahtarı yok)"
      );
    } catch {
      setError("Sunucuya ulaşılamadı — tekrar deneyin");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Ödeme Dekontu {isHavale ? "(IBAN / Havale)" : ""}
        </h2>
        {receipt ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-800">
            ✓ Dekont alındı
          </span>
        ) : (
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-500">
            Bekleniyor
          </span>
        )}
      </div>

      {preview ? (
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt={`Dekont — ${orderNo}`}
            className="mb-3 w-full rounded-md border border-neutral-200 object-contain max-h-64"
          />
          {receiptAt && (
            <p className="text-[11px] text-neutral-500">
              Yüklendi: {new Date(receiptAt).toLocaleString("tr-TR")}
            </p>
          )}
          {customerUploaded ? (
            <p className="mt-1 rounded-md bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700">
              Bu dekont müşteri tarafından siteden yüklendi — admin yeniden
              yüklemesi gerekmez. Sipariş ÖDEME ALINDI olarak işaretlendi.
            </p>
          ) : (
            !readonly && (
              <button
                type="button"
                onClick={pick}
                disabled={busy}
                className="mt-3 rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
              >
                {busy ? "Yükleniyor…" : "Dekontu değiştir"}
              </button>
            )
          )}
        </div>
      ) : (
        <div>
          <p className="mb-3 text-[12px] leading-relaxed text-neutral-500">
            Müşteri siteden (veya WhatsApp'ten) dekontu iletirse otomatik
            kaydedilir. Henüz dekont gelmediyse buradan da yükleyebilirsiniz —
            yükleme anında sipariş{" "}
            <strong className="text-neutral-700">Otomatik ÖDEME ALINDI</strong>{" "}
            olur ve Meta reklam panellerine satın alma kaydedilir.
          </p>
          <button
            type="button"
            onClick={pick}
            disabled={busy || locked}
            className="w-full rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {locked
              ? "Kilitli (sipariş kapandı)"
              : busy
                ? "Yükleniyor…"
                : "Dekont Fotoğrafı Yükle"}
          </button>
          <p className="mt-1.5 text-center text-[10px] text-neutral-400">
            JPG / PNG / WEBP · en fazla 5 MB
          </p>
        </div>
      )}

      {/* Gizli input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onFile}
      />

      {msg && (
        <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-[12px] text-emerald-700">
          {msg}
        </p>
      )}
      {error && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-[12px] text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
