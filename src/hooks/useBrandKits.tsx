import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface BrandKit {
  id: string;
  user_id: string;
  name: string;
  agency_name: string | null;
  agent_name: string | null;
  designation: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  primary_logo_url: string | null;
  secondary_logo_url: string | null;
  profile_photo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  default_cta: string;
  social_links: Record<string, string>;
  qr_config: Record<string, any>;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export function useBrandKits() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["brand_kits", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_kits" as any)
        .select("*")
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as unknown) as BrandKit[];
    },
  });
}

export function useSaveBrandKit() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (kit: Partial<BrandKit> & { name: string }) => {
      if (!user) throw new Error("User not authenticated");

      if (kit.id) {
        const { id, user_id, created_at, updated_at, ...rest } = kit;
        const { error } = await supabase
          .from("brand_kits" as any)
          .update(rest)
          .eq("id", id);
        if (error) throw error;
      } else {
        const payload = {
          ...kit,
          user_id: user.id,
        };
        const { error } = await supabase
          .from("brand_kits" as any)
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brand_kits"] }),
  });
}

export function useDeleteBrandKit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("brand_kits" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brand_kits"] }),
  });
}

export function useSetDefaultBrandKit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("brand_kits" as any)
        .update({ is_default: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brand_kits"] }),
  });
}
