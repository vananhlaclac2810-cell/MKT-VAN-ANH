"use client";

import Image from "next/image";
import EbookFreeForm from "@/components/ebook/EbookFreeForm";
import EbookPaidForm from "@/components/ebook/EbookPaidForm";
import { HOTLINE, MESSENGER_URL, formatVnd } from "@/lib/products";

const HASOBABY_USPS = [
  {
    icon: "🌿",
    t: "100% thảo dược thiên nhiên",
    d: "6 tinh chất — dùng được cho bé sơ sinh từ 0 tháng",
  },
  {
    icon: "⚡",
    t: "Mát 3 giây · Hạ nhiệt 2-3 phút",
    d: "Bé dịu ngay tức thì, ngủ ngon hơn",
  },
  {
    icon: "🚫",
    t: "KHÔNG cồn · paraben · hóa chất",
    d: "An tâm xịt cho con nhiều lần trong ngày",
  },
  {
    icon: "🤱",
    t: "Hỗ trợ làm dịu sau tiêm",
    d: "Bé bớt quấy khóc, mẹ thức trắng ít hơn",
  },
];

const VACCINATION_REASONS = [
  "Về nhà bé sốt → xịt liền tay, không phải lái xe ra hiệu thuốc giữa đêm",
  "Bé bứt rứt khi nóng người → xịt làm dịu, bé ngủ ngon — mẹ đỡ thức trắng",
  "An tâm dùng cho bé 0 tháng — không giới hạn liều ngặt nghèo như Paracetamol",
];

/* ============================================================
   DATA
   ============================================================ */
const WHY_CARDS = [
  {
    icon: "📅",
    color: "from-sky-100 to-cyan-100",
    iconBg: "bg-cyan-200 text-cyan-700",
    t: "Lịch tiêm đầy đủ — không bỏ sót mũi nào",
    d: "15 mũi từ 0-24 tháng + bảng tra cứu nhanh dán tủ lạnh.",
  },
  {
    icon: "🤱",
    color: "from-yellow-100 to-orange-100",
    iconBg: "bg-orange-200 text-orange-700",
    t: "Xử lý phản ứng sau tiêm — bình tĩnh đúng cách",
    d: "Sốt, sưng đỏ, quấy khóc — khi nào ở nhà, khi nào đi viện.",
  },
  {
    icon: "🍼",
    color: "from-pink-100 to-rose-100",
    iconBg: "bg-rose-200 text-rose-700",
    t: "Mẹo dỗ bé ÍT khóc nhất khi tiêm",
    d: "Kỹ thuật bú mẹ + chuyển hướng + ôm ấp đã được nghiên cứu.",
  },
];

const CHAPTERS = [
  { icon: "🗓️", t: "Lịch tiêm chủng 0-24 tháng (bảng tra cứu)" },
  { icon: "💉", t: "Mũi tiêm bắt buộc & mũi tự nguyện — nên chọn gì" },
  { icon: "🩺", t: "Trước khi tiêm — checklist mẹ cần chuẩn bị" },
  { icon: "🤗", t: "Trong khi tiêm — mẹo dỗ bé ít khóc nhất" },
  { icon: "🌡️", t: "Sau khi tiêm — theo dõi 30 phút & 48h vàng" },
  { icon: "🚨", t: "9 dấu hiệu cần đưa bé đi viện NGAY" },
  { icon: "💊", t: "Hạ sốt sau tiêm — dùng thuốc đúng cách" },
  { icon: "❓", t: "FAQ — 20 câu hỏi thường gặp của mẹ" },
];

const TESTIMONIALS = [
  {
    avatar: "👩‍🍼",
    bg: "bg-cyan-100",
    quote:
      "Cẩm nang chích ngừa giúp em không bỏ sót mũi nào, có lịch in ra dán tủ lạnh luôn. Tải về 2 phút là xong, dễ đọc, không lan man.",
    name: "Chị Lan",
    detail: "mẹ bé 14 tháng",
  },
  {
    avatar: "🤱",
    bg: "bg-orange-100",
    quote:
      "Lần con sốt sau tiêm 39 độ em hoảng, mở ebook ra mới biết khi nào cần đưa đi viện. Đỡ áy náy hẳn, ngủ ngon hơn.",
    name: "Chị Trang",
    detail: "mẹ bé 8 tháng",
  },
  {
    avatar: "👶",
    bg: "bg-pink-100",
    quote:
      "Mua combo 189K thấy quá hời, riêng chai xịt đã đáng tiền, 2 ebook là quà bonus. Lại được vào nhóm Zalo hỏi đáp với Dr.Maya nữa.",
    name: "Chị Hằng",
    detail: "mẹ 2 bé",
  },
];

