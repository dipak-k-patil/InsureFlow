import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings2 } from "lucide-react";

interface Props {
  rules: Record<string, number>;
  onSave: (next: Record<string, number>) => void;
}

export function CommissionRulesDialog({ rules, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, number>>(rules);

  const update = (provider: string, val: string) => {
    const num = Math.max(0, Math.min(100, Number(val) || 0));
    setDraft({ ...draft, [provider]: num });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setDraft(rules); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="w-3.5 h-3.5" /> Commission Rules
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Per-Provider Commission %</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {Object.entries(draft).map(([provider, rate]) => (
            <div key={provider} className="flex items-center justify-between gap-3">
              <span className="text-sm text-foreground">{provider}</span>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={rate}
                  onChange={(e) => update(provider, e.target.value)}
                  className="w-20 h-8 text-right"
                  min={0}
                  max={100}
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => { onSave(draft); setOpen(false); }}>Save Rules</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
