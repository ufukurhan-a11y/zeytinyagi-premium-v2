import { OrderPanel } from "@/components/features/OrderPanel";
import { CartButton } from "@/components/features/CartButton";
import { HeroImage } from "@/components/features/HeroImage";

/* ============================================================
   ZEYVA — Premium Zeytinyağı Landing Page
   Sakin Editorial — Sıcak Premium
   ============================================================ */

export default function Home() {
  return (
    <main className="grain min-h-screen bg-canvas text-ink">
      {/* ─────────── HEADER ─────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5 sm:h-16 sm:px-8">
          <a href="#" className="flex items-center gap-3">
            {/* Premium zeytin damlası logosu */}
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-olive-soft to-olive-deep shadow-md ring-1 ring-white/10">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <defs>
                  <linearGradient id="hdr-drop" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FFF" stopOpacity="0.92" />
                    <stop offset="100%" stopColor="#F5F4ED" stopOpacity="0.55" />
                  </linearGradient>
                  <linearGradient id="hdr-vein" x1="8" y1="8" x2="24" y2="26" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#2E3820" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#2E3820" stopOpacity="0.08" />
                  </linearGradient>
                </defs>
                {/* Ana damla — yumuşak, organ akış */}
                <path d="M16 3C10.8 8.5 8 13.8 8 19a8 8 0 0 0 16 0c0-5.2-2.8-10.5-8-16z" fill="url(#hdr-drop)" />
                {/* Hafif damar / ışık — derinlik hissi */}
                <path d="M11.5 9.5C9.8 12.5 8.5 15.5 8.5 19a7.5 7.5 0 0 0 3 5.8" stroke="url(#hdr-vein)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                {/* Alt zeytin tohumu — altın vurgu */}
                <circle cx="16" cy="22.5" r="1.8" fill="#9A7B3F" opacity="0.55" />
              </svg>
            </span>
            <span className="font-serif text-lg leading-tight tracking-tight text-ink sm:text-xl">
              Zeytinci Yusuf
            </span>
            <span className="hidden h-4 w-px bg-border-primary sm:inline-block" />
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-ink-tertiary sm:inline">
              Kırkağaç · Bakır Mahallesi
            </span>
          </a>
          <nav className="flex items-center gap-1">
            <a
              href="#urun"
              className="px-3 py-2 text-[13px] font-medium text-ink-secondary transition-colors hover:text-olive sm:text-sm"
            >
              Ürün
            </a>
            <a
              href="#hikaye"
              className="hidden px-3 py-2 text-[13px] font-medium text-ink-secondary transition-colors hover:text-olive sm:inline-block sm:text-sm"
            >
              Hikâye
            </a>
            <a
              href="#sss"
              className="hidden px-3 py-2 text-[13px] font-medium text-ink-secondary transition-colors hover:text-olive sm:inline-block sm:text-sm"
            >
              SSS
            </a>
            <CartButton />
          </nav>
        </div>
      </header>

      {/* ─────────── HERO + ÜRÜN (açılış ekranı) ─────────── */}
      <section id="urun" className="relative overflow-hidden">
        {/* Dekoratif arka plan — sıcak tonlu, abartısız */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-olive/[0.05] blur-3xl" />
          <div className="absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-gold/[0.04] blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-5 pt-8 pb-14 sm:px-8 sm:pt-12 sm:pb-24">
          {/* Güven şeridi — üst bar */}
          <div className="mb-8 flex items-center justify-between gap-4 sm:mb-12">
            <div className="flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
                <defs>
                  <linearGradient id="gsh-drop" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#6B7A52"/>
                    <stop offset="100%" stopColor="#3D4A2A"/>
                  </linearGradient>
                </defs>
                <path d="M16 3C10.8 8.5 8 13.8 8 19a8 8 0 0 0 16 0c0-5.2-2.8-10.5-8-16z" fill="url(#gsh-drop)" />
                <circle cx="16" cy="22" r="1.6" fill="#9A7B3F" opacity="0.6" />
              </svg>
              <span className="text-[11px] font-medium tracking-[0.04em] text-ink-secondary">
                Manisa · Kırkağaç · Bakır Mahallesi
              </span>
            </div>
            <div className="hidden items-center gap-4 sm:flex">
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-ink-tertiary">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Aile işletmesi
              </span>
              <span className="h-3 w-px bg-border-primary" />
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-ink-tertiary">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                1000 TL üzeri ücretsiz kargo
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-12 sm:gap-12 lg:gap-16">
            {/* Sol: ürün görseli — OrderPanel kontrol eder */}
            <div className="order-2 sm:col-span-6 sm:order-1">
              <HeroImage />
            </div>

            {/* Sağ: hero metni + satın alma */}
            <div className="order-1 sm:col-span-6 sm:order-2 sm:flex sm:flex-col sm:justify-center">
              {/* Editorial başlık */}
              <h1 className="font-serif text-[2.5rem] leading-[1.02] tracking-[-0.025em] text-ink sm:text-[3.25rem] sm:leading-[0.98]">
                Dededen toruna,
                <br />
                <span className="italic text-olive">altmış yıllık</span> lezzet.
              </h1>

              {/* Açıklama */}
              <p className="mt-5 max-w-md text-[14px] leading-[1.65] text-ink-secondary sm:text-[15px] sm:leading-[1.7]">
                Manisa Kırkağaç'ın Bakır Mahallesinde, üç kuşağıdır
                aynı bahçelerden, aynı özenle ürettiğimiz natürel sızma
                zeytinyağı. Kendi zeytinimiz, kendi sıkımımız.
              </p>

              {/* Güven göstergeleri */}
              <div className="mt-6 flex items-center gap-5 border-t border-border-subtle pt-5">
                <div>
                  <div className="font-serif text-xl text-ink">60</div>
                  <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-tertiary">
                    Yıllık gelenek
                  </div>
                </div>
                <div className="h-8 w-px bg-border-primary" />
                <div>
                  <div className="font-serif text-xl text-ink">3</div>
                  <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-tertiary">
                    Kuşak
                  </div>
                </div>
              </div>

              {/* Sipariş paneli — hacim seçici + adet + WhatsApp sipariş */}
              <OrderPanel />
            </div>
          </div>
        </div>
      </section>
      {/* Ücretsiz kargo çağrısı */}
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-olive/20 bg-olive/[0.04] px-5 py-4 sm:px-8 sm:py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-olive/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-olive">
                <path d="M5 12h14" />
                <path d="M5 8h14" />
                <circle cx="9" cy="19" r="1.5" />
                <circle cx="15" cy="19" r="1.5" />
                <path d="M8 5h8a2 2 0 0 1 2 2v4" />
                <rect x="4" y="5" width="12" height="10" rx="2" />
              </svg>
            </span>
            <div>
              <div className="font-serif text-lg leading-tight text-ink sm:text-xl">
                1000 TL üzeri <span className="italic text-olive">ücretsiz kargo</span>
              </div>
              <div className="mt-0.5 text-[12px] text-ink-tertiary">
                Siparişiniz 1000 TL ve üzeri olursa kargo bedava — 1-2 iş gününde kapınızda.
              </div>
            </div>
          </div>
          <a
            href="#urun"
            className="shrink-0 rounded-lg bg-olive px-4 py-2.5 text-[13px] font-medium text-white shadow-sm transition-transform hover:scale-[1.02] sm:px-5 sm:text-sm"
          >
            Hemen sipariş ver
          </a>
        </div>
      </div>


      {/* ─────────── HİKÂYE / MENŞE ─────────── */}
      <section id="hikaye" className="relative">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-12 sm:gap-12">
            {/* Sol: etiket + başlık */}
            <div className="sm:col-span-7">
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-tertiary">
                Hikâyemiz
              </span>
              <h2 className="mt-4 font-serif text-[1.75rem] leading-[1.15] tracking-[-0.015em] text-ink sm:text-[2.25rem] sm:leading-[1.1]">
                Altmış yıldır
                <br />
                <span className="italic text-olive">aynı toprakta.</span>
              </h2>
            </div>

            {/* Sağ: metin */}
            <div className="sm:col-span-5">
              <p className="text-[15px] leading-[1.7] text-ink-secondary">
                Manisa'nın Kırkağaç ilçesine bağlı Bakır Mahallesi —
                işte her şeyin başladığı yer. Dedem Yusuf, altmış yıl önce
                bu taşlı topraklara ilk zeytin fidanını dikti. O günden
                bu yana, aynı bahçelerde, aynı ellerle üretiyoruz.
              </p>
              <p className="mt-4 text-[15px] leading-[1.7] text-ink-secondary">
                Zeytinlerimizi kendimiz yetiştiriyor, kendimiz hasat ediyor,
                kendimiz sıkıyoruz. Araya hiçbir aracı girmiyor. Şişeye
                dolan yağ, bizim bahçemizin, bizim emeğimizin hikâyesi.
              </p>
            </div>
          </div>

          {/* Teknik veri şeridi */}
          <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border-subtle bg-border-subtle sm:grid-cols-4">
            {[
              { label: "Menşe", value: "Kırkağaç" },
              { label: "Tarihçe", value: "60 yıl", mono: true },
              { label: "Sıkım", value: "Soğuk", mono: true },
              { label: "Üretim", value: "Kendi sıkım", mono: false },
            ].map((item) => (
              <div key={item.label} className="bg-surface px-5 py-6">
                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-tertiary">
                  {item.label}
                </div>
                <div
                  className={`mt-2 text-lg text-ink ${item.mono ? "font-mono tnum" : "font-serif"}`}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── SÜREÇ ─────────── */}
      <section className="relative">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-tertiary">
            Süreç
          </span>
          <h2 className="mt-4 font-serif text-[1.75rem] leading-[1.1] tracking-[-0.015em] text-ink sm:text-[2.25rem]">
            Bahçeden şişeye
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
            {[
              {
                n: "01",
                t: "Bahçemizden hasat",
                d: "Kırkağaç'ın Bakır Mahallesindeki kendi bahçemizden, zeytinler olgunlaşınca elle toplanır.",
              },
              {
                n: "02",
                t: "Kendi sıkımımız",
                d: "Zeytinleri kendi tesisimizde sıkıyoruz. Araya aracı girmiyor, her aşamayı biz kontrol ediyoruz.",
              },
              {
                n: "03",
                t: "Dinlenme ve şişeleme",
                d: "Doğal dinlenmenin ardından süzülür, ışıktan koruyan koyu cam şişelere kendi ellerimizle doldurulur.",
              },
            ].map((step) => (
              <div key={step.n} className="border-t border-border-primary pt-5">
                <div className="font-mono text-xs text-olive tnum">
                  {step.n}
                </div>
                <h3 className="mt-3 text-base font-medium text-ink">
                  {step.t}
                </h3>
                <p
                  className="mt-2 text-[13px] leading-[1.6] text-ink-tertiary"
                  dangerouslySetInnerHTML={{ __html: step.d }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── SOSYAL KANIT ─────────── */}
      <section className="relative bg-canvas-alt">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="flex items-center gap-3">
            <div className="flex text-olive">
              {"★★★★★".split("").map((s, i) => (
                <span key={i} className="text-sm">
                  {s}
                </span>
              ))}
            </div>
            <span className="text-[13px] text-ink-secondary">
              Müşterilerimizden gelenler
            </span>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
            {[
              {
                q: "Sabahları çiğ sebzelerimin üzerine sıkıyorum. Gerçekten yeşil, gerçekten acı — market yağı değil bu.",
                n: "Elif K.",
                c: "İstanbul",
              },
              {
                q: "Şişeyi açar açmaz otlu, yeşil aromayı aldım. Balıkta ve peynirde farkı bariz.",
                n: "Murat T.",
                c: "İzmir",
              },
            ].map((r) => (
              <figure
                key={r.n}
                className="border-l-2 border-olive/30 pl-5"
              >
                <blockquote className="font-serif text-lg leading-[1.4] text-ink">
                  &ldquo;{r.q}&rdquo;
                </blockquote>
                <figcaption className="mt-4 text-[13px] text-ink-tertiary">
                  <span className="font-medium text-ink-secondary">
                    {r.n}
                  </span>{" "}
                  · {r.c}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── SSS ─────────── */}
      <section id="sss" className="relative">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-tertiary">
            Sık sorulanlar
          </span>
          <h2 className="mt-4 font-serif text-[1.75rem] leading-[1.1] tracking-[-0.015em] text-ink sm:text-[2.25rem]">
            Aklınızdakiler
          </h2>

          <div className="mt-10 divide-y divide-border-primary border-y border-border-primary">
            {[
              {
                q: "Yağınızı nerede üretiyorsunuz?",
                a: "Manisa'nın Kırkağaç ilçesine bağlı Bakır Mahallesinde, kendi bahçelerimizde. Zeytini biz yetiştiriyor, biz sıkıyor, biz şişeliyoruz — araya aracı girmiyor.",
              },
              {
                q: "Bu işi ne zamandır yapıyorsunuz?",
                a: "Kırkağaç'ın Bakır Mahallesi'ndeki bahçelerde dedem Yusuf'un altmış yıl önce diktiği fidanlarla başladı her şey. O günden bu yana üç kuşaktır aynı toprakta, aynı özenle üretiyoruz.",
              },
              {
                q: "Raf ömrü ne kadar?",
                a: "Bakır Mahallesi'ndeki soğuk sıkımımızda şişelediğimiz yağ, ışığı kesen koyu cam şişede ve serin yerde 24 aya kadar tazeliğini korur.",
              },
              {
                q: "Kargo ne zaman gelir?",
                a: "Sipariş sonrası 1 iş gününde kargoya verilir, 2 iş gününde teslim edilir. 1000 TL ve üzeri siparişlerde kargo ücretsiz.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group py-5"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span className="text-[15px] font-medium text-ink">
                    {item.q}
                  </span>
                  <span className="text-ink-tertiary transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[14px] leading-[1.65] text-ink-secondary">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── FOOTER ─────────── */}
      <footer className="relative border-t border-border-primary bg-canvas">
        <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="font-serif text-2xl text-ink">Zeytinci Yusuf</div>
              <p className="mt-2 max-w-xs text-[13px] leading-[1.6] text-ink-tertiary">
                Manisa Kırkağaç'ın Bakır Mahallesinde, dededen toruna
                60 yıllık bir ticaret geleneğiyle ürettiğimiz natürel sızma
                zeytinyağı.
              </p>
            </div>
            <div className="flex gap-10">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-tertiary">
                  İletişim
                </div>
                <ul className="mt-3 space-y-1.5 text-[13px] text-ink-secondary">
                  <li>
                    <a
                      href="https://wa.me/905444880979"
                      className="transition-colors hover:text-olive"
                    >
                      WhatsApp: 0 544 488 09 79
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://instagram.com/zeytinciyusuf45"
                      className="transition-colors hover:text-olive"
                    >
                      Instagram: @zeytinciyusuf45
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="transition-colors hover:text-olive"
                    >
                      Facebook: Zeytinci Yusuf
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-tertiary">
                  Menşe
                </div>
                <ul className="mt-3 space-y-1.5 text-[13px] text-ink-secondary">
                  <li>Kırkağaç · Bakır Mahallesi</li>
                  <li>Manisa · Türkiye</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-col gap-2 border-t border-border-subtle pt-6 text-[11px] text-ink-tertiary sm:flex-row sm:items-center sm:justify-between">
            <span>© Zeytinci Yusuf. Tüm hakları saklıdır.</span>
            <span className="font-mono">Kırkağaç · Manisa</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
