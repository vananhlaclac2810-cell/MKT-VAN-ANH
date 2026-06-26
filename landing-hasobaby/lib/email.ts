// lib/email.ts
//
// Gửi email xác nhận đơn hàng cho khách sau khi thanh toán thành công.
// Gọi từ /api/sepay-webhook (runSideEffects). Dùng SMTP qua nodemailer —
// đổi provider chỉ cần đổi SMTP_* env, không sửa code.

import nodemailer from "nodemailer";
import type { Lead } from "./leads-store";
import { formatVnd, HOTLINE, MESSENGER_URL } from "./products";

export async function sendOrderConfirmationEmail(lead: Lead): Promise<void> {
  if (!lead.email || !lead.email.includes("@")) {
    console.log("[email] Đơn không có email hợp lệ — bỏ qua.");
    return;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.error("[email] Chưa cấu hình SMTP (SMTP_HOST/SMTP_USER/SMTP_PASS).");
    return;
  }

  const from = process.env.MAIL_FROM || `Dr.Maya - Hasobaby <${user}>`;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = SSL, 587 = STARTTLS
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: lead.email,
    subject: `Cảm ơn ${lead.name} — đơn Hasobaby ${lead.orderId} đã thanh toán`,
    html: renderEmail(lead),
  });
}

function esc(s: string): string {
  return s.replace(
    /[<>&]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c] ?? c
  );
}

function renderEmail(lead: Lead): string {
  const amount = formatVnd(lead.amount);
  return `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#FFFCF3;font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#143B39;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFFCF3;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 30px -12px rgba(20,59,57,0.18);">

        <tr><td style="background:linear-gradient(135deg,#22B8B2,#2F8A4A);padding:28px 28px;text-align:center;">
          <div style="color:#ffffff;font-size:22px;font-weight:800;">Dr.Maya — Hasobaby</div>
          <div style="color:#E3F3E5;font-size:13px;margin-top:4px;">Xịt Hạ Sốt Hasobaby 0+</div>
        </td></tr>

        <tr><td style="padding:30px 28px 8px;">
          <div style="font-size:20px;font-weight:800;color:#143B39;">Cảm ơn ${esc(lead.name)}! 🎉</div>
          <p style="font-size:15px;line-height:1.6;color:#4F6F6C;margin:14px 0 0;">
            Đơn hàng <b style="color:#143B39;">${esc(lead.orderId)}</b> của chị đã
            <b style="color:#2F8A4A;">thanh toán thành công</b>. Dr.Maya sẽ liên hệ
            xác nhận và giao hàng tới chị trong thời gian sớm nhất.
          </p>
        </td></tr>

        <tr><td style="padding:18px 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ECFBFA;border-radius:14px;">
            <tr><td style="padding:18px 20px;font-size:14px;line-height:1.9;color:#143B39;">
              <div><span style="color:#4F6F6C;">Mã đơn:</span> <b>${esc(lead.orderId)}</b></div>
              <div><span style="color:#4F6F6C;">Sản phẩm:</span> <b>${esc(lead.productName)}</b></div>
              <div><span style="color:#4F6F6C;">Thành tiền:</span> <b style="color:#ED5424;">${amount}</b></div>
              <div><span style="color:#4F6F6C;">Người nhận:</span> ${esc(lead.name)} — ${esc(lead.phone)}</div>
              <div><span style="color:#4F6F6C;">Địa chỉ giao:</span> ${esc(lead.address)}</div>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:6px 28px 18px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF4CC;border-radius:14px;">
            <tr><td style="padding:18px 20px;font-size:14px;line-height:1.65;color:#143B39;">
              🎁 <b>QUÀ TẶNG KÈM ĐƠN HÀNG</b>
              <div style="margin-top:10px;font-size:13.5px;color:#143B39;">
                📘 <b>Cẩm nang chích ngừa an toàn cho bé 0-24 tháng</b><br/>
                <span style="color:#4F6F6C;font-size:12.5px;">10 trang • Lịch tiêm đầy đủ + Hướng dẫn xử lý phản ứng sau tiêm + Cách dùng thuốc hạ sốt an toàn — Trị giá <b>199.000đ</b></span>
              </div>
              <div style="margin-top:14px;">
                <a href="https://xithasot.thieuvananh.vn/ebook/cam-nang-chich-ngua.pdf"
                   style="display:inline-block;background:#179B96;color:#ffffff;text-decoration:none;padding:11px 22px;border-radius:10px;font-weight:700;font-size:14px;">
                   ⬇ Tải Ebook ngay
                </a>
              </div>
              <div style="margin-top:10px;font-size:12px;color:#4F6F6C;">
                Lưu PDF vào máy/điện thoại để xem khi cần. Có thể chia sẻ với người thân.
              </div>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:6px 28px 28px;">
          <p style="font-size:14px;line-height:1.6;color:#4F6F6C;margin:0;">
            Cần hỗ trợ, chị liên hệ:<br/>
            📞 Hotline: <b style="color:#143B39;">${HOTLINE}</b><br/>
            💬 Messenger: <a href="${MESSENGER_URL}" style="color:#0E7470;">m.me/hasobaby.drmaya</a>
          </p>
        </td></tr>

        <tr><td style="background:#143B39;padding:18px 28px;text-align:center;">
          <div style="color:#9FD8A8;font-size:12px;line-height:1.6;">
            © 2026 Dr.Maya. Xịt Hạ Sốt Hasobaby 0+ là sản phẩm hỗ trợ làm mát,
            không phải là thuốc và không thay thế thuốc chữa bệnh.
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
