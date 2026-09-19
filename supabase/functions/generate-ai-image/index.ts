import { createClient } from "npm:@supabase/supabase-js@2";

// Server-side Credit Costs per quality tier
export const CREDIT_COSTS: Record<string, number> = {
  low: 10,
  standard: 15,
  medium: 15,
  high: 20,
};

// Aspect ratio to OpenAI image dimensions mapping
export const DIMENSIONS_MAP: Record<string, string> = {
  "1:1": "1024x1024",
  "9:16": "1024x1792",
  "16:9": "1792x1024",
};

export interface GenerateImagePayload {
  prompt: string;
  category?: string;
  aspect_ratio?: "1:1" | "9:16" | "16:9";
  quality?: "low" | "medium" | "high" | "standard";
  brand_kit_id?: string;
}

export function buildInsuranceSystemPrompt(
  userPrompt: string,
  category: string,
  brandKit?: any
): string {
  const brandName = brandKit?.agency_name || brandKit?.name || "InsureFlow Premier Partner";
  const colors = [
    brandKit?.primary_color || "#00c6ff",
    brandKit?.secondary_color || "#0072ff",
    brandKit?.accent_color || "#a100f2",
  ].join(", ");

  return [
    `High quality professional insurance marketing advertisement visual for ${category} insurance.`,
    `Topic: "${userPrompt}".`,
    `Target Audience: Indian families, professionals, and individuals seeking financial protection.`,
    `Visual Style: Clean, trustworthy, modern, vibrant financial branding.`,
    `Color Palette: Incorporate corporate brand tones (${colors}).`,
    `Branding Context: Created for ${brandName}.`,
    `Composition: Balanced visual hierarchy with clean open negative space for text and contact branding overlay.`,
    `Safety Rules: No misleading policy guarantees, no fake statistics, no unauthorized insurer logos, no unrealistic medical claims.`,
  ].join(" ");
}

