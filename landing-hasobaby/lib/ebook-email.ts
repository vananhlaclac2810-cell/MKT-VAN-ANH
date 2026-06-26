// lib/ebook-email.ts
//
// Gửi email ebook miễn phí cho lead path "Cẩm Nang Chích Ngừa" (FREE).
// Khác với email order confirmation: tone vui tươi, palette mint+vàng,
// CTA chính là DOWNLOAD PDF + JOIN ZALO GROUP (không phải xác nhận đơn).

import { sendOne } from "./mailer";
import { HOTLINE, MESSENGER_URL } from "./products";

const ZALO_GROUP_URL = "https://zalo.me/g/izxocpsvs76krthiebzn";
const EBOOK_PDF_PATH = "/ebook/cam-nang-chich-ngua.pdf";

function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  return "https://xithasot.thieuvananh.vn";
}

function esc(s: string): string {
  return s.replace(
    /[<>&]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c] ?? c
  );
}

export async function sendEbookFreeEmail({
  name,
  email,
}: {
  name: string;
  email: string;
}): Promise<void> {
  if (!email || !email.includes("@")) {
    console.log("[ebook-email] Email không hợp lệ — bỏ qua.");
    return;
  }

  const subject = `Mẹ ơi, cẩm nang chích ngừa của con đã sẵn sàng 💛`;
  const html = renderEbookEmailHtml(name);
  const text = renderEbookEmailText(name);

  const result = await sendOne({ to: email, subject, html, text });
  if (!result.ok) {
    // Bubble lên cho caller log; KHÔNG throw để API route không 500 vì SMTP.
    throw new Error(`[ebook-email] gửi thất bại: ${result.error}`);
  }
  console.log(`[ebook-email] Đã gửi ebook cho ${email} (msgId=${result.messageId})`);
}

function renderEbookEmailHtml(name: string): string {
  const siteUrl = getSiteUrl();
  const pdfUrl = `${siteUrl}${EBOOK_PDF_PATH}`;
  const comboUrl = `${siteUrl}/ebook#combo-dac-biet`;
  const safeName = esc(name.trim() || "mẹ");

  return `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#FFFCF3;font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#143B39;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFFCF3;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 30px -12px rgba(20,59,57,0.18);">

        <tr><td style="background:linear-gradient(135deg,#22B8B2 0%,#FFD24C 100%);padding:32px 28px;text-align:center;">
          <div style="color:#ffffff;font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;opacity:0.95;">Dr.Maya — Quà tặng mẹ</div>
          <div style="color:#ffffff;font-size:24px;font-weight:800;margin-top:8px;">🎁 Cẩm nang chích ngừa</div>
          <div style="color:#FFFCF3;font-size:13.5px;margin-top:6px;opacity:0.95;">Dành riêng cho mẹ thông thái Dr.Maya</div>
        </td></tr>

        <tr><td style="padding:30px 28px 8px;">
          <div style="font-size:22px;font-weight:800;color:#143B39;">Chào ${safeName}! 💛</div>
          <p style="font-size:15px;line-height:1.7;color:#4F6F6C;margin:14px 0 0;">
            Cảm ơn mẹ đã tin tưởng Dr.Maya. Em gửi mẹ <b style="color:#143B39;">cẩm nang chích ngừa an toàn cho bé 0–24 tháng</b> — 10 trang
            tổng hợp lịch tiêm đầy đủ, hướng dẫn xử lý phản ứng sau tiêm và cách dùng thuốc hạ sốt đúng cách.
          </p>
          <p style="font-size:14.5px;line-height:1.7;color:#4F6F6C;margin:10px 0 0;">
            Mẹ tải về lưu trong máy để xem khi cần nhé!
          </p>
        </td></tr>

        <tr><td style="padding:24px 28px 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:6px 0;">
              <a href="${pdfUrl}"
                 style="display:inline-block;background:#22B8B2;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:800;font-size:15px;box-shadow:0 6px 18px -8px rgba(34,184,178,0.55);">
                 ⬇ Tải ebook PDF ngay
              </a>
            </td></tr>
            <tr><td align="center" style="padding:10px 0;">
              <a href="${ZALO_GROUP_URL}"
                 style="display:inline-block;background:#2F8A4A;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:800;font-size:15px;box-shadow:0 6px 18px -8px rgba(47,138,74,0.55);">
                 📱 Vào nhóm Zalo Mẹ Thông Thái Dr.Maya
              </a>
            </td></tr>
          </table>
          <p style="font-size:12.5px;line-height:1.6;color:#7A9694;margin:14px 0 0;text-align:center;">
            Trong nhóm Zalo, mẹ được Dr.Maya và các mẹ khác cùng chia sẻ kinh nghiệm chăm con mỗi ngày — miễn phí.
          </p>
        </td></tr>

        <tr><td style="padding:18px 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF4CC;border-radius:14px;">
            <tr><td style="padding:18px 20px;font-size:14px;line-height:1.7;color:#143B39;">
              🎁 <b>Mẹo nhỏ từ Dr.Maya</b>
              <div style="margin-top:8px;font-size:13.5px;color:#143B39;line-height:1.65;">
                Nếu mẹ muốn có thêm cẩm nang <b>Xử lý sốt tại nhà</b> và <b>chai xịt hạ sốt Hasobaby 0+</b> để chủ động khi bé sốt sau tiêm,
                mẹ có thể đặt <b>combo đặc biệt chỉ 189K</b> (kèm ebook xử lý sốt).
              </div>
              <div style="margin-top:14px;">
                <a href="${comboUrl}"
                   style="display:inline-block;background:#ED5424;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:10px;font-weight:700;font-size:13.5px;">
                   Xem combo đặc biệt 189K →
                </a>
              </div>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:6px 28px 28px;">
          <p style="font-size:14px;line-height:1.65;color:#4F6F6C;margin:0;">
            Có bất cứ thắc mắc gì về chích ngừa hay chăm bé sau tiêm, mẹ liên hệ:<br/>
            📞 Hotline: <b style="color:#143B39;">${HOTLINE}</b><br/>
            💬 Messenger: <a href="${MESSENGER_URL}" style="color:#0E7470;">m.me/hasobaby.drmaya</a>
          </p>
        </td></tr>

        <tr><td style="background:#143B39;padding:18px 28px;text-align:center;">
          <div style="color:#9FD8A8;font-size:12px;line-height:1.6;">
            © 2026 Dr.Maya. Email này được gửi vì mẹ đã đăng ký nhận ebook miễn phí.<br/>
            Nội dung ebook chỉ mang tính tham khảo — không thay thế chỉ định của bác sĩ.
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function renderEbookEmailText(name: string): string {
  const siteUrl = getSiteUrl();
  const pdfUrl = `${siteUrl}${EBOOK_PDF_PATH}`;
  const safeName = name.trim() || "mẹ";
  return `Chào ${safeName}!

Cảm ơn mẹ đã tin tưởng Dr.Maya. Em gửi mẹ ebook "Cẩm nang chích ngừa an toàn cho bé 0–24 tháng" (10 trang).

Tải PDF: ${pdfUrl}
Vào nhóm Zalo Mẹ Thông Thái: ${ZALO_GROUP_URL}

Mẹo: nếu mẹ muốn có thêm cẩm nang Xử lý sốt tại nhà + chai xịt hạ sốt Hasobaby, mẹ có thể đặt combo đặc biệt chỉ 189K tại ${siteUrl}/ebook#combo-dac-biet

Hỗ trợ:
- Hotline: ${HOTLINE}
- Messenger: ${MESSENGER_URL}

Dr.Maya — Hasobaby`;
}
