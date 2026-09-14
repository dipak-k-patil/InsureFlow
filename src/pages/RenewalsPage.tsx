import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarClock, DollarSign, AlertTriangle, TrendingUp, Bell, Loader2, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/StatCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CommissionRulesDialog } from "@/components/CommissionRulesDialog";
import { toast } from "sonner";
import {
  daysUntil, getZone, zoneBadgeClass, zoneLabel, calcCommission, formatINR,
} from "@/lib/renewals";
import { usePolicies, useCommissionRules, useSaveCommissionRules, useSavePolicy, type Policy } from "@/hooks/useCrmData";
import { useReminderLog, useRunScheduler } from "@/hooks/useReminders";

type ZoneFilter = "all" | "green" | "orange" | "red";

function waLink(p: Policy, daysLeft: number) {
  const phone = (p.phone ?? "").replace(/\D/g, "");
  const status = daysLeft < 0 ? `overdue by ${Math.abs(daysLeft)} days` : `expiring in ${daysLeft} days`;
  const msg =
    `Hello ${p.client}, a friendly reminder from your insurance advisor.\n\n` +
    `Your ${p.type ?? "policy"} (${p.policy_no ?? "—"}) with ${p.provider} is ${status} on ${p.end_date}.\n` +
    `Renewal premium: ${formatINR(p.premium)}.\n\nReply here to renew. Thank you!`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

export default function RenewalsPage() {
  const { data: policies = [], isLoading } = usePolicies();
  const { data: ruleRows = [] } = useCommissionRules();
  const saveRules = useSaveCommissionRules();
  const savePolicy = useSavePolicy();
  const { data: log = [] } = useReminderLog();
  const runScheduler = useRunScheduler();
  const [filter, setFilter] = useState<ZoneFilter>("all");

  const rules = useMemo(
    () => Object.fromEntries(ruleRows.map((r) => [r.provider, Number(r.default_rate)])) as Record<string, number>,
    [ruleRows],
  );

  const rows = useMemo(() => {
    return policies
      .filter((p) => p.status === "Active")
      .map((p) => {
        const daysLeft = daysUntil(p.end_date);
        const zone = getZone(daysLeft);
        const rate = p.commission_rate ?? rules[p.provider] ?? 10;
        return { ...p, daysLeft, zone, rate, commission: calcCommission(p.premium, rate) };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [policies, rules]);

  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((r) => {
      if (filter === "green") return r.zone === "green" || r.zone === "safe";
      if (filter === "orange") return r.zone === "orange";
      return r.zone === "red" || r.zone === "critical" || r.zone === "overdue";
    });
  }, [rows, filter]);

  const totals = useMemo(() => ({
    totalPremium: rows.reduce((s, r) => s + r.premium, 0),
    totalCommission: rows.reduce((s, r) => s + r.commission, 0),
    dueCount: rows.filter((r) => r.daysLeft >= 0 && r.daysLeft <= 60).length,
    overdueCount: rows.filter((r) => r.daysLeft < 0).length,
  }), [rows]);

  const zoneCounts = useMemo(() => ({
    green: rows.filter((r) => r.zone === "green" || r.zone === "safe").length,
    orange: rows.filter((r) => r.zone === "orange").length,
    red: rows.filter((r) => ["red", "critical", "overdue"].includes(r.zone)).length,
  }), [rows]);

  const setRate = async (p: Policy, val: string) => {
    const num = Math.max(0, Math.min(100, Number(val) || 0));
    try {
      await savePolicy.mutateAsync({
        id: p.id, client: p.client, provider: p.provider, premium: p.premium,
        end_date: p.end_date, commission_rate: num,
      });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const runNow = async () => {
    try {
      const res = await runScheduler.mutateAsync();
      toast.success(res?.created ? `${res.created} reminder(s) created` : "No new reminders due right now");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Renewals</h1>
          <p className="text-muted-foreground mt-1">Track expiring policies, send reminders and monitor renewal business</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={runNow} disabled={runScheduler.isPending}>
            {runScheduler.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />} Run now
          </Button>
          <CommissionRulesDialog
            rules={rules}
            onSave={async (next) => {
              try {
                await saveRules.mutateAsync(next);
                toast.success("Commission rules saved");
              } catch (e) {
                toast.error((e as Error).message);
              }
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Renewal Premium" value={totals.totalPremium} prefix="₹" change={0} icon={DollarSign} glowClass="stat-glow-cyan" />
        <StatCard title="Renewal Commission" value={totals.totalCommission} prefix="₹" change={0} icon={TrendingUp} glowClass="stat-glow-green" />
        <StatCard title="Policies Due (≤60d)" value={totals.dueCount} change={0} icon={CalendarClock} glowClass="stat-glow-amber" />
        <StatCard title="Overdue" value={totals.overdueCount} change={0} icon={AlertTriangle} glowClass="stat-glow-violet" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {([
          { key: "all", label: `All (${rows.length})`, cls: "bg-muted/50 text-foreground border-border" },
          { key: "green", label: `Green Zone (${zoneCounts.green})`, cls: "bg-success/10 text-success border-success/20" },
          { key: "orange", label: `Orange Zone (${zoneCounts.orange})`, cls: "bg-warning/10 text-warning border-warning/20" },
          { key: "red", label: `Red Zone (${zoneCounts.red})`, cls: "bg-destructive/10 text-destructive border-destructive/20" },
        ] as { key: ZoneFilter; label: string; cls: string }[]).map((c) => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${c.cls} ${filter === c.key ? "ring-2 ring-primary/40" : "opacity-80 hover:opacity-100"}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : rows.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <p className="text-muted-foreground">No active policies yet. Add policies to track renewals.</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="grid gap-3 lg:hidden">
            {filtered.map((r) => (
              <div key={r.id} className="glass-card p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{r.client}</p>
                    <p className="text-xs text-muted-foreground">{r.provider} · {r.end_date}</p>
                  </div>
                  <Badge variant="outline" className={zoneBadgeClass(r.zone)}>{zoneLabel(r.zone)}</Badge>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{r.daysLeft < 0 ? `${Math.abs(r.daysLeft)}d overdue` : `${r.daysLeft} days left`}</span>
                  <span className="text-foreground font-semibold">{formatINR(r.premium)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Input type="number" value={r.rate} onChange={(e) => setRate(r, e.target.value)} className="w-16 h-8 text-right" /> %
                    <span className="ml-2 text-success font-semibold">{formatINR(r.commission)}</span>
                  </div>
                  {r.phone && <WhatsAppButton href={waLink(r, r.daysLeft)} compact />}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel overflow-hidden hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    {["Policy", "Client", "Provider", "Expiry", "Days Left", "Premium", "Comm %", "Commission", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono text-primary">{r.policy_no || "—"}</td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{r.client}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{r.provider}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{r.end_date}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{r.daysLeft < 0 ? `${Math.abs(r.daysLeft)}d overdue` : `${r.daysLeft}d`}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{formatINR(r.premium)}</td>
                      <td className="px-4 py-3">
                        <Input type="number" value={r.rate} onChange={(e) => setRate(r, e.target.value)} className="w-20 h-8 text-right" min={0} max={100} />
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-success">{formatINR(r.commission)}</td>
                      <td className="px-4 py-3"><Badge variant="outline" className={zoneBadgeClass(r.zone)}>{zoneLabel(r.zone)}</Badge></td>
                      <td className="px-4 py-3">{r.phone ? <WhatsAppButton href={waLink(r, r.daysLeft)} compact /> : <span className="text-xs text-muted-foreground">no phone</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}

      {/* Auto reminder log */}
      <div className="glass-panel p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Auto Reminder Log</h2>
          <span className="text-xs text-muted-foreground">({log.length})</span>
        </div>
        {log.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reminders sent yet. The scheduler runs automatically every hour.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {log.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-3 py-2 border-b border-border/20 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm text-foreground truncate">{e.client ?? "Client"} — {e.milestone}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(e.sent_at).toLocaleString("en-IN")} · {e.days_left ?? 0} days left
                  </p>
                </div>
                {e.wa_link && <WhatsAppButton href={e.wa_link} compact />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
