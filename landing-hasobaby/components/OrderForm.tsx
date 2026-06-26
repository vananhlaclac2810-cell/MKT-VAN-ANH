"use client";

import { useState } from "react";
import { COMBOS, formatVnd, MESSENGER_URL, HOTLINE } from "@/lib/products";

type CheckoutResult = {
  orderId: string;
  amount: number;
  qrUrl: string;
  bank: { bankCode: string; accountNumber: string; accountName: string };
  transferContent: string;
  comboName: string;
  comboQty: number;
};

export default function OrderForm() {
  const [comboId, setComboId] = useState("combo3");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [copied, setCopied] = useState("");

  const selected = COMBOS.find((c) => c.id === comboId)!;

  const copy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(""), 1800);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Mẹ vui lòng nhập họ tên nhận hàng.");
    if (!/^0\d{9}$/.test(phone.trim()))
      return setError("Số điện thoại chưa đúng — cần 10 số, bắt đầu bằng 0.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return setError("Email chưa đúng — mẹ kiểm tra lại giúp em.");
    if (address.trim().length < 6)
      return setError("Mẹ vui lòng nhập địa chỉ nhận hàng đầy đủ.");

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comboId,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          source: "home",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra.");
      setResult(data as CheckoutResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- SUCCESS / QR PAYMENT PANEL ----------
  if (result) {
    return (
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-soft border border-mint-100">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-leaf-100">
            <svg
              className="h-9 w-9 text-leaf-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h3 className="font-display text-2xl font-bold text-ink">
            Đặt hàng thành công!
          </h3>
          <p className="mt-1 text-ink-soft">
            Mã đơn của mẹ:{" "}
            <span className="font-bold text-mint-700">#{result.orderId}</span>
          </p>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {/* QR */}
          <div className="flex flex-col items-center rounded-2xl bg-mint-50 p-5">
            <p className="mb-3 text-sm font-semibold text-ink">
              Quét mã QR để thanh toán
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.qrUrl}
              alt={`Mã QR thanh toán đơn ${result.orderId}`}
              className="h-52 w-52 rounded-xl bg-white p-2 shadow-card"
              width={208}
              height={208}
            />
            <p className="mt-3 text-center text-2xl font-extrabold font-display text-coral-600">
              {formatVnd(result.amount)}
            </p>
          </div>

          {/* Bank details */}
          <div className="rounded-2xl border border-ink-line bg-cream p-5">
            <p className="mb-3 text-sm font-semibold text-ink">
              Hoặc chuyển khoản thủ công
            </p>
            <dl className="space-y-2.5 text-sm">
              <Detail label="Ngân hàng" value={result.bank.bankCode} />
              <Detail
                label="Số tài khoản"
                value={result.bank.accountNumber}
                copyable
                copied={copied === "acc"}
                onCopy={() => copy(result.bank.accountNumber, "acc")}
              />
              <Detail label="Chủ tài khoản" value={result.bank.accountName} />
              <Detail
                label="Nội dung CK"
                value={result.transferContent}
                highlight
                copyable
                copied={copied === "content"}
                onCopy={() => copy(result.transferContent, "content")}
              />
            </dl>
            <p className="mt-3 rounded-lg bg-sun-100 px-3 py-2 text-xs leading-relaxed text-ink-soft">
              Mẹ nhớ ghi đúng nội dung{" "}
              <strong className="text-ink">{result.transferContent}</strong> để
              đơn được xác nhận nhanh nhất nhé.
            </p>
          </div>
        </div>

        <a
          href={MESSENGER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-shine mt-6 flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-mint-500 to-leaf-500 px-6 font-bold text-white shadow-soft transition-transform hover:scale-[1.02]"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z" />
          </svg>
          Đã chuyển khoản — Nhắn Messenger xác nhận đơn
        </a>
        <button
          type="button"
          onClick={() => {
            setResult(null);
            setName("");
            setPhone("");
            setEmail("");
            setAddress("");
          }}
          className="mt-3 w-full text-center text-sm font-semibold text-mint-700 underline-offset-4 hover:underline"
        >
          Đặt thêm đơn khác
        </button>
      </div>
    );
  }

  // ---------- ORDER FORM ----------
  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl bg-white p-6 sm:p-8 shadow-soft border border-mint-100"
    >
      <h3 className="font-display text-2xl font-bold text-ink">
        Đặt mua Hasobaby 0+
      </h3>
      <p className="mt-1 text-sm text-ink-soft">
        Mẹ điền thông tin — Dr.Maya giao hàng tận nơi, thanh toán khi nhận hoặc
        chuyển khoản QR.
      </p>

      {/* Combo selector */}
      <fieldset className="mt-5">
        <legend className="mb-2 text-sm font-semibold text-ink">Chọn gói</legend>
        <div className="space-y-2.5">
          {COMBOS.map((c) => {
            const active = c.id === comboId;
            return (
              <label
                key={c.id}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3.5 transition-colors ${
                  active
                    ? "border-mint-500 bg-mint-50"
                    : "border-ink-line bg-cream hover:border-mint-300"
                }`}
              >
                <input
                  type="radio"
                  name="combo"
                  value={c.id}
                  checked={active}
                  onChange={() => setComboId(c.id)}
                  className="h-5 w-5 shrink-0 accent-mint-600"
                />
                <span className="flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-bold text-ink">{c.name}</span>
                    {c.popular && (
                      <span className="rounded-full bg-coral-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        Hời nhất
                      </span>
                    )}
                  </span>
                  <span className="block text-xs text-ink-soft">
                    {c.tagline}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block font-extrabold text-coral-600">
                    {formatVnd(c.price)}
                  </span>
                  {c.original && (
                    <span className="block text-xs text-ink-soft line-through">
                      {formatVnd(c.original)}
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Inputs */}
      <div className="mt-5 space-y-3.5">
        <Field
          id="name"
          label="Họ và tên"
          value={name}
          onChange={setName}
          placeholder="Nguyễn Thị A"
          autoComplete="name"
        />
        <Field
          id="phone"
          label="Số điện thoại"
          value={phone}
          onChange={setPhone}
          placeholder="0xxxxxxxxx"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
        />
        <Field
          id="email"
          label="Email (nhận xác nhận đơn & ebook)"
          value={email}
          onChange={setEmail}
          placeholder="email@example.com"
          type="email"
          autoComplete="email"
        />
        <Field
          id="address"
          label="Địa chỉ nhận hàng"
          value={address}
          onChange={setAddress}
          placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
          autoComplete="street-address"
          textarea
        />
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-xl bg-coral-100 px-3.5 py-2.5 text-sm text-coral-600"
        >
          <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
          </svg>
          {error}
        </p>
      )}

      <div className="mt-5 rounded-2xl bg-mint-50 p-3.5 text-center">
        <span className="text-sm text-ink-soft">Tổng thanh toán</span>
        <div className="font-display text-3xl font-extrabold text-coral-600">
          {formatVnd(selected.price)}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-shine mt-4 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-coral-500 to-coral-600 px-6 text-lg font-bold text-white shadow-soft transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
            </svg>
            Đang xử lý...
          </>
        ) : (
          <>
            Đặt mua ngay
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10.3 4.3a1 1 0 011.4 0l5 5a1 1 0 010 1.4l-5 5a1 1 0 11-1.4-1.4L13.6 11H4a1 1 0 110-2h9.6l-3.3-3.3a1 1 0 010-1.4z" />
            </svg>
          </>
        )}
      </button>

      <p className="mt-3 text-center text-xs text-ink-soft">
        Cần tư vấn thêm? Gọi{" "}
        <a href={`tel:${HOTLINE}`} className="font-bold text-mint-700">
          {HOTLINE}
        </a>{" "}
        hoặc nhắn Messenger.
      </p>
    </form>
  );
}

// ---------- small sub-components ----------
function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
  textarea,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: "numeric" | "text" | "tel";
  autoComplete?: string;
  textarea?: boolean;
}) {
  const cls =
    "w-full rounded-xl border-2 border-ink-line bg-cream px-4 py-3 text-base text-ink placeholder:text-ink-soft/60 transition-colors focus:border-mint-500 focus:bg-white";
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          rows={2}
          className={cls + " resize-none"}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          autoComplete={autoComplete}
          className={cls}
        />
      )}
    </div>
  );
}

function Detail({
  label,
  value,
  highlight,
  copyable,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  copyable?: boolean;
  copied?: boolean;
  onCopy?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="flex items-center gap-2">
        <span
          className={`font-bold ${highlight ? "text-coral-600" : "text-ink"}`}
        >
          {value}
        </span>
        {copyable && (
          <button
            type="button"
            onClick={onCopy}
            className="rounded-md bg-mint-100 px-2 py-1 text-[11px] font-semibold text-mint-700 transition-colors hover:bg-mint-200"
          >
            {copied ? "Đã chép" : "Chép"}
          </button>
        )}
      </dd>
    </div>
  );
}
