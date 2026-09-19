-- Phase 1 Production AI Foundation Migration
-- 1. Brand Kits Table & Triggers
-- 2. AI Credit Balances, Ledger & Atomic RPC Functions
-- 3. AI Generated Assets Lifecycle Table

-- ============================================================================
-- 1. BRAND KITS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.brand_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  name TEXT NOT NULL DEFAULT 'Default Brand Kit',
  agency_name TEXT,
  agent_name TEXT,
  designation TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  primary_logo_url TEXT,
  secondary_logo_url TEXT,
  profile_photo_url TEXT,
  primary_color TEXT DEFAULT '#00c6ff',
  secondary_color TEXT DEFAULT '#0072ff',
  accent_color TEXT DEFAULT '#a100f2',
  font_family TEXT DEFAULT 'Inter',
  default_cta TEXT DEFAULT 'Contact Us Today',
  social_links JSONB DEFAULT '{}'::jsonb,
  qr_config JSONB DEFAULT '{"enabled": true}'::jsonb,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast user queries
CREATE INDEX IF NOT EXISTS idx_brand_kits_user_id ON public.brand_kits(user_id);

-- Ensure updated_at is maintained
CREATE TRIGGER update_brand_kits_updated_at
  BEFORE UPDATE ON public.brand_kits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Ensure only one default Brand Kit per user
CREATE OR REPLACE FUNCTION public.handle_single_default_brand_kit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.brand_kits
    SET is_default = false
    WHERE user_id = NEW.user_id AND id <> NEW.id AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_single_default_brand_kit
  BEFORE INSERT OR UPDATE OF is_default ON public.brand_kits
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION public.handle_single_default_brand_kit();

-- Enable RLS & Policies
ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.brand_kits FROM anon, public;

CREATE POLICY "Users can view their own brand kits"
  ON public.brand_kits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own brand kits"
  ON public.brand_kits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brand kits"
  ON public.brand_kits FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brand kits"
  ON public.brand_kits FOR DELETE
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.brand_kits TO authenticated;
GRANT ALL ON public.brand_kits TO service_role;

