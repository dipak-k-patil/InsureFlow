import { useState, useEffect } from "react";
import { useBrandKits, BrandKit } from "@/hooks/useBrandKits";
import { useAiCreditBalance } from "@/hooks/useAiUsage";
import {
  useAiGeneratedAssets,
  useGenerateAiImage,
  useGetAssetSignedUrl,
  useDeleteAiAsset,
  GeneratedAiAsset,
} from "@/hooks/useAiImageStudio";
import { BrandKitPreview } from "@/components/BrandKitPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Sparkles,
  Zap,
  Image as ImageIcon,
  Download,
  RotateCw,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Shield,
} from "lucide-react";

const CATEGORIES = [
  { id: "health", label: "Health Insurance", prompt: "Comprehensive family health insurance cashless coverage banner" },
  { id: "life", label: "Life & Term Cover", prompt: "Financial security and life cover for family future" },
  { id: "motor", label: "Motor & Car Insurance", prompt: "Fast claim settlement and car protection policy advertisement" },
  { id: "travel", label: "Travel Protection", prompt: "International vacation and student travel insurance policy" },
  { id: "lead_gen", label: "Lead Generation", prompt: "Get instant free insurance quote today special offer" },
  { id: "recruitment", label: "Agent Recruitment", prompt: "Become a certified insurance advisor and build your business" },
  { id: "festival", label: "Festival Offer", prompt: "Festival special insurance renewal discount and festive greetings" },
];

const ASPECT_RATIOS = [
  { id: "1:1", label: "Square (1:1)", desc: "WhatsApp / Instagram Post" },
  { id: "9:16", label: "Story (9:16)", desc: "WhatsApp Status / IG Story" },
  { id: "16:9", label: "Landscape (16:9)", desc: "Facebook / Presentation / Banner" },
];

const QUALITIES = [
  { id: "low", label: "Low (10 Credits)", cost: 10 },
  { id: "standard", label: "Standard (15 Credits)", cost: 15 },
  { id: "high", label: "High / HD (20 Credits)", cost: 20 },
];

