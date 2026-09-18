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

interface LeadFollowupPayload {
  user_id?: string;
  lead_id?: string;
  action?: string;
  notes?: string;
  channel?: string;
  new_status?: string;
  trigger?: string;
  workflow_name?: string;
  retry_count?: number;
  idempotency_key?: string;
}

const UUID_OR_TEST_ID_REGEX = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|lead-e2e-\d+)$/i;

function isValidId(id: unknown): id is string {
  return typeof id === "string" && id.length > 0 && id.length <= 128 && UUID_OR_TEST_ID_REGEX.test(id);
}

export async function handleLeadFollowupRequest(
  reqBody: LeadFollowupPayload,
  headers: Record<string, string | null>,
  env: Record<string, string | undefined>,
  mockDb?: {
    leads?: Record<string, unknown>[];
    webhook_logs?: Record<string, unknown>[];
    lead_followup_log?: Record<string, unknown>[];
    notifications?: Record<string, unknown>[];
  },
  options?: {
    supabaseClient?: SupabaseClient | { auth: { getUser: (token: string) => Promise<{ data: { user: { id: string } | null }; error: unknown }> } };
  }
) {
  const corsHeaders = getCorsHeaders(headers["origin"] || headers["Origin"], env.APP_ORIGIN);
  const idempotencyKey = headers["x-idempotency-key"] || headers["X-Idempotency-Key"] || reqBody.idempotency_key || null;
  const retryCount = Number(reqBody.retry_count ?? 0);
  const workflowName = String(reqBody.workflow_name || "Lead Follow-up Workflow").slice(0, 100);
  const trigger = String(reqBody.trigger || "24h Post-Lead Creation Followup").slice(0, 100);

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
  const leadId = reqBody.lead_id;
  if (!isValidId(leadId)) {
    const resp = { success: false, error: "Invalid or missing lead_id" };
    return { status: 400, body: resp, headers: corsHeaders };
  }

  const logs = mockDb?.webhook_logs || [];
  const followupLogs = mockDb?.lead_followup_log || [];

  const lead = (mockDb?.leads || []).find((l) => l.id === leadId);
  if (!lead) {
    const resp = { success: false, error: "Lead not found" };
    return { status: 404, body: resp, headers: corsHeaders };
  }

  // Ownership verification for user requests
  if (authenticatedUserId && lead.user_id !== authenticatedUserId) {
    const resp = { success: false, error: "Forbidden: Access denied to requested lead" };
    return { status: 403, body: resp, headers: corsHeaders };
  }

  const effectiveUserId = String(lead.user_id);

  const recordLog = (statusCode: number, outcome: string, responsePayload: Record<string, unknown>) => {
    const logEntry = {
      id: `log-${Date.now()}-${Math.random()}`,
      user_id: effectiveUserId,
      event_type: "lead_followup",
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

  // Idempotency check
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

  const action = String(reqBody.action || "24h Follow-up Sent").slice(0, 200);
  const channel = String(reqBody.channel || "whatsapp").slice(0, 50);
  const notes = String(reqBody.notes || "Automated follow-up triggered").slice(0, 1000);

  const followupEntry = {
    id: `fol-${Date.now()}`,
    user_id: effectiveUserId,
    lead_id: lead.id,
    action: action,
    notes: notes,
    channel: channel,
    sent_at: new Date().toISOString(),
    idempotency_key: idempotencyKey,
  };
  followupLogs.push(followupEntry);

  if (reqBody.new_status && typeof reqBody.new_status === "string") {
    lead.status = reqBody.new_status.slice(0, 50);
  }

  const successResp = {
    success: true,
    message: "Lead follow-up logged successfully",
    followup_id: followupEntry.id,
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

    let reqBody: LeadFollowupPayload = {};
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
    const workflowName = String(reqBody.workflow_name || "Lead Follow-up Workflow").slice(0, 100);
    const trigger = String(reqBody.trigger || "24h Post-Lead Creation Followup").slice(0, 100);

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

    const leadId = reqBody.lead_id;
    if (!isValidId(leadId)) {
      const resp = { success: false, error: "Invalid or missing lead_id" };
      return new Response(JSON.stringify(resp), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Query lead with ownership filter if User Auth Mode A
    let query = supabase.from("leads").select("*").eq("id", leadId);
    if (authenticatedUserId) {
      query = query.eq("user_id", authenticatedUserId);
    }
    const { data: lead, error: leadErr } = await query.maybeSingle();

    if (leadErr || !lead) {
      const resp = { success: false, error: "Lead not found" };
      return new Response(JSON.stringify(resp), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = lead.user_id;

    const recordLog = async (statusCode: number, outcome: string, responsePayload: Record<string, unknown>) => {
      try {
        await supabase.from("webhook_logs").insert({
          user_id: userId,
          event_type: "lead_followup",
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

    const action = String(reqBody.action || "24h Follow-up Sent").slice(0, 200);
    const channel = String(reqBody.channel || "whatsapp").slice(0, 50);
    const notes = String(reqBody.notes || "Automated follow-up triggered").slice(0, 1000);

    const { data: followupLog, error: folErr } = await supabase
      .from("lead_followup_log")
      .insert({
        user_id: userId,
        lead_id: lead.id,
        action: action,
        notes: notes,
        channel: channel,
        idempotency_key: idempotencyKey,
      })
      .select()
      .single();

    if (folErr) {
      if (folErr.code === "23505") {
        const resp = { success: true, duplicate: true, message: "Follow-up record already exists for this idempotency key." };
        await recordLog(200, "duplicate", resp);
        return new Response(JSON.stringify(resp), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("Database insert error into lead_followup_log:", folErr);
      const resp = { success: false, error: "Internal server error" };
      await recordLog(500, "error", resp);
      return new Response(JSON.stringify(resp), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (reqBody.new_status && typeof reqBody.new_status === "string") {
      await supabase
        .from("leads")
        .update({ status: reqBody.new_status.slice(0, 50) })
        .eq("id", lead.id)
        .eq("user_id", userId);
    }

    await supabase.from("notifications").insert({
      user_id: userId,
      title: `Lead follow-up sent: ${lead.name}`,
      body: `Follow-up (${action}) performed via ${channel}.`,
      type: "lead",
      link: "/leads",
    });

    const successResp = {
      success: true,
      message: "Lead follow-up logged successfully",
      followup_id: followupLog.id,
    };
    await recordLog(200, "success", successResp);

    return new Response(JSON.stringify(successResp), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  });
}
