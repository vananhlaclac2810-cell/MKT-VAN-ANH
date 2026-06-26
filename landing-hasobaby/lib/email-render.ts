// lib/email-render.ts
//
// Pure email-rendering helpers — KHÔNG import nodemailer / node API.
// Dùng được ở CẢ server (API route gửi email) lẫn client (preview trong /admin).

export type BodyFormat = "text" | "html";

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function textToHtml(text: string): string {
  const linkify = (s: string) =>
    s.replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" style="color:#0066cc;">$1</a>'
    );
  return text
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split("\n").map(escapeHtml).map(linkify).join("<br/>");
      return `<p style="margin:0 0 16px;line-height:1.6;">${lines}</p>`;
    })
    .join("\n");
}

export function personalize(
  body: string,
  vars: { name: string; email: string }
): string {
  return body
    .replace(/\{\{\s*name\s*\}\}/gi, vars.name || "anh/chị")
    .replace(/\{\{\s*email\s*\}\}/gi, vars.email);
}

export function htmlIsFullDocument(html: string): boolean {
  return /<!doctype\s+html|<html[\s>]/i.test(html);
}

export function stripHtmlToText(html: string): string {
  return html
    .replace(/<\s*\/?\s*(br|p|div|h[1-6]|li|tr)\s*[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function wrapEmailHtml(opts: {
  subject: string;
  innerHtml: string;
  fromName?: string;
}): string {
  const { subject, innerHtml, fromName = "Dr.Maya - Hasobaby" } = opts;
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f5f7;padding:24px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
               style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding:24px 28px;border-bottom:1px solid #f0f0f0;">
              <div style="font-size:13px;color:#6b7280;">${escapeHtml(fromName)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px;font-size:15px;color:#1f2937;">
              ${innerHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px;background:#fafafa;border-top:1px solid #f0f0f0;font-size:12px;color:#9ca3af;line-height:1.5;">
              Anh/chị nhận được email này vì đã đăng ký với Dr.Maya.<br/>
              Nếu không muốn nhận thông tin nữa, reply email này với chữ <b>HỦY</b> — em sẽ xoá khỏi danh sách.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderCampaignEmail(opts: {
  format: BodyFormat;
  body: string;
  subject: string;
  fromName?: string;
}): { html: string; text: string } {
  const { format, body, subject, fromName } = opts;
  if (format === "html") {
    const html = htmlIsFullDocument(body)
      ? body
      : wrapEmailHtml({ subject, innerHtml: body, fromName });
    return { html, text: stripHtmlToText(body) };
  }
  const inner = textToHtml(body);
  return {
    html: wrapEmailHtml({ subject, innerHtml: inner, fromName }),
    text: body,
  };
}
