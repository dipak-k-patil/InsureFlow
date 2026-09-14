import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  BarChart3,
  MessageSquare,
  Zap,
  CheckCircle,
  FileText,
  BadgeDollarSign
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FeatureCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  title: string;
  description: string;
  highlights: string[];
  metrics: { label: string; value: string }[];
}

const categories: FeatureCategory[] = [
  {
    id: "leads",
    label: "Lead Management",
    icon: Users,
    title: "Capture, Qualify, & Nurture Every Insurance Prospect",
    description: "Never lose a potential client again. Streamline lead acquisition from Meta ads, web forms, and WhatsApp directly into an intuitive sales pipeline.",
    highlights: [
      "Automated WhatsApp & Email auto-responders",
      "Lead stage tracking & priority scoring",
      "Instant assignment to sales team members",
      "Detailed lead interaction timeline"
    ],
    metrics: [
      { label: "Response Time", value: "< 2 mins" },
      { label: "Conversion Lift", value: "+38%" }
    ]
  },
  {
    id: "policies",
    label: "Policy Management",
    icon: ShieldCheck,
    title: "Complete Digital Vault for All Insurance Products",
    description: "Effortlessly log Motor, Health, Term Life, and Commercial policies. Access policy documents, client details, and premium schedules instantly.",
    highlights: [
      "Multi-carrier policy aggregation",
      "Document vault with quick PDF downloads",
      "Flexible payment frequency tracking",
      "Automated policy status updates"
    ],
    metrics: [
      { label: "Data Accuracy", value: "99.9%" },
      { label: "Policy Retrieval", value: "< 1 sec" }
    ]
  },
  {
    id: "marketing",
    label: "AI Marketing Suite",
    icon: Sparkles,
    title: "Generate Marketing Creatives & Presentations in Seconds",
    description: "Empower your agency with built-in AI tools. Generate customized social media graphics, client presentations, festival greetings, and video scripts.",
    highlights: [
      "AI Post & Banner Generator for social media",
      "Branded festival & greeting templates",
      "Automated client presentation deck builder",
      "AI video marketing scriptwriter"
    ],
    metrics: [
      { label: "Content Created", value: "10x Faster" },
      { label: "Client Engagement", value: "+65%" }
    ]
  },
  {
    id: "renewals",
    label: "Renewals & Commissions",
    icon: RefreshCw,
    title: "Maximized Retention & Automated Commission Payouts",
    description: "Proactively send renewal notices via WhatsApp before policies lapse, while tracking tiered commission rules across carriers and agents in real time.",
    highlights: [
      "Multi-channel renewal alerts (WhatsApp, Email)",
      "Automated commission calculation & splitting",
      "Renewal pipeline forecasting",
      "Carrier payout reconciliation logs"
    ],
    metrics: [
      { label: "Renewal Rate", value: "94%" },
      { label: "Payout Leakage", value: "0%" }
    ]
  }
];

export const FeaturesSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("leads");

  const currentCategory = categories.find((c) => c.id === activeTab) || categories[0];

  return (
    <section id="features" className="py-20 bg-muted/20 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="outline" className="mb-3 px-3 py-1 border-primary/30 text-primary">
            Product Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Everything Your Insurance Business Needs
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            Purpose-built tools designed specifically for modern insurance agencies, advisors, and brokerages.
          </p>
        </div>

        {/* Feature Category Tabs */}
        <div className="flex justify-center mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-3xl">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 h-auto p-1.5 bg-muted/80 rounded-xl gap-1">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-medium rounded-lg transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="truncate">{category.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

        {/* Dynamic Feature Content Box */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCategory.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="max-w-5xl mx-auto"
          >
            <Card className="border-border/60 shadow-xl overflow-hidden bg-card">
              <CardContent className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

                {/* Text & Highlights Column */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 text-xs font-semibold text-primary">
                    <currentCategory.icon className="w-4 h-4" />
                    <span>{currentCategory.label} Module</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {currentCategory.title}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed">
                    {currentCategory.description}
                  </p>

                  <div className="space-y-2.5 pt-2">
                    {currentCategory.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-foreground">{highlight}</span>
                      </div>
                    ))}
                  </div>

                  {/* Highlight Metrics */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/60">
                    {currentCategory.metrics.map((metric, idx) => (
                      <div key={idx} className="bg-muted/40 p-3.5 rounded-lg border border-border/40">
                        <span className="text-xs text-muted-foreground block font-medium">{metric.label}</span>
                        <span className="text-xl font-bold text-primary mt-0.5 block">{metric.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual Feature Mockup Column */}
                <div className="lg:col-span-5">
                  <div className="relative rounded-2xl p-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10 border border-primary/20 shadow-inner space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold text-foreground">Live Workflow Preview</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">Active</Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-background/80 rounded-lg border border-border/60 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-xs font-semibold">Auto WhatsApp Trigger</p>
                            <p className="text-[10px] text-muted-foreground">Renewal notice sent to client</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-500 font-medium">Delivered</span>
                      </div>

                      <div className="p-3 bg-background/80 rounded-lg border border-border/60 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                          <BadgeDollarSign className="w-4 h-4 text-emerald-500" />
                          <div>
                            <p className="text-xs font-semibold">Commission Logged</p>
                            <p className="text-[10px] text-muted-foreground">15% carrier split credited</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-primary font-bold">+$320.00</span>
                      </div>

                      <div className="p-3 bg-background/80 rounded-lg border border-border/60 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-indigo-500" />
                          <div>
                            <p className="text-xs font-semibold">Policy PDF Auto-Vault</p>
                            <p className="text-[10px] text-muted-foreground">Encrypted backup created</p>
                          </div>
                        </div>
                        <BarChart3 className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default FeaturesSection;