-- ============================================================================
-- 2. AI CREDIT BALANCES & USAGE LEDGER
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ai_credit_balances (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  credits_remaining INT NOT NULL DEFAULT 50 CHECK (credits_remaining >= 0),
  credits_total INT NOT NULL DEFAULT 50 CHECK (credits_total >= 0),
  tier TEXT NOT NULL DEFAULT 'starter',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for balances
ALTER TABLE public.ai_credit_balances ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_credit_balances FROM anon, public;

CREATE POLICY "Users can view their own credit balance"
  ON public.ai_credit_balances FOR SELECT
  USING (auth.uid() = user_id);

GRANT SELECT ON public.ai_credit_balances TO authenticated;
GRANT ALL ON public.ai_credit_balances TO service_role;

-- Usage Ledger Table
CREATE TABLE IF NOT EXISTS public.ai_usage_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  operation_type TEXT NOT NULL, -- e.g., 'image_generation', 'video_render', 'presentation_generation'
  credits_consumed INT NOT NULL CHECK (credits_consumed >= 0),
  provider TEXT,
  model TEXT,
  request_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_ledger_user ON public.ai_usage_ledger(user_id, created_at DESC);

ALTER TABLE public.ai_usage_ledger ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_usage_ledger FROM anon, public;

CREATE POLICY "Users can view their own usage ledger"
  ON public.ai_usage_ledger FOR SELECT
  USING (auth.uid() = user_id);

GRANT SELECT ON public.ai_usage_ledger TO authenticated;
GRANT ALL ON public.ai_usage_ledger TO service_role;

-- Atomic Credit Deduction Function
CREATE OR REPLACE FUNCTION public.deduct_ai_credits(
  p_operation_type TEXT,
  p_credits_to_deduct INT,
  p_provider TEXT DEFAULT NULL,
  p_model TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  success BOOLEAN,
  remaining_credits INT,
  error_message TEXT
) AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_current_balance INT;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, 0, 'Unauthenticated user'::TEXT;
    RETURN;
  END IF;

  IF p_credits_to_deduct <= 0 THEN
    RETURN QUERY SELECT false, 0, 'Invalid credit deduction amount'::TEXT;
    RETURN;
  END IF;

  -- Lock user balance row for atomic check & update
  SELECT credits_remaining INTO v_current_balance
  FROM public.ai_credit_balances
  WHERE user_id = v_user_id
  FOR UPDATE;

  -- Initialize balance if missing
  IF v_current_balance IS NULL THEN
    INSERT INTO public.ai_credit_balances (user_id, credits_remaining, credits_total)
    VALUES (v_user_id, 50, 50)
    RETURNING credits_remaining INTO v_current_balance;
  END IF;

  IF v_current_balance < p_credits_to_deduct THEN
    RETURN QUERY SELECT false, v_current_balance, 'Insufficient AI credits'::TEXT;
    RETURN;
  END IF;

  -- Deduct atomically
  UPDATE public.ai_credit_balances
  SET credits_remaining = credits_remaining - p_credits_to_deduct,
      updated_at = now()
  WHERE user_id = v_user_id
  RETURNING credits_remaining INTO v_current_balance;

  -- Record in ledger
  INSERT INTO public.ai_usage_ledger (user_id, operation_type, credits_consumed, provider, model, request_metadata)
  VALUES (v_user_id, p_operation_type, p_credits_to_deduct, p_provider, p_model, p_metadata);

  RETURN QUERY SELECT true, v_current_balance, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.deduct_ai_credits(TEXT, INT, TEXT, TEXT, JSONB) TO authenticated, service_role;

-- Atomic Credit Refund Function (for failed generations)
CREATE OR REPLACE FUNCTION public.refund_ai_credits(
  p_credits_to_refund INT,
  p_reason TEXT DEFAULT 'Operation failed'
)
RETURNS TABLE (
  success BOOLEAN,
  remaining_credits INT,
  error_message TEXT
) AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_new_balance INT;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, 0, 'Unauthenticated user'::TEXT;
    RETURN;
  END IF;

  IF p_credits_to_refund <= 0 THEN
    RETURN QUERY SELECT false, 0, 'Invalid refund amount'::TEXT;
    RETURN;
  END IF;

  UPDATE public.ai_credit_balances
  SET credits_remaining = credits_remaining + p_credits_to_refund,
      updated_at = now()
  WHERE user_id = v_user_id
  RETURNING credits_remaining INTO v_new_balance;

  -- Record refund entry in ledger
  INSERT INTO public.ai_usage_ledger (user_id, operation_type, credits_consumed, request_metadata)
  VALUES (v_user_id, 'credit_refund', 0, jsonb_build_object('refunded_amount', p_credits_to_refund, 'reason', p_reason));

  RETURN QUERY SELECT true, v_new_balance, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.refund_ai_credits(INT, TEXT) TO authenticated, service_role;

-- ============================================================================
-- 3. AI GENERATED ASSETS LIFECYCLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ai_generated_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  asset_type TEXT NOT NULL, -- 'image', 'video', 'presentation', 'document', 'digital_card', 'print_card'
  title TEXT NOT NULL,
  prompt TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'deleted')),
  storage_path TEXT,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  provider TEXT,
  model TEXT,
  generation_cost INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_assets_user_status ON public.ai_generated_assets(user_id, status, created_at DESC);

CREATE TRIGGER update_ai_generated_assets_updated_at
  BEFORE UPDATE ON public.ai_generated_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.ai_generated_assets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_generated_assets FROM anon, public;

CREATE POLICY "Users can view their own generated assets"
  ON public.ai_generated_assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generated assets"
  ON public.ai_generated_assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generated assets"
  ON public.ai_generated_assets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated assets"
  ON public.ai_generated_assets FOR DELETE
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_generated_assets TO authenticated;
GRANT ALL ON public.ai_generated_assets TO service_role;
