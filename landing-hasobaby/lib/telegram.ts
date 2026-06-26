// lib/telegram.ts
//
// Gửi thông báo đơn hàng về Telegram cho chủ shop.
// - notifyNewOrder()  → khách vừa ĐẶT (chưa thanh toán)  [gọi từ /api/checkout]
// - notifyPaidOrder() → khách ĐÃ thanh toán (Sepay xác nhận) [gọi từ webhook]
//
// Env cần có (đặt trong .env.local + Vercel):
//   TELEGRAM_BOT_TOKEN  — token bot lấy từ @BotFather
//   TELEGRAM_CHAT_ID    — chat id của chủ shop (hoặc group) nhận thông báo
//
// Thiết kế: KHÔNG bao giờ throw ra ngoài — thiếu env hoặc lỗi mạng chỉ log,
// để không làm hỏng luồng đặt hàng / webhook.

import type { Lead } from "./leads-store";

function formatVnd(n: number): string {
  if (!Number.isFinite(n)) return "0đ";
  return n.toLocaleString("vi-VN") + "đ";
}

function nowVn(): string {
  // dd/mm/yyyy HH:MM theo giờ VN
  return new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Escape ký tự đặc biệt cho parse_mode HTML của Telegram.
function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Gửi 1 tin nhắn text (HTML) tới Telegram. Trả về true nếu gửi được. */
export async function sendTelegramNotification(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn(
      "[telegram] Bỏ qua — thiếu TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID."
    );
    return false;
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      }
    );
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[telegram] HTTP ${res.status}: ${detail.slice(0, 300)}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[telegram] send failed:", err);
    return false;
  }
}

function leadLines(lead: Lead): string {
  return [
    `🧾 Mã đơn: <b>${esc(lead.orderId)}</b>`,
    `👤 Tên: <b>${esc(lead.name)}</b>`,
    `📞 SĐT: <b>${esc(lead.phone)}</b>`,
    lead.email ? `📧 Email: ${esc(lead.email)}` : "",
    `🏠 Địa chỉ: ${esc(lead.address || "(chưa có)")}`,
    `📦 Sản phẩm: ${esc(lead.productName)}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Khách vừa ĐẶT đơn — chưa thanh toán. */
export async function notifyNewOrder(lead: Lead): Promise<void> {
  const text =
    `🆕 <b>ĐƠN MỚI — CHỜ THANH TOÁN</b>\n\n` +
    `${leadLines(lead)}\n` +
    `💰 Cần thu: <b>${formatVnd(lead.amount)}</b>\n` +
    `⏰ ${nowVn()}\n\n` +
    `⏳ Khách chưa chuyển khoản. Đợi báo "ĐÃ THANH TOÁN" hoặc chủ động liên hệ.`;
  await sendTelegramNotification(text);
}

/** Khách ĐÃ thanh toán — Sepay xác nhận. */
export async function notifyPaidOrder(
  lead: Lead,
  opts?: { receivedAmount?: number; gateway?: string }
): Promise<void> {
  const received = opts?.receivedAmount ?? lead.amount;
  const gateway = opts?.gateway ? ` (${esc(opts.gateway)})` : "";
  const text =
    `✅ <b>ĐÃ THANH TOÁN</b>\n\n` +
    `${leadLines(lead)}\n` +
    `💵 Đã nhận: <b>${formatVnd(received)}</b>${gateway}\n` +
    `⏰ ${nowVn()}\n\n` +
    `🚚 Chuẩn bị đóng gói & giao hàng nhé!`;
  await sendTelegramNotification(text);
}
