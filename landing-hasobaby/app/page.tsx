"use client";

import Image from "next/image";
import { useEffect } from "react";
import OrderForm from "@/components/OrderForm";
import { COMBOS, formatVnd, MESSENGER_URL, HOTLINE } from "@/lib/products";

/* ============================================================
   DATA
   ============================================================ */
const TRUST = [
  { icon: "baby", t: "An toàn cho bé 0 tháng", d: "Thảo dược lành tính" },
  { icon: "leaf", t: "100% thảo dược", d: "6 tinh chất thiên nhiên" },
  { icon: "drop", t: "Mát chỉ sau 3 giây", d: "Bé dịu ngay tức thì" },
  { icon: "thermo", t: "Hạ nhiệt sau 2–3 phút", d: "Hỗ trợ hạ thân nhiệt" },
];

const PAINS = [
  {
    img: "pain-vaccine",
    wide: true,
    t: "Mỗi lần đưa con đi tiêm phòng về, con lại sốt, nóng người, quấy khóc — mẹ thương con mà chẳng biết làm sao cho con dịu nhanh.",
  },
  { img: "pain-1", wide: false, t: "0h sáng con nóng ran người, mẹ luống cuống không biết làm sao cho nhanh." },
  { img: "pain-3", wide: false, t: "Lau người bằng khăn ấm lích kích, con giãy khóc — mẹ càng rối." },
  { img: "pain-2", wide: false, t: "Sợ cho con uống thuốc hạ sốt quá sớm, quá nhiều khi con còn nhỏ xíu." },
  { img: "pain-4", wide: false, t: "Con bứt rứt, trằn trọc khó ngủ — cả nhà thức trắng theo con." },
];

const USPS = [
  {
    img: "usp-1",
    t: "Mát chỉ sau 3 giây",
    d: "Xịt lên da, cảm giác mát lan tỏa tức thì giúp bé dịu cơn nóng người.",
  },
  {
    img: "usp-2",
    t: "Hạ thân nhiệt sau 2–3 phút",
    d: "Hỗ trợ đưa thân nhiệt của bé về mức dễ chịu chỉ trong ít phút.",
  },
  {
    img: "usp-3",
    t: "Xịt là xong — không pha, không lau",
    d: "Thao tác gọn trong 1 giây, không cần pha nước, không cần lau người.",
  },
  {
    img: "usp-4",
    t: "Thảo dược — dùng từ 0 tháng",
    d: "Công thức 6 thảo dược lành tính, an toàn cho cả trẻ sơ sinh.",
  },
  {
    img: "usp-5",
    t: "4 KHÔNG tuyệt đối",
    d: "Không cồn · không paraben · không phẩm màu · không hóa chất mạnh.",
  },
  {
    img: "usp-6",
    t: "Vừa làm mát vừa dưỡng ẩm",
    d: "Lô hội trong công thức làm dịu, dưỡng ẩm vùng da bé khi sốt.",
  },
];

const INGREDIENTS = [
  { img: "ing-tram-gio", name: "Tràm gió", d: "Tinh dầu ấm dịu, kháng khuẩn — thảo dược quen thuộc của mẹ Việt." },
  { img: "ing-bac-ha", name: "Bạc hà", d: "Menthol tự nhiên tạo cảm giác mát lạnh tức thì, thông thoáng." },
  { img: "ing-hung-chanh", name: "Húng chanh", d: "Thảo dược lành tính, hỗ trợ làm dịu khi bé nóng sốt." },
  { img: "ing-huong-nhu", name: "Hương nhu", d: "Theo dân gian giúp giải cảm, làm mát cơ thể nhẹ nhàng." },
  { img: "ing-dinh-huong", name: "Đinh hương", d: "Hương ấm dịu, hỗ trợ kháng khuẩn tự nhiên." },
  { img: "ing-lo-hoi", name: "Lô hội", d: "Dưỡng ẩm, làm dịu mát vùng da bé — chống khô rát khi sốt." },
];

const STEPS = [
  { img: "step-1", t: "Lắc đều chai", d: "Lắc nhẹ chai trước mỗi lần sử dụng." },
  { img: "step-2", t: "Giữ khoảng cách", d: "Để đầu xịt cách vùng da bé khoảng 10–15cm." },
  { img: "step-3", t: "Xịt làm mát", d: "Xịt lên tay, chân, lưng — hoặc xịt ra khăn mềm rồi lau nhẹ." },
  { img: "step-4", t: "Vỗ nhẹ thẩm thấu", d: "Vỗ nhẹ cho tinh chất thấm vào da, không cần lau lại." },
];

const AUDIENCE = [
  {
    img: "aud-1",
    t: "Trẻ sơ sinh từ 0 tháng",
    d: "Công thức lành tính, mẹ yên tâm dùng cho con ngay từ những ngày đầu đời.",
  },
  {
    img: "aud-2",
    t: "Bé sốt sau tiêm phòng, mọc răng",
    d: "Hỗ trợ làm mát, giúp con dịu cơn sốt nhẹ, bớt quấy khóc và ngủ ngon hơn.",
  },
  {
    img: "aud-3",
    t: "Người lớn cần làm mát nhanh",
    d: "Cả nhà đều dùng được khi nóng người, mệt mỏi, oi bức.",
  },
];

const VIDEO_REVIEWS = [
  { src: "review-1", cap: "Có con rồi mới hiểu — mỗi lần con sốt nhẹ" },
  { src: "review-2", cap: "Sốt mọc răng, sốt sau tiêm phòng" },
  { src: "review-3", cap: "Đi tiêm về là cần ngay bảo bối" },
  { src: "review-4", cap: "Sốt sau tiêm phòng là phản ứng của cơ thể" },
];

