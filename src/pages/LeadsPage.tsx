import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, MoreHorizontal, Phone, Mail, MessageSquare, Pencil, Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { LeadDialog, LEAD_STATUSES } from "@/components/LeadDialog";
import { useLeads, useDeleteLead, type Lead } from "@/hooks/useCrmData";

const statusColors: Record<string, string> = {
  New: "bg-primary/10 text-primary border-primary/20",
  Contacted: "bg-info/10 text-info border-info/20",
  "Proposal Sent": "bg-warning/10 text-warning border-warning/20",
  Negotiation: "bg-secondary/10 text-secondary border-secondary/20",
  Won: "bg-success/10 text-success border-success/20",
  Lost: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function LeadsPage() {
  const { data: leads = [], isLoading } = useLeads();
  const del = useDeleteLead();
  const [activeFilter, setActiveFilter] = useState("All");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);

  const counts = useMemo(() => {
    const base: { label: string; count: number }[] = [{ label: "All", count: leads.length }];
    LEAD_STATUSES.forEach((s) => base.push({ label: s, count: leads.filter((l) => l.status === s).length }));
    return base;
  }, [leads]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return leads
      .filter((l) => activeFilter === "All" || l.status === activeFilter)
      .filter((l) => !term || [l.name, l.email, l.phone].some((v) => v?.toLowerCase().includes(term)));
  }, [leads, activeFilter, q]);

  const remove = async (lead: Lead) => {
    try {
      await del.mutateAsync(lead.id);
      toast.success("Lead deleted");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const initials = (n: string) => n.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leads</h1>
          <p className="text-muted-foreground mt-1">Manage and track your insurance leads</p>
        </div>
        <Button className="gap-2" onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="w-4 h-4" /> Add Lead
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {counts.map((p) => (
          <button
            key={p.label}
            onClick={() => setActiveFilter(p.label)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeFilter === p.label
                ? "bg-primary/10 text-primary border border-primary/30"
                : "bg-muted/50 text-muted-foreground border border-transparent hover:bg-muted"
            }`}
          >
            {p.label} <span className="ml-1 opacity-60">{p.count}</span>
          </button>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search leads..." className="pl-10 bg-muted/50 border-border/50 h-9" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <p className="text-muted-foreground">No leads yet. Add your first lead to get started.</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="grid gap-3 md:hidden">
            {filtered.map((lead) => (
              <div key={lead.id} className="glass-card p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.email || lead.phone}</p>
                  </div>
                  <Badge variant="outline" className={statusColors[lead.status]}>{lead.status}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{lead.source}</span>
                  <span className="font-semibold text-foreground">₹{(lead.value ?? 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => { setEditing(lead); setOpen(true); }}>
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => remove(lead)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
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
                    {["Lead", "Status", "Source", "Value", "Actions"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead, i) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i, 10) * 0.03 }}
                      className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                            {initials(lead.name)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{lead.name}</p>
                            <p className="text-xs text-muted-foreground">{lead.email || lead.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={statusColors[lead.status]}>{lead.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{lead.source}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">₹{(lead.value ?? 0).toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {lead.phone && (
                            <>
                              <a href={`tel:${lead.phone}`} className="p-1.5 rounded-md hover:bg-muted/50">
                                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                              </a>
                              <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="p-1.5 rounded-md hover:bg-muted/50">
                                <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                              </a>
                            </>
                          )}
                          {lead.email && (
                            <a href={`mailto:${lead.email}`} className="p-1.5 rounded-md hover:bg-muted/50">
                              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                            </a>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger className="p-1.5 rounded-md hover:bg-muted/50">
                              <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setEditing(lead); setOpen(true); }}>
                                <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => remove(lead)}>
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

      <LeadDialog open={open} onOpenChange={setOpen} lead={editing} />
    </div>
  );
}
