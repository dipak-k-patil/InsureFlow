import { describe, it, expect } from "vitest";
import {
  handleGenerateAiImageRequest,
  buildInsuranceSystemPrompt,
  CREDIT_COSTS,
  DIMENSIONS_MAP,
} from "../../supabase/functions/generate-ai-image/index";

describe("Phase 2 AI Image Studio & Edge Function Tests", () => {
  const mockUserA = "11111111-1111-1111-1111-111111111111";
  const mockUserB = "22222222-2222-2222-2222-222222222222";

  const createMockSupabase = (opts: {
    user?: { id: string } | null;
    brandKit?: any;
    deductSuccess?: boolean;
    assetData?: any;
  }) => ({
    auth: {
      getUser: async (token: string) => {
        if (token === "invalid") return { data: { user: null }, error: new Error("Invalid token") };
        return { data: { user: opts.user !== undefined ? opts.user : { id: mockUserA } }, error: null };
      },
    },
    from: (table: string) => {
      if (table === "brand_kits") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: opts.brandKit || null, error: null }),
              }),
              maybeSingle: async () => ({ data: opts.brandKit || null, error: null }),
            }),
          }),
        };
      }
      if (table === "ai_generated_assets") {
        return {
          insert: () => ({
            select: () => ({
              single: async () => ({
                data: opts.assetData || { id: "asset-123", status: "queued", user_id: mockUserA },
                error: null,
              }),
            }),
          }),
          update: () => ({
            eq: () => ({
              select: () => ({
                single: async () => ({
                  data: { id: "asset-123", status: "completed", storage_path: `${mockUserA}/asset-123.png` },
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      return {};
    },
    rpc: async (fnName: string, params: any) => {
      if (fnName === "deduct_ai_credits") {
        if (opts.deductSuccess === false) {
          return { data: [{ success: false, remaining_credits: 5, error_message: "Insufficient AI credits" }], error: null };
        }
        return { data: [{ success: true, remaining_credits: 35, error_message: null }], error: null };
      }
      if (fnName === "refund_ai_credits") {
        return { data: [{ success: true, remaining_credits: 50, error_message: null }], error: null };
      }
      return { data: null, error: null };
    },
    storage: {
      from: () => ({
        upload: async () => ({ error: null }),
      }),
    },
  });

  const validEnv = {
    SUPABASE_URL: "https://mock.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "mock_service_role",
    OPENAI_API_KEY: "sk-mock-openai-api-key",
  };

  describe("1. Input & System Prompt Builder Unit Tests", () => {
    it("maps aspect ratios correctly to OpenAI dimensions", () => {
      expect(DIMENSIONS_MAP["1:1"]).toBe("1024x1024");
      expect(DIMENSIONS_MAP["9:16"]).toBe("1024x1792");
      expect(DIMENSIONS_MAP["16:9"]).toBe("1792x1024");
    });

    it("calculates server-side credit costs correctly by quality tier", () => {
      expect(CREDIT_COSTS["low"]).toBe(10);
      expect(CREDIT_COSTS["standard"]).toBe(15);
      expect(CREDIT_COSTS["high"]).toBe(20);
    });

    it("builds insurance system prompt with Brand Kit context and safety rules", () => {
      const prompt = buildInsuranceSystemPrompt("Senior citizen health plan", "Health Insurance", {
        agency_name: "Shield Insurance Agency",
        primary_color: "#00c6ff",
      });

      expect(prompt).toContain("Senior citizen health plan");
      expect(prompt).toContain("Health Insurance");
      expect(prompt).toContain("Shield Insurance Agency");
      expect(prompt).toContain("#00c6ff");
      expect(prompt).toContain("No misleading policy guarantees");
    });
  });

  describe("2. Edge Function Security & Credit Metering Unit Tests", () => {
    it("rejects unauthenticated request with HTTP 401", async () => {
      const res = await handleGenerateAiImageRequest(
        { prompt: "Health Insurance Offer" },
        {},
        validEnv,
        null,
        { supabaseClient: createMockSupabase({}) }
      );
      expect(res.status).toBe(401);
      expect(res.body.error).toContain("Missing or invalid Authorization header");
    });

    it("rejects invalid JWT session token with HTTP 401", async () => {
      const res = await handleGenerateAiImageRequest(
        { prompt: "Health Insurance Offer" },
        { authorization: "Bearer invalid" },
        validEnv,
        null,
        { supabaseClient: createMockSupabase({ user: null }) }
      );
      expect(res.status).toBe(401);
      expect(res.body.error).toContain("Invalid user session token");
    });

    it("rejects short or empty prompt with HTTP 400", async () => {
      const res = await handleGenerateAiImageRequest(
        { prompt: "a" },
        { authorization: "Bearer valid_jwt" },
        validEnv,
        null,
        { supabaseClient: createMockSupabase({}) }
      );
      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Prompt must be at least 3 characters");
    });

    it("rejects request when user has insufficient AI credits with HTTP 402", async () => {
      const res = await handleGenerateAiImageRequest(
        { prompt: "Life Insurance Banner", quality: "high" },
        { authorization: "Bearer valid_jwt" },
        validEnv,
        null,
        { supabaseClient: createMockSupabase({ deductSuccess: false }) }
      );
      expect(res.status).toBe(402);
      expect(res.body.error).toContain("Insufficient AI credits");
    });

    it("successfully generates image, uploads to private storage, and returns asset", async () => {
      const mockFetch = async () => ({
        ok: true,
        json: async () => ({
          data: [{ b64_json: btoa("fake_png_image_bytes") }],
        }),
      });

      const res = await handleGenerateAiImageRequest(
        { prompt: "Comprehensive Motor Insurance Cover", category: "Motor", aspect_ratio: "1:1" },
        { authorization: "Bearer valid_jwt" },
        validEnv,
        null,
        { supabaseClient: createMockSupabase({}), fetchOverride: mockFetch as any }
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.asset.status).toBe("completed");
      expect(res.body.remaining_credits).toBe(35);
    });

    it("atomically refunds AI credits when OpenAI provider API fails", async () => {
      const mockFailingFetch = async () => ({
        ok: false,
        status: 500,
        text: async () => "OpenAI Provider Rate Limited",
      });

      const res = await handleGenerateAiImageRequest(
        { prompt: "Family Health Banner", quality: "standard" },
        { authorization: "Bearer valid_jwt" },
        validEnv,
        null,
        { supabaseClient: createMockSupabase({}), fetchOverride: mockFailingFetch as any }
      );

      expect(res.status).toBe(500);
      expect(res.body.error).toContain("OpenAI API error");
      expect(res.body.credits_refunded).toBe(15);
    });
  });
});
