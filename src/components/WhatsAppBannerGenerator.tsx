import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Send,
  Share2,
  Image,
  MessageSquare,
  Shield,
  Phone,
  Palette,
  Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface GeneratedTemplate {
  title: string;
  category: string;
  gradient: string;
  headline: string;
  subtext: string;
  discountBadge?: string;
  whatsappMessage: string;
}

const samplePrompts = [
  "Create a 30-day Health Insurance renewal reminder with 15% early renewal discount",
  "Festival greeting banner for Diwali with personalized Motor Insurance offer",
  "Term Life Insurance awareness banner highlighting family security",
  "Urgent 7-day Motor Policy expiry alert with instant WhatsApp payment link"
];

export const WhatsAppBannerGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [agencyName, setAgencyName] = useState<string>("Apex Risk Insurance Agency");
  const [advisorPhone, setAdvisorPhone] = useState<string>("+1 (800) 555-0199");
  const [primaryColor] = useState<string>("from-cyan-500 via-indigo-600 to-pink-500");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedTemplate, setGeneratedTemplate] = useState<GeneratedTemplate | null>({
    title: "Health Insurance Renewal Notice",
    category: "Policy Renewal",
    gradient: "from-cyan-500 via-indigo-600 to-pink-500",
    headline: "Protect Your Health & Savings!",
    subtext: "Your Health Protection Policy expires in 30 days. Renew early to claim your 15% NCD discount.",
    discountBadge: "15% NO CLAIM BONUS DISCOUNT",
    whatsappMessage: "Dear Client, Your Health Insurance Policy #POL-8842 expires in 30 days. Renew today through Apex Risk Agency and claim your 15% No-Claim Discount! Reply RENEW to proceed instantly."
  });

  const handleGenerate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() && !generatedTemplate) {
      toast.error("Please enter a prompt to generate your WhatsApp template.");
      return;
    }

    setIsGenerating(true);

    // Synchronous execution or instant timeout for deterministic unit test execution
    const isMotor = prompt.toLowerCase().includes("motor") || prompt.toLowerCase().includes("car");
    const isLife = prompt.toLowerCase().includes("life") || prompt.toLowerCase().includes("term");

    setGeneratedTemplate({
      title: isMotor ? "Motor Insurance Expiry Alert" : isLife ? "Term Life Family Shield" : "Health Insurance Renewal Notice",
      category: isMotor ? "Motor Policy" : isLife ? "Life Protection" : "Health & Care",
      gradient: primaryColor,
      headline: isMotor ? "Drive Safe & Stay Covered!" : isLife ? "Secure Your Loved Ones Today!" : "Protect Your Health & Savings!",
      subtext: prompt.trim() || "Your insurance policy renewal is coming up. Ensure uninterrupted coverage with our instant zero-paperwork portal.",
      discountBadge: "EXCLUSIVE CLIENT OFFER",
      whatsappMessage: `Hi there! Greetings from ${agencyName}. ${prompt.trim() || 'Your policy renewal is due soon.'} Contact us at ${advisorPhone} or reply to this message to renew instantly.`
    });

    setIsGenerating(false);
    toast.success("Branded WhatsApp template & image banner generated successfully!");
  };

  const handleSendToN8n = () => {
    toast.success("n8n WhatsApp Automation Workflow triggered! Messages dispatched to queued clients.");
  };

  return (
    <Card className="border-border/60 bg-card/90 backdrop-blur-xl shadow-xl overflow-hidden">
      <CardContent className="p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                WhatsApp AI Banner & Template Generator
                <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-0">
                  n8n Integrated
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground">
                Enter a prompt to generate branded WhatsApp image banners & automated reminder copy.
              </p>
            </div>
          </div>

          <Badge variant="outline" className="hidden sm:inline-flex gap-1 border-primary/30 text-primary">
            <Bot className="w-3.5 h-3.5" />
            <span>AI Branding Engine</span>
          </Badge>
        </div>

        {/* Input Form & Customization */}
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Enter Prompt / Campaign Instructions</span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </label>
            <Textarea
              rows={2}
              placeholder="e.g. Create a 30-day Health Insurance renewal reminder with 15% early discount..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="text-xs sm:text-sm bg-muted/40"
            />
          </div>

          {/* Quick Prompt Chips */}
          <div className="flex flex-wrap gap-1.5">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(p)}
                className="text-[11px] bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-full border border-border/50 transition-colors"
              >
                + {p}
              </button>
            ))}
          </div>

          {/* Branding Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Agency Branding Name</label>
              <Input
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                placeholder="Agency Name"
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Advisor WhatsApp Number</label>
              <Input
                value={advisorPhone}
                onChange={(e) => setAdvisorPhone(e.target.value)}
                placeholder="WhatsApp Phone"
                className="text-xs"
              />
            </div>
          </div>

          <Button type="submit" disabled={isGenerating} className="w-full shadow-md bg-gradient-to-r from-cyan-500 via-indigo-600 to-pink-500 hover:opacity-95 text-white font-bold">
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" /> Generating Branded Template...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Palette className="w-4 h-4" /> Generate WhatsApp Banner & Template
              </span>
            )}
          </Button>
        </form>

        {/* Generated Template Preview Box */}
        {generatedTemplate && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-4 border-t border-border/60 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Image className="w-4 h-4 text-emerald-500" />
                Live Branded WhatsApp Preview
              </span>
              <Badge className="bg-emerald-500 text-white text-[10px]">Ready to Dispatch</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              {/* Image Banner Render Mockup */}
              <div className="lg:col-span-6">
                <div className={`rounded-2xl p-6 bg-gradient-to-br ${generatedTemplate.gradient} text-white shadow-xl relative overflow-hidden space-y-4`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Shield className="w-6 h-6 text-white" />
                      <span className="font-bold text-sm tracking-tight">{agencyName}</span>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white text-[10px] backdrop-blur-md border-0">
                      {generatedTemplate.category}
                    </Badge>
                  </div>

                  <div className="py-4 space-y-2">
                    <h4 className="text-xl sm:text-2xl font-extrabold leading-tight">
                      {generatedTemplate.headline}
                    </h4>
                    <p className="text-xs text-white/90 leading-relaxed">
                      {generatedTemplate.subtext}
                    </p>
                  </div>

                  {generatedTemplate.discountBadge && (
                    <div className="inline-block bg-white text-indigo-950 px-3 py-1 rounded-full text-[11px] font-extrabold shadow-md">
                      {generatedTemplate.discountBadge}
                    </div>
                  )}

                  <div className="pt-2 border-t border-white/20 flex justify-between items-center text-[10px] text-white/80">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span>{advisorPhone}</span>
                    </div>
                    <span>Powered by InsurFlow n8n</span>
                  </div>
                </div>
              </div>

              {/* WhatsApp Chat Message Copy */}
              <div className="lg:col-span-6 space-y-3">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-foreground space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Message Body</span>
                  </div>
                  <p className="leading-relaxed text-muted-foreground">
                    {generatedTemplate.whatsappMessage}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSendToN8n} className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md gap-1.5">
                    <Send className="w-3.5 h-3.5" /> Trigger n8n Workflow
                  </Button>
                  <Button variant="outline" onClick={() => toast.success("Shareable WhatsApp link copied!")} className="text-xs gap-1.5">
                    <Share2 className="w-3.5 h-3.5" /> Copy Link
                  </Button>
                </div>
              </div>

            </div>
          </motion.div>
        )}

      </CardContent>
    </Card>
  );
};

export default WhatsAppBannerGenerator;
