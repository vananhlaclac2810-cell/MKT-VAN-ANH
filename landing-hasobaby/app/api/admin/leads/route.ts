// app/api/admin/leads/route.ts
//
// GET /api/admin/leads?status=&search=&fromDate=&toDate=
// Headers: x-admin-pass: <password>

import { NextRequest, NextResponse } from "next/server";
import { checkAdminPass } from "@/lib/admin-auth";
import { listLeads } from "@/lib/leads-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!checkAdminPass(req.headers.get("x-admin-pass"))) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  try {
    const sourceParam = searchParams.get("source");
    const source =
      sourceParam === "ebook" || sourceParam === "quiz" ? sourceParam : "orders";
    const result = await listLeads({
      status: (searchParams.get("status") ?? "all") as
        | "all"
        | "pending"
        | "paid"
        | "expired",
      search: searchParams.get("search") ?? "",
      fromDate: searchParams.get("fromDate") ?? undefined,
      toDate: searchParams.get("toDate") ?? undefined,
      source,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/admin/leads]", err);
    return NextResponse.json(
      {
        error: "internal_error",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
