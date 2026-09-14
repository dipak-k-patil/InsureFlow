import { motion } from "framer-motion";
import { StatCard } from "@/components/StatCard";
import { Users, FileText, DollarSign, TrendingUp, ArrowRight, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const stats = [
  { title: "Total Leads", value: 1284, change: 12.5, icon: Users, glowClass: "stat-glow-cyan" },
  { title: "Active Policies", value: 856, change: 8.2, icon: FileText, glowClass: "stat-glow-violet" },
  { title: "Total Commission", value: 284500, prefix: "₹", change: 15.3, icon: DollarSign, glowClass: "stat-glow-green" },
  { title: "Conversion Rate", value: 68, suffix: "%", change: -2.1, icon: TrendingUp, glowClass: "stat-glow-amber" },
];

const recentLeads = [
  { name: "Priya Sharma", type: "Health Insurance", status: "New", time: "2 min ago" },
  { name: "Rajesh Kumar", type: "Motor Insurance", status: "Contacted", time: "15 min ago" },
  { name: "Anita Desai", type: "Life Insurance", status: "Proposal Sent", time: "1 hr ago" },
  { name: "Vikram Singh", type: "Home Insurance", status: "Negotiation", time: "3 hrs ago" },
  { name: "Meera Patel", type: "Health Insurance", status: "New", time: "5 hrs ago" },
];

const upcomingRenewals = [
  { client: "Amit Verma", policy: "Health Plus", daysLeft: 3, premium: "₹24,000" },
  { client: "Sunita Agarwal", policy: "Motor Shield", daysLeft: 7, premium: "₹8,500" },
  { client: "Rahul Joshi", policy: "Life Secure", daysLeft: 12, premium: "₹45,000" },
  { client: "Kavita Nair", policy: "Home Guard", daysLeft: 15, premium: "₹12,000" },
];

const statusColors: Record<string, string> = {
  New: "bg-primary/10 text-primary border-primary/20",
  Contacted: "bg-info/10 text-info border-info/20",
  "Proposal Sent": "bg-warning/10 text-warning border-warning/20",
  Negotiation: "bg-secondary/10 text-secondary border-secondary/20",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, John. Here's your agency overview.</p>
      </div>

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
            <button className="text-xs text-primary flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {recentLeads.map((lead, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {lead.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={statusColors[lead.status]}>
                    {lead.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground hidden sm:block">{lead.time}</span>
                </div>
              </div>
            ))}
          </div>
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
            <button className="text-xs text-primary flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {upcomingRenewals.map((r, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${r.daysLeft <= 7 ? 'bg-destructive/10' : 'bg-warning/10'}`}>
                    {r.daysLeft <= 7
                      ? <AlertTriangle className="w-4 h-4 text-destructive" />
                      : <Clock className="w-4 h-4 text-warning" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.client}</p>
                    <p className="text-xs text-muted-foreground">{r.policy}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{r.premium}</p>
                  <p className={`text-xs ${r.daysLeft <= 7 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {r.daysLeft} days left
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
