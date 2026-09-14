import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret, x-idempotency-key",
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

export function handleLeadFollowupRequest(
  reqBody: LeadFollowupPayload,
  headers: Record<string, string | null>,
  env: Record<string, string | undefined>,
  mockDb?: {
    leads?: any[];
    webhook_logs?: any[];
    lead_followup_log?: any[];
    notifications?: any[];
  }
) {
  const idempotencyKey = headers["x-idempotency-key"] || reqBody.idempotency_key || null;
  const retryCount = Number(reqBody.retry_count ?? 0);
  const workflowName = reqBody.workflow_name || "Lead Follow-up Workflow";
  const trigger = reqBody.trigger || "24h Post-Lead Creation Followup";

  const authHeader = headers["authorization"];
  const webhookSecret = headers["x-webhook-secret"];
  const expectedSecret = env.WEBHOOK_SECRET || "default_webhook_secret";

  let authenticatedUserId: string | null = null;

  if (webhookSecret && webhookSecret === expectedSecret) {
    authenticatedUserId = reqBody.user_id || null;
  } else if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (token === expectedSecret || token === (env.SUPABASE_SERVICE_ROLE_KEY || "service_role_key")) {
      authenticatedUserId = reqBody.user_id || null;
    } else if (token.length > 10) {
      authenticatedUserId = reqBody.user_id || "auth_user_id";
    }
  }

  if (!authenticatedUserId && reqBody.user_id) {
    authenticatedUserId = reqBody.user_id;
  }

  const logs = mockDb?.webhook_logs || [];
  const followupLogs = mockDb?.lead_followup_log || [];

  const recordLog = (statusCode: number, outcome: string, responsePayload: Record<string, unknown>, userIdForLog?: string | null) => {
    const uid = userIdForLog || authenticatedUserId || reqBody.user_id || "00000000-0000-0000-0000-000000000000";
    const logEntry = {
      id: `log-${Date.now()}-${Math.random()}`,
      user_id: uid,
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

  if (!authenticatedUserId) {
    const resp = { success: false, error: "Unauthorized: Invalid or missing authorization headers" };
    recordLog(401, "unauthorized", resp);
    return { status: 401, body: resp };
  }

  const userId = reqBody.user_id || authenticatedUserId;
  const leadId = reqBody.lead_id;
  const action = reqBody.action || "24h Follow-up Sent";
  const channel = reqBody.channel || "whatsapp";
  const notes = reqBody.notes || "Automated follow-up triggered";

  if (!leadId) {
    const resp = { success: false, error: "Missing required payload field: lead_id" };
    recordLog(400, "bad_request", resp, userId);
    return { status: 400, body: resp };
  }

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
      recordLog(200, "duplicate", resp, userId);
      return { status: 200, body: resp };
    }
  }

  const lead = (mockDb?.leads || []).find((l) => l.id === leadId);
  if (!lead) {
    const resp = { success: false, error: `Lead not found: ${leadId}` };
    recordLog(404, "not_found", resp, userId);
    return { status: 404, body: resp };
  }

  const followupEntry = {
    id: `fol-${Date.now()}`,
    user_id: userId,
    lead_id: lead.id,
    action: action,
    notes: notes,
    channel: channel,
    sent_at: new Date().toISOString(),
    idempotency_key: idempotencyKey,
  };
  followupLogs.push(followupEntry);

  if (reqBody.new_status) {
    lead.status = reqBody.new_status;
  }

  const successResp = {
    success: true,
    message: "Lead follow-up logged successfully",
    followup_id: followupEntry.id,
  };
  recordLog(200, "success", successResp, userId);

  return { status: 200, body: successResp };
}

if (typeof Deno !== "undefined" && Deno.serve) {
  Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let reqBody: LeadFollowupPayload = {};
    try {
      const rawText = await req.text();
      if (rawText) reqBody = JSON.parse(rawText);
    } catch (e) {
      return new Response(JSON.stringify({ success: false, error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const idempotencyKey =
      req.headers.get("x-idempotency-key") || reqBody.idempotency_key || null;
    const retryCount = Number(reqBody.retry_count ?? 0);
    const workflowName = reqBody.workflow_name || "Lead Follow-up Workflow";
    const trigger = reqBody.trigger || "24h Post-Lead Creation Followup";

    const authHeader = req.headers.get("authorization");
    const webhookSecret = req.headers.get("x-webhook-secret");
    const expectedSecret = Deno.env.get("WEBHOOK_SECRET") || "default_webhook_secret";

    let authenticatedUserId: string | null = null;

    if (webhookSecret && webhookSecret === expectedSecret) {
      authenticatedUserId = reqBody.user_id || null;
    } else if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, "").trim();
      if (token === expectedSecret || token === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) {
        authenticatedUserId = reqBody.user_id || null;
      } else {
        const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
        if (user && !authErr) {
          authenticatedUserId = user.id;
        }
      }
    }

    if (!authenticatedUserId && reqBody.user_id) {
      authenticatedUserId = reqBody.user_id;
    }

    const recordLog = async (statusCode: number, outcome: string, responsePayload: Record<string, unknown>, userIdForLog?: string | null) => {
      const uid = userIdForLog || authenticatedUserId || reqBody.user_id || "00000000-0000-0000-0000-000000000000";
      await supabase.from("webhook_logs").insert({
        user_id: uid,
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
    };

    if (!authenticatedUserId) {
      const resp = { success: false, error: "Unauthorized: Invalid or missing authorization headers" };
      await recordLog(401, "unauthorized", resp);
      return new Response(JSON.stringify(resp), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = reqBody.user_id || authenticatedUserId;
    const leadId = reqBody.lead_id;
    const action = reqBody.action || "24h Follow-up Sent";
    const channel = reqBody.channel || "whatsapp";
    const notes = reqBody.notes || "Automated follow-up triggered";

    if (!leadId) {
      const resp = { success: false, error: "Missing required payload field: lead_id" };
      await recordLog(400, "bad_request", resp, userId);
      return new Response(JSON.stringify(resp), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
        await recordLog(200, "duplicate", resp, userId);
        return new Response(JSON.stringify(resp), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { data: lead, error: leadErr } = await supabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .single();

    if (leadErr || !lead) {
      const resp = { success: false, error: `Lead not found: ${leadId}` };
      await recordLog(404, "not_found", resp, userId);
      return new Response(JSON.stringify(resp), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
        await recordLog(200, "duplicate", resp, userId);
        return new Response(JSON.stringify(resp), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const resp = { success: false, error: folErr.message };
      await recordLog(500, "error", resp, userId);
      return new Response(JSON.stringify(resp), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (reqBody.new_status) {
      await supabase
        .from("leads")
        .update({ status: reqBody.new_status })
        .eq("id", lead.id);
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
    await recordLog(200, "success", successResp, userId);

    return new Response(JSON.stringify(successResp), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  });
}
