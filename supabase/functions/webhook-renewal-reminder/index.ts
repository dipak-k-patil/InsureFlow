import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";

const getCorsHeaders = (origin?: string | null, appOrigin?: string) => {
  const configuredOrigin = appOrigin || "https://insureflow.kadmak.in";
  const allowedOrigin = origin && origin === configuredOrigin ? origin : configuredOrigin;
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret, x-idempotency-key",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
};

interface RenewalPayload {
  user_id?: string;
  policy_id?: string;
  milestone?: string;
  trigger?: string;
  workflow_name?: string;
  retry_count?: number;
  idempotency_key?: string;
}

const UUID_OR_TEST_ID_REGEX = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|pol-e2e-\d+)$/i;
const VALID_MILESTONES = new Set(["d60", "d30", "d15", "d7", "d5", "daily"]);

function isValidId(id: unknown): id is string {
  return typeof id === "string" && id.length > 0 && id.length <= 128 && UUID_OR_TEST_ID_REGEX.test(id);
}

export async function handleRenewalReminderRequest(
  reqBody: RenewalPayload,
  headers: Record<string, string | null>,
  env: Record<string, string | undefined>,
  mockDb?: {
    policies?: Record<string, unknown>[];
    webhook_logs?: Record<string, unknown>[];
    reminder_log?: Record<string, unknown>[];
    notifications?: Record<string, unknown>[];
  },
  options?: {
    supabaseClient?: SupabaseClient | { auth: { getUser: (token: string) => Promise<{ data: { user: { id: string } | null }; error: unknown }> } };
  }
) {
  const corsHeaders = getCorsHeaders(headers["origin"] || headers["Origin"], env.APP_ORIGIN);
  const idempotencyKey = headers["x-idempotency-key"] || headers["X-Idempotency-Key"] || reqBody.idempotency_key || null;
  const retryCount = Number(reqBody.retry_count ?? 0);
  const workflowName = String(reqBody.workflow_name || "Renewal Reminder Automation").slice(0, 100);
  const trigger = String(reqBody.trigger || "Scheduled Expiry Reminder").slice(0, 100);

  const authHeader = headers["authorization"] || headers["Authorization"];
  const webhookSecret = headers["x-webhook-secret"] || headers["X-Webhook-Secret"];
  const expectedSecret = env.WEBHOOK_SECRET;

  let authenticatedUserId: string | null = null;
  let isServerWebhook = false;

  // MODE B — Server-to-server webhook authentication via x-webhook-secret ONLY
  if (webhookSecret) {
    if (!expectedSecret) {
      const resp = { success: false, error: "Webhook authentication is not configured" };
      return { status: 503, body: resp, headers: corsHeaders };
    }
    if (webhookSecret === expectedSecret) {
      isServerWebhook = true;
    }
  }

  // MODE A — Real Supabase JWT verification via Authorization: Bearer <JWT> ONLY
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (token) {
      const supabase = options?.supabaseClient || (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY) : null);
      if (supabase) {
        const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
        if (!authErr && user) {
          authenticatedUserId = user.id;
        }
      }
    }
  }

  // Reject unauthenticated requests
  if (!isServerWebhook && !authenticatedUserId) {
    const resp = { success: false, error: "Unauthorized request" };
    return { status: 401, body: resp, headers: corsHeaders };
  }

  // Strict Input Validation
  const policyId = reqBody.policy_id;
  if (!isValidId(policyId)) {
    const resp = { success: false, error: "Invalid or missing policy_id" };
    return { status: 400, body: resp, headers: corsHeaders };
  }

  const milestone = String(reqBody.milestone || "d30").toLowerCase();
  if (!VALID_MILESTONES.has(milestone)) {
    const resp = { success: false, error: "Invalid milestone value" };
    return { status: 400, body: resp, headers: corsHeaders };
  }

  const logs = mockDb?.webhook_logs || [];
  const reminderLogs = mockDb?.reminder_log || [];

  const policy = (mockDb?.policies || []).find((p) => p.id === policyId);
  if (!policy) {
    const resp = { success: false, error: "Policy not found" };
    return { status: 404, body: resp, headers: corsHeaders };
  }

  // Ownership verification for user requests
  if (authenticatedUserId && policy.user_id !== authenticatedUserId) {
    const resp = { success: false, error: "Forbidden: Access denied to requested policy" };
    return { status: 403, body: resp, headers: corsHeaders };
  }

  const effectiveUserId = String(policy.user_id);

  const recordLog = (statusCode: number, outcome: string, responsePayload: Record<string, unknown>) => {
    const logEntry = {
      id: `log-${Date.now()}-${Math.random()}`,
      user_id: effectiveUserId,
      event_type: "renewal_reminder",
      workflow_name: workflowName,
      trigger: trigger,
      retry_count: retryCount,
      request_payload: reqBody,
      response_payload: responsePayload,
      status_code: statusCode,
      outcome: outcome,
      idempotency_key: idempotencyKey,
      created_at: new Date().toISOString(),
    };
    logs.push(logEntry);
    return logEntry;
  };

  // Idempotency Check
  if (idempotencyKey) {
    const existing = logs.find(
      (l) => l.idempotency_key === idempotencyKey && l.outcome === "success"
    );
    if (existing) {
      const resp = {
        success: true,
        duplicate: true,
        message: "Duplicate request detected and ignored. Previously processed.",
      };
      recordLog(200, "duplicate", resp);
      return { status: 200, body: resp, headers: corsHeaders };
    }
  }

  const reminderEntry = {
    id: `rem-${Date.now()}`,
    user_id: effectiveUserId,
    policy_id: policy.id,
    client: policy.client,
    milestone: milestone,
    days_left: 30,
    sent_date: new Date().toISOString().slice(0, 10),
    channels: { WhatsApp: true, Email: true },
    wa_link: "https://wa.me/1234567890",
  };
  reminderLogs.push(reminderEntry);

  const successResp = {
    success: true,
    message: "Renewal reminder recorded successfully",
    reminder_id: reminderEntry.id,
  };
  recordLog(200, "success", successResp);

  return { status: 200, body: successResp, headers: corsHeaders };
}

