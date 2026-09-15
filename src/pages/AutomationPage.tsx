import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Clock, MessageSquare, Mail, Bell, CalendarClock, Repeat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useReminderSettings, useSaveReminderSettings, DEFAULT_CHANNELS, DEFAULT_MILESTONES, type Channel, type Milestone } from "@/hooks/useReminders";
import { WebhookStatusLogs } from "@/components/WebhookStatusLogs";
import { WhatsAppBannerGenerator } from "@/components/WhatsAppBannerGenerator";

const rules = [
  { name: "30-Day Renewal Reminder", trigger: "30 days before expiry", channels: ["WhatsApp", "Email"], status: "Active", lastRun: "2 hrs ago" },
  { name: "15-Day Renewal Alert", trigger: "15 days before expiry", channels: ["SMS", "Email"], status: "Active", lastRun: "5 hrs ago" },
  { name: "7-Day Urgent Renewal", trigger: "7 days before expiry", channels: ["WhatsApp", "SMS", "Email"], status: "Active", lastRun: "1 day ago" },
  { name: "New Lead Follow-up", trigger: "24 hours after creation", channels: ["WhatsApp"], status: "Paused", lastRun: "3 days ago" },
  { name: "Birthday Wishes", trigger: "On client birthday", channels: ["WhatsApp", "Email"], status: "Active", lastRun: "12 hrs ago" },
];

const channelIcons: Record<string, typeof MessageSquare> = {
  WhatsApp: MessageSquare,
  SMS: Bell,
  Email: Mail,
};

interface Step {
  key: string;
  label: string;
  description: string;
  zone: "green" | "orange" | "red";
}

const reminderSteps: Step[] = [
  { key: "d60",   label: "60 days before", description: "Early heads-up (green zone)",     zone: "green" },
  { key: "d30",   label: "30 days before", description: "Standard reminder",               zone: "green" },
  { key: "d15",   label: "15 days before", description: "Move to orange zone",             zone: "orange" },
  { key: "d7",    label: "7 days before",  description: "Urgent — WhatsApp + SMS",         zone: "orange" },
  { key: "d5",    label: "5 days before",  description: "Enter red zone",                  zone: "red" },
  { key: "daily", label: "After 5 days → daily", description: "Daily until renewed or expired", zone: "red" },
];

const zoneClass: Record<Step["zone"], string> = {
  green: "bg-success/10 text-success border-success/20",
  orange: "bg-warning/10 text-warning border-warning/20",
  red: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function AutomationPage() {
  const { data: settings } = useReminderSettings();
  const saveSettings = useSaveReminderSettings();
  const [enabled, setEnabled] = useState<Record<Milestone, boolean>>(DEFAULT_MILESTONES);
  const [channels, setChannels] = useState<Record<Channel, boolean>>(DEFAULT_CHANNELS);

  useEffect(() => {
    if (settings) {
      setEnabled(settings.milestones);
      setChannels(settings.channels);
    }
  }, [settings]);

  const persist = (milestones: Record<Milestone, boolean>, chans: Record<Channel, boolean>) => {
    setEnabled(milestones);
    setChannels(chans);
    saveSettings.mutate({ milestones, channels: chans });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Automation & Workflows</h1>
          <p className="text-muted-foreground mt-1">Configure automated n8n workflows and WhatsApp reminder templates</p>
        </div>
        <Button className="gap-2">
          <Zap className="w-4 h-4" /> New Rule
        </Button>
      </div>

      {/* Webhook Execution Status & Retry Logs */}
      <WebhookStatusLogs />

      {/* Interactive WhatsApp Prompt Banner & Branding Generator */}
      <WhatsAppBannerGenerator />

      {/* Renewal Reminder Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <CalendarClock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Renewal Reminder Schedule</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Automatic reminders sent to policy holders before expiry
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {(Object.keys(channels) as (keyof typeof channels)[]).map((c) => {
              const Icon = channelIcons[c] ?? Bell;
              const active = channels[c];
              return (
                <button
                  key={c}
                  onClick={() => persist(enabled, { ...channels, [c]: !active })}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs transition-colors ${
                    active
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-muted/30 text-muted-foreground border-border/40"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {c}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          {reminderSteps.map((s) => (
            <div key={s.key} className="flex items-center justify-between gap-3 py-3 border-b border-border/30 last:border-0">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {s.key === "daily"
                  ? <Repeat className="w-4 h-4 text-muted-foreground shrink-0" />
                  : <Clock className="w-4 h-4 text-muted-foreground shrink-0" />}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </div>
              </div>
              <Badge variant="outline" className={zoneClass[s.zone]}>{s.zone}</Badge>
              <Switch
                checked={enabled[s.key as Milestone]}
                onCheckedChange={(v) => persist({ ...enabled, [s.key as Milestone]: v }, channels)}
              />
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Reminders run on the server every hour and are logged on the Renewals page with a ready-to-send WhatsApp link.
        </p>
      </motion.div>

      {/* Existing rule list */}
      <div className="space-y-4">
        {rules.map((rule, i) => (
          <motion.div
            key={rule.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-5 flex items-center justify-between gap-4 flex-wrap"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{rule.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{rule.trigger}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {rule.channels.map((ch) => {
                const Icon = channelIcons[ch] || Bell;
                return (
                  <div key={ch} className="p-1.5 rounded-md bg-muted/50" title={ch}>
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={rule.status === "Active" ? "bg-success/10 text-success border-success/20" : "bg-muted/50 text-muted-foreground"}>
                {rule.status}
              </Badge>
              <span className="text-xs text-muted-foreground whitespace-nowrap">Last: {rule.lastRun}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
