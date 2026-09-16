import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://wvoyfmkxwpjtjtsnodgf.supabase.co";
const PUBLISHABLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_NhuDPaLMh5tjGfWW6fujBw_Aq9JIHF3";

const supabase = createClient(SUPABASE_URL, PUBLISHABLE_KEY);

async function runE2E() {
  console.log("=== Starting End-to-End Webhook Verification ===");

  // 1. Authenticate / get test user
  console.log("Step 1: Setting up test user...");
  const userId = "00000000-0000-4000-a000-000000000001";
  const policyId = "00000000-0000-4000-a000-000000000002";
  const leadId = "00000000-0000-4000-a000-000000000003";
  const testEmail = "e2e_test@example.com";
  const authToken = PUBLISHABLE_KEY;
  const webhookSecret = process.env.WEBHOOK_SECRET || "e2e_test_webhook_secret";

  console.log(`Test user ID: ${userId}`);

  // 2. Seed Test Policy & Test Lead
  console.log("\nStep 2: Preparing test policy and lead objects...");

  const testPolicy = {
    id: policyId,
    user_id: userId,
    client: "E2E Test Client",
    phone: "+919876543210",
    email: testEmail,
    provider: "Star Health",
    type: "Health Insurance",
    premium: 15000,
    start_date: "2025-01-01",
    end_date: "2026-08-15",
    policy_no: "POL-E2E-1001",
    status: "Active",
  };

  const testLead = {
    id: leadId,
    user_id: userId,
    name: "E2E Test Lead",
    phone: "+919876543210",
    email: testEmail,
    source: "Website",
    status: "new",
    value: 50000,
  };

  // 3. Test Webhook Edge Functions
  const renewalIdempotencyKey = `e2e-renewal-${testPolicy.id}-d30`;
  const leadIdempotencyKey = `e2e-lead-${testLead.id}-followup`;

  console.log("\nStep 3: Triggering Renewal Reminder Webhook...");
  const renewalPayload = {
    user_id: userId,
    policy_id: testPolicy.id,
    milestone: "d30",
    workflow_name: "E2E Renewal Automation",
    trigger: "Scheduled Test Run",
    retry_count: 0,
    idempotency_key: renewalIdempotencyKey,
  };

  const { handleRenewalReminderRequest } = await import("../supabase/functions/webhook-renewal-reminder/index.ts");
  const mockDbRenewal = {
    policies: [testPolicy],
    webhook_logs: [],
    reminder_log: [],
    notifications: [],
  };

  const res1 = handleRenewalReminderRequest(
    renewalPayload,
    {
      "x-webhook-secret": webhookSecret,
      "x-idempotency-key": renewalIdempotencyKey,
      authorization: `Bearer ${webhookSecret}`,
    },
    { WEBHOOK_SECRET: webhookSecret },
    mockDbRenewal
  );

  console.log(`Renewal Webhook Initial Call Response status: ${res1.status}`, res1.body);
  if (res1.status !== 200 || !res1.body.success) {
    console.error("Expected 200 success response from renewal webhook");
    process.exit(1);
  }

  console.log("\nStep 4: Triggering Lead Follow-up Webhook...");
  const leadPayload = {
    user_id: userId,
    lead_id: testLead.id,
    action: "Initial Contact Follow-up",
    notes: "E2E verification automated note",
    channel: "whatsapp",
    new_status: "contacted",
    workflow_name: "E2E Lead Workflow",
    trigger: "24h Lead Creation",
    retry_count: 0,
    idempotency_key: leadIdempotencyKey,
  };

  const { handleLeadFollowupRequest } = await import("../supabase/functions/webhook-lead-followup/index.ts");
  const mockDbLead = {
    leads: [testLead],
    webhook_logs: [],
    lead_followup_log: [],
    notifications: [],
  };

  const res2 = handleLeadFollowupRequest(
    leadPayload,
    {
      "x-webhook-secret": webhookSecret,
      "x-idempotency-key": leadIdempotencyKey,
      authorization: `Bearer ${webhookSecret}`,
    },
    { WEBHOOK_SECRET: webhookSecret },
    mockDbLead
  );

  console.log(`Lead Webhook Initial Call Response status: ${res2.status}`, res2.body);
  if (res2.status !== 200 || !res2.body.success) {
    console.error("Expected 200 success response from lead webhook");
    process.exit(1);
  }

  // 4. Test Idempotency & Duplicate Retries (n8n retry scenario)
  console.log("\nStep 5: Testing Idempotency & Duplicate Retries...");
  const mockDbRetry = {
    policies: [testPolicy],
    webhook_logs: [
      { idempotency_key: renewalIdempotencyKey, outcome: "success" }
    ],
    reminder_log: [],
  };

  const resRetry = handleRenewalReminderRequest(
    { ...renewalPayload, retry_count: 1 },
    {
      "x-webhook-secret": webhookSecret,
      "x-idempotency-key": renewalIdempotencyKey,
      authorization: `Bearer ${webhookSecret}`,
    },
    { WEBHOOK_SECRET: webhookSecret },
    mockDbRetry
  );

  console.log(`Renewal Duplicate Retry Response status: ${resRetry.status}`, resRetry.body);
  if (resRetry.status !== 200 || !resRetry.body.duplicate) {
    console.error("Expected 200 response with duplicate: true for renewal retry");
    process.exit(1);
  }

  // 5. Test Payload Validation & Unauthorized Handling
  console.log("\nStep 6: Testing Validation & Unauthorized Access...");
  const resUnauthorized = handleRenewalReminderRequest(
    renewalPayload,
    {
      "x-webhook-secret": "wrong_secret",
    },
    { WEBHOOK_SECRET: webhookSecret },
    mockDbRenewal
  );

  console.log(`Unauthorized Response status: ${resUnauthorized.status}`, resUnauthorized.body);
  if (resUnauthorized.status !== 401 || resUnauthorized.body.success !== false) {
    console.error("Expected 401 error response for invalid secret");
    process.exit(1);
  }

  console.log("\n=== ALL E2E VERIFICATION TESTS PASSED SUCCESSFULLY! ===");
}

runE2E().catch((err) => {
  console.error("E2E Verification failed with unhandled error:", err);
  process.exit(1);
});
