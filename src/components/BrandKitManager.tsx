import { useState } from "react";
import { useBrandKits, useSaveBrandKit, useDeleteBrandKit, useSetDefaultBrandKit, BrandKit } from "@/hooks/useBrandKits";
import { BrandKitPreview } from "@/components/BrandKitPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Palette, Plus, CheckCircle2, Trash2, Edit3, Star, Shield, Loader2 } from "lucide-react";

export function BrandKitManager() {
  const { data: kits = [], isLoading } = useBrandKits();
  const saveKitMutation = useSaveBrandKit();
  const deleteKitMutation = useDeleteBrandKit();
  const setDefaultKitMutation = useSetDefaultBrandKit();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKit, setEditingKit] = useState<Partial<BrandKit> | null>(null);

  const activeDefaultKit = kits.find((k) => k.is_default) || kits[0] || null;

  const handleOpenForm = (kit?: BrandKit) => {
    if (kit) {
      setEditingKit({ ...kit });
    } else {
      setEditingKit({
        name: `Brand Kit ${kits.length + 1}`,
        agency_name: "",
        agent_name: "",
        designation: "Insurance Consultant",
        phone: "",
        whatsapp: "",
        email: "",
        website: "",
        address: "",
        primary_logo_url: "",
        secondary_logo_url: "",
        profile_photo_url: "",
        primary_color: "#00c6ff",
        secondary_color: "#0072ff",
        accent_color: "#a100f2",
        font_family: "Inter",
        default_cta: "Get Instant Quote",
        is_default: kits.length === 0,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKit?.name) {
      toast.error("Please enter a Brand Kit name");
      return;
    }

    try {
      await saveKitMutation.mutateAsync(editingKit as any);
      toast.success(editingKit.id ? "Brand Kit updated" : "New Brand Kit created");
      setDialogOpen(false);
      setEditingKit(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to save Brand Kit");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this Brand Kit?")) {
      try {
        await deleteKitMutation.mutateAsync(id);
        toast.success("Brand Kit deleted");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete Brand Kit");
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultKitMutation.mutateAsync(id);
      toast.success("Set as default Brand Kit");
    } catch (err: any) {
      toast.error(err.message || "Failed to set default Brand Kit");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" /> Reusable Brand Kits
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Maintain agency logos, brand color palettes, fonts, and agent details across marketing assets.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenForm()} size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Create Brand Kit
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                {editingKit?.id ? "Edit Brand Kit" : "Create Reusable Brand Kit"}
              </DialogTitle>
            </DialogHeader>

            {editingKit && (
              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs font-semibold">Brand Kit Name *</Label>
                    <Input
                      value={editingKit.name || ""}
                      onChange={(e) => setEditingKit({ ...editingKit, name: e.target.value })}
                      placeholder="e.g. Health Insurance Campaign Kit"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Agency / Company Name</Label>
                    <Input
                      value={editingKit.agency_name || ""}
                      onChange={(e) => setEditingKit({ ...editingKit, agency_name: e.target.value })}
                      placeholder="InsureFlow Premier Agency"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Agent Name</Label>
                    <Input
                      value={editingKit.agent_name || ""}
                      onChange={(e) => setEditingKit({ ...editingKit, agent_name: e.target.value })}
                      placeholder="Rahul Sharma"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Designation</Label>
                    <Input
                      value={editingKit.designation || ""}
                      onChange={(e) => setEditingKit({ ...editingKit, designation: e.target.value })}
                      placeholder="Senior Insurance Advisor"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Phone Number</Label>
                    <Input
                      value={editingKit.phone || ""}
                      onChange={(e) => setEditingKit({ ...editingKit, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Email</Label>
                    <Input
                      type="email"
                      value={editingKit.email || ""}
                      onChange={(e) => setEditingKit({ ...editingKit, email: e.target.value })}
                      placeholder="rahul@insureflow.in"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Website</Label>
                    <Input
                      value={editingKit.website || ""}
                      onChange={(e) => setEditingKit({ ...editingKit, website: e.target.value })}
                      placeholder="www.insureflow.in"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs">Primary Logo URL</Label>
                    <Input
                      value={editingKit.primary_logo_url || ""}
                      onChange={(e) => setEditingKit({ ...editingKit, primary_logo_url: e.target.value })}
                      placeholder="https://domain.com/logo.png"
                    />
                  </div>

                  {/* Brand Color Pickers */}
                  <div className="space-y-1">
                    <Label className="text-xs">Primary Color</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="color"
                        className="w-10 h-8 p-1 cursor-pointer"
                        value={editingKit.primary_color || "#00c6ff"}
                        onChange={(e) => setEditingKit({ ...editingKit, primary_color: e.target.value })}
                      />
                      <Input
                        value={editingKit.primary_color || "#00c6ff"}
                        onChange={(e) => setEditingKit({ ...editingKit, primary_color: e.target.value })}
                        className="font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Secondary Color</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="color"
                        className="w-10 h-8 p-1 cursor-pointer"
                        value={editingKit.secondary_color || "#0072ff"}
                        onChange={(e) => setEditingKit({ ...editingKit, secondary_color: e.target.value })}
                      />
                      <Input
                        value={editingKit.secondary_color || "#0072ff"}
                        onChange={(e) => setEditingKit({ ...editingKit, secondary_color: e.target.value })}
                        className="font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Accent Color</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="color"
                        className="w-10 h-8 p-1 cursor-pointer"
                        value={editingKit.accent_color || "#a100f2"}
                        onChange={(e) => setEditingKit({ ...editingKit, accent_color: e.target.value })}
                      />
                      <Input
                        value={editingKit.accent_color || "#a100f2"}
                        onChange={(e) => setEditingKit({ ...editingKit, accent_color: e.target.value })}
                        className="font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Default Call to Action (CTA)</Label>
                    <Input
                      value={editingKit.default_cta || ""}
                      onChange={(e) => setEditingKit({ ...editingKit, default_cta: e.target.value })}
                      placeholder="Get Instant Quote Today"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saveKitMutation.isPending}>
                    {saveKitMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                    Save Brand Kit
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Grid: Kits List + Live Preview Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kits List */}
        <div className="lg:col-span-6 space-y-3">
          {kits.length === 0 ? (
            <div className="glass-panel p-8 text-center space-y-3 border-dashed">
              <Shield className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-sm font-semibold text-foreground">No Brand Kits created yet</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Create a Brand Kit to define your logos, brand colors, agent contact details, and marketing CTA.
              </p>
              <Button onClick={() => handleOpenForm()} size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Create First Brand Kit
              </Button>
            </div>
          ) : (
            kits.map((kit) => (
              <div
                key={kit.id}
                className={`glass-panel p-4 space-y-3 border transition-all ${
                  kit.is_default ? "border-primary/50 bg-primary/5" : "border-border/40 hover:border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-foreground">{kit.name}</h3>
                    {kit.is_default && (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1 text-[10px]">
                        <Star className="w-3 h-3 fill-primary" /> Default
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {!kit.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(kit.id)}
                        className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenForm(kit)}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(kit.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>Agency: <span className="text-foreground font-medium">{kit.agency_name || "—"}</span></div>
                  <div>Agent: <span className="text-foreground font-medium">{kit.agent_name || "—"}</span></div>
                </div>

                {/* Color Swatches */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-muted-foreground">Palette:</span>
                  <div className="w-4 h-4 rounded-full border shadow-sm" style={{ backgroundColor: kit.primary_color }} title="Primary" />
                  <div className="w-4 h-4 rounded-full border shadow-sm" style={{ backgroundColor: kit.secondary_color }} title="Secondary" />
                  <div className="w-4 h-4 rounded-full border shadow-sm" style={{ backgroundColor: kit.accent_color }} title="Accent" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Live Preview Panel */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Live Asset Brand Overlay Preview
            </h3>
          </div>
          <BrandKitPreview brandKit={activeDefaultKit} />
        </div>
      </div>
    </div>
  );
}
