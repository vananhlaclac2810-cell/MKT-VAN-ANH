"use client";

import { useState } from "react";

type ClaimResponse = {
  ok: true;
  zaloLink: string;
  message: string;
};

export default function EbookFreeForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<ClaimResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("Mẹ vui lòng nhập họ tên (ít nhất 2 ký tự).");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Email chưa đúng — mẹ kiểm tra lại giúp em.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ebook-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Có lỗi, mẹ thử lại sau ít phút.");
      setSuccess(data as ClaimResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi, mẹ thử lại sau ít phút.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-3xl border-4 border-sun-300 bg-gradient-to-br from-yellow-50 via-white to-sun-100 p-7 shadow-soft sm:p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-mint-400 to-mint-600 text-4xl text-white shadow-glow">
            ✓
          </div>
          <span className="inline-block rounded-full bg-mint-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-mint-700">
            🎉 Thành công
          </span>
          <h3 className="mt-3 font-display text-2xl font-extrabold text-ink sm:text-3xl">
            Đã gửi ebook qua email
          </h3>
          <p className="mt-2 break-words text-base text-ink">
            <span className="font-bold text-mint-700">{email}</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Mẹ mở email kiểm tra trong 2 phút nhé. Nếu chưa thấy, nhớ check
            mục <strong>Spam / Quảng cáo</strong> giúp em.
          </p>
        </div>

        <a
          href={success.zaloLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-mint-500 px-6 text-lg font-extrabold text-white shadow-soft transition-transform hover:scale-[1.02]"
        >
          <span className="text-xl">📱</span>
          Vào nhóm Zalo Dr.Maya ngay
        </a>

        <a
          href="/ebook/cam-nang-chich-ngua.pdf"
          download
          className="mt-3 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full border-2 border-mint-300 bg-white px-6 text-sm font-bold text-mint-700 transition-colors hover:border-mint-500"
        >
          📥 Tải PDF ngay nếu chưa thấy email
        </a>

        <p className="mt-5 text-center text-xs text-ink-soft">
          Vào nhóm Zalo đọc <b>TÀI LIỆU</b> ở bài ghim và hỏi đáp.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border-4 border-sun-300 bg-gradient-to-br from-yellow-50 via-white to-sun-100 p-6 shadow-soft sm:p-8"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sun-400 to-sun-500 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wide text-ink shadow-card">
          🎁 Quà tặng
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-coral-600">
          MIỄN PHÍ 100%
        </span>
      </div>

      <h3 className="mt-4 font-display text-2xl font-extrabold text-ink sm:text-3xl">
        Nhận MIỄN PHÍ ngay
      </h3>
      <p className="mt-1.5 text-sm text-ink-soft">
        Ebook gửi qua email trong 30 giây — không cần thẻ, không cần thanh toán.
      </p>

      <div className="mt-5 flex items-end gap-3 rounded-2xl bg-white/70 p-4">
        <span className="font-display text-2xl font-bold text-ink-soft line-through decoration-coral-400 decoration-2">
          199.000đ
        </span>
        <span className="font-display text-5xl font-extrabold text-mint-600 sm:text-6xl">
          0đ
        </span>
      </div>

      <ul className="mt-5 space-y-2.5 text-sm text-ink">
        <li className="flex items-start gap-2">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint-100 text-mint-600">
            ✓
          </span>
          <span>
            <strong>Ebook &quot;Cẩm nang chích ngừa an toàn 0-24 tháng&quot;</strong> (PDF 10 trang)
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint-100 text-mint-600">
            ✓
          </span>
          <span>
            Vào nhóm kín Zalo <strong>&quot;Mẹ thông thái Dr.Maya&quot;</strong> — hỏi đáp 24/7
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint-100 text-mint-600">
            ✓
          </span>
          <span>Tips chăm con hàng tuần từ Dr.Maya</span>
        </li>
      </ul>

      <div className="mt-5 space-y-3">
        <div>
          <label
            htmlFor="ebook-name"
            className="mb-1.5 block text-sm font-semibold text-ink"
          >
            Họ tên mẹ
          </label>
          <input
            id="ebook-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nguyễn Thị A"
            autoComplete="name"
            className="w-full rounded-xl border-2 border-ink-line bg-white px-4 py-3 text-base text-ink placeholder:text-ink-soft/60 transition-colors focus:border-mint-500"
          />
        </div>
        <div>
          <label
            htmlFor="ebook-email"
            className="mb-1.5 block text-sm font-semibold text-ink"
          >
            Email nhận ebook
          </label>
          <input
            id="ebook-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            autoComplete="email"
            className="w-full rounded-xl border-2 border-ink-line bg-white px-4 py-3 text-base text-ink placeholder:text-ink-soft/60 transition-colors focus:border-mint-500"
          />
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-xl bg-coral-100 px-3.5 py-2.5 text-sm text-coral-600"
        >
          <svg
            className="mt-0.5 h-4 w-4 shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
          </svg>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-5 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-mint-500 via-cyan-500 to-sky-500 px-6 text-lg font-extrabold text-white shadow-soft transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <svg
              className="h-5 w-5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
              />
            </svg>
            Đang gửi ebook...
          </>
        ) : (
          <>
            <span className="text-xl">📥</span>
            Tải ebook về máy ngay
          </>
        )}
      </button>

      <p className="mt-4 text-center text-xs leading-relaxed text-ink-soft">
        Bằng việc nhận ebook, mẹ đồng ý nhận thêm tips chăm con từ Dr.Maya.
        Có thể unsubscribe bất kỳ lúc nào.
      </p>
    </form>
  );
}