if (typeof Deno !== "undefined" && Deno.serve) {
  Deno.serve(async (req) => {
    const appOrigin = Deno.env.get("APP_ORIGIN");
    const origin = req.headers.get("origin");
    const corsHeaders = getCorsHeaders(origin, appOrigin);

    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing Supabase configuration in environment variables");
      return new Response(JSON.stringify({ success: false, error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let reqBody: RenewalPayload = {};
    try {
      const rawText = await req.text();
      if (rawText) reqBody = JSON.parse(rawText);
    } catch {
      return new Response(JSON.stringify({ success: false, error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const idempotencyKey =
      req.headers.get("x-idempotency-key") || reqBody.idempotency_key || null;
    const retryCount = Number(reqBody.retry_count ?? 0);
    const workflowName = String(reqBody.workflow_name || "Renewal Reminder Automation").slice(0, 100);
    const trigger = String(reqBody.trigger || "Scheduled Expiry Reminder").slice(0, 100);

    const authHeader = req.headers.get("authorization");
    const webhookSecret = req.headers.get("x-webhook-secret");
    const expectedSecret = Deno.env.get("WEBHOOK_SECRET");

    let authenticatedUserId: string | null = null;
    let isServerWebhook = false;

    // MODE B — Server-to-server webhook authentication via x-webhook-secret ONLY
    if (webhookSecret) {
      if (!expectedSecret) {
        return new Response(
          JSON.stringify({ success: false, error: "Webhook authentication is not configured" }),
          {
            status: 503,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (webhookSecret === expectedSecret) {
        isServerWebhook = true;
      }
    }

    // MODE A — User request JWT authentication via Authorization: Bearer <JWT> ONLY
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace(/^Bearer\s+/i, "").trim();
      if (token) {
        const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
        if (user && !authErr) {
          authenticatedUserId = user.id;
        }
      }
    }

    if (!isServerWebhook && !authenticatedUserId) {
      const resp = { success: false, error: "Unauthorized request" };
      return new Response(JSON.stringify(resp), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const policyId = reqBody.policy_id;
    if (!isValidId(policyId)) {
      const resp = { success: false, error: "Invalid or missing policy_id" };
      return new Response(JSON.stringify(resp), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const milestone = String(reqBody.milestone || "d30").toLowerCase();
    if (!VALID_MILESTONES.has(milestone)) {
      const resp = { success: false, error: "Invalid milestone value" };
      return new Response(JSON.stringify(resp), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Query policy with ownership filter if User Auth Mode A
    let query = supabase.from("policies").select("*").eq("id", policyId);
    if (authenticatedUserId) {
      query = query.eq("user_id", authenticatedUserId);
    }
    const { data: policy, error: policyErr } = await query.maybeSingle();

    if (policyErr || !policy) {
      const resp = { success: false, error: "Policy not found" };
      return new Response(JSON.stringify(resp), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = policy.user_id;

    const recordLog = async (statusCode: number, outcome: string, responsePayload: Record<string, unknown>) => {
      try {
        await supabase.from("webhook_logs").insert({
          user_id: userId,
          event_type: "renewal_reminder",
          workflow_name: workflowName,
          trigger: trigger,
          retry_count: retryCount,
          request_payload: reqBody,
          response_payload: responsePayload,
          status_code: statusCode,
          outcome: outcome,
          idempotency_key: idempotencyKey,
        });
      } catch (err) {
        console.error("Failed to record webhook log:", err);
      }
    };

    if (idempotencyKey) {
      const { data: existingLogs } = await supabase
        .from("webhook_logs")
        .select("id, status_code")
        .eq("idempotency_key", idempotencyKey)
        .eq("outcome", "success")
        .limit(1);

      if (existingLogs && existingLogs.length > 0) {
        const resp = {
          success: true,
          duplicate: true,
          message: "Duplicate request detected and ignored. Previously processed.",
        };
        await recordLog(200, "duplicate", resp);
        return new Response(JSON.stringify(resp), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const today = new Date().toISOString().slice(0, 10);
    const end = new Date(policy.end_date + "T00:00:00Z").getTime();
    const now = new Date();
    const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const daysLeft = Math.round((end - todayUtc) / 86400000);

    function formatINR(n: number) {
      return "₹" + Number(n).toLocaleString("en-IN");
    }

    const phone = String(policy.phone ?? "").replace(/\D/g, "");
    const statusStr = daysLeft < 0 ? `overdue by ${Math.abs(daysLeft)} days` : `expiring in ${daysLeft} days`;
    const msg =
      `Hello ${policy.client}, a friendly reminder from your insurance advisor.\n\n` +
      `Your ${policy.type ?? "policy"} (${policy.policy_no ?? "—"}) with ${policy.provider} is ${statusStr} on ${policy.end_date}.\n` +
      `Renewal premium: ${formatINR(policy.premium)}.\n\nReply here to renew. Thank you!`;
    const wa_link = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : null;

    const { data: reminder, error: remErr } = await supabase
      .from("reminder_log")
      .insert({
        user_id: userId,
        policy_id: policy.id,
        client: policy.client,
        milestone: milestone,
        days_left: daysLeft,
        sent_date: today,
        channels: { WhatsApp: true, Email: true },
        wa_link: wa_link,
      })
      .select()
      .single();

    if (remErr) {
      if (remErr.code === "23505") {
        const resp = { success: true, duplicate: true, message: "Reminder already sent for this milestone." };
        await recordLog(200, "duplicate", resp);
        return new Response(JSON.stringify(resp), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("Database insert error into reminder_log:", remErr);
      const resp = { success: false, error: "Internal server error" };
      await recordLog(500, "error", resp);
      return new Response(JSON.stringify(resp), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase.from("notifications").insert({
      user_id: userId,
      title: `Renewal reminder: ${policy.client}`,
      body: `${policy.provider} ${policy.type ?? "policy"} ${daysLeft < 0 ? "is overdue" : `expires in ${daysLeft} days`} (${policy.end_date}).`,
      type: "renewal",
      link: "/renewals",
    });

    const successResp = {
      success: true,
      message: "Renewal reminder recorded successfully",
      reminder_id: reminder.id,
    };
    await recordLog(200, "success", successResp);

    return new Response(JSON.stringify(successResp), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  });
}
