// lib/admin-stats.ts
//
// Dashboard analytics — KPI snapshot + time-series + KPI deltas vs previous period.
// Timezone: tất cả bucket tính theo Asia/Ho_Chi_Minh (UTC+7).

import { getSupabaseAdmin } from "./supabase-admin";

const VN_TZ_OFFSET_MS = 7 * 60 * 60 * 1000;

export type PeriodDays = 7 | 30 | 90;

export type DashboardData = {
  period: {
    days: PeriodDays;
    label: string;
    leads: number;
    paid: number;
    pending: number;
    revenue: number;
    conversionRate: number;
  };
  previousPeriod: {
    leads: number;
    paid: number;
    revenue: number;
    conversionRate: number;
  };
  deltas: {
    leadsPct: number | null;
    paidPct: number | null;
    revenuePct: number | null;
    conversionPoints: number;
  };
  totals: {
    allTimeLeads: number;
    allTimePaid: number;
    allTimeRevenue: number;
  };
  timeseries: TimeBucket[];
  statusBreakdown: { paid: number; pending: number; expired: number };
  recentPayments: RecentPayment[];
};

export type TimeBucket = {
  date: string;
  leads: number;
  paid: number;
  revenue: number;
};

export type RecentPayment = {
  orderId: string;
  name: string;
  amount: number;
  paidAt: string;
  productName: string;
};

type LeadRow = {
  order_id: string;
  name: string;
  email: string;
  phone: string;
  product_name: string;
  amount: number;
  status: "pending" | "paid" | "expired";
  created_at: string;
  paid_at: string | null;
  payment_record: { amount?: number } | null;
};

function toVnDateString(iso: string): string {
  const t = new Date(iso).getTime() + VN_TZ_OFFSET_MS;
  return new Date(t).toISOString().slice(0, 10);
}

function todayVnDateString(): string {
  const t = Date.now() + VN_TZ_OFFSET_MS;
  return new Date(t).toISOString().slice(0, 10);
}

function shiftVnDate(yyyymmdd: string, days: number): string {
  const d = new Date(yyyymmdd + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function pctDelta(curr: number, prev: number): number | null {
  if (prev === 0) return curr === 0 ? 0 : null;
  return ((curr - prev) / prev) * 100;
}

function leadRevenue(l: LeadRow): number {
  if (l.status !== "paid") return 0;
  return Number(l.payment_record?.amount ?? l.amount ?? 0);
}

export async function getDashboardData(
  days: PeriodDays = 30
): Promise<DashboardData> {
  const supabase = getSupabaseAdmin();

  // CHỈ đơn mua THẬT (mã "DH..."). Loại lead marketing TN-/EBK- khỏi mọi KPI.
  const { data: rows, error } = await supabase
    .from("leads")
    .select(
      "order_id, name, email, phone, product_name, amount, status, created_at, paid_at, payment_record"
    )
    .like("order_id", "DH%")
    .order("created_at", { ascending: false });

  if (error)
    throw new Error(`getDashboardData: leads query failed: ${error.message}`);
  const leads = (rows ?? []) as LeadRow[];

  const today = todayVnDateString();
  const startCurr = shiftVnDate(today, -(days - 1));
  const startPrev = shiftVnDate(today, -(days * 2 - 1));
  const endPrev = shiftVnDate(today, -days);

  const timeseries: TimeBucket[] = [];
  for (let i = days - 1; i >= 0; i--) {
    timeseries.push({
      date: shiftVnDate(today, -i),
      leads: 0,
      paid: 0,
      revenue: 0,
    });
  }
  const bucketByDate = new Map(timeseries.map((b) => [b.date, b]));

  const totals = { allTimeLeads: leads.length, allTimePaid: 0, allTimeRevenue: 0 };
  const currPeriod = { leads: 0, paid: 0, pending: 0, revenue: 0 };
  const prevPeriod = { leads: 0, paid: 0, revenue: 0 };
  const statusBreakdown = { paid: 0, pending: 0, expired: 0 };
  const paidInPeriod: LeadRow[] = [];

  for (const l of leads) {
    const createdDate = toVnDateString(l.created_at);
    const paidDate = l.paid_at ? toVnDateString(l.paid_at) : null;
    const rev = leadRevenue(l);

    if (l.status === "paid") statusBreakdown.paid++;
    else if (l.status === "pending") statusBreakdown.pending++;
    else if (l.status === "expired") statusBreakdown.expired++;

    if (l.status === "paid") {
      totals.allTimePaid++;
      totals.allTimeRevenue += rev;
    }

    if (createdDate >= startCurr && createdDate <= today) {
      currPeriod.leads++;
      if (l.status === "pending") currPeriod.pending++;
      const bucket = bucketByDate.get(createdDate);
      if (bucket) bucket.leads++;
    }
    if (paidDate && paidDate >= startCurr && paidDate <= today) {
      currPeriod.paid++;
      currPeriod.revenue += rev;
      paidInPeriod.push(l);
      const bucket = bucketByDate.get(paidDate);
      if (bucket) {
        bucket.paid++;
        bucket.revenue += rev;
      }
    }

    if (createdDate >= startPrev && createdDate <= endPrev) {
      prevPeriod.leads++;
    }
    if (paidDate && paidDate >= startPrev && paidDate <= endPrev) {
      prevPeriod.paid++;
      prevPeriod.revenue += rev;
    }
  }

  const currConv = currPeriod.leads === 0 ? 0 : currPeriod.paid / currPeriod.leads;
  const prevConv = prevPeriod.leads === 0 ? 0 : prevPeriod.paid / prevPeriod.leads;

  paidInPeriod.sort((a, b) => (b.paid_at ?? "").localeCompare(a.paid_at ?? ""));
  const recentPayments: RecentPayment[] = paidInPeriod.slice(0, 5).map((l) => ({
    orderId: l.order_id,
    name: l.name,
    amount: leadRevenue(l),
    paidAt: l.paid_at!,
    productName: l.product_name,
  }));

  return {
    period: {
      days,
      label: `${days} ngày qua`,
      leads: currPeriod.leads,
      paid: currPeriod.paid,
      pending: currPeriod.pending,
      revenue: currPeriod.revenue,
      conversionRate: currConv,
    },
    previousPeriod: {
      leads: prevPeriod.leads,
      paid: prevPeriod.paid,
      revenue: prevPeriod.revenue,
      conversionRate: prevConv,
    },
    deltas: {
      leadsPct: pctDelta(currPeriod.leads, prevPeriod.leads),
      paidPct: pctDelta(currPeriod.paid, prevPeriod.paid),
      revenuePct: pctDelta(currPeriod.revenue, prevPeriod.revenue),
      conversionPoints: (currConv - prevConv) * 100,
    },
    totals,
    timeseries,
    statusBreakdown,
    recentPayments,
  };
}