export function AiImageStudio() {
  const { data: kits = [] } = useBrandKits();
  const { data: credits } = useAiCreditBalance();
  const { data: assets = [], isLoading: loadingAssets } = useAiGeneratedAssets();

  const generateMutation = useGenerateAiImage();
  const getSignedUrlMutation = useGetAssetSignedUrl();
  const deleteMutation = useDeleteAiAsset();

  const [prompt, setPrompt] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("health");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "9:16" | "16:9">("1:1");
  const [quality, setQuality] = useState<"low" | "medium" | "high" | "standard">("standard");
  const [selectedKitId, setSelectedKitId] = useState<string>("");
  const [assetImageUrls, setAssetImageUrls] = useState<Record<string, string>>({});

  const activeKit = kits.find((k) => k.id === selectedKitId) || kits.find((k) => k.is_default) || kits[0] || null;
  const estimatedCost = QUALITIES.find((q) => q.id === quality)?.cost || 15;
  const remainingCredits = credits?.credits_remaining ?? 50;

  useEffect(() => {
    if (kits.length > 0 && !selectedKitId) {
      const defaultKit = kits.find((k) => k.is_default) || kits[0];
      if (defaultKit) setSelectedKitId(defaultKit.id);
    }
  }, [kits, selectedKitId]);

  // Load signed URLs for completed assets
  useEffect(() => {
    assets.forEach((asset) => {
      if (asset.status === "completed" && asset.storage_path && !assetImageUrls[asset.id]) {
        getSignedUrlMutation.mutateAsync(asset.storage_path).then((url) => {
          if (url) {
            setAssetImageUrls((prev) => ({ ...prev, [asset.id]: url }));
          }
        });
      }
    });
  }, [assets]);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    const catObj = CATEGORIES.find((c) => c.id === catId);
    if (catObj) {
      setPrompt(catObj.prompt);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter or select a content prompt");
      return;
    }
    if (remainingCredits < estimatedCost) {
      toast.error("Insufficient AI credits. Upgrade tier or wait for refill.");
      return;
    }

    try {
      toast.info("Generating AI insurance visual... Deducting credits");
      const res = await generateMutation.mutateAsync({
        prompt,
        category: CATEGORIES.find((c) => c.id === selectedCategory)?.label || "Insurance",
        aspect_ratio: aspectRatio,
        quality,
        brand_kit_id: activeKit?.id,
      });

      toast.success("AI Visual generated successfully!");
      if (res.asset.storage_path) {
        const url = await getSignedUrlMutation.mutateAsync(res.asset.storage_path);
        if (url) {
          setAssetImageUrls((prev) => ({ ...prev, [res.asset.id]: url }));
        }
      }
    } catch (err: any) {
      toast.error(err.message || "AI image generation failed. Credits refunded.");
    }
  };

  const handleDeleteAsset = async (asset: GeneratedAiAsset) => {
    if (confirm("Delete this AI generated asset?")) {
      try {
        await deleteMutation.mutateAsync(asset);
        toast.success("Asset deleted");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete asset");
      }
    }
  };

  const handleRegenerate = (asset: GeneratedAiAsset) => {
    if (asset.prompt) setPrompt(asset.prompt);
    if (asset.aspect_ratio) setAspectRatio(asset.aspect_ratio as any);
    if (asset.quality) setQuality(asset.quality as any);
    if (asset.brand_kit_id) setSelectedKitId(asset.brand_kit_id);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.info("Prompt & settings restored. Click Generate AI Visual.");
  };

  return (
    <div className="space-y-8">
      {/* Top Banner: Credit Balance & AI Status */}
      <div className="glass-panel p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-inner">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">AI Insurance Content Studio</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Generate AI-powered marketing banners automatically branded with your agency details & colors.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-card/80 backdrop-blur px-4 py-2.5 rounded-xl border border-border/50 shadow-sm">
          <Zap className="w-4 h-4 text-warning fill-warning" />
          <div>
            <p className="text-[11px] text-muted-foreground uppercase font-semibold">Available AI Credits</p>
            <p className="text-base font-extrabold text-foreground font-mono">{remainingCredits} Credits</p>
          </div>
        </div>
      </div>

      {/* Main Studio Workspace: Form + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Controls */}
        <div className="lg:col-span-6 space-y-5 glass-panel p-6">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary" /> 1. Select Campaign & Prompt
          </h3>

          {/* Quick Preset Categories */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Insurance Category Presets</Label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-muted/40 text-muted-foreground border-border/40 hover:bg-muted/70"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Textarea */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Custom Content Prompt *</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to create or pick a category above..."
              rows={3}
              className="text-xs resize-none"
            />
          </div>

          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 pt-2 border-t border-border/40">
            <Shield className="w-4 h-4 text-primary" /> 2. Format & Brand Kit
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Aspect Ratio */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Aspect Ratio / Format</Label>
              <Select value={aspectRatio} onValueChange={(v: any) => setAspectRatio(v)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASPECT_RATIOS.map((ar) => (
                    <SelectItem key={ar.id} value={ar.id} className="text-xs">
                      {ar.label} - {ar.desc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quality Tier */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Quality & Credit Cost</Label>
              <Select value={quality} onValueChange={(v: any) => setQuality(v)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUALITIES.map((q) => (
                    <SelectItem key={q.id} value={q.id} className="text-xs">
                      {q.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Brand Kit Selector */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold">Selected Agency Brand Kit</Label>
              <Select value={selectedKitId} onValueChange={setSelectedKitId}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select Brand Kit" />
                </SelectTrigger>
                <SelectContent>
                  {kits.map((kit) => (
                    <SelectItem key={kit.id} value={kit.id} className="text-xs">
                      {kit.name} ({kit.agency_name || "Agency"}) {kit.is_default ? "★ Default" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate CTA Button */}
          <div className="pt-3 border-t border-border/40 flex items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground">
              Cost: <span className="font-bold text-foreground font-mono">{estimatedCost} Credits</span>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending || !prompt.trim()}
              className="gap-2 shadow-lg"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating AI Visual...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-warning fill-warning" /> Generate AI Visual
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Live Brand Preview & Status Panel */}
        <div className="lg:col-span-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Live Brand Overlay & Composition Preview
          </h3>
          <BrandKitPreview
            brandKit={activeKit}
            headline={prompt.trim() || "Comprehensive Insurance Coverage Partner"}
            subheadline="Instant Cashless Claims · 100% Tax Savings · 24x7 Assistance"
          />
        </div>
      </div>

      {/* Generated Assets History Section */}
      <div className="space-y-4 pt-6 border-t border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">AI Generation History</h3>
            <p className="text-xs text-muted-foreground">View, download, and manage your AI generated marketing assets.</p>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {assets.length} Assets
          </Badge>
        </div>

        {loadingAssets ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading asset history...</div>
        ) : assets.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground glass-panel border-dashed">
            No AI assets generated yet. Enter a prompt above to generate your first AI marketing banner.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset) => (
              <div key={asset.id} className="glass-panel p-4 space-y-3 flex flex-col justify-between hover-lift">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                      {asset.aspect_ratio || "1:1"}
                    </Badge>

                    {asset.status === "completed" && (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[10px] gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </Badge>
                    )}
                    {asset.status === "processing" && (
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-[10px] gap-1">
                        <Clock className="w-3 h-3 animate-spin" /> Processing
                      </Badge>
                    )}
                    {asset.status === "failed" && (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] gap-1">
                        <AlertCircle className="w-3 h-3" /> Failed (Refunded)
                      </Badge>
                    )}
                  </div>

                  {/* Asset Image Container */}
                  <div className="aspect-square w-full rounded-xl bg-muted/40 overflow-hidden flex items-center justify-center relative border border-border/40">
                    {asset.status === "completed" && assetImageUrls[asset.id] ? (
                      <img
                        src={assetImageUrls[asset.id]}
                        alt={asset.title}
                        className="w-full h-full object-cover"
                      />
                    ) : asset.status === "failed" ? (
                      <div className="p-4 text-center text-xs text-destructive space-y-1">
                        <AlertCircle className="w-6 h-6 mx-auto" />
                        <p className="font-medium">Generation Error</p>
                        <p className="text-[10px] opacity-80">{asset.error_message || "Provider error"}</p>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-muted-foreground space-y-2">
                        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                        <p>Processing AI Visual...</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-foreground line-clamp-1">{asset.title}</h4>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{asset.prompt}</p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRegenerate(asset)}
                      title="Reuse settings & regenerate"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteAsset(asset)}
                      title="Delete asset"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {asset.status === "completed" && assetImageUrls[asset.id] && (
                    <a
                      href={assetImageUrls[asset.id]}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={`insureflow-ai-${asset.id}.png`}
                    >
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                        <Download className="w-3.5 h-3.5" /> Download
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
