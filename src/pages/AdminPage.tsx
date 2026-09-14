import { motion } from "framer-motion";
import { StatCard } from "@/components/StatCard";
import { Building2, Users, DollarSign, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const tenants = [
  { name: "Shield Insurance Agency", agents: 12, plan: "Enterprise", revenue: "₹4,99,000", status: "Active" },
  { name: "SafeGuard Brokers", agents: 5, plan: "Professional", revenue: "₹1,24,500", status: "Active" },
  { name: "TrustLine Insurance", agents: 8, plan: "Professional", revenue: "₹2,49,000", status: "Active" },
  { name: "SecureLife Agency", agents: 3, plan: "Starter", revenue: "₹29,970", status: "Trial" },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform-wide overview and tenant management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Tenants" value={28} change={12} icon={Building2} glowClass="stat-glow-cyan" />
        <StatCard title="Total Users" value={342} change={8.5} icon={Users} glowClass="stat-glow-violet" />
        <StatCard title="Monthly Revenue" value={890000} prefix="₹" change={22.3} icon={DollarSign} glowClass="stat-glow-green" />
        <StatCard title="Avg. Usage" value={78} suffix="%" change={5.1} icon={BarChart3} glowClass="stat-glow-amber" />
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50">
          <h2 className="text-lg font-semibold text-foreground">Tenants</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Agency</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Agents</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Plan</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Revenue</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t, i) => (
                <tr key={i} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{t.name}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{t.agents}</td>
                  <td className="px-6 py-4"><Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{t.plan}</Badge></td>
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">{t.revenue}</td>
                  <td className="px-6 py-4"><Badge variant="outline" className={t.status === "Active" ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"}>{t.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
