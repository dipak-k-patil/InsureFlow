import { useMemo } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, FileText, Calendar, Loader2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { CommissionRulesDialog } from "@/components/CommissionRulesDialog";
import { toast } from "sonner";
import { usePolicies, useCommissionRules, useSaveCommissionRules } from "@/hooks/useCrmData";
import { calcCommission, formatINR, daysUntil } from "@/lib/renewals";

export default function CommissionsPage() {
  const { data: policies = [], isLoading } = usePolicies();
  const { data: ruleRows = [] } = useCommissionRules();
  const saveRules = useSaveCommissionRules();

  const rules = useMemo(
    () => Object.fromEntries(ruleRows.map((r) => [r.provider, Number(r.default_rate)])) as Record<string, number>,
    [ruleRows],
  );

  const byProvider = useMemo(() => {
    const map = new Map<string, { provider: string; count: number; premium: number; commission: number; rate: number; upcoming: number }>();
    policies.forEach((p) => {
      const rate = p.commission_rate ?? rules[p.provider] ?? 10;
      const commission = calcCommission(p.premium, rate);
      const cur = map.get(p.provider) ?? { provider: p.provider, count: 0, premium: 0, commission: 0, rate, upcoming: 0 };
      cur.count += 1;
      cur.premium += p.premium;
      cur.commission += commission;
      cur.rate = rate;
      const d = daysUntil(p.end_date);
      if (p.status === "Active" && d >= 0 && d <= 60) cur.upcoming += commission;
      map.set(p.provider, cur);
    });
    return [...map.values()].sort((a, b) => b.commission - a.commission);
  }, [policies, rules]);

  const totals = useMemo(() => {
    const earned = byProvider.reduce((s, r) => s + r.commission, 0);
    const upcoming = byProvider.reduce((s, r) => s + r.upcoming, 0);
    const premium = byProvider.reduce((s, r) => s + r.premium, 0);
    const avgRate = premium ? Math.round((earned / premium) * 1000) / 10 : 0;
    return { earned, upcoming, premium, avgRate, policies: policies.length };
  }, [byProvider, policies]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Commissions</h1>
          <p className="text-muted-foreground mt-1">Earnings by insurance provider, based on your commission rules</p>
        </div>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Commission" value={totals.earned} prefix="₹" change={0} icon={DollarSign} glowClass="stat-glow-green" />
        <StatCard title="Upcoming (≤60d)" value={totals.upcoming} prefix="₹" change={0} icon={Calendar} glowClass="stat-glow-amber" />
        <StatCard title="Policies" value={totals.policies} change={0} icon={FileText} glowClass="stat-glow-cyan" />
        <StatCard title="Avg Commission Rate" value={totals.avgRate} suffix="%" change={0} icon={TrendingUp} glowClass="stat-glow-violet" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : byProvider.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <p className="text-muted-foreground">No policies yet — commissions will appear once you add policies.</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  {["Provider", "Policies", "Premium", "Rate", "Commission", "Upcoming (≤60d)"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {byProvider.map((row) => (
                  <tr key={row.provider} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{row.provider}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{row.count}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{formatINR(row.premium)}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{rules[row.provider] ?? row.rate}%</td>
                    <td className="px-6 py-4 text-sm font-semibold text-success">{formatINR(row.commission)}</td>
                    <td className="px-6 py-4 text-sm text-warning">{formatINR(row.upcoming)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
