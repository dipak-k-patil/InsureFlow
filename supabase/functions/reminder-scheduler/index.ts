import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const getCorsHeaders = (origin?: string | null) => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
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

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Cron authentication check
  const cronSecret = Deno.env.get("CRON_SECRET");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");

  const authHeader = req.headers.get("authorization");
  const headerCronSecret = req.headers.get("x-cron-secret");

  let isAuthenticated = false;

  if (cronSecret && (headerCronSecret === cronSecret || authHeader === `Bearer ${cronSecret}`)) {
    isAuthenticated = true;
  } else if (serviceRoleKey && (authHeader === `Bearer ${serviceRoleKey}` || req.headers.get("apikey") === serviceRoleKey)) {
    isAuthenticated = true;
  }

  if (!isAuthenticated) {
    return new Response(JSON.stringify({ error: "Unauthorized request" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase configuration");
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const { data: policies, error } = await supabase
      .from("policies")
      .select("*")
      .eq("status", "Active");
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

    return new Response(JSON.stringify({ created }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("reminder-scheduler error", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
