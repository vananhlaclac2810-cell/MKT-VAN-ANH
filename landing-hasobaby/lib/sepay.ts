// lib/sepay.ts
//
// Pure helpers cho Sepay integration — không dependency framework.
// Reusable cho cả /api/checkout, /api/sepay-webhook, server components.

import { timingSafeEqual } from "crypto";

// =============================================================================
// QR generation
// =============================================================================

export function generateVietQRUrl(opts: {
  accountNumber: string;
  bank: string;
  amount: number;
  content: string;
  template?: "compact" | "qronly" | "";
}): string {
  const params = new URLSearchParams({
    acc: opts.accountNumber,
    bank: opts.bank,
    amount: String(Math.floor(opts.amount)),
    des: opts.content,
  });
  if (opts.template) params.set("template", opts.template);
  return `https://qr.sepay.vn/img?${params.toString()}`;
}

// =============================================================================
// Order ID parsing
// =============================================================================

export function parseOrderIdFromContent(content: string): string | null {
  if (!content) return null;
  const match = content.match(/DH\s*(\d{1,10})/i);
  if (!match) return null;
  const digits = match[1].padStart(6, "0");
  return `DH${digits}`;
}

export function parsePhoneFromContent(content: string): string | null {
  if (!content) return null;
  const match = content.match(/0\d{9}/);
  return match ? match[0] : null;
}

// =============================================================================
// Webhook auth — timing-safe comparison
// =============================================================================

export function verifySepayAuth(
  authHeader: string | null,
  expectedKey: string
): boolean {
  if (!authHeader || !expectedKey) return false;

  let providedKey: string;
  if (authHeader.startsWith("Apikey ")) {
    providedKey = authHeader.slice(7);
  } else if (authHeader.startsWith("Bearer ")) {
    providedKey = authHeader.slice(7);
  } else {
    return false;
  }

  try {
    const expected = Buffer.from(expectedKey);
    const provided = Buffer.from(providedKey);
    if (expected.length !== provided.length) return false;
    return timingSafeEqual(expected, provided);
  } catch {
    return false;
  }
}

// =============================================================================
// Format helpers
// =============================================================================

export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

// =============================================================================
// Payload typing
// =============================================================================

export type SepayWebhookPayload = {
  id: number;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  code: string | null;
  content: string;
  transferType: "in" | "out";
  transferAmount: number;
  accumulated: number;
  subAccount: string | null;
  referenceCode: string;
  description?: string;
};
