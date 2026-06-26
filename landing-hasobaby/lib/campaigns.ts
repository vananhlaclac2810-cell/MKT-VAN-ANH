// lib/campaigns.ts
//
// Email campaign CRUD + audience query.

import { getSupabaseAdmin } from "./supabase-admin";

export type AudienceKind = "all" | "paid" | "pending" | "last_days";

export type Audience = {
  kind: AudienceKind;
  days?: number;
};

export type CampaignInput = {
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  audience: Audience;
};

export type Campaign = {
  id: string;
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  audience: Audience;
  recipientCount: number;
  successCount: number;
  failCount: number;
  status: "pending" | "sending" | "sent" | "failed";
  createdAt: string;
  sentAt: string | null;
};

export type CampaignSend = {
  id: string;
  campaignId: string;
  leadOrderId: string | null;
  email: string;
  name: string | null;
  status: "sent" | "failed" | "skipped";
  error: string | null;
  sentAt: string;
};

export type AudienceLead = {
  orderId: string;
  name: string;
  email: string;
};

type CampaignRow = {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  body_text: string;
  audience_kind: AudienceKind;
  audience_days: number | null;
  recipient_count: number;
  success_count: number;
  fail_count: number;
  status: "pending" | "sending" | "sent" | "failed";
  created_at: string;
  sent_at: string | null;
};

function rowToCampaign(r: CampaignRow): Campaign {
  return {
    id: r.id,
    name: r.name,
    subject: r.subject,
    bodyHtml: r.body_html,
    bodyText: r.body_text,
    audience: { kind: r.audience_kind, days: r.audience_days ?? undefined },
    recipientCount: r.recipient_count,
    successCount: r.success_count,
    failCount: r.fail_count,
    status: r.status,
    createdAt: r.created_at,
    sentAt: r.sent_at,
  };
}

export async function queryAudience(
  audience: Audience
): Promise<AudienceLead[]> {
  const supabase = getSupabaseAdmin();
  let q = supabase
    .from("leads")
    .select("order_id, name, email, status, created_at");

  if (audience.kind === "paid") q = q.eq("status", "paid");
  else if (audience.kind === "pending") q = q.eq("status", "pending");
  if (audience.kind === "all") q = q.in("status", ["paid", "pending"]);

  if (audience.kind === "last_days" && audience.days) {
    const since = new Date(
      Date.now() - audience.days * 86400 * 1000
    ).toISOString();
    q = q.gte("created_at", since);
  }

  const { data, error } = await q.order("created_at", { ascending: false });
  if (error) throw new Error(`queryAudience failed: ${error.message}`);

  const seen = new Set<string>();
  const out: AudienceLead[] = [];
  for (const r of (data ?? []) as Array<{
    order_id: string;
    name: string;
    email: string;
  }>) {
    const key = r.email.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push({ orderId: r.order_id, name: r.name, email: r.email });
  }
  return out;
}

export async function createCampaign(
  input: CampaignInput,
  recipientCount: number
): Promise<Campaign> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      name: input.name,
      subject: input.subject,
      body_html: input.bodyHtml,
      body_text: input.bodyText,
      audience_kind: input.audience.kind,
      audience_days: input.audience.days ?? null,
      recipient_count: recipientCount,
      status: "pending",
    })
    .select()
    .single();

  if (error || !data)
    throw new Error(`createCampaign failed: ${error?.message}`);
  return rowToCampaign(data as CampaignRow);
}

export async function setCampaignStatus(
  id: string,
  patch: Partial<{
    status: "pending" | "sending" | "sent" | "failed";
    successCount: number;
    failCount: number;
    sentAt: string | null;
  }>
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const row: Record<string, unknown> = {};
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.successCount !== undefined) row.success_count = patch.successCount;
  if (patch.failCount !== undefined) row.fail_count = patch.failCount;
  if (patch.sentAt !== undefined) row.sent_at = patch.sentAt;
  const { error } = await supabase.from("campaigns").update(row).eq("id", id);
  if (error) throw new Error(`setCampaignStatus failed: ${error.message}`);
}

export async function logCampaignSend(
  send: Omit<CampaignSend, "id" | "sentAt"> & { sentAt?: string }
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("campaign_sends").insert({
    campaign_id: send.campaignId,
    lead_order_id: send.leadOrderId,
    email: send.email,
    name: send.name,
    status: send.status,
    error: send.error,
    sent_at: send.sentAt ?? new Date().toISOString(),
  });
  if (error) console.error("logCampaignSend failed:", error.message);
}

export async function listCampaigns(limit = 50): Promise<Campaign[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`listCampaigns failed: ${error.message}`);
  return ((data ?? []) as CampaignRow[]).map(rowToCampaign);
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("getCampaign failed:", error.message);
    return null;
  }
  return data ? rowToCampaign(data as CampaignRow) : null;
}
