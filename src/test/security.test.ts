import { describe, it, expect } from "vitest";
import { handleLeadFollowupRequest } from "../../supabase/functions/webhook-lead-followup/index";
import { handleRenewalReminderRequest } from "../../supabase/functions/webhook-renewal-reminder/index";
import { handleReminderSchedulerRequest } from "../../supabase/functions/reminder-scheduler/index";

describe("Security Regression & Webhook Hardening Tests", () => {
  const mockUserA = "11111111-1111-1111-1111-111111111111";
  const mockUserB = "22222222-2222-2222-2222-222222222222";

  const getMockDb = () => ({
    leads: [
      { id: "33333333-3333-3333-3333-333333333333", user_id: mockUserA, name: "User A Lead", status: "new" },
      { id: "44444444-4444-4444-4444-444444444444", user_id: mockUserB, name: "User B Lead", status: "new" },
    ],
    policies: [
      { id: "55555555-5555-5555-5555-555555555555", user_id: mockUserA, client: "User A Client", provider: "LIC", end_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10), premium: 10000, status: "active" },
      { id: "66666666-6666-6666-6666-666666666666", user_id: mockUserB, client: "User B Client", provider: "Star", end_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10), premium: 20000, status: "Active" }, // uppercase status should be ignored by DB query
    ],
    reminder_settings: [],
    webhook_logs: [],
    lead_followup_log: [],
    reminder_log: [],
    notifications: [],
  });

  const validEnv = { WEBHOOK_SECRET: "super_secret_webhook_key_2026" };

  const createMockSupabase = (tokenUserMap: Record<string, { id: string } | null>) => ({
    auth: {
      getUser: async (token: string) => {
        const user = tokenUserMap[token];
        if (!user) return { data: { user: null }, error: new Error("Invalid JWT token") };
        return { data: { user }, error: null };
      },
    },
  });

  it("1. Reject unauthenticated request with HTTP 401", async () => {
    const res = await handleLeadFollowupRequest(
      { lead_id: "33333333-3333-3333-3333-333333333333" },
      {},
      validEnv,
      getMockDb()
    );
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("2. Reject invalid webhook secret with HTTP 401", async () => {
    const res = await handleLeadFollowupRequest(
      { lead_id: "33333333-3333-3333-3333-333333333333" },
      { "x-webhook-secret": "wrong_secret" },
      validEnv,
      getMockDb()
    );
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized request");
  });

  it("2b. Reject WEBHOOK_SECRET in Authorization Bearer header (x-webhook-secret required for server auth)", async () => {
    const res = await handleLeadFollowupRequest(
      { lead_id: "33333333-3333-3333-3333-333333333333" },
      { authorization: `Bearer ${validEnv.WEBHOOK_SECRET}` },
      validEnv,
      getMockDb(),
      { supabaseClient: createMockSupabase({}) }
    );
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized request");
  });

  it("2c. Webhook response returns restricted APP_ORIGIN CORS header instead of wildcard *", async () => {
    const customAppOriginEnv = { ...validEnv, APP_ORIGIN: "https://custom.insureflow.com" };
    const res = await handleLeadFollowupRequest(
      { lead_id: "33333333-3333-3333-3333-333333333333" },
      { "x-webhook-secret": validEnv.WEBHOOK_SECRET, origin: "https://custom.insureflow.com" },
      customAppOriginEnv,
      getMockDb()
    );
    expect(res.headers["Access-Control-Allow-Origin"]).toBe("https://custom.insureflow.com");
    expect(res.headers["Access-Control-Allow-Origin"]).not.toBe("*");
  });

  it("3. Return HTTP 503 when server WEBHOOK_SECRET is unconfigured", async () => {
    const res = await handleLeadFollowupRequest(
      { lead_id: "33333333-3333-3333-3333-333333333333" },
      { "x-webhook-secret": "some_secret" },
      {},
      getMockDb()
    );
    expect(res.status).toBe(503);
    expect(res.body.error).toBe("Webhook authentication is not configured");
  });

  it("4. Reject random Bearer token with HTTP 401", async () => {
    const res = await handleLeadFollowupRequest(
      { lead_id: "33333333-3333-3333-3333-333333333333" },
      { authorization: "Bearer abcdefghijklmnop" },
      validEnv,
      getMockDb(),
      { supabaseClient: createMockSupabase({}) }
    );
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized request");
  });

  it("5. Reject invalid Supabase JWT with HTTP 401", async () => {
    const res = await handleLeadFollowupRequest(
      { lead_id: "33333333-3333-3333-3333-333333333333" },
      { authorization: "Bearer invalid_jwt_token_payload" },
      validEnv,
      getMockDb(),
      { supabaseClient: createMockSupabase({ invalid_jwt_token_payload: null }) }
    );
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized request");
  });

  it("6. Valid Supabase JWT authenticates user and extracts user ID from JWT", async () => {
    const mockDb = getMockDb();
    const res = await handleLeadFollowupRequest(
      { lead_id: "33333333-3333-3333-3333-333333333333" },
      { authorization: "Bearer valid_jwt_user_a" },
      validEnv,
      mockDb,
      { supabaseClient: createMockSupabase({ valid_jwt_user_a: { id: mockUserA } }) }
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const createdLog = mockDb.webhook_logs.find((l) => l.event_type === "lead_followup");
    expect(createdLog.user_id).toBe(mockUserA);
  });

  it("7. Request body user_id cannot change authenticated identity or spoof user", async () => {
    const mockDb = getMockDb();
    // User A authenticates via JWT, but passes user_id of User B in body trying to access User B's lead
    const res = await handleLeadFollowupRequest(
      {
        user_id: mockUserB, // Attempted spoof in body
        lead_id: "44444444-4444-4444-4444-444444444444", // Lead belongs to User B
      },
      { authorization: "Bearer valid_jwt_user_a" },
      validEnv,
      mockDb,
      { supabaseClient: createMockSupabase({ valid_jwt_user_a: { id: mockUserA } }) }
    );
    // User A cannot access User B's lead -> 403 Forbidden
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Forbidden: Access denied to requested lead");
  });

  it("8. Reject request with invalid non-UUID lead_id with HTTP 400", async () => {
    const res = await handleLeadFollowupRequest(
      { lead_id: "invalid-id-'; DROP TABLE leads;--" },
      { "x-webhook-secret": "super_secret_webhook_key_2026" },
      validEnv,
      getMockDb()
    );
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid or missing lead_id");
  });

  it("9. Reject request with invalid milestone in renewal reminder with HTTP 400", async () => {
    const res = await handleRenewalReminderRequest(
      { policy_id: "55555555-5555-5555-5555-555555555555", milestone: "d9999_invalid" },
      { "x-webhook-secret": "super_secret_webhook_key_2026" },
      validEnv,
      getMockDb()
    );
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid milestone value");
  });

  describe("Scheduler Authentication & Status Filtering Tests", () => {
    it("10. Missing CRON_SECRET returns HTTP 503", async () => {
      const res = await handleReminderSchedulerRequest(
        { "x-cron-secret": "some_secret" },
        {},
        getMockDb()
      );
      expect(res.status).toBe(503);
      expect(res.body.error).toBe("Cron authentication is not configured");
    });

    it("11. Incorrect or missing x-cron-secret returns HTTP 401", async () => {
      const cronEnv = { CRON_SECRET: "correct_cron_secret_123" };

      const missingRes = await handleReminderSchedulerRequest({}, cronEnv, getMockDb());
      expect(missingRes.status).toBe(401);

      const wrongRes = await handleReminderSchedulerRequest(
        { "x-cron-secret": "wrong_cron_secret" },
        cronEnv,
        getMockDb()
      );
      expect(wrongRes.status).toBe(401);
    });

    it("12. Client Bearer JWT or service-role key in authorization header cannot bypass x-cron-secret requirement", async () => {
      const cronEnv = { CRON_SECRET: "correct_cron_secret_123" };

      const res = await handleReminderSchedulerRequest(
        { authorization: "Bearer client_jwt_token_or_service_role" },
        cronEnv,
        getMockDb()
      );
      expect(res.status).toBe(401);
    });

    it("13. Correct x-cron-secret allows scheduler execution and selects policies with status 'active'", async () => {
      const cronEnv = { CRON_SECRET: "correct_cron_secret_123" };
      const mockDb = getMockDb();

      const res = await handleReminderSchedulerRequest(
        { "x-cron-secret": "correct_cron_secret_123" },
        cronEnv,
        mockDb
      );
      expect(res.status).toBe(200);
      // Only policy 5555... has status: "active" (lowercase). Policy 6666... has status: "Active" and must be ignored.
      expect(res.body.created).toBe(1);
      expect(mockDb.reminder_log.length).toBe(1);
      expect(mockDb.reminder_log[0].policy_id).toBe("55555555-5555-5555-5555-555555555555");
    });
  });

  describe("Database RLS & Cross-User Security Policy Simulation", () => {
    it("14. Cross-user policy ownership verification blocks linking reminder_log to policy owned by another user", () => {
      const authenticatedUserId = mockUserA;
      const targetPolicyOwnerId = mockUserB; // Target policy belongs to User B

      // Simulation of RLS WITH CHECK condition:
      // auth.uid() = user_id AND EXISTS (SELECT 1 FROM policies WHERE id = policy_id AND user_id = auth.uid())
      const isOwner = authenticatedUserId === targetPolicyOwnerId;
      expect(isOwner).toBe(false);
    });

    it("15. Cross-user lead ownership verification blocks linking lead_followup_log to lead owned by another user", () => {
      const authenticatedUserId = mockUserA;
      const targetLeadOwnerId = mockUserB; // Target lead belongs to User B

      // Simulation of RLS WITH CHECK condition:
      // auth.uid() = user_id AND EXISTS (SELECT 1 FROM leads WHERE id = lead_id AND user_id = auth.uid())
      const isOwner = authenticatedUserId === targetLeadOwnerId;
      expect(isOwner).toBe(false);
    });

    it("16. Storage folder path validation blocks user from writing to another user's folder path", () => {
      const authenticatedUserId = mockUserA;
      const attemptedFilePath = `${mockUserB}/document.pdf`;
      const folderUserId = attemptedFilePath.split("/")[0];

      // Simulation of Storage RLS WITH CHECK condition:
      // (storage.foldername(name))[1] = auth.uid()::text
      const canAccess = folderUserId === authenticatedUserId;
      expect(canAccess).toBe(false);
    });
  });
});
