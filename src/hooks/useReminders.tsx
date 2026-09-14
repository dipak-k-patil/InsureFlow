import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";

export type Milestone = "d60" | "d30" | "d15" | "d7" | "d5" | "daily";
export type Channel = "WhatsApp" | "SMS" | "Email";

export const DEFAULT_MILESTONES: Record<Milestone, boolean> = {
  d60: true, d30: true, d15: true, d7: true, d5: true, daily: true,
};
export const DEFAULT_CHANNELS: Record<Channel, boolean> = {
  WhatsApp: true, SMS: false, Email: true,
};

export type ReminderLogRow = Tables<"reminder_log">;

export function useReminderSettings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["reminder_settings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reminder_settings")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return {
        milestones: { ...DEFAULT_MILESTONES, ...((data?.milestones as Record<string, boolean>) ?? {}) } as Record<Milestone, boolean>,
        channels: { ...DEFAULT_CHANNELS, ...((data?.channels as Record<string, boolean>) ?? {}) } as Record<Channel, boolean>,
      };
    },
  });
}

export function useSaveReminderSettings() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (next: { milestones: Record<Milestone, boolean>; channels: Record<Channel, boolean> }) => {
      const { error } = await supabase
        .from("reminder_settings")
        .upsert({ user_id: user!.id, milestones: next.milestones, channels: next.channels }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminder_settings"] }),
  });
}

export function useReminderLog() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["reminder_log", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reminder_log")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as ReminderLogRow[];
    },
  });
}

export function useRunScheduler() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("reminder-scheduler", { body: {} });
      if (error) throw error;
      return data as { created: number };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminder_log"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
