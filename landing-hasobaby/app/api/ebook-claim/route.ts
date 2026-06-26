// app/api/ebook-claim/route.ts
//
// POST /api/ebook-claim
// Body:     { name, email }
// Response: { ok: true, zaloLink, message }
//
// Flow:
//  1. Validate name + email.
//  2. Check duplicate email — nếu lead ebook đã tồn tại với email này thì
//     RE-SEND email (không insert lại) và trả "Mẹ đã đăng ký rồi...".
//  3. Insert lead trực tiếp vào bảng `leads` (Supabase) — KHÔNG dùng helper
//     createLead() vì:
//       (a) order_id cần prefix "EBK-" thay vì "DH" để admin filter dễ.
//       (b) phone là fake (không insert phone_index để tránh đè khoá thật).
//     Lead được lưu với status='paid' (vì ebook free đã "giao" ngay) và
//     expire_at = NOW + 90 ngày.
//  4. Gửi email ebook qua sendEbookFreeEmail() — SMTP fail KHÔNG block response.
//  5. Trả về { ok, zaloLink, message } cho landing page.

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { sendEbookFreeEmail } from "@/lib/ebook-email";

export const runtime = "nodejs";

const ZALO_GROUP_URL = "https://zalo.me/g/izxocpsvs76krthiebzn";
const EBOOK_PRODUCT_NAME = "Ebook Cẩm Nang Chích Ngừa (FREE)";
const PAID_TTL_DAYS = 90;

type EbookClaimBody = {
  name?: unknown;
  email?: unknown;
};

type EbookClaimResponse = {
  ok: true;
  zaloLink: string;
  message: string;
};

type ErrorResponse = { error: string };

function generateEbookOrderId(): string {
  // EBK-<timestamp base36 uppercase> — dễ filter trong /admin và rất khó trùng.
  return `EBK-${Date.now().toString(36).toUpperCase()}`;
}

function fakePhoneForEmail(email: string): string {
  // "ebook-<email-slug>" — đảm bảo unique-ish trong cột leads.phone NOT NULL
  // mà KHÔNG đụng phone thật (phone thật luôn 10 số bắt đầu bằng 0).
  const slug = email
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
  return `ebook-${slug}`;
}

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 86400 * 1000).toISOString();
}

export async function POST(
  req: Request
): Promise<NextResponse<EbookClaimResponse | ErrorResponse>> {
  let body: EbookClaimBody;
  try {
    body = (await req.json()) as EbookClaimBody;
  } catch {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ." },
      { status: 400 }
    );
  }

  // --- validate name ---
  const rawName = typeof body.name === "string" ? body.name.trim() : "";
  if (rawName.length < 2 || rawName.length > 80) {
    return NextResponse.json(
      { error: "Mẹ vui lòng nhập họ tên (2–80 ký tự)." },
      { status: 400 }
    );
  }

  // --- validate email ---
  const rawEmail =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
    return NextResponse.json(
      { error: "Email chưa hợp lệ." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  // --- duplicate-email check ---
  // Tìm lead ebook đã tồn tại với email này (product_name LIKE 'Ebook%').
  let isDuplicate = false;
  try {
    const { data: existing, error: lookupErr } = await supabase
      .from("leads")
      .select("order_id")
      .eq("email", rawEmail)
      .like("product_name", "Ebook%")
      .limit(1)
      .maybeSingle();

    if (lookupErr) {
      console.error("[ebook-claim] duplicate lookup failed:", lookupErr);
      // không return 500 — coi như chưa có, vẫn insert tiếp.
    } else if (existing) {
      isDuplicate = true;
    }
  } catch (err) {
    console.error("[ebook-claim] duplicate lookup exception:", err);
  }

  // --- insert lead (skip nếu duplicate) ---
  if (!isDuplicate) {
    const orderId = generateEbookOrderId();
    const nowIso = new Date().toISOString();

    const row = {
      order_id: orderId,
      name: rawName,
      phone: fakePhoneForEmail(rawEmail),
      email: rawEmail,
      address: "",
      product_name: EBOOK_PRODUCT_NAME,
      amount: 0,
      status: "paid" as const,
      created_at: nowIso,
      paid_at: nowIso,
      payment_record: null,
      expire_at: daysFromNow(PAID_TTL_DAYS),
    };

    const { error: insertErr } = await supabase.from("leads").insert(row);
    if (insertErr) {
      // Nếu lỗi trùng PK order_id (cực hiếm — Date.now collide trong cùng ms)
      // thì retry 1 lần với suffix random.
      if (insertErr.message?.toLowerCase().includes("duplicate")) {
        const retryRow = {
          ...row,
          order_id: `${orderId}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        };
        const { error: retryErr } = await supabase
          .from("leads")
          .insert(retryRow);
        if (retryErr) {
          console.error("[ebook-claim] insert retry failed:", retryErr);
          return NextResponse.json(
            { error: "Hệ thống đang bận, mẹ thử lại sau ít phút." },
            { status: 500 }
          );
        }
      } else {
        console.error("[ebook-claim] leads insert failed:", insertErr);
        return NextResponse.json(
          { error: "Hệ thống đang bận, mẹ thử lại sau ít phút." },
          { status: 500 }
        );
      }
    }
  }

  // --- send email (SMTP fail KHÔNG block response) ---
  try {
    await sendEbookFreeEmail({ name: rawName, email: rawEmail });
  } catch (err) {
    console.error("[ebook-claim] sendEbookFreeEmail failed:", err);
    // tiếp tục — landing page sẽ hiển thị link PDF + nút Zalo inline.
  }

  const message = isDuplicate
    ? `Mẹ đã đăng ký rồi, em đã gửi lại ebook tới email ${rawEmail}.`
    : `Đã gửi ebook tới email ${rawEmail}.`;

  return NextResponse.json({
    ok: true,
    zaloLink: ZALO_GROUP_URL,
    message,
  });
}