const FANPAGE_IMAGES = [
  { f: "goldspots", alt: "Mẹo xịt 3 điểm vàng trên cơ thể bé" },
  { f: "compare", alt: "Hasobaby mát da chỉ sau 3 giây" },
  { f: "provinces", alt: "Hasobaby có mặt khắp 34 tỉnh thành" },
  { f: "convenient", alt: "Không lỉnh kỉnh khăn lau chậu nước" },
  { f: "season", alt: "Chăm bé khoẻ mạnh ngày giao mùa" },
];

const FAQS = [
  {
    q: "Bé mấy tháng tuổi thì dùng được?",
    a: "Hasobaby 0+ có công thức thảo dược lành tính, dùng được cho trẻ <strong>từ sơ sinh 0 tháng tuổi</strong>. Người lớn cần làm mát cơ thể cũng dùng được.",
  },
  {
    q: "Con đi tiêm phòng về bị sốt có dùng Hasobaby được không?",
    a: "Có ạ. Sốt nhẹ, nóng người sau tiêm phòng là phản ứng thường gặp ở trẻ. Hasobaby hỗ trợ <strong>làm mát, giúp con dịu cơn khó chịu, bớt quấy khóc</strong> — mẹ xịt nhẹ lên tay, chân, lưng cho con. Lưu ý Hasobaby là sản phẩm hỗ trợ làm mát, không phải thuốc: nếu con sốt cao trên 38,5°C, mẹ cần theo dõi và dùng thuốc hạ sốt theo hướng dẫn của bác sĩ.",
  },
  {
    q: "Xịt hạ sốt có thay thế thuốc hạ sốt không?",
    a: "<strong>Không.</strong> Hasobaby là sản phẩm hỗ trợ làm mát, giúp bé dễ chịu — không phải thuốc và không thay thế thuốc chữa bệnh. Khi bé sốt cao, mẹ vẫn cần theo dõi nhiệt độ và dùng thuốc hạ sốt hoặc đưa bé đi khám theo hướng dẫn của bác sĩ.",
  },
  {
    q: "Sản phẩm có chứa cồn hay hóa chất mạnh không?",
    a: "Hoàn toàn không. Hasobaby cam kết <strong>4 KHÔNG</strong>: không cồn, không paraben, không phẩm màu, không hóa chất mạnh.",
  },
  {
    q: "Nên xịt vào vùng nào trên cơ thể bé?",
    a: "Mẹ xịt lên tay, chân, lưng hoặc vùng da nóng của bé. <strong>Tránh xịt trực tiếp vào mặt, mắt, miệng và vết thương hở.</strong> Với vùng mặt, mẹ xịt ra khăn mềm rồi lau nhẹ cho bé.",
  },
  {
    q: "Một chai dùng được bao lâu?",
    a: "Mỗi chai dung tích 100ml. Mẹ nên có sẵn 2–3 chai — một chai để nhà, một chai mang theo trong túi bỉm khi đưa bé ra ngoài.",
  },
  {
    q: "Đặt hàng và thanh toán như thế nào?",
    a: "Mẹ điền form đặt hàng phía dưới và chọn gói phù hợp. Sau khi đặt, mẹ thanh toán nhanh bằng mã QR chuyển khoản. Cần tư vấn thêm, mẹ nhắn Messenger hoặc gọi hotline " + HOTLINE + ".",
  },
];

/* ============================================================
   ICON
   ============================================================ */
