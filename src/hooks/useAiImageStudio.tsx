import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface GeneratedAiAsset {
  id: string;
  user_id: string;
  asset_type: string;
  title: string;
  prompt: string | null;
  status: "queued" | "processing" | "completed" | "failed" | "deleted";
  storage_path: string | null;
  thumbnail_url: string | null;
  brand_kit_id: string | null;
  aspect_ratio: string;
  quality: string;
  provider: string;
  model: string;
  generation_cost: number;
  error_message: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export function useAiGeneratedAssets() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["ai_generated_assets", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_generated_assets" as any)
        .select("*")
        .eq("user_id", user!.id)
        .neq("status", "deleted")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as unknown) as GeneratedAiAsset[];
    },
  });
}

export function useGenerateAiImage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      prompt: string;
      category?: string;
      aspect_ratio?: "1:1" | "9:16" | "16:9";
      quality?: "low" | "medium" | "high" | "standard";
      brand_kit_id?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("generate-ai-image", {
        body: payload,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return data as { success: boolean; asset: GeneratedAiAsset; remaining_credits: number };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai_generated_assets"] });
      qc.invalidateQueries({ queryKey: ["ai_credit_balance"] });
    },
  });
}

export function useGetAssetSignedUrl() {
  return useMutation({
    mutationFn: async (storagePath: string) => {
      const { data, error } = await supabase.storage
        .from("ai-generated-images")
        .createSignedUrl(storagePath, 3600); // 1 hour expiration

      if (error) throw error;
      return data?.signedUrl || null;
    },
  });
}

export function useDeleteAiAsset() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (asset: GeneratedAiAsset) => {
      // 1. Delete storage object if present
      if (asset.storage_path) {
        await supabase.storage
          .from("ai-generated-images")
          .remove([asset.storage_path]);
      }

      // 2. Mark asset as deleted
      const { error } = await supabase
        .from("ai_generated_assets" as any)
        .update({ status: "deleted" })
        .eq("id", asset.id);

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai_generated_assets"] });
    },
  });
}
