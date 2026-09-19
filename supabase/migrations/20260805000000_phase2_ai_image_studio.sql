-- Phase 2 AI Image Studio Migration
-- Adds brand_kit_id reference to ai_generated_assets and configures private ai-generated-images storage bucket with user-scoped RLS policies.

ALTER TABLE public.ai_generated_assets
  ADD COLUMN IF NOT EXISTS brand_kit_id UUID REFERENCES public.brand_kits(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS aspect_ratio TEXT DEFAULT '1:1',
  ADD COLUMN IF NOT EXISTS quality TEXT DEFAULT 'standard';

CREATE INDEX IF NOT EXISTS idx_ai_assets_brand_kit ON public.ai_generated_assets(brand_kit_id);

-- Create Private Storage Bucket for AI Generated Images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ai-generated-images',
  'ai-generated-images',
  false,
  15728640, -- 15MB max file size
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 15728640,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp'];

-- Storage RLS Policies for ai-generated-images
CREATE POLICY "Users can upload their own AI generated images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'ai-generated-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own AI generated images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'ai-generated-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own AI generated images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'ai-generated-images' AND (storage.foldername(name))[1] = auth.uid()::text);
