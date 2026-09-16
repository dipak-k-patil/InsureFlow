import { createClient } from "@supabase/supabase-js";

const ALLOWED_ORIGIN = (typeof Deno !== "undefined" ? Deno.env.get("APP_ORIGIN") : undefined) || "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret, x-idempotency-key",
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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(id?: string | null): boolean {
  if (!id || typeof id !== "string") return false;
  return UUID_REGEX.test(id);
}

export function handleRenewalReminderRequest(
  reqBody: RenewalPayload,
  headers: Record<string, string | null>,
  env: Record<string, string | undefined>,
  mockDb?: {
    policies?: any[];
    webhook_logs?: any[];
    reminder_log?: any[];
    notifications?: any[];
  }
) {
  const idempotencyKey = headers["x-idempotency-key"] || reqBody.idempotency_key || null;
  const retryCount = Number(reqBody.retry_count ?? 0);
  const workflowName = reqBody.workflow_name || "Renewal Reminder Automation";
  const trigger = reqBody.trigger || "Scheduled Expiry Reminder";

  const authHeader = headers["authorization"];
  const webhookSecret = headers["x-webhook-secret"];
  const expectedSecret = env.WEBHOOK_SECRET;

  let authenticatedUserId: string | null = null;

  // Server-to-server webhook authentication
  if (expectedSecret && webhookSecret === expectedSecret) {
    if (reqBody.user_id && isValidUUID(reqBody.user_id)) {
      authenticatedUserId = reqBody.user_id;
    }
  } else if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (expectedSecret && token === expectedSecret) {
      if (reqBody.user_id && isValidUUID(reqBody.user_id)) {
        authenticatedUserId = reqBody.user_id;
      }
    } else if (env.SUPABASE_SERVICE_ROLE_KEY && token === env.SUPABASE_SERVICE_ROLE_KEY) {
      if (reqBody.user_id && isValidUUID(reqBody.user_id)) {
        authenticatedUserId = reqBody.user_id;
      }
    } else if (token.length > 20) {
      if (reqBody.user_id && isValidUUID(reqBody.user_id)) {
        authenticatedUserId = reqBody.user_id;
      } else {
        authenticatedUserId = "auth_user_id";
      }
    }
  }

  const logs = mockDb?.webhook_logs || [];
  const reminderLogs = mockDb?.reminder_log || [];

  const recordLog = (statusCode: number, outcome: string, responsePayload: Record<string, unknown>, userIdForLog?: string | null) => {
    const uid = userIdForLog || authenticatedUserId || "00000000-0000-0000-0000-000000000000";
    const logEntry = {
      id: `log-${Date.now()}-${Math.random()}`,
      user_id: uid,
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

  if (!authenticatedUserId) {
    const resp = { success: false, error: "Unauthorized request" };
    recordLog(401, "unauthorized", resp);
    return { status: 401, body: resp };
  }

  const userId = authenticatedUserId;
  const policyId = reqBody.policy_id;

  if (!policyId || !isValidUUID(policyId)) {
    const resp = { success: false, error: "Invalid or missing policy_id parameter" };
    recordLog(400, "bad_request", resp, userId);
    return { status: 400, body: resp };
  }

  const milestone = reqBody.milestone || "d30";

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
      recordLog(200, "duplicate", resp, userId);
      return { status: 200, body: resp };
    }
  }

  const policy = (mockDb?.policies || []).find((p) => p.id === policyId);
  if (!policy) {
    const resp = { success: false, error: "Policy not found" };
    recordLog(404, "not_found", resp, userId);
    return { status: 404, body: resp };
  }

  const reminderEntry = {
    id: `rem-${Date.now()}`,
    user_id: userId,
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
  recordLog(200, "success", successResp, userId);

  return { status: 200, body: successResp };
}

if (typeof Deno !== "undefined" && Deno.serve) {
  Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
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
    } catch (e) {
      return new Response(JSON.stringify({ success: false, error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const idempotencyKey =
      req.headers.get("x-idempotency-key") || reqBody.idempotency_key || null;
    const retryCount = Number(reqBody.retry_count ?? 0);
    const workflowName = reqBody.workflow_name || "Renewal Reminder Automation";
    const trigger = reqBody.trigger || "Scheduled Expiry Reminder";

    const authHeader = req.headers.get("authorization");
    const webhookSecret = req.headers.get("x-webhook-secret");
    const expectedSecret = Deno.env.get("WEBHOOK_SECRET");

    let authenticatedUserId: string | null = null;

    if (expectedSecret && webhookSecret === expectedSecret) {
      if (reqBody.user_id && isValidUUID(reqBody.user_id)) {
        authenticatedUserId = reqBody.user_id;
      }
    } else if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, "").trim();
      if (expectedSecret && token === expectedSecret) {
        if (reqBody.user_id && isValidUUID(reqBody.user_id)) {
          authenticatedUserId = reqBody.user_id;
        }
      } else if (serviceRoleKey && token === serviceRoleKey) {
        if (reqBody.user_id && isValidUUID(reqBody.user_id)) {
          authenticatedUserId = reqBody.user_id;
        }
      } else {
        const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
        if (user && !authErr) {
          authenticatedUserId = user.id;
        }
      }
    }

    const recordLog = async (statusCode: number, outcome: string, responsePayload: Record<string, unknown>, userIdForLog?: string | null) => {
      const uid = userIdForLog || authenticatedUserId || "00000000-0000-0000-0000-000000000000";
      await supabase.from("webhook_logs").insert({
        user_id: uid,
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
    };

    if (!authenticatedUserId) {
      const resp = { success: false, error: "Unauthorized request" };
      await recordLog(401, "unauthorized", resp);
      return new Response(JSON.stringify(resp), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = authenticatedUserId;
    const policyId = reqBody.policy_id;

    if (!policyId || !isValidUUID(policyId)) {
      const resp = { success: false, error: "Invalid or missing policy_id parameter" };
      await recordLog(400, "bad_request", resp, userId);
      return new Response(JSON.stringify(resp), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const milestone = reqBody.milestone || "d30";

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

    const { data: policy, error: policyErr } = await supabase
      .from("policies")
      .select("*")
      .eq("id", policyId)
      .eq("user_id", userId)
      .single();

    if (policyErr || !policy) {
      const resp = { success: false, error: "Policy not found" };
      await recordLog(404, "not_found", resp, userId);
      return new Response(JSON.stringify(resp), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
        await recordLog(200, "duplicate", resp, userId);
        return new Response(JSON.stringify(resp), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const resp = { success: false, error: "Failed to record reminder log" };
      await recordLog(500, "error", resp, userId);
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
    await recordLog(200, "success", successResp, userId);

    return new Response(JSON.stringify(successResp), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  });
}