function Ic({ name, className = "h-6 w-6" }: { name: string; className?: string }) {
  // Stroked icons render as outlines; the rest render as solid fills.
  const strokeSet = new Set([
    "spray",
    "check",
    "phone",
    "chat",
    "gift",
    "thermo",
    "shield",
    "leaf",
  ]);
  const isStroke = strokeSet.has(name);
  const d: Record<string, React.ReactNode> = {
    drop: <path d="M12 2.5C12 2.5 5 10 5 14.5a7 7 0 1 0 14 0C19 10 12 2.5 12 2.5Z" />,
    heart: (
      <path d="M12 20s-7-4.3-7-10a4.2 4.2 0 0 1 7-3 4.2 4.2 0 0 1 7 3c0 5.7-7 10-7 10Z" />
    ),
    star: (
      <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 18.4 6.1 21l1.2-6.5L2.5 9.9l6.6-.9L12 2.5Z" />
    ),
    bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />,
    moon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" />,
    sparkle: (
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
    ),
    baby: (
      <g>
        <circle cx="12" cy="6.6" r="3.4" />
        <path d="M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7Z" />
      </g>
    ),
    leaf: <path d="M5 19C5 9 11 4 20 4c0 10-6 15-15 15Zm0 0c2-5 5-8 9-10" />,
    thermo: (
      <path d="M14 14.76V5a2 2 0 1 0-4 0v9.76a4 4 0 1 0 4 0Z" />
    ),
    shield: (
      <path d="M12 3 4.5 5.5V11c0 4.5 3.1 8.4 7.5 9.8 4.4-1.4 7.5-5.3 7.5-9.8V5.5L12 3Zm-3 8.5 2.2 2.2L15.5 9.5" />
    ),
    spray: (
      <path d="M10 9.5h5V20a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V9.5Zm1.5 0V6h2v3.5M14 4h3M14 6.2h2.4" />
    ),
    check: <path d="M20 6 9 17l-5-5" />,
    phone: (
      <path d="M16.8 21c-8 0-13.8-5.8-13.8-13.8 0-1 .8-1.9 1.9-1.9h2.8c.5 0 1 .4 1.1.9l.9 3c.1.4 0 .9-.4 1.2l-1.7 1.5a13 13 0 0 0 4.7 4.7l1.5-1.7c.3-.4.8-.5 1.2-.4l3 .9c.5.1.9.6.9 1.1v2.8c0 1-.9 1.9-1.9 1.9Z" />
    ),
    chat: (
      <path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5Z" />
    ),
    gift: (
      <path d="M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8M3 8h18v4H3V8Zm9 0v13M12 8S10.6 4 8 4a2 2 0 1 0 0 4h4Zm0 0s1.4-4 4-4a2 2 0 1 1 0 4h-4Z" />
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={isStroke ? "none" : "currentColor"}
      stroke={isStroke ? "currentColor" : "none"}
      strokeWidth={isStroke ? 1.9 : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {d[name]}
    </svg>
  );
}

/* ============================================================
   PAGE
   ============================================================ */
export default function Page() {
  useEffect(() => {
    // Reveal on scroll
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "-50px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    // Scroll progress + sticky CTA
    const bar = document.getElementById("progress");
    const sticky = document.getElementById("stickyCta");
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      const pct = total > 0 ? h.scrollTop / total : 0;
      if (bar) bar.style.transform = `scaleX(${pct})`;
      if (sticky) {
        if (h.scrollTop > window.innerHeight * 0.8) sticky.classList.add("show");
        else sticky.classList.remove("show");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Count-up
    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          const target = parseInt(el.dataset.count || "0", 10);
          const suffix = el.dataset.suffix || "";
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min((now - start) / 1400, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent =
              Math.floor(target * eased).toLocaleString("vi-VN") + suffix;
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          co.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    document.querySelectorAll("[data-count]").forEach((el) => co.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
      co.disconnect();
    };
  }, []);

  return (
    <main className="overflow-x-hidden">
      <div className="scroll-progress" id="progress" aria-hidden="true" />

      {/* ============ STICKY MOBILE CTA ============ */}
      <a
        href="#dat-hang"
        id="stickyCta"
        className="sticky-cta btn-shine flex min-h-[54px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-coral-500 to-coral-600 px-6 font-bold text-white shadow-soft"
      >
        <Ic name="drop" className="h-5 w-5" />
        Đặt mua ngay — chỉ từ {formatVnd(189000)}
      </a>

      {/* ============ FLOATING MESSENGER ============ */}
      <a
        href={MESSENGER_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Nhắn tin Messenger với Dr.Maya"
        className="anim-pulse-ring fixed bottom-[5.75rem] right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-mint-400 to-mint-600 text-white shadow-soft transition-transform hover:scale-110 lg:bottom-[6.75rem]"
      >
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z" />
        </svg>
      </a>

      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-40 border-b border-ink-line/70 bg-cream/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:h-20 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-leaf-500 to-leaf-700 text-white">
              <Ic name="leaf" className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-lg font-extrabold text-leaf-700">
                Dr.Maya
              </span>
              <span className="block text-[11px] font-semibold text-mint-600">
                Hasobaby 0+
              </span>
            </span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-ink-soft md:flex">
            <a className="transition-colors hover:text-mint-700" href="#san-pham">Sản phẩm</a>
            <a className="transition-colors hover:text-mint-700" href="#thanh-phan">Thành phần</a>
            <a className="transition-colors hover:text-mint-700" href="#cach-dung">Cách dùng</a>
            <a className="transition-colors hover:text-mint-700" href="#bang-gia">Bảng giá</a>
            <a className="transition-colors hover:text-mint-700" href="#review">Đánh giá</a>
          </nav>
          <a
            href="#dat-hang"
            className="btn-shine inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-gradient-to-r from-coral-500 to-coral-600 px-5 text-sm font-bold text-white shadow-soft"
          >
            Đặt mua
            <Ic name="check" className="h-4 w-4" />
          </a>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section id="top" className="relative overflow-hidden">
        <div
          className="anim-gradient absolute inset-0 bg-gradient-to-br from-mint-100 via-cream to-sun-100"
          aria-hidden="true"
        />
        <Blob className="-left-24 -top-20 h-80 w-80 bg-mint-300/40" />
        <Blob className="-right-24 top-32 h-96 w-96 bg-sun-300/40" />
        <CoolDrops />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-14 lg:grid-cols-2 lg:gap-14 lg:px-8">
          {/* Copy */}
          <div className="reveal">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-leaf-700 shadow-card">
              <Ic name="leaf" className="h-4 w-4" />
              Thảo dược thiên nhiên · An toàn cho bé 0 tháng
            </span>

            <h1 className="mt-5 font-display text-[2.1rem] font-extrabold leading-[1.12] text-ink sm:text-5xl lg:text-[3.4rem]">
              Con đi tiêm về bị sốt?
              <br />
              <span className="text-mint-600">3 giây là mát</span>, bé dễ chịu —
              mẹ an tâm
            </h1>

            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">
              <strong className="text-ink">Xịt Hạ Sốt Hasobaby 0+</strong> của
              Dr.Maya — công thức thảo dược thiên nhiên giúp con dịu mát nhanh
              khi <strong className="text-ink">sốt sau tiêm phòng</strong>, mọc
              răng hay nóng người. Không cần pha nước, không cần lau người.
            </p>

            <ul className="check-list mt-6 space-y-2.5 text-ink">
              <li>Đồng hành cùng con sau mỗi mũi tiêm phòng, mọc răng</li>
              <li>Mát chỉ sau 3 giây — hỗ trợ hạ thân nhiệt sau 2–3 phút</li>
              <li>Thảo dược lành tính — dùng được cho trẻ sơ sinh từ 0 tháng</li>
              <li>Không cồn · không paraben · không phẩm màu</li>
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#dat-hang"
                className="btn-shine inline-flex min-h-[56px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-coral-500 to-coral-600 px-7 text-lg font-bold text-white shadow-soft transition-transform hover:scale-[1.03]"
              >
                Đặt mua ngay
                <Ic name="drop" className="h-5 w-5" />
              </a>
              <a
                href="#san-pham"
                className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-full border-2 border-mint-300 bg-white/70 px-7 font-bold text-mint-700 transition-colors hover:border-mint-500"
              >
                Tìm hiểu thêm
              </a>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2.5">
                {["mom-1", "mom-2", "mom-3"].map((m) => (
                  <div
                    key={m}
                    className="h-10 w-10 overflow-hidden rounded-full border-2 border-cream bg-mint-100"
                  >
                    <Image
                      src={`/illustrations/${m}.jpg`}
                      alt=""
                      width={1024}
                      height={1024}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-ink-soft">
                <span
                  className="font-extrabold text-ink"
                  data-count="12000"
                  data-suffix="+"
                >
                  0
                </span>{" "}
                mẹ bỉm đã tin chọn cho con
              </p>
            </div>
          </div>

          {/* Product image */}
          <div className="reveal relative" data-delay="1">
            <div className="relative mx-auto max-w-md">
              <div
                className="absolute inset-6 rounded-full bg-gradient-to-br from-mint-300/60 to-sun-300/60 blur-2xl"
                aria-hidden="true"
              />
              <div className="anim-float relative overflow-hidden rounded-[2.5rem] border-4 border-white bg-white shadow-soft">
                <Image
                  src="/products/hasobaby-2.jpg"
                  alt="Xịt Hạ Sốt Hasobaby 0+ Dr.Maya — chai và hộp sản phẩm"
                  width={1080}
                  height={1080}
                  priority
                  className="h-full w-full object-cover"
                />
              </div>

              {/* floating badges */}
              <div className="anim-float-slow absolute -left-3 top-10 flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 shadow-card sm:-left-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mint-100 text-mint-600">
                  <Ic name="drop" className="h-5 w-5" />
                </span>
                <span className="text-sm">
                  <span className="block font-bold text-ink">Mát sau 3 giây</span>
                  <span className="block text-xs text-ink-soft">Bé dịu ngay</span>
                </span>
              </div>
              <div className="anim-float absolute -right-3 bottom-20 flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 shadow-card sm:-right-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-coral-100 text-coral-500">
                  <Ic name="thermo" className="h-5 w-5" />
                </span>
                <span className="text-sm">
                  <span className="block font-bold text-ink">Hạ nhiệt 2–3′</span>
                  <span className="block text-xs text-ink-soft">An toàn dịu nhẹ</span>
                </span>
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-sun-400 to-sun-500 px-5 py-2 text-center shadow-card">
                <span className="font-display text-sm font-extrabold text-ink">
                  Chỉ từ {formatVnd(189000)} / chai 100ml
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST BAR ============ */}
      <section className="border-y border-ink-line/70 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-5 px-5 py-7 sm:px-6 md:grid-cols-4 lg:px-8">
          {TRUST.map((x, i) => (
            <div key={x.t} className="reveal flex items-center gap-3" data-delay={String(i + 1)}>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mint-100 text-mint-600">
                <Ic name={x.icon} className="h-6 w-6" />
              </span>
              <span>
                <span className="block text-sm font-bold text-ink">{x.t}</span>
                <span className="block text-xs text-ink-soft">{x.d}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ============ PAIN ============ */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <Blob className="-right-20 top-10 h-72 w-72 bg-coral-100/70" />
        <div className="relative mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
          <div className="reveal mx-auto max-w-2xl text-center">
            <SectionTag icon="moon" tone="coral">
              Nỗi lo mỗi khi con sốt
            </SectionTag>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Con đi tiêm phòng về bị sốt — nỗi lo quen thuộc của mẹ
            </h2>
            <p className="mt-4 text-ink-soft">
              Sau mỗi mũi tiêm, lúc mọc răng hay những đêm trở trời — con sốt,
              nóng người, quấy khóc khiến mẹ chẳng lúc nào yên lòng.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {PAINS.map((p, i) => (
              <div
                key={i}
                className={`reveal flex items-center gap-4 rounded-3xl border p-4 sm:p-5 ${
                  p.wide
                    ? "border-coral-300 bg-coral-100/80 sm:col-span-2"
                    : "border-coral-100 bg-coral-100/40"
                }`}
                data-delay={String((i % 2) + 1)}
              >
                <div
                  className={`shrink-0 overflow-hidden rounded-2xl bg-white ${
                    p.wide ? "h-28 w-28 sm:h-32 sm:w-32" : "h-24 w-24 sm:h-28 sm:w-28"
                  }`}
                >
                  <Image
                    src={`/illustrations/${p.img}.jpg`}
                    alt=""
                    width={1024}
                    height={1024}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  {p.wide && (
                    <span className="mb-1.5 inline-block rounded-full bg-coral-500 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-white">
                      Tình huống thường gặp nhất
                    </span>
                  )}
                  <p className="leading-relaxed text-ink">{p.t}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="reveal mt-8 rounded-2xl bg-gradient-to-r from-mint-500 to-leaf-500 p-6 text-center text-white sm:p-7">
            <p className="font-display text-lg font-bold sm:text-xl">
              Dù con sốt sau tiêm phòng, mọc răng hay sốt đêm — mẹ cần một giải
              pháp <span className="text-sun-300">nhanh, an toàn, dễ dùng</span>{" "}
              ngay tại nhà.
            </p>
          </div>
        </div>
      </section>

      {/* ============ SOLUTION + USP ============ */}
      <section id="san-pham" className="relative overflow-hidden bg-mint-50 py-16 sm:py-24">
        <Blob className="-left-24 top-20 h-80 w-80 bg-mint-200/60" />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <div className="reveal mx-auto max-w-2xl text-center">
            <SectionTag icon="sparkle" tone="mint">
              Giải pháp Hasobaby 0+
            </SectionTag>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Xịt là mát — không cần pha, không cần lau
            </h2>
            <p className="mt-4 text-ink-soft">
              6 lý do khiến hàng nghìn mẹ bỉm chọn Hasobaby để bên con mỗi khi
              con nóng sốt.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {USPS.map((u, i) => (
              <article
                key={u.t}
                className="card-hover reveal overflow-hidden rounded-3xl bg-white shadow-card"
                data-delay={String((i % 3) + 1)}
              >
                <div className="aspect-[4/3] bg-mint-50">
                  <Image
                    src={`/illustrations/${u.img}.jpg`}
                    alt={u.t}
                    width={1024}
                    height={1024}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-lg font-bold text-ink">{u.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{u.d}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FANPAGE GALLERY ============ */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <div className="reveal mx-auto max-w-2xl text-center">
            <SectionTag icon="sparkle" tone="mint">
              Hình ảnh từ Hasobaby
            </SectionTag>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Những điều mẹ nên biết về Hasobaby
            </h2>
            <p className="mt-4 text-ink-soft">
              Tổng hợp mẹo dùng &amp; thông tin hữu ích từ fanpage Dr.Maya.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {FANPAGE_IMAGES.map((img, i) => (
              <div
                key={img.f}
                className="card-hover reveal overflow-hidden rounded-2xl border border-ink-line bg-white shadow-card"
                data-delay={String((i % 5) + 1)}
              >
                <Image
                  src={`/fb/${img.f}.png`}
                  alt={img.alt}
                  width={206}
                  height={206}
                  className="aspect-square h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ INGREDIENTS ============ */}
      <section id="thanh-phan" className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <div className="reveal mx-auto max-w-2xl text-center">
            <SectionTag icon="leaf" tone="leaf">
              6 thảo dược thiên nhiên
            </SectionTag>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Tinh túy thảo dược lành cho làn da bé
            </h2>
            <p className="mt-4 text-ink-soft">
              Mỗi giọt Hasobaby là sự kết hợp của 6 thảo dược quen thuộc — dịu
              nhẹ, an toàn cho cả trẻ sơ sinh.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {INGREDIENTS.map((ing, i) => (
              <article
                key={ing.name}
                className="card-hover reveal flex flex-col items-center rounded-3xl border border-leaf-100 bg-white p-6 text-center shadow-card"
                data-delay={String((i % 3) + 1)}
              >
                <div className="h-32 w-32 overflow-hidden rounded-full bg-leaf-100/50 ring-4 ring-leaf-100">
                  <Image
                    src={`/illustrations/${ing.img}.jpg`}
                    alt={`Thảo dược ${ing.name}`}
                    width={1024}
                    height={1024}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-ink">
                  {ing.name}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  {ing.d}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW TO USE ============ */}
      <section id="cach-dung" className="relative overflow-hidden bg-mint-50 py-16 sm:py-24">
        <Blob className="-right-24 bottom-0 h-80 w-80 bg-sun-200/50" />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <div className="reveal mx-auto max-w-2xl text-center">
            <SectionTag icon="spray" tone="mint">
              Cách dùng đơn giản
            </SectionTag>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
              4 bước — chưa đầy 10 giây là xong
            </h2>
            <p className="mt-4 text-ink-soft">
              Không pha chế, không lau người — mẹ thao tác nhanh, bé hợp tác.
            </p>
          </div>

          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li
                key={s.t}
                className="card-hover reveal relative overflow-hidden rounded-3xl bg-white shadow-card"
                data-delay={String(i + 1)}
              >
                <div className="relative aspect-[4/3] bg-mint-50">
                  <Image
                    src={`/illustrations/${s.img}.jpg`}
                    alt={s.t}
                    width={1024}
                    height={1024}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-mint-500 font-display text-lg font-extrabold text-white shadow-card">
                    {i + 1}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-bold text-ink">{s.t}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                    {s.d}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {/* 3 điểm vàng */}
          <div className="reveal mt-8 rounded-3xl border-2 border-sun-300 bg-white p-6 shadow-card sm:p-8">
            <div className="mx-auto max-w-xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-sun-100 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-sun-600">
                <Ic name="sparkle" className="h-4 w-4" />
                Mẹo hay từ Dr.Maya
              </span>
              <h3 className="mt-3 font-display text-xl font-extrabold text-ink sm:text-2xl">
                3 điểm vàng giúp con mát nhanh nhất
              </h3>
              <p className="mt-2 text-sm text-ink-soft">
                Khi xịt, mẹ ưu tiên 3 vùng da mỏng, nhiều mạch máu này để con hạ
                nhiệt nhanh hơn.
              </p>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                { n: 1, t: "Vùng trán" },
                { n: 2, t: "Hai bên nách" },
                { n: 3, t: "Hai bên bẹn" },
              ].map((p) => (
                <div
                  key={p.n}
                  className="flex items-center gap-3 rounded-2xl bg-sun-100/60 p-4"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sun-400 to-sun-500 font-display text-lg font-extrabold text-ink">
                    {p.n}
                  </span>
                  <span className="font-display text-base font-bold text-ink">
                    {p.t}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ AUDIENCE ============ */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <div className="reveal mx-auto max-w-2xl text-center">
            <SectionTag icon="heart" tone="leaf">
              Dành cho ai
            </SectionTag>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Một chai — cả nhà cùng dùng
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {AUDIENCE.map((a, i) => (
              <article
                key={a.t}
                className="card-hover reveal overflow-hidden rounded-3xl border border-ink-line bg-white text-center shadow-card"
                data-delay={String(i + 1)}
              >
                <div className="aspect-[5/4] bg-sun-100/50">
                  <Image
                    src={`/illustrations/${a.img}.jpg`}
                    alt={a.t}
                    width={1024}
                    height={1024}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-lg font-bold text-ink">{a.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{a.d}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 4 KHÔNG BANNER ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-leaf-600 to-leaf-700 py-14 text-white sm:py-16">
        <Blob className="-left-20 -top-16 h-72 w-72 bg-white/10" />
        <Blob className="-right-20 bottom-0 h-72 w-72 bg-mint-400/20" />
        <div className="relative mx-auto max-w-5xl px-5 text-center sm:px-6 lg:px-8">
          <div className="reveal">
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
              Cam kết <span className="text-sun-300">4 KHÔNG</span> cho làn da bé
            </h2>
            <p className="mt-3 text-white/80">
              Mẹ hoàn toàn yên tâm khi dùng Hasobaby cho con mỗi ngày.
            </p>
          </div>
          <div className="mt-9 grid grid-cols-2 gap-4 md:grid-cols-4">
            {["Không cồn", "Không paraben", "Không phẩm màu", "Không hóa chất mạnh"].map(
              (x, i) => (
                <div
                  key={x}
                  className="reveal rounded-2xl bg-white/10 p-5 backdrop-blur"
                  data-delay={String(i + 1)}
                >
                  <span className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-sun-400 text-leaf-700">
                    <Ic name="shield" className="h-6 w-6" />
                  </span>
                  <p className="font-display font-bold">{x}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section id="bang-gia" className="relative overflow-hidden py-16 sm:py-24">
        <Blob className="-left-24 top-32 h-80 w-80 bg-mint-200/50" />
        <Blob className="-right-24 bottom-10 h-80 w-80 bg-sun-200/50" />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <div className="reveal mx-auto max-w-2xl text-center">
            <SectionTag icon="gift" tone="coral">
              Bảng giá & quà tặng
            </SectionTag>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Mua càng nhiều — tiết kiệm càng lớn
            </h2>
            <p className="mt-4 text-ink-soft">
              Mỗi gói đều kèm quà tặng chăm con thiết thực từ Dr.Maya.
            </p>
          </div>

          <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
            {COMBOS.map((c, i) => (
              <article
                key={c.id}
                data-delay={String(i + 1)}
                className={`card-hover reveal relative flex flex-col rounded-3xl p-6 sm:p-7 ${
                  c.popular
                    ? "bg-gradient-to-br from-mint-500 to-leaf-600 text-white shadow-glow ring-4 ring-sun-300/60 lg:z-10 lg:-my-5 lg:scale-[1.06]"
                    : "border border-ink-line bg-white shadow-card lg:my-1"
                }`}
              >
                {c.popular && (
                  <span className="anim-twinkle absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-coral-500 px-5 py-1.5 text-sm font-extrabold uppercase tracking-wide text-white shadow-card">
                    ★ Mẹ chọn nhiều nhất
                  </span>
                )}
                <h3
                  className={`font-display text-xl font-extrabold ${
                    c.popular ? "text-white" : "text-ink"
                  }`}
                >
                  {c.name}
                </h3>
                <p
                  className={`text-sm ${
                    c.popular ? "text-white/80" : "text-ink-soft"
                  }`}
                >
                  {c.tagline}
                </p>

                <div className="mt-4 flex items-end gap-2">
                  <span
                    className={`font-display text-4xl font-extrabold ${
                      c.popular ? "text-sun-300" : "text-coral-600"
                    }`}
                  >
                    {formatVnd(c.price)}
                  </span>
                  {c.original && (
                    <span
                      className={`pb-1 text-sm line-through ${
                        c.popular ? "text-white/60" : "text-ink-soft"
                      }`}
                    >
                      {formatVnd(c.original)}
                    </span>
                  )}
                </div>
                {c.save ? (
                  <span
                    className={`mt-1 inline-block w-fit rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      c.popular
                        ? "bg-white/15 text-sun-300"
                        : "bg-coral-100 text-coral-600"
                    }`}
                  >
                    Tiết kiệm {formatVnd(c.save)}
                  </span>
                ) : (
                  <span className="mt-1 text-xs text-ink-soft">
                    {c.qty} chai × 100ml
                  </span>
                )}

                <div
                  className={`my-5 h-px ${
                    c.popular ? "bg-white/20" : "bg-ink-line"
                  }`}
                />

                <p
                  className={`mb-2 text-xs font-bold uppercase tracking-wide ${
                    c.popular ? "text-white/70" : "text-ink-soft"
                  }`}
                >
                  Quà tặng kèm
                </p>
                <ul className="flex-1 space-y-2.5">
                  {c.gifts.map((g) => (
                    <li key={g} className="flex gap-2.5 text-sm">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          c.popular
                            ? "bg-sun-400 text-leaf-700"
                            : "bg-mint-100 text-mint-600"
                        }`}
                      >
                        <Ic name="gift" className="h-3 w-3" />
                      </span>
                      <span className={c.popular ? "text-white/90" : "text-ink"}>
                        {g}
                      </span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#dat-hang"
                  className={`btn-shine mt-6 flex min-h-[52px] items-center justify-center gap-2 rounded-full px-6 font-bold transition-transform hover:scale-[1.03] ${
                    c.popular
                      ? "bg-sun-400 text-leaf-700"
                      : "bg-gradient-to-r from-coral-500 to-coral-600 text-white"
                  }`}
                >
                  Chọn gói này
                  <Ic name="check" className="h-4 w-4" />
                </a>
              </article>
            ))}
          </div>

          <p className="reveal mt-8 text-center text-sm text-ink-soft">
            Giao hàng toàn quốc · Thanh toán qua mã QR · Hỗ trợ tư vấn qua
            Messenger
          </p>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section id="review" className="bg-mint-50 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <div className="reveal mx-auto max-w-2xl text-center">
            <SectionTag icon="star" tone="sun">
              Mẹ bỉm nói gì
            </SectionTag>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Hàng nghìn mẹ đã an tâm hơn cùng Hasobaby
            </h2>
            <div className="mt-3 flex items-center justify-center gap-1 text-sun-500">
              {[0, 1, 2, 3, 4].map((s) => (
                <Ic key={s} name="star" className="h-5 w-5" />
              ))}
              <span className="ml-2 text-sm text-ink-soft">
                <span className="font-bold text-ink">4.8</span>/5 — từ hàng nghìn
                đánh giá
              </span>
            </div>
            <p className="mt-4 text-ink-soft">
              Cùng nghe các mẹ chia sẻ trải nghiệm thật khi dùng Hasobaby cho con.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {VIDEO_REVIEWS.map((v, i) => (
              <article
                key={v.src}
                className="card-hover reveal overflow-hidden rounded-3xl bg-white shadow-card"
                data-delay={String((i % 4) + 1)}
              >
                <video
                  controls
                  preload="none"
                  playsInline
                  poster={`/videos/${v.src}.jpg`}
                  className="aspect-[9/16] w-full bg-ink object-cover"
                >
                  <source src={`/videos/${v.src}.mp4`} type="video/mp4" />
                </video>
                <div className="flex items-start gap-2 p-4">
                  <Ic
                    name="star"
                    className="mt-0.5 h-4 w-4 shrink-0 text-sun-500"
                  />
                  <p className="text-sm font-semibold leading-snug text-ink">
                    {v.cap}
                  </p>
                </div>
              </article>
            ))}
          </div>
          <p className="reveal mt-6 text-center text-sm text-ink-soft">
            Video review thật từ các mẹ bỉm — bấm vào để xem.
          </p>
        </div>
      </section>

      {/* ============ PHARMACY TRUST ============ */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="reveal mx-auto w-full max-w-[300px]">
              <div className="overflow-hidden rounded-[2rem] border-4 border-white bg-ink shadow-soft">
                <video
                  controls
                  preload="none"
                  playsInline
                  poster="/videos/pharmacy.jpg"
                  className="aspect-[9/16] w-full bg-ink object-cover"
                >
                  <source src="/videos/pharmacy.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
            <div className="reveal" data-delay="1">
              <SectionTag icon="shield" tone="leaf">
                Nhà thuốc tin dùng
              </SectionTag>
              <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
                Được nhà thuốc tin tưởng giới thiệu
              </h2>
              <p className="mt-4 text-ink-soft">
                Không chỉ các mẹ bỉm — Hasobaby còn được chính các dược sĩ tại
                nhà thuốc tin tưởng và giới thiệu cho khách hàng của mình.
              </p>
              <ul className="check-list mt-6 space-y-2.5 text-ink">
                <li>
                  Có mặt tại nhiều nhà thuốc trên{" "}
                  <strong>34 tỉnh thành</strong>
                </li>
                <li>Dược sĩ trực tiếp tư vấn &amp; giới thiệu cho mẹ</li>
                <li>Sản phẩm chính hãng Dr.Maya — nguồn gốc rõ ràng</li>
              </ul>
              <a
                href="#dat-hang"
                className="btn-shine mt-7 inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-coral-500 to-coral-600 px-7 font-bold text-white shadow-soft transition-transform hover:scale-[1.03]"
              >
                Đặt mua Hasobaby ngay
                <Ic name="drop" className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
          <div className="reveal text-center">
            <SectionTag icon="chat" tone="mint">
              Câu hỏi thường gặp
            </SectionTag>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Mẹ thường thắc mắc
            </h2>
          </div>

          <div className="mt-10 space-y-3">
            {FAQS.map((f, i) => (
              <details
                key={i}
                className="reveal group rounded-2xl border border-ink-line bg-white"
                {...(i === 0 ? { open: true } : {})}
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 font-bold text-ink sm:px-6 sm:py-5">
                  <span>{f.q}</span>
                  <span className="faq-icon flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mint-100 text-mint-600">
                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M10 4v12M4 10h12" />
                    </svg>
                  </span>
                </summary>
                <div
                  className="px-5 pb-5 leading-relaxed text-ink-soft sm:px-6 sm:pb-6"
                  dangerouslySetInnerHTML={{ __html: f.a }}
                />
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ORDER ============ */}
      <section
        id="dat-hang"
        className="relative overflow-hidden bg-gradient-to-br from-mint-100 via-cream to-sun-100 py-16 sm:py-24"
      >
        <Blob className="-left-24 top-10 h-80 w-80 bg-mint-300/40" />
        <Blob className="-right-24 bottom-10 h-80 w-80 bg-sun-300/40" />
        <CoolDrops />

        <div className="relative mx-auto grid max-w-6xl items-start gap-10 px-5 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
          <div className="reveal lg:sticky lg:top-24">
            <SectionTag icon="drop" tone="coral">
              Đặt hàng ngay
            </SectionTag>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Để con luôn có Hasobaby bên cạnh
            </h2>
            <p className="mt-4 text-ink-soft">
              Đừng để đến cơn sốt giữa đêm mới luống cuống tìm giải pháp. Trang
              bị sẵn Hasobaby 0+ — mẹ chủ động, con dễ chịu, cả nhà ngủ ngon.
            </p>

            <ul className="check-list mt-6 space-y-2.5 text-ink">
              <li>Giao hàng toàn quốc — nhận hàng nhanh chóng</li>
              <li>Thanh toán tiện lợi bằng mã QR chuyển khoản</li>
              <li>Tư vấn tận tình qua Messenger &amp; hotline</li>
            </ul>

            <div className="mt-7 overflow-hidden rounded-3xl border-4 border-white bg-white shadow-card">
              <Image
                src="/products/hasobaby-main.jpg"
                alt="Xịt Hạ Sốt Hasobaby 0+ Dr.Maya"
                width={1200}
                height={1200}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={`tel:${HOTLINE}`}
                className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-full border-2 border-mint-300 bg-white px-5 font-bold text-mint-700 transition-colors hover:border-mint-500"
              >
                <Ic name="phone" className="h-5 w-5" />
                Gọi {HOTLINE}
              </a>
              <a
                href={MESSENGER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-mint-500 to-leaf-500 px-5 font-bold text-white transition-transform hover:scale-[1.02]"
              >
                <Ic name="chat" className="h-5 w-5" />
                Nhắn Messenger
              </a>
            </div>
          </div>

          <div className="reveal" data-delay="1">
            <OrderForm />
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-ink text-cream/80">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-leaf-500 to-leaf-700 text-white">
                  <Ic name="leaf" className="h-5 w-5" />
                </span>
                <span className="font-display text-xl font-extrabold text-cream">
                  Dr.Maya
                </span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed">
                Dr.Maya — thương hiệu chăm sóc sức khỏe mẹ và bé từ tinh túy
                thảo dược Việt.
              </p>
            </div>

            <div>
              <h3 className="mb-3 font-bold text-cream">Liên hệ</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  Hotline:{" "}
                  <a href={`tel:${HOTLINE}`} className="font-semibold text-mint-300">
                    {HOTLINE}
                  </a>
                </li>
                <li>
                  <a
                    href={MESSENGER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-cream"
                  >
                    Nhắn tin Messenger
                  </a>
                </li>
                <li>
                  <a
                    href="https://drmayastore.vn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-cream"
                  >
                    drmayastore.vn
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 font-bold text-cream">Sản phẩm</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#san-pham" className="transition-colors hover:text-cream">Xịt Hạ Sốt Hasobaby 0+</a></li>
                <li><a href="#thanh-phan" className="transition-colors hover:text-cream">Thành phần thảo dược</a></li>
                <li><a href="#cach-dung" className="transition-colors hover:text-cream">Hướng dẫn sử dụng</a></li>
                <li><a href="#bang-gia" className="transition-colors hover:text-cream">Bảng giá &amp; quà tặng</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-cream/10 pt-6 text-xs leading-relaxed text-cream/55">
            <p>
              © 2026 Dr.Maya. Sản phẩm Xịt Hạ Sốt Hasobaby 0+ là sản phẩm hỗ trợ
              làm mát, <strong className="text-cream/75">không phải là thuốc và
              không có tác dụng thay thế thuốc chữa bệnh</strong>. Khi trẻ sốt
              cao, phụ huynh cần theo dõi và tham khảo ý kiến bác sĩ.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ============================================================
   SUB-COMPONENTS
   ============================================================ */
function Blob({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
      aria-hidden="true"
    />
  );
}

function CoolDrops() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {[
        { l: "12%", t: "18%", d: "0s", s: "h-4 w-4" },
        { l: "82%", t: "12%", d: "0.8s", s: "h-3 w-3" },
        { l: "68%", t: "62%", d: "1.6s", s: "h-5 w-5" },
        { l: "26%", t: "70%", d: "1.1s", s: "h-3 w-3" },
      ].map((x, i) => (
        <span
          key={i}
          className={`cool-drop absolute rounded-full bg-mint-400/40 ${x.s}`}
          style={{ left: x.l, top: x.t, animationDelay: x.d }}
        />
      ))}
    </div>
  );
}

function SectionTag({
  children,
  icon,
  tone,
}: {
  children: React.ReactNode;
  icon: string;
  tone: "mint" | "leaf" | "coral" | "sun";
}) {
  const tones: Record<string, string> = {
    mint: "bg-mint-100 text-mint-700",
    leaf: "bg-leaf-100 text-leaf-700",
    coral: "bg-coral-100 text-coral-600",
    sun: "bg-sun-100 text-sun-600",
  };
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide ${tones[tone]}`}
    >
      <Ic name={icon} className="h-4 w-4" />
      {children}
    </span>
  );
}