export async function handleGenerateAiImageRequest(
  reqBody: GenerateImagePayload,
  headers: Record<string, string> = {},
  env: Record<string, string> = {},
  dbOverride?: any,
  options?: { supabaseClient?: any; fetchOverride?: typeof fetch }
) {
  const appOrigin = env.APP_ORIGIN || "https://insureflow.kadmak.in";
  const requestOrigin = headers["origin"] || headers["Origin"];

  const corsHeaders = {
    "Access-Control-Allow-Origin": requestOrigin === appOrigin ? requestOrigin : appOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle CORS Preflight
  if (headers["method"] === "OPTIONS") {
    return { status: 200, headers: corsHeaders, body: "ok" };
  }

  const supabaseUrl = env.SUPABASE_URL || "https://placeholder.supabase.co";
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || "placeholder_service_role_key";
  const openaiApiKey = env.OPENAI_API_KEY;

  if (!openaiApiKey && !options?.fetchOverride) {
    return {
      status: 503,
      headers: corsHeaders,
      body: { error: "OpenAI API key is not configured on the server" },
    };
  }

  // 1. Authenticate Request via Supabase Auth
  const supabase =
    options?.supabaseClient ||
    createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

  const authHeader = headers["authorization"] || headers["Authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      status: 401,
      headers: corsHeaders,
      body: { error: "Unauthorized request: Missing or invalid Authorization header" },
    };
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: userData, error: userError } = await supabase.auth.getUser(token);

  if (userError || !userData?.user) {
    return {
      status: 401,
      headers: corsHeaders,
      body: { error: "Unauthorized request: Invalid user session token" },
    };
  }

  const userId = userData.user.id;

  // 2. Input Validation
  const prompt = (reqBody.prompt || "").trim();
  if (!prompt || prompt.length < 3) {
    return {
      status: 400,
      headers: corsHeaders,
      body: { error: "Invalid request: Prompt must be at least 3 characters" },
    };
  }
  if (prompt.length > 1000) {
    return {
      status: 400,
      headers: corsHeaders,
      body: { error: "Invalid request: Prompt exceeds 1000 characters limit" },
    };
  }

  const category = reqBody.category || "General Insurance";
  const aspectRatio = reqBody.aspect_ratio || "1:1";
  const quality = reqBody.quality || "standard";

  if (!DIMENSIONS_MAP[aspectRatio]) {
    return {
      status: 400,
      headers: corsHeaders,
      body: { error: "Invalid request: Unsupported aspect_ratio" },
    };
  }

  const creditCost = CREDIT_COSTS[quality] || 15;

  // 3. Verify Brand Kit Ownership
  let brandKit = null;
  if (reqBody.brand_kit_id) {
    const { data: kitData, error: kitErr } = await supabase
      .from("brand_kits")
      .select("*")
      .eq("id", reqBody.brand_kit_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (kitErr || !kitData) {
      return {
        status: 403,
        headers: corsHeaders,
        body: { error: "Forbidden: Invalid or unowned Brand Kit specified" },
      };
    }
    brandKit = kitData;
  } else {
    const { data: defaultKit } = await supabase
      .from("brand_kits")
      .select("*")
      .eq("user_id", userId)
      .eq("is_default", true)
      .maybeSingle();
    brandKit = defaultKit;
  }

  // 4. Atomically Deduct AI Credits
  const { data: deductRes, error: deductErr } = await supabase.rpc("deduct_ai_credits", {
    p_operation_type: "image_generation",
    p_credits_to_deduct: creditCost,
    p_provider: "openai",
    p_model: env.OPENAI_IMAGE_MODEL || "dall-e-3",
    p_metadata: { category, aspect_ratio: aspectRatio, quality },
  });

  if (deductErr) {
    return {
      status: 500,
      headers: corsHeaders,
      body: { error: `Credit deduction error: ${deductErr.message}` },
    };
  }

  const deductResult = Array.isArray(deductRes) ? deductRes[0] : deductRes;
  if (!deductResult?.success) {
    return {
      status: 402,
      headers: corsHeaders,
      body: { error: deductResult?.error_message || "Insufficient AI credits" },
    };
  }

  // 5. Create Asset Record (Status: queued)
  const { data: assetData, error: assetErr } = await supabase
    .from("ai_generated_assets")
    .insert({
      user_id: userId,
      asset_type: "image",
      title: `${category} - ${prompt.slice(0, 30)}...`,
      prompt,
      status: "queued",
      brand_kit_id: brandKit?.id || null,
      aspect_ratio: aspectRatio,
      quality,
      provider: "openai",
      model: env.OPENAI_IMAGE_MODEL || "dall-e-3",
      generation_cost: creditCost,
      metadata: { category, brand_kit_id: brandKit?.id },
    })
    .select()
    .single();

  if (assetErr || !assetData) {
    // Refund credits on asset DB failure
    await supabase.rpc("refund_ai_credits", {
      p_credits_to_refund: creditCost,
      p_reason: "Asset creation DB failure",
    });
    return {
      status: 500,
      headers: corsHeaders,
      body: { error: "Failed to initialize asset record" },
    };
  }

  const assetId = assetData.id;

  // Update status to processing
  await supabase
    .from("ai_generated_assets")
    .update({ status: "processing" })
    .eq("id", assetId);

  // 6. Invoke OpenAI Image Generation API
  const systemPrompt = buildInsuranceSystemPrompt(prompt, category, brandKit);
  const size = DIMENSIONS_MAP[aspectRatio] || "1024x1024";

  try {
    const fetchImpl = options?.fetchOverride || fetch;
    const openaiRes = await fetchImpl("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.OPENAI_IMAGE_MODEL || "dall-e-3",
        prompt: systemPrompt,
        n: 1,
        size,
        quality: quality === "high" ? "hd" : "standard",
        response_format: "b64_json",
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      throw new Error(`OpenAI API error (${openaiRes.status}): ${errText}`);
    }

    const openaiJson = await openaiRes.json();
    const b64Data = openaiJson?.data?.[0]?.b64_json;

    if (!b64Data) {
      throw new Error("Invalid response structure from OpenAI Image API");
    }

    // 7. Upload Image to Supabase Private Storage
    const buffer = Uint8Array.from(atob(b64Data), (c) => c.charCodeAt(0));
    const storagePath = `${userId}/${assetId}.png`;

    const { error: uploadErr } = await supabase.storage
      .from("ai-generated-images")
      .upload(storagePath, buffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadErr) {
      throw new Error(`Storage upload failure: ${uploadErr.message}`);
    }

    // 8. Update Asset Record to Completed
    const { data: finalAsset, error: updateErr } = await supabase
      .from("ai_generated_assets")
      .update({
        status: "completed",
        storage_path: storagePath,
        updated_at: new Date().toISOString(),
      })
      .eq("id", assetId)
      .select()
      .single();

    if (updateErr) {
      throw new Error(`Asset update error: ${updateErr.message}`);
    }

    return {
      status: 200,
      headers: corsHeaders,
      body: {
        success: true,
        asset: finalAsset,
        remaining_credits: deductResult.remaining_credits,
      },
    };
  } catch (err: any) {
    // 9. Failure Handling & Automatic Atomic Credit Refund
    const errMsg = err?.message || "AI image generation failed";

    await supabase
      .from("ai_generated_assets")
      .update({
        status: "failed",
        error_message: errMsg,
        updated_at: new Date().toISOString(),
      })
      .eq("id", assetId);

    await supabase.rpc("refund_ai_credits", {
      p_credits_to_refund: creditCost,
      p_reason: `AI generation error: ${errMsg.slice(0, 100)}`,
    });

    return {
      status: 500,
      headers: corsHeaders,
      body: {
        error: errMsg,
        credits_refunded: creditCost,
      },
    };
  }
}
