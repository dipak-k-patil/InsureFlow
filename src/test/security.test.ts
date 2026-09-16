import { describe, it, expect } from "vitest";
import { handleLeadFollowupRequest } from "../../supabase/functions/webhook-lead-followup/index";
import { handleRenewalReminderRequest } from "../../supabase/functions/webhook-renewal-reminder/index";

describe("Security Regression & Webhook Hardening Tests", () => {
  const mockUserA = "11111111-1111-1111-1111-111111111111";
  const mockUserB = "22222222-2222-2222-2222-222222222222";

  const mockDb = {
    leads: [
      { id: "33333333-3333-3333-3333-333333333333", user_id: mockUserA, name: "User A Lead", status: "new" },
      { id: "44444444-4444-4444-4444-444444444444", user_id: mockUserB, name: "User B Lead", status: "new" },
    ],
    policies: [
      { id: "55555555-5555-5555-5555-555555555555", user_id: mockUserA, client: "User A Client", provider: "LIC", end_date: "2026-09-01", premium: 10000 },
      { id: "66666666-6666-6666-6666-666666666666", user_id: mockUserB, client: "User B Client", provider: "Star", end_date: "2026-09-01", premium: 20000 },
    ],
    webhook_logs: [],
    lead_followup_log: [],
    reminder_log: [],
  };

  const validEnv = { WEBHOOK_SECRET: "super_secret_webhook_key_2026" };

  it("1. Reject unauthenticated request with HTTP 401", () => {
    const res = handleLeadFollowupRequest(
      { lead_id: "33333333-3333-3333-3333-333333333333" },
      {},
      validEnv,
      mockDb
    );
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("2. Reject invalid webhook secret with HTTP 401", () => {
    const res = handleLeadFollowupRequest(
      { lead_id: "33333333-3333-3333-3333-333333333333" },
      { "x-webhook-secret": "wrong_secret" },
      validEnv,
      mockDb
    );
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized request");
  });

  it("3. Return HTTP 503 when server WEBHOOK_SECRET is unconfigured", () => {
    const res = handleLeadFollowupRequest(
      { lead_id: "33333333-3333-3333-3333-333333333333" },
      { "x-webhook-secret": "some_secret" },
      {},
      mockDb
    );
    expect(res.status).toBe(503);
    expect(res.body.error).toBe("Webhook authentication is not configured");
  });

  it("4. Reject request with invalid non-UUID lead_id with HTTP 400", () => {
    const res = handleLeadFollowupRequest(
      { lead_id: "invalid-id-'; DROP TABLE leads;--" },
      { "x-webhook-secret": "super_secret_webhook_key_2026" },
      validEnv,
      mockDb
    );
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid or missing lead_id");
  });

  it("5. Reject request with invalid milestone in renewal reminder with HTTP 400", () => {
    const res = handleRenewalReminderRequest(
      { policy_id: "55555555-5555-5555-5555-555555555555", milestone: "d9999_invalid" },
      { "x-webhook-secret": "super_secret_webhook_key_2026" },
      validEnv,
      mockDb
    );
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid milestone value");
  });

  it("6. Never trust body user_id for identity spoofing", () => {
    const res = handleLeadFollowupRequest(
      {
        user_id: mockUserB, // Attempted spoof
        lead_id: "33333333-3333-3333-3333-333333333333",
      },
      { "x-webhook-secret": "super_secret_webhook_key_2026" },
      validEnv,
      mockDb
    );
    expect(res.status).toBe(200);
    // Verified: The recorded log user_id comes from lead's actual owner (mockUserA), NOT body user_id (mockUserB)
    const createdLog = mockDb.webhook_logs.find((l) => l.event_type === "lead_followup");
    expect(createdLog.user_id).toBe(mockUserA);
  });
});
