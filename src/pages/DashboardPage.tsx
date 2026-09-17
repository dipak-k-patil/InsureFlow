import { useMemo } from "react";
import { motion } from "framer-motion";
import { StatCard } from "@/components/StatCard";
import { Users, FileText, DollarSign, TrendingUp, ArrowRight, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useLeads, usePolicies, useCommissionRules } from "@/hooks/useCrmData";
import { useProfile } from "@/hooks/useProfile";
import { calcCommission, daysUntil, formatINR } from "@/lib/renewals";

const statusColors: Record<string, string> = {
  New: "bg-primary/10 text-primary border-primary/20",
  Contacted: "bg-info/10 text-info border-info/20",
  "Proposal Sent": "bg-warning/10 text-warning border-warning/20",
  Negotiation: "bg-secondary/10 text-secondary border-secondary/20",
  Won: "bg-success/10 text-success border-success/20",
  Lost: "bg-destructive/10 text-destructive border-destructive/20",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

function formatTimeAgo(dateStr?: string | null) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  if (isNaN(diff)) return "";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getInitials(name?: string | null) {
  if (!name || typeof name !== "string") return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  return parts.map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const { data: leads = [], isLoading: loadingLeads } = useLeads();
  const { data: policies = [], isLoading: loadingPolicies } = usePolicies();
  const { data: ruleRows = [] } = useCommissionRules();

  const rules = useMemo(
    () => Object.fromEntries((ruleRows || []).map((r) => [r.provider, Number(r.default_rate || 0)])) as Record<string, number>,
    [ruleRows]
  );

  const stats = useMemo(() => {
    const totalLeads = leads?.length || 0;
    const activePolicies = (policies || []).filter((p) => p && p.status?.toLowerCase() === "active").length;

    const totalCommission = (policies || []).reduce((sum, p) => {
      if (!p) return sum;
      const rate = p.commission_rate ?? rules[p.provider] ?? 10;
      return sum + calcCommission(p.premium || 0, rate);
    }, 0);

    const wonLeads = (leads || []).filter((l) => l && l.status === "Won").length;
    const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

    return [
      { title: "Total Leads", value: totalLeads, change: 0, icon: Users, glowClass: "stat-glow-cyan" },
      { title: "Active Policies", value: activePolicies, change: 0, icon: FileText, glowClass: "stat-glow-violet" },
      { title: "Total Commission", value: totalCommission, prefix: "₹", change: 0, icon: DollarSign, glowClass: "stat-glow-green" },
      { title: "Conversion Rate", value: conversionRate, suffix: "%", change: 0, icon: TrendingUp, glowClass: "stat-glow-amber" },
    ];
  }, [leads, policies, rules]);

  const recentLeads = useMemo(() => {
    return [...(leads || [])].slice(0, 5);
  }, [leads]);

  const upcomingRenewals = useMemo(() => {
    return (policies || [])
      .filter((p) => p && p.status?.toLowerCase() === "active" && p.end_date)
      .map((p) => {
        const daysLeft = daysUntil(p.end_date);
        return { ...p, daysLeft };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);
  }, [policies]);

  const isLoading = loadingLeads || loadingPolicies;
  const greetingName = profile?.full_name || profile?.agency_name || "Agent";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {greetingName}. Here's your agency overview.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </motion.div>

          {/* Two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Leads */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-panel p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-foreground">Recent Leads</h2>
                <button
                  onClick={() => navigate("/leads")}
                  className="text-xs text-primary flex items-center gap-1 hover:underline"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              {recentLeads.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No leads created yet. Add leads to see them here.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                          {getInitials(lead?.name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{lead?.name || "Unnamed Lead"}</p>
                          <p className="text-xs text-muted-foreground">{lead?.type || lead?.source || "Lead"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={statusColors[lead?.status || ""] || "bg-muted text-muted-foreground"}>
                          {lead?.status || "New"}
                        </Badge>
                        <span className="text-xs text-muted-foreground hidden sm:block">
                          {formatTimeAgo(lead?.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Upcoming Renewals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-panel p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-foreground">Upcoming Renewals</h2>
                <button
                  onClick={() => navigate("/renewals")}
                  className="text-xs text-primary flex items-center gap-1 hover:underline"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              {upcomingRenewals.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No active policies due for renewal.
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingRenewals.map((r) => (
                    <div key={r.id} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${r.daysLeft <= 7 ? 'bg-destructive/10' : 'bg-warning/10'}`}>
                          {r.daysLeft <= 7
                            ? <AlertTriangle className="w-4 h-4 text-destructive" />
                            : <Clock className="w-4 h-4 text-warning" />
                          }
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{r?.client || "Client"}</p>
                          <p className="text-xs text-muted-foreground">{r?.type || "Policy"} · {r?.provider || "Provider"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">{formatINR(r?.premium || 0)}</p>
                        <p className={`text-xs ${r.daysLeft <= 7 ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {r.daysLeft < 0 ? `${Math.abs(r.daysLeft)} days overdue` : `${r.daysLeft} days left`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
