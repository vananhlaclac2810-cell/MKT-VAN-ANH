// lib/mailer.ts
//
// Singleton nodemailer transporter cho SMTP — dùng bởi /api/admin/campaigns.
// Reuse env: SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM.

import nodemailer, { Transporter } from "nodemailer";

export {
  escapeHtml,
  textToHtml,
  personalize,
  htmlIsFullDocument,
  stripHtmlToText,
  wrapEmailHtml,
  renderCampaignEmail,
} from "./email-render";
export type { BodyFormat } from "./email-render";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = process.env.SMTP_SECURE === "true";
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER || "";

let transporter: Transporter | null = null;

export function getTransporter(): Transporter {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      "SMTP chưa cấu hình. Thiếu SMTP_HOST/SMTP_USER/SMTP_PASS trong env."
    );
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE || SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

export type SendResult =
  | { ok: true; messageId: string }
  | { ok: false; error: string };

export async function sendOne(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}): Promise<SendResult> {
  try {
    const info = await getTransporter().sendMail({
      from: MAIL_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      replyTo: opts.replyTo,
    });
    return { ok: true, messageId: info.messageId };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
