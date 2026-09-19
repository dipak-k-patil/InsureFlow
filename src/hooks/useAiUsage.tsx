import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface AiCreditBalance {
  user_id: string;
  credits_remaining: number;
  credits_total: number;
  tier: string;
  updated_at: string;
}

export interface AiUsageLedgerItem {
  id: string;
  user_id: string;
  operation_type: string;
  credits_consumed: number;
  provider: string | null;
  model: string | null;
  request_metadata: Record<string, any>;
  created_at: string;
}

export function useAiCreditBalance() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["ai_credit_balance", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_credit_balances" as any)
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return {
          user_id: user!.id,
          credits_remaining: 50,
          credits_total: 50,
          tier: "starter",
          updated_at: new Date().toISOString(),
        } as AiCreditBalance;
      }
      return (data as unknown) as AiCreditBalance;
    },
  });
}

export function useDeductAiCredits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      operationType: string;
      creditsToDeduct: number;
      provider?: string;
      model?: string;
      metadata?: Record<string, any>;
    }) => {
      const { data, error } = await supabase.rpc("deduct_ai_credits" as any, {
        p_operation_type: params.operationType,
        p_credits_to_deduct: params.creditsToDeduct,
        p_provider: params.provider || null,
        p_model: params.model || null,
        p_metadata: params.metadata || {},
      });

      if (error) throw error;
      const res = (data as any)?.[0] || data;
      if (!res?.success) {
        throw new Error(res?.error_message || "Insufficient AI credits or operation failed");
      }
      return res as { success: boolean; remaining_credits: number };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai_credit_balance"] });
      qc.invalidateQueries({ queryKey: ["ai_usage_ledger"] });
    },
  });
}

export function useRefundAiCredits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { creditsToRefund: number; reason?: string }) => {
      const { data, error } = await supabase.rpc("refund_ai_credits" as any, {
        p_credits_to_refund: params.creditsToRefund,
        p_reason: params.reason || "Operation failed",
      });

      if (error) throw error;
      const res = (data as any)?.[0] || data;
      return res as { success: boolean; remaining_credits: number };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai_credit_balance"] });
      qc.invalidateQueries({ queryKey: ["ai_usage_ledger"] });
    },
  });
}