const FAQS = [
  {
    q: "Em không có Zalo, có nhận được ebook không?",
    a: "Có ạ, ebook gửi qua email — mẹ chỉ cần email là đủ. Nhóm Zalo là kênh hỏi đáp bonus thôi, không bắt buộc.",
  },
  {
    q: "Combo 189K shipping bao lâu?",
    a: "1-3 ngày toàn quốc, COD hoặc chuyển khoản trước. Đơn xác nhận trong ngày, ngày sau là bưu tá gọi giao hàng.",
  },
  {
    q: "Ebook có in ra được không?",
    a: "Có ạ, file PDF chuẩn A4, mẹ có thể in ra dán tủ lạnh hoặc cất trong sổ chăm con.",
  },
  {
    q: "Sau khi tải có bị spam email nữa không?",
    a: "Không ạ. Dr.Maya chỉ gửi tips chăm con 1 tuần 1 lần, mẹ có thể unsubscribe bất kỳ lúc nào trong email.",
  },
];

const COMPARE_ROWS = [
  { feature: "Ebook chích ngừa", free: true, paid: true },
  { feature: "Ebook xử lý sốt", free: false, paid: true },
  { feature: "Vào nhóm Zalo Dr.Maya", free: true, paid: true },
  { feature: "Chai Xịt Hạ Sốt Hasobaby 100ml", free: false, paid: true },
  { feature: "Tips chăm con hàng tuần", free: true, paid: true },
];

/* ============================================================
   PAGE
   ============================================================ */
