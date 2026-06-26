// app/api/sepay-webhook/route.ts
//
// POST /api/sepay-webhook — nhận thông báo thanh toán từ Sepay.
// Headers: Authorization: Apikey {SEPAY_WEBHOOK_API_KEY}
//
// Quy tắc: verify auth timing-safe · multi-strategy matching · dedup theo id ·
// reject underpayment, accept overpayment · LUÔN trả 200 (Sepay retry nếu non-200).

import { NextResponse } from "next/server";
import {
  getLeadByOrderId,
  getLeadByPhone,
  findPendingLeadByAmountAndTime,
  markLeadPaid,
  isTransactionProcessed,
  markTransactionProcessed,
  type Lead,
  type PaymentRecord,
} from "@/lib/leads-store";
import {
  parseOrderIdFromContent,
  parsePhoneFromContent,
  verifySepayAuth,
  type SepayWebhookPayload,
} from "@/lib/sepay";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { notifyPaidOrder } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // 1. AUTH — timing-safe
    const auth = req.headers.get("authorization");
    if (!verifySepayAuth(auth, process.env.SEPAY_WEBHOOK_API_KEY ?? "")) {
      console.warn("[sepay-webhook] Invalid auth");
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const payload = (await req.json()) as SepayWebhookPayload;
    const eventId = String(payload.id);

    // 2. EARLY DEDUP
    if (await isTransactionProcessed(eventId)) {
      console.log(`[sepay-webhook] Duplicate ignored: ${eventId}`);
      return NextResponse.json({ success: true, status: "already_processed" });
    }

    // 3. RECORD dedup FIRST — idempotent
    await markTransactionProcessed(eventId);

    // 4. Bỏ qua giao dịch chuyển tiền RA
    if (payload.transferType !== "in") {
      return NextResponse.json({ success: true, status: "outgoing_skipped" });
    }

    // 5. MULTI-STRATEGY MATCHING
    const matchResult = await findOrderForTransaction(payload);
    if (!matchResult.lead) {
      console.warn(
        `[sepay-webhook] No lead matched. content="${payload.content}" amount=${payload.transferAmount}`
      );
      return NextResponse.json({ success: true, status: "no_match" });
    }

    const { lead, method } = matchResult;

    // 6. AMOUNT VALIDATION — reject underpayment, accept overpayment
    if (payload.transferAmount < lead.amount) {
      console.error(
        `[sepay-webhook] Underpayment: order=${lead.orderId} expected=${lead.amount} got=${payload.transferAmount}`
      );
      return NextResponse.json({ success: true, status: "underpayment" });
    }

    // 7. MARK PAID
    const payment: PaymentRecord = {
      sepayId: payload.id,
      referenceCode: payload.referenceCode,
      gateway: payload.gateway,
      amount: payload.transferAmount,
      transactionDate: payload.transactionDate,
      matchMethod: method as PaymentRecord["matchMethod"],
    };
    const updatedLead = await markLeadPaid(lead.orderId, payment);

    // 8. SIDE EFFECTS — non-blocking. Placeholder cho email / telegram notify.
    if (updatedLead) await runSideEffects(updatedLead, payload);

    return NextResponse.json({
      success: true,
      orderId: lead.orderId,
      matchMethod: method,
    });
  } catch (err) {
    console.error("[sepay-webhook] Unhandled error:", err);
    // LUÔN trả 200 để Sepay không retry → tránh duplicate
    return NextResponse.json({ success: false, error: String(err) }, { status: 200 });
  }
}

// =============================================================================
// Multi-strategy order matching
// =============================================================================

type MatchResult = {
  lead: Lead | null;
  method:
    | "content-orderid"
    | "content-phone"
    | "amount-timestamp-window"
    | "none";
};

async function findOrderForTransaction(
  payload: SepayWebhookPayload
): Promise<MatchResult> {
  // Strategy 1: order ID từ content
  const orderId = parseOrderIdFromContent(payload.content);
  if (orderId) {
    const lead = await getLeadByOrderId(orderId);
    if (lead) return { lead, method: "content-orderid" };
  }

  // Strategy 2: phone từ content
  const phone = parsePhoneFromContent(payload.content);
  if (phone) {
    const lead = await getLeadByPhone(phone);
    if (lead) return { lead, method: "content-phone" };
  }

  // Strategy 3: amount + timestamp window ±30 phút (chỉ accept nếu duy nhất 1)
  const transactionTime = new Date(
    payload.transactionDate.replace(" ", "T") + "+07:00"
  );
  const windowStart = new Date(transactionTime.getTime() - 30 * 60 * 1000);
  const windowEnd = new Date(transactionTime.getTime() + 30 * 60 * 1000);
  const candidates = await findPendingLeadByAmountAndTime(
    payload.transferAmount,
    windowStart,
    windowEnd
  );
  if (candidates.length === 1) {
    return { lead: candidates[0], method: "amount-timestamp-window" };
  }
  if (candidates.length > 1) {
    console.warn(
      `[sepay-webhook] Multiple amount-window matches (${candidates.length}) — skip`
    );
  }

  return { lead: null, method: "none" };
}

// =============================================================================
// Side effects — placeholder cho email / telegram notify wire vào sau
// =============================================================================

async function runSideEffects(
  lead: Lead,
  payload: SepayWebhookPayload
): Promise<void> {
  const operations: Array<{ name: string; fn: () => Promise<unknown> }> = [
    {
      name: "ConfirmationEmail",
      fn: () => sendOrderConfirmationEmail(lead),
    },
    {
      // Báo chủ shop: khách ĐÃ thanh toán → chuẩn bị giao hàng.
      name: "TelegramPaidNotify",
      fn: () =>
        notifyPaidOrder(lead, {
          receivedAmount: payload.transferAmount,
          gateway: payload.gateway,
        }),
    },
  ];

  for (const op of operations) {
    try {
      await op.fn();
      console.log(`[sepay-webhook] ✓ ${op.name} done`);
    } catch (err) {
      console.error(`[sepay-webhook] ✗ ${op.name} failed:`, err);
    }
  }
}
