import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useSavePolicy, uploadPolicyPdf, type Policy } from "@/hooks/useCrmData";

export const POLICY_TYPES = ["Health Insurance", "Motor Insurance", "Life Insurance", "Term Insurance", "Home Insurance", "Travel Insurance"];
export const PROVIDERS = ["Star Health", "LIC", "HDFC Ergo", "ICICI Lombard", "Bajaj Allianz", "Tata AIG", "Max Life", "New India Assurance"];
const STATUSES = ["Active", "Lapsed", "Cancelled"];

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  policy?: Policy | null;
}

export function PolicyDialog({ open, onOpenChange, policy }: Props) {
  const save = useSavePolicy();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    client: "", phone: "", email: "", provider: PROVIDERS[0], policy_no: "",
    type: POLICY_TYPES[0], premium: "", commission_rate: "", start_date: "", end_date: "", status: "Active",
  });

  useEffect(() => {
    if (open) {
      setFile(null);
      setForm({
        client: policy?.client ?? "",
        phone: policy?.phone ?? "",
        email: policy?.email ?? "",
        provider: policy?.provider ?? PROVIDERS[0],
        policy_no: policy?.policy_no ?? "",
        type: policy?.type ?? POLICY_TYPES[0],
        premium: policy?.premium != null ? String(policy.premium) : "",
        commission_rate: policy?.commission_rate != null ? String(policy.commission_rate) : "",
        start_date: policy?.start_date ?? "",
        end_date: policy?.end_date ?? "",
        status: policy?.status ?? "Active",
      });
    }
  }, [open, policy]);

  const submit = async () => {
    if (!form.client.trim()) return toast.error("Client name is required");
    if (!form.end_date) return toast.error("Expiry date is required");
    setBusy(true);
    try {
      let pdf_url = policy?.pdf_url ?? null;
      if (file) pdf_url = await uploadPolicyPdf(user!.id, file);
      await save.mutateAsync({
        id: policy?.id,
        client: form.client.trim(),
        phone: form.phone || null,
        email: form.email || null,
        provider: form.provider,
        policy_no: form.policy_no || null,
        type: form.type,
        premium: Number(form.premium) || 0,
        commission_rate: form.commission_rate ? Number(form.commission_rate) : null,
        start_date: form.start_date || null,
        end_date: form.end_date,
        status: form.status.toLowerCase() === "active" ? "active" : form.status,
        pdf_url,
      });
      toast.success(policy ? "Policy updated" : "Policy added");
      onOpenChange(false);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{policy ? "Edit Policy" : "New Policy"}</DialogTitle></DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Client *</Label>
            <Input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>WhatsApp Number</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="919876543210" />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Policy Number</Label>
            <Input value={form.policy_no} onChange={(e) => setForm({ ...form, policy_no: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Provider</Label>
            <Select value={form.provider} onValueChange={(v) => setForm({ ...form, provider: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PROVIDERS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{POLICY_TYPES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Premium (₹)</Label>
            <Input type="number" value={form.premium} onChange={(e) => setForm({ ...form, premium: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Commission % (override)</Label>
            <Input type="number" value={form.commission_rate} onChange={(e) => setForm({ ...form, commission_rate: e.target.value })} placeholder="provider default" />
          </div>
          <div className="space-y-1.5">
            <Label>Start Date</Label>
            <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Expiry Date *</Label>
            <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Policy PDF</Label>
            <Input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>{busy ? "Saving..." : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