export default function EbookPage() {
  return (
    <main className="overflow-x-hidden">
      {/* ============ TOP NAV (mini, không sticky) ============ */}
      <header className="border-b border-ink-line/50 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-leaf-500 to-leaf-700 text-white">
              <span className="text-base">🌿</span>
            </span>
            <span className="leading-tight">
              <span className="block font-display text-base font-extrabold text-leaf-700">
                Dr.Maya
              </span>
              <span className="block text-[10px] font-semibold text-mint-600">
                Hasobaby 0+
              </span>
            </span>
          </a>
          <a
            href="/"
            className="text-sm font-semibold text-ink-soft transition-colors hover:text-mint-700"
          >
            ← Về trang chính
          </a>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        {/* Bright gradient background */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-yellow-100 via-orange-50 to-mint-100"
          aria-hidden="true"
        />
        {/* Confetti dots */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-60"
          aria-hidden="true"
        >
          {[
            { l: "8%", t: "12%", c: "bg-yellow-400", s: "h-3 w-3" },
            { l: "22%", t: "28%", c: "bg-pink-300", s: "h-2 w-2" },
            { l: "78%", t: "8%", c: "bg-mint-400", s: "h-3 w-3" },
            { l: "88%", t: "32%", c: "bg-coral-400", s: "h-2 w-2" },
            { l: "15%", t: "65%", c: "bg-cyan-300", s: "h-4 w-4" },
            { l: "70%", t: "72%", c: "bg-sun-400", s: "h-3 w-3" },
            { l: "92%", t: "58%", c: "bg-rose-300", s: "h-2 w-2" },
            { l: "45%", t: "85%", c: "bg-leaf-400", s: "h-3 w-3" },
          ].map((d, i) => (
            <span
              key={i}
              className={`absolute rounded-full ${d.c} ${d.s}`}
              style={{ left: d.l, top: d.t }}
            />
          ))}
        </div>

        <div className="relative mx-auto grid min-h-[88vh] max-w-6xl items-center gap-10 px-5 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:grid-cols-2 lg:gap-12 lg:px-8">
          {/* Copy */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wide text-coral-600 shadow-card">
              🎁 Quà tặng từ Dr.Maya — Có hạn
            </span>

            <h1 className="mt-5 font-display text-[2rem] font-extrabold leading-[1.12] text-ink sm:text-5xl lg:text-[3.2rem]">
              Mẹ ơi, tặng mẹ cuốn{" "}
              <span className="text-mint-600">cẩm nang chích ngừa</span>{" "}
              trị giá 199.000đ —{" "}
              <span className="bg-gradient-to-r from-coral-500 to-sun-500 bg-clip-text text-transparent">
                MIỄN PHÍ
              </span>{" "}
              💛
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-soft sm:text-lg">
              <strong className="text-ink">Lịch tiêm đầy đủ 0-24 tháng</strong>{" "}
              · Xử lý phản ứng sau tiêm · Mẹo dỗ bé khi đi tiêm — soạn bởi
              Dr.Maya cho <strong className="text-ink">50.000+</strong> mẹ
              bỉm Việt.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href="#nhan-qua"
                className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-mint-500 via-cyan-500 to-sky-500 px-6 text-base font-extrabold text-white shadow-soft transition-transform hover:scale-[1.03] sm:text-lg"
              >
                🎁 Nhận ebook miễn phí ngay
              </a>
              <a
                href="#combo-dac-biet"
                className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-full border-2 border-leaf-500 bg-white/90 px-6 text-sm font-bold text-leaf-700 transition-colors hover:border-leaf-600 hover:bg-white sm:text-base"
              >
                💚 Hoặc combo đặc biệt 189K
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-ink-soft sm:text-sm">
              <span className="flex items-center gap-1.5">📚 Soạn bởi Dr.Maya</span>
              <span className="flex items-center gap-1.5">👶 0-24 tháng</span>
              <span className="flex items-center gap-1.5">💌 Vào nhóm Zalo</span>
              <span className="flex items-center gap-1.5">⏱️ Nhận trong 30 giây</span>
            </div>
          </div>

          {/* Ebook mockup */}
          <div className="relative">
            <div className="relative mx-auto max-w-md">
              {/* Soft glow behind book */}
              <div
                className="absolute inset-6 rounded-full bg-gradient-to-br from-sun-300/60 to-mint-300/60 blur-3xl"
                aria-hidden="true"
              />

              {/* CSS Book Mockup */}
              <div className="relative mx-auto" style={{ perspective: "1200px" }}>
                <div
                  className="relative mx-auto aspect-[3/4] max-w-[320px] rotate-[-6deg] rounded-r-2xl rounded-l-md shadow-2xl transition-transform sm:max-w-[360px]"
                  style={{
                    background:
                      "linear-gradient(135deg, #FFD23F 0%, #FF8A5B 60%, #FF6B35 100%)",
                    boxShadow:
                      "0 30px 60px -20px rgba(255, 107, 53, 0.45), -8px 0 0 0 #E8A800, -8px 8px 20px -4px rgba(20, 59, 57, 0.25)",
                  }}
                >
                  {/* Book spine accent */}
                  <div
                    className="absolute left-0 top-0 h-full w-3 rounded-l-md"
                    style={{ background: "rgba(0,0,0,0.18)" }}
                    aria-hidden="true"
                  />
                  {/* Cover content */}
                  <div className="absolute inset-0 flex flex-col justify-between p-7">
                    <div>
                      <span className="inline-block rounded-full bg-white/95 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-coral-600">
                        Ebook MIỄN PHÍ
                      </span>
                      <div className="mt-6 text-6xl">📖</div>
                      <h3 className="mt-4 font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                        Cẩm nang
                        <br />
                        Chích Ngừa
                        <br />
                        An Toàn
                      </h3>
                      <p className="mt-2 text-sm font-semibold text-white/95">
                        Cho bé 0-24 tháng
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/90">
                        Dr.Maya
                      </p>
                      <p className="text-[10px] text-white/80">10 trang · PDF</p>
                    </div>
                  </div>
                </div>

                {/* Floating price badge */}
                <div className="absolute -right-2 top-6 rotate-6 rounded-2xl bg-white px-4 py-2 shadow-card sm:-right-6">
                  <p className="text-[10px] font-bold uppercase text-ink-soft">
                    Trị giá
                  </p>
                  <p className="font-display text-lg font-extrabold text-ink line-through decoration-coral-500 decoration-2">
                    199K
                  </p>
                </div>

                <div className="absolute -left-4 bottom-10 -rotate-6 rounded-2xl bg-gradient-to-r from-mint-500 to-cyan-500 px-4 py-2 shadow-card sm:-left-6">
                  <p className="text-[10px] font-bold uppercase text-white/90">
                    Hôm nay
                  </p>
                  <p className="font-display text-2xl font-extrabold text-white">
                    0đ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ WHY THIS EBOOK ============ */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-mint-100 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wide text-mint-700">
              💡 Lý do mẹ nên tải
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
              3 lý do mẹ NÊN tải cẩm nang này NGAY hôm nay
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {WHY_CARDS.map((c) => (
              <article
                key={c.t}
                className={`rounded-3xl bg-gradient-to-br ${c.color} p-7 shadow-card transition-transform hover:-translate-y-1`}
              >
                <span
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${c.iconBg}`}
                  aria-hidden="true"
                >
                  {c.icon}
                </span>
                <h3 className="mt-5 font-display text-lg font-extrabold text-ink">
                  {c.t}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {c.d}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WHAT'S INSIDE ============ */}
      <section className="bg-gradient-to-br from-mint-50 via-cyan-50 to-sky-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-sun-100 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wide text-sun-600">
              📖 Bên trong có gì
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Mẹ sẽ học được gì trong 10 trang ebook?
            </h2>
            <p className="mt-3 text-ink-soft">
              8 chương — đọc xong trong 30 phút, dùng được cả 2 năm.
            </p>
          </div>

          <div className="mt-12 grid items-center gap-10 lg:grid-cols-5">
            {/* Mini book mockup */}
            <div className="lg:col-span-2">
              <div
                className="relative mx-auto aspect-[3/4] max-w-[280px] rotate-[3deg] rounded-r-xl rounded-l-sm shadow-xl"
                style={{
                  background:
                    "linear-gradient(135deg, #FFD23F 0%, #FF8A5B 60%, #FF6B35 100%)",
                  boxShadow:
                    "0 24px 50px -16px rgba(255, 107, 53, 0.4), -6px 0 0 0 #E8A800",
                }}
              >
                <div className="absolute inset-0 flex flex-col justify-between p-6">
                  <div>
                    <span className="inline-block rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-extrabold uppercase text-coral-600">
                      10 trang · PDF
                    </span>
                    <div className="mt-5 text-5xl">📖</div>
                    <h3 className="mt-3 font-display text-xl font-extrabold leading-tight text-white">
                      Cẩm nang
                      <br />
                      Chích Ngừa
                    </h3>
                  </div>
                  <p className="text-[10px] font-bold uppercase text-white/90">
                    Dr.Maya
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="rounded-full bg-coral-100 px-3 py-1 text-xs font-bold text-coral-600">
                  10 trang
                </span>
                <span className="rounded-full bg-sun-100 px-3 py-1 text-xs font-bold text-sun-600">
                  Trị giá 199.000đ
                </span>
              </div>
            </div>

            {/* Chapter list */}
            <div className="lg:col-span-3">
              <ul className="space-y-3">
                {CHAPTERS.map((ch, i) => (
                  <li
                    key={ch.t}
                    className="flex items-center gap-3 rounded-2xl border border-mint-100 bg-white px-4 py-3 shadow-card transition-transform hover:translate-x-1"
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-mint-100 to-cyan-100 text-xl"
                      aria-hidden="true"
                    >
                      {ch.icon}
                    </span>
                    <span className="text-sm font-semibold text-ink">
                      <span className="mr-2 font-display text-mint-600">
                        Chương {i + 1}.
                      </span>
                      {ch.t}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HASOBABY INTRO — bạn đồng hành ngày con đi tiêm ============ */}
      <section className="relative overflow-hidden bg-white py-16 sm:py-20">
        {/* Soft decorative blobs */}
        <div
          className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-mint-200/40 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-24 bottom-12 h-72 w-72 rounded-full bg-sun-200/50 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            {/* === Product image === */}
            <div className="relative order-2 lg:order-1">
              <div
                className="absolute inset-6 rounded-full bg-gradient-to-br from-mint-300/50 to-sun-300/50 blur-3xl"
                aria-hidden="true"
              />
              <div className="relative mx-auto max-w-md overflow-hidden rounded-[2.5rem] border-4 border-white bg-white shadow-soft">
                <Image
                  src="/products/hasobaby-main.jpg"
                  alt="Xịt Hạ Sốt Hasobaby 0+ Dr.Maya — chai 100ml thảo dược cho bé sơ sinh"
                  width={1080}
                  height={1080}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Floating badges */}
              <div className="absolute left-0 top-6 flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 shadow-card sm:-left-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mint-100 text-xl">
                  ⚡
                </span>
                <span className="text-sm leading-tight">
                  <span className="block font-bold text-ink">Mát sau 3 giây</span>
                  <span className="block text-xs text-ink-soft">Bé dịu ngay</span>
                </span>
              </div>
              <div className="absolute bottom-16 right-0 flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 shadow-card sm:-right-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-coral-100 text-xl">
                  👶
                </span>
                <span className="text-sm leading-tight">
                  <span className="block font-bold text-ink">Dùng từ 0 tháng</span>
                  <span className="block text-xs text-ink-soft">Thảo dược lành tính</span>
                </span>
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-sun-400 to-sun-500 px-5 py-2 text-center shadow-card">
                <span className="font-display text-sm font-extrabold text-ink">
                  {formatVnd(189000)} / chai 100ml
                </span>
              </div>
            </div>

            {/* === Copy === */}
            <div className="order-1 lg:order-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-mint-100 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wide text-mint-700">
                💚 Bạn đồng hành ngày con đi tiêm
              </span>
              <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
                Mẹ ơi, làm quen với{" "}
                <span className="text-mint-600">Xịt Hạ Sốt Hasobaby</span> — chai
                xịt mẹ <em className="not-italic text-coral-500">nên có sẵn</em>{" "}
                cho ngày con đi tiêm 💛
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">
                Đa số bé sốt nhẹ sau khi tiêm chủng. Có sẵn chai xịt trong tủ
                lạnh, mẹ chủ động{" "}
                <strong className="text-ink">làm mát con trong 3 giây</strong>{" "}
                ngay khi vừa thấy nóng người — không cần lích kích lau khăn,
                không phải đợi thuốc ngấm 30 phút.
              </p>

              {/* 4 USP cards */}
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {HASOBABY_USPS.map((u) => (
                  <li
                    key={u.t}
                    className="flex gap-3 rounded-2xl bg-mint-50 p-4 ring-1 ring-mint-100"
                  >
                    <span className="text-2xl leading-none">{u.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-ink">{u.t}</p>
                      <p className="mt-0.5 text-xs leading-snug text-ink-soft">
                        {u.d}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Day of vaccination — 3 lý do */}
              <div className="mt-6 rounded-3xl border-2 border-coral-100 bg-coral-50 p-5 sm:p-6">
                <p className="text-xs font-extrabold uppercase tracking-wide text-coral-600 sm:text-sm">
                  🍼 Tại sao Hasobaby = bạn đồng hành NGÀY CON ĐI TIÊM?
                </p>
                <ol className="mt-3 space-y-2 text-sm text-ink-soft sm:text-base">
                  {VACCINATION_REASONS.map((r, i) => (
                    <li key={r} className="flex gap-2">
                      <span className="font-extrabold text-coral-500">
                        {i + 1}.
                      </span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <a
                href="#combo-dac-biet"
                className="mt-6 inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-leaf-500 to-leaf-700 px-6 text-base font-extrabold text-white shadow-soft transition-transform hover:scale-[1.03]"
              >
                💚 Xem combo 189K — tặng kèm 2 ebook ↓
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 2 PATH CTA ============ */}
      <section
        id="path-cta"
        className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-cream to-mint-50 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-coral-100 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wide text-coral-600">
              ⭐ Mẹ chọn cách nào?
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Mẹ chọn cách nào để nhận cẩm nang?
            </h2>
            <p className="mt-3 text-ink-soft">
              2 lựa chọn — mẹ thoải mái pick cái phù hợp với mẹ nhất 💛
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 md:gap-7">
            {/* Path A — FREE */}
            <div id="nhan-qua" className="scroll-mt-20">
              <EbookFreeForm />
            </div>

            {/* Path B — PAID */}
            <div id="combo-dac-biet" className="scroll-mt-20">
              <EbookPaidForm />
            </div>
          </div>
        </div>
      </section>

      {/* ============ COMPARE TABLE ============ */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-mint-100 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wide text-mint-700">
              🔍 So sánh
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Mẹ nhận được gì với mỗi lựa chọn?
            </h2>
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border border-ink-line bg-white shadow-card">
            <table className="w-full text-left text-sm sm:text-base">
              <thead>
                <tr className="bg-gradient-to-r from-mint-100 via-cyan-100 to-sky-100">
                  <th className="px-4 py-4 font-display font-extrabold text-ink sm:px-6">
                    Đặc điểm
                  </th>
                  <th className="px-3 py-4 text-center font-display font-extrabold text-mint-700 sm:px-6">
                    🎁 Miễn phí
                  </th>
                  <th className="px-3 py-4 text-center font-display font-extrabold text-coral-600 sm:px-6">
                    💚 Combo 189K
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={i % 2 === 0 ? "bg-white" : "bg-cream/40"}
                  >
                    <td className="px-4 py-3.5 font-semibold text-ink sm:px-6">
                      {row.feature}
                    </td>
                    <td className="px-3 py-3.5 text-center sm:px-6">
                      {row.free ? (
                        <span className="text-xl text-mint-600">✅</span>
                      ) : (
                        <span className="text-xl text-ink-soft/40">❌</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-center sm:px-6">
                      {row.paid ? (
                        <span className="text-xl text-leaf-600">✅</span>
                      ) : (
                        <span className="text-xl text-ink-soft/40">❌</span>
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gradient-to-r from-sun-50 to-orange-50 font-display font-extrabold">
                  <td className="px-4 py-4 text-ink sm:px-6">Phí</td>
                  <td className="px-3 py-4 text-center text-xl text-mint-600 sm:px-6">
                    0đ
                  </td>
                  <td className="px-3 py-4 text-center text-xl text-coral-600 sm:px-6">
                    189K
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="bg-gradient-to-br from-pink-50 via-yellow-50 to-cream py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wide text-rose-600">
              💬 Mẹ bỉm nói gì
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
              50.000+ mẹ đã nhận ebook & cảm nhận
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <article
                key={t.name}
                className="rounded-3xl bg-white p-6 shadow-card transition-transform hover:-translate-y-1"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${t.bg}`}
                    aria-hidden="true"
                  >
                    {t.avatar}
                  </span>
                  <div>
                    <p className="font-display font-extrabold text-ink">
                      {t.name}
                    </p>
                    <p className="text-xs text-ink-soft">{t.detail}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-0.5 text-sun-500">
                  {[0, 1, 2, 3, 4].map((s) => (
                    <span key={s}>★</span>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wide text-cyan-700">
              ❓ FAQ
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Mẹ thường thắc mắc
            </h2>
          </div>

          <div className="mt-10 space-y-3">
            {FAQS.map((f, i) => (
              <details
                key={i}
                className="group rounded-2xl border border-ink-line bg-cream/50"
                {...(i === 0 ? { open: true } : {})}
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 font-bold text-ink sm:px-6 sm:py-5">
                  <span>{f.q}</span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mint-100 text-mint-600 transition-transform group-open:rotate-45">
                    <svg
                      viewBox="0 0 20 20"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path d="M10 4v12M4 10h12" />
                    </svg>
                  </span>
                </summary>
                <div className="px-5 pb-5 leading-relaxed text-ink-soft sm:px-6 sm:pb-6">
                  {f.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA STRIP ============ */}
      <section className="bg-gradient-to-r from-mint-500 via-cyan-500 to-sky-500 py-12">
        <div className="mx-auto max-w-4xl px-5 text-center text-white sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
            Sẵn sàng đồng hành cùng con qua mỗi mũi tiêm? 💛
          </h2>
          <p className="mt-3 text-white/90">
            2 lựa chọn — mẹ chỉ cần 30 giây là có ebook trong tay.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href="#nhan-qua"
              className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-full bg-white px-7 font-extrabold text-mint-700 shadow-soft transition-transform hover:scale-[1.03]"
            >
              🎁 Nhận miễn phí
            </a>
            <a
              href="#combo-dac-biet"
              className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-full bg-coral-500 px-7 font-extrabold text-white shadow-soft transition-transform hover:scale-[1.03]"
            >
              💚 Combo đặc biệt 189K
            </a>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-ink py-10 text-cream/80">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-leaf-500 to-leaf-700 text-xl text-white">
                🌿
              </span>
              <div>
                <p className="font-display text-lg font-extrabold text-cream">
                  Dr.Maya
                </p>
                <a
                  href="https://drmayastore.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-mint-300 hover:text-cream"
                >
                  drmayastore.vn
                </a>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 text-sm sm:items-end">
              <a
                href={`tel:${HOTLINE}`}
                className="font-semibold text-mint-300 hover:text-cream"
              >
                Hotline: {HOTLINE}
              </a>
              <a
                href={MESSENGER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs hover:text-cream"
              >
                Nhắn tin Messenger
              </a>
            </div>
          </div>
          <p className="mt-6 border-t border-cream/10 pt-5 text-center text-[11px] leading-relaxed text-cream/55">
            © 2026 Dr.Maya. Sản phẩm Xịt Hạ Sốt Hasobaby 0+ là sản phẩm hỗ trợ
            làm mát,{" "}
            <strong className="text-cream/75">
              không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh
            </strong>
            .
          </p>
        </div>
      </footer>
    </main>
  );
}
