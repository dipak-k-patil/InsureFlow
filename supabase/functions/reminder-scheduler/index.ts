import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";

const getCorsHeaders = (origin?: string | null) => ({
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  ...(origin ? { "Access-Control-Allow-Origin": origin } : {}),
});

type Milestone = "d60" | "d30" | "d15" | "d7" | "d5" | "daily";

const MILESTONE_DAYS: Record<string, number> = { d60: 60, d30: 30, d15: 15, d7: 7, d5: 5 };

function formatINR(n: number) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

function daysUntil(dateISO: string) {
  const end = new Date(dateISO + "T00:00:00Z").getTime();
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((end - today) / 86400000);
}

export async function handleReminderSchedulerRequest(
  headers: Record<string, string | null>,
  env: Record<string, string | undefined>,
  mockDb?: {
    policies?: Record<string, unknown>[];
    reminder_settings?: Record<string, unknown>[];
    reminder_log?: Record<string, unknown>[];
    notifications?: Record<string, unknown>[];
  },
  options?: {
    supabaseClient?: SupabaseClient;
  }
) {
  const corsHeaders = getCorsHeaders(headers["origin"] || headers["Origin"]);

  const cronSecret = env.CRON_SECRET;
  const headerCronSecret = headers["x-cron-secret"] || headers["X-Cron-Secret"];

  if (!cronSecret) {
    return { status: 503, body: { error: "Cron authentication is not configured" }, headers: corsHeaders };
  }

  if (!headerCronSecret || headerCronSecret !== cronSecret) {
    return { status: 401, body: { error: "Unauthorized request" }, headers: corsHeaders };
  }

  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = env.SUPABASE_URL;

  const supabase = options?.supabaseClient || (supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null);

  if (mockDb) {
    const activePolicies = (mockDb.policies || []).filter((p) => p.status === "active");
    const settingsByUser = new Map<string, { milestones: Record<string, boolean>; channels: Record<string, boolean> }>();
    (mockDb.reminder_settings ?? []).forEach((r) =>
      settingsByUser.set(String(r.user_id), {
        milestones: (r.milestones ?? {}) as Record<string, boolean>,
        channels: (r.channels ?? {}) as Record<string, boolean>,
      })
    );

    const today = new Date().toISOString().slice(0, 10);
    let created = 0;
    const reminderLogs = mockDb.reminder_log || [];
    const notifications = mockDb.notifications || [];

    for (const p of activePolicies) {
      const daysLeft = daysUntil(String(p.end_date));
      if (daysLeft > 60) continue;

      const userIdStr = String(p.user_id);
      const s = settingsByUser.get(userIdStr);
      const milestones = s?.milestones ?? { d60: true, d30: true, d15: true, d7: true, d5: true, daily: true };
      const channels = s?.channels ?? { WhatsApp: true, Email: true, SMS: false };

      let milestone: Milestone | null = null;
      const hit = Object.entries(MILESTONE_DAYS).find(([, d]) => d === daysLeft);
      if (hit) milestone = hit[0] as Milestone;
      else if (daysLeft < 5) milestone = "daily";
      if (!milestone || milestones[milestone] === false) continue;

      const existing = reminderLogs.find(
        (r) => r.policy_id === p.id && r.milestone === milestone && (milestone !== "daily" || r.sent_date === today)
      );
      if (existing) continue;

      const phone = String(p.phone ?? "").replace(/\D/g, "");
      const status = daysLeft < 0 ? `overdue by ${Math.abs(daysLeft)} days` : `expiring in ${daysLeft} days`;
      const msg =
        `Hello ${p.client}, a friendly reminder from your insurance advisor.\n\n` +
        `Your ${p.type ?? "policy"} (${p.policy_no ?? "—"}) with ${p.provider} is ${status} on ${p.end_date}.\n` +
        `Renewal premium: ${formatINR(Number(p.premium))}.\n\nReply here to renew. Thank you!`;
      const wa_link = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : null;

      reminderLogs.push({
        id: `rem-${Date.now()}`,
        user_id: p.user_id,
        policy_id: p.id,
        client: p.client,
        milestone,
        days_left: daysLeft,
        sent_date: today,
        channels,
        wa_link,
      });

      notifications.push({
        id: `notif-${Date.now()}`,
        user_id: p.user_id,
        title: `Renewal reminder: ${p.client}`,
        body: `${p.provider} ${p.type ?? "policy"} ${daysLeft < 0 ? "is overdue" : `expires in ${daysLeft} days`} (${p.end_date}).`,
        type: "renewal",
        link: "/renewals",
      });
      created++;
    }

    return { status: 200, body: { created }, headers: corsHeaders };
  }

  if (!supabase) {
    return { status: 500, body: { error: "Server configuration error" }, headers: corsHeaders };
  }

  try {
    const { data: policies, error } = await supabase
      .from("policies")
      .select("*")
      .eq("status", "active");
    if (error) throw error;

    const { data: settingsRows } = await supabase.from("reminder_settings").select("*");
    const settingsByUser = new Map<string, { milestones: Record<string, boolean>; channels: Record<string, boolean> }>();
    (settingsRows ?? []).forEach((r) =>
      settingsByUser.set(r.user_id, {
        milestones: (r.milestones ?? {}) as Record<string, boolean>,
        channels: (r.channels ?? {}) as Record<string, boolean>,
      })
    );

    const today = new Date().toISOString().slice(0, 10);
    let created = 0;

    for (const p of policies ?? []) {
      const daysLeft = daysUntil(p.end_date);
      if (daysLeft > 60) continue;

      const s = settingsByUser.get(p.user_id);
      const milestones = s?.milestones ?? { d60: true, d30: true, d15: true, d7: true, d5: true, daily: true };
      const channels = s?.channels ?? { WhatsApp: true, Email: true, SMS: false };

      let milestone: Milestone | null = null;
      const hit = Object.entries(MILESTONE_DAYS).find(([, d]) => d === daysLeft);
      if (hit) milestone = hit[0] as Milestone;
      else if (daysLeft < 5) milestone = "daily";
      if (!milestone || milestones[milestone] === false) continue;

      // Idempotency check
      const q = supabase
        .from("reminder_log")
        .select("id")
        .eq("policy_id", p.id)
        .eq("milestone", milestone)
        .limit(1);
      const { data: existing } = milestone === "daily" ? await q.eq("sent_date", today) : await q;
      if (existing && existing.length > 0) continue;

      const phone = String(p.phone ?? "").replace(/\D/g, "");
      const status = daysLeft < 0 ? `overdue by ${Math.abs(daysLeft)} days` : `expiring in ${daysLeft} days`;
      const msg =
        `Hello ${p.client}, a friendly reminder from your insurance advisor.\n\n` +
        `Your ${p.type ?? "policy"} (${p.policy_no ?? "—"}) with ${p.provider} is ${status} on ${p.end_date}.\n` +
        `Renewal premium: ${formatINR(p.premium)}.\n\nReply here to renew. Thank you!`;
      const wa_link = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : null;

      const { error: logErr } = await supabase.from("reminder_log").insert({
        user_id: p.user_id,
        policy_id: p.id,
        client: p.client,
        milestone,
        days_left: daysLeft,
        sent_date: today,
        channels,
        wa_link,
      });
      if (logErr) continue;

      await supabase.from("notifications").insert({
        user_id: p.user_id,
        title: `Renewal reminder: ${p.client}`,
        body: `${p.provider} ${p.type ?? "policy"} ${daysLeft < 0 ? "is overdue" : `expires in ${daysLeft} days`} (${p.end_date}).`,
        type: "renewal",
        link: "/renewals",
      });
      created++;
    }

    return { status: 200, body: { created }, headers: corsHeaders };
  } catch (e) {
    console.error("reminder-scheduler error", e);
    return { status: 500, body: { error: "Internal server error" }, headers: corsHeaders };
  }
}

if (typeof Deno !== "undefined" && Deno.serve) {
  Deno.serve(async (req) => {
    const origin = req.headers.get("origin");
    const corsHeaders = getCorsHeaders(origin);

    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    const headers: Record<string, string | null> = {};
    req.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    const env: Record<string, string | undefined> = {
      CRON_SECRET: Deno.env.get("CRON_SECRET"),
      SUPABASE_URL: Deno.env.get("SUPABASE_URL"),
      SUPABASE_SERVICE_ROLE_KEY: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
    };

    const res = await handleReminderSchedulerRequest(headers, env);
    return new Response(JSON.stringify(res.body), {
      status: res.status,
      headers: { ...res.headers, "Content-Type": "application/json" },
    });
  });
}
