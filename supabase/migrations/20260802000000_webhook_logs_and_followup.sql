CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  workflow_name TEXT NOT NULL,
  trigger TEXT,
  retry_count INT NOT NULL DEFAULT 0,
  request_payload JSONB,
  response_payload JSONB,
  status_code INT NOT NULL,
  outcome TEXT NOT NULL,
  idempotency_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_user ON public.webhook_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_idem ON public.webhook_logs(idempotency_key);

REVOKE ALL ON public.webhook_logs FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.webhook_logs TO authenticated;
GRANT ALL ON public.webhook_logs TO service_role;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own webhook logs" ON public.webhook_logs FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.lead_followup_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  notes TEXT,
  channel TEXT DEFAULT 'whatsapp',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  idempotency_key TEXT UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_lead_followup_user ON public.lead_followup_log(user_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_followup_lead ON public.lead_followup_log(lead_id);

REVOKE ALL ON public.lead_followup_log FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_followup_log TO authenticated;
GRANT ALL ON public.lead_followup_log TO service_role;
ALTER TABLE public.lead_followup_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own lead followups" ON public.lead_followup_log FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
