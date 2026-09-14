import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Lead = Tables<"leads">;
export type Policy = Tables<"policies">;
export type CommissionRule = Tables<"commission_rules">;

/* ---------------- Leads ---------------- */

export function useLeads() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["leads", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
  });
}

export function useSaveLead() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (lead: Partial<Lead> & { name: string }) => {
      if (lead.id) {
        const { id, ...rest } = lead;
        const { error } = await supabase.from("leads").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const payload: TablesInsert<"leads"> = {
          ...(lead as Omit<TablesInsert<"leads">, "user_id">),
          user_id: user!.id,
        };
        const { error } = await supabase.from("leads").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

/* ---------------- Policies ---------------- */

export function usePolicies() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["policies", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("policies")
        .select("*")
        .order("end_date", { ascending: true });
      if (error) throw error;
      return data as Policy[];
    },
  });
}

export function useSavePolicy() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (policy: Partial<Policy> & { client: string; provider: string; premium: number; end_date: string }) => {
      if (policy.id) {
        const { id, ...rest } = policy;
        const { error } = await supabase.from("policies").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const payload: TablesInsert<"policies"> = {
          ...(policy as Omit<TablesInsert<"policies">, "user_id">),
          user_id: user!.id,
        };
        const { error } = await supabase.from("policies").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["policies"] }),
  });
}

export function useDeletePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("policies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["policies"] }),
  });
}

/* ---------------- Commission rules ---------------- */

export function useCommissionRules() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["commission_rules", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commission_rules")
        .select("*")
        .order("provider");
      if (error) throw error;
      return data as CommissionRule[];
    },
  });
}

export function useSaveCommissionRules() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (rules: Record<string, number>) => {
      const rows = Object.entries(rules).map(([provider, default_rate]) => ({
        user_id: user!.id,
        provider,
        default_rate,
      }));
      const { error } = await supabase
        .from("commission_rules")
        .upsert(rows, { onConflict: "user_id,provider" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["commission_rules"] }),
  });
}

/* ---------------- Storage: policy PDFs ---------------- */

export async function uploadPolicyPdf(userId: string, file: File) {
  const path = `${userId}/${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage.from("policy-docs").upload(path, file, { upsert: true });
  if (error) throw error;
  return path;
}

export async function getPolicyPdfUrl(path: string | null | undefined) {
  if (!path) return null;
  const { data } = await supabase.storage.from("policy-docs").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
