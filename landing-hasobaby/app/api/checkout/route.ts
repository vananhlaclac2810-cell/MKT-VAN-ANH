// app/api/checkout/route.ts
//
// POST /api/checkout
// Body:     { comboId, name, phone, address }
// Response: { orderId, amount, qrUrl, bank, transferContent, comboName, comboQty }
//
// Flow: validate → createLead (Supabase) → sinh order DH000xxx → tạo VietQR Sepay.

import { NextResponse } from "next/server";
import { createLead } from "@/lib/leads-store";
import { generateVietQRUrl } from "@/lib/sepay";
import { COMBOS } from "@/lib/products";
import { notifyNewOrder } from "@/lib/telegram";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: {
    comboId?: string;
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    source?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const { comboId, name, phone, email, address } = body;
  // Landing nguồn của đơn — chỉ chấp nhận "ebook", còn lại coi là "home".
  const source = body.source === "ebook" ? "ebook" : "home";

  const combo = COMBOS.find((c) => c.id === comboId);
  if (!combo) {
    return NextResponse.json(
      { error: "Gói sản phẩm không hợp lệ." },
      { status: 400 }
    );
  }
  if (!name?.trim() || name.trim().length < 2) {
    return NextResponse.json(
      { error: "Mẹ vui lòng nhập họ tên." },
      { status: 400 }
    );
  }
  if (!phone || !/^0\d{9}$/.test(phone.trim())) {
    return NextResponse.json(
      { error: "Số điện thoại chưa đúng — cần 10 số, bắt đầu bằng 0." },
      { status: 400 }
    );
  }
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json(
      { error: "Email chưa hợp lệ." },
      { status: 400 }
    );
  }
  if (!address?.trim() || address.trim().length < 6) {
    return NextResponse.json(
      { error: "Mẹ vui lòng nhập địa chỉ nhận hàng đầy đủ." },
      { status: 400 }
    );
  }

  const bankName = process.env.SEPAY_BANK_NAME;
  const accountNumber = process.env.SEPAY_BANK_ACCOUNT_NUMBER;
  const accountName = process.env.SEPAY_ACCOUNT_NAME;
  if (!bankName || !accountNumber || !accountName) {
    return NextResponse.json(
      {
        error:
          "Hệ thống thanh toán đang được cập nhật. Mẹ vui lòng nhắn Messenger để đặt hàng giúp em.",
      },
      { status: 503 }
    );
  }

  let orderId: string;
  try {
    const res = await createLead({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      productName: `${combo.name} — Xịt Hạ Sốt Hasobaby`,
      amount: combo.price,
      source,
    });
    orderId = res.orderId;

    // Telegram: báo chủ shop có đơn mới (chưa thanh toán). Không block đơn nếu lỗi.
    try {
      await notifyNewOrder(res.lead);
    } catch (notifyErr) {
      console.error("[checkout] notifyNewOrder failed:", notifyErr);
    }
  } catch (err) {
    console.error("[checkout] createLead failed:", err);
    return NextResponse.json(
      {
        error:
          "Chưa tạo được đơn hàng. Mẹ thử lại hoặc nhắn Messenger giúp em nhé.",
      },
      { status: 500 }
    );
  }

  const qrUrl = generateVietQRUrl({
    accountNumber,
    bank: bankName,
    amount: combo.price,
    content: orderId,
    template: "compact",
  });

  return NextResponse.json({
    orderId,
    amount: combo.price,
    qrUrl,
    bank: { bankCode: bankName, accountNumber, accountName },
    transferContent: orderId,
    comboName: combo.name,
    comboQty: combo.qty,
  });
}
