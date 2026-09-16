import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Download, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { PolicyDialog } from "@/components/PolicyDialog";
import { usePolicies, useDeletePolicy, getPolicyPdfUrl, type Policy } from "@/hooks/useCrmData";
import { daysUntil } from "@/lib/renewals";

function derivedStatus(p: Policy) {
  if (p.status?.toLowerCase() !== "active") return p.status;
  const d = daysUntil(p.end_date);
  if (d < 0) return "Expired";
  if (d <= 30) return "Expiring Soon";
  return "Active";
}

const statusColors: Record<string, string> = {
  Active: "bg-success/10 text-success border-success/20",
  "Expiring Soon": "bg-warning/10 text-warning border-warning/20",
  Expired: "bg-destructive/10 text-destructive border-destructive/20",
  Lapsed: "bg-destructive/10 text-destructive border-destructive/20",
  Cancelled: "bg-muted text-muted-foreground border-border",
};

export default function PoliciesPage() {
  const { data: policies = [], isLoading } = usePolicies();
  const del = useDeletePolicy();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Policy | null>(null);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return policies
      .map((p) => ({ ...p, derived: derivedStatus(p) }))
      .filter((p) => !term || [p.client, p.provider, p.policy_no, p.type].some((v) => v?.toLowerCase().includes(term)));
  }, [policies, q]);

  const summary = useMemo(() => ({
    active: rows.filter((r) => r.derived === "Active").length,
    soon: rows.filter((r) => r.derived === "Expiring Soon").length,
    expired: rows.filter((r) => r.derived === "Expired" || r.derived === "Lapsed").length,
  }), [rows]);

  const download = async (p: Policy) => {
    const url = await getPolicyPdfUrl(p.pdf_url);
    if (!url) return toast.error("No document uploaded for this policy");
    window.open(url, "_blank");
  };

  const remove = async (p: Policy) => {
    try {
      await del.mutateAsync(p.id);
      toast.success("Policy deleted");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Policies</h1>
          <p className="text-muted-foreground mt-1">Track and manage all insurance policies</p>
        </div>
        <Button className="gap-2" onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="w-4 h-4" /> New Policy
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Active Policies", value: summary.active, color: "text-success" },
          { label: "Expiring Soon", value: summary.soon, color: "text-warning" },
          { label: "Expired / Lapsed", value: summary.expired, color: "text-destructive" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search policies..." className="pl-10 bg-muted/50 border-border/50 h-9" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : rows.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <p className="text-muted-foreground">No policies yet. Create your first policy to start tracking renewals.</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="grid gap-3 md:hidden">
            {rows.map((p) => (
              <div key={p.id} className="glass-card p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{p.client}</p>
                    <p className="text-xs text-muted-foreground">{p.type} · {p.provider}</p>
                  </div>
                  <Badge variant="outline" className={statusColors[p.derived]}>{p.derived}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Expiry {p.end_date}</span>
                  <span className="font-semibold text-foreground">₹{p.premium.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => { setEditing(p); setOpen(true); }}>
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => download(p)}><Download className="w-3 h-3" /></Button>
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => remove(p)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    {["Policy No", "Client", "Type", "Provider", "Premium", "Status", "Expiry", "Actions"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i, 10) * 0.03 }}
                      className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-mono text-primary">{p.policy_no || "—"}</td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{p.client}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{p.type}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{p.provider}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">₹{p.premium.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4"><Badge variant="outline" className={statusColors[p.derived]}>{p.derived}</Badge></td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{p.end_date}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => download(p)} className="p-1.5 rounded-md hover:bg-muted/50">
                            <Download className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="p-1.5 rounded-md hover:bg-muted/50">
                              <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setEditing(p); setOpen(true); }}>
                                <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => remove(p)}>
                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}

      <PolicyDialog open={open} onOpenChange={setOpen} policy={editing} />
    </div>
  );
}
