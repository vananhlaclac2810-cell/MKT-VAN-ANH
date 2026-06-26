// app/api/health/route.ts
//
// Health check cho Vercel Cron ping — giữ Supabase project khỏi auto-pause
// sau 7 ngày inactivity.

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("order_counter")
      .select("current_value")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      counter: data?.current_value ?? 0,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 503 }
    );
  }
}
