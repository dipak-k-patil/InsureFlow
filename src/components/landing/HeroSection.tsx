import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ShieldCheck, TrendingUp, Users, Calculator, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import Avatar3D from "@/components/landing/Avatar3D";
import { ThreeDCharacter } from "@/components/ThreeDCharacter";

interface HeroSectionProps {
  onOpenChat?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenChat }) => {
  const [agentsCount, setAgentsCount] = useState<number>(8);
  const [avgPolicies, setAvgPolicies] = useState<number>(35);

  const estimatedHoursSaved = agentsCount * avgPolicies * 1.5;
  const estimatedRevenueIncrease = Math.round(agentsCount * avgPolicies * 480);

  return (
    <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28 bg-gradient-to-b from-background via-violet-950/20 via-slate-900/40 to-background">

      {/* Dynamic Colorful Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-cyan-500/15 blur-[120px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[350px] bg-pink-500/15 blur-[120px] rounded-full pointer-events-none animate-pulse [animation-delay:2s]" />
      <div className="absolute bottom-10 left-1/3 w-[400px] h-[300px] bg-violet-500/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left Column: Headline and Call To Action */}
          <motion.div
            className="lg:col-span-7 text-left space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-pink-500/20 border border-cyan-500/30 text-xs sm:text-sm font-semibold text-cyan-300 shadow-sm">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Kadmak (kadmak.in) • Next-Gen AI Insurance Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Automate Your Agency With <br />
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-500 bg-clip-text text-transparent">
              <span className="bg-gradient-to-r from-cyan-400 via-primary to-purple-500 bg-clip-text text-transparent">
                Kadmak 3D AI Assistant
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Manage leads, automate policy renewals, streamline commissions, and unleash AI marketing—all with your personal welcoming 3D AI assistant.
            </p>

            {/* Feature Highlights */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Instant Lead Capture</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Automated WhatsApp Reminders</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>3D AI Welcoming Assistant</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="px-8 text-base shadow-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-pink-500 hover:opacity-95 transition-all group border-0 text-white font-bold" asChild>
                <Link to="/auth">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button size="lg" variant="outline" className="px-8 text-base border-primary/40 bg-card/60 backdrop-blur-md" asChild>
                <a href="#demo-calculator">
                  <Calculator className="mr-2 w-5 h-5 text-cyan-400" />
                  Calculate ROI
                </a>
              </Button>
            </div>

            {/* Social Proof Mini Bar */}
            <div className="pt-6 border-t border-border/50 flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Enterprise Grade Security</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>99.9% Renewal Retention</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: 3D Welcoming Avatar & Interactive ROI Simulator */}
          <motion.div
            id="demo-calculator"
            className="lg:col-span-5 space-y-6"
          {/* Right Column: 3D Character & Interactive ROI Preview Widget */}
          <motion.div
            id="demo-calculator"
            className="lg:col-span-5 flex flex-col gap-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* 3D Welcoming Character */}
            <div className="flex justify-center">
              <Avatar3D onOpenChat={onOpenChat} />
            </div>

            {/* Interactive ROI Simulator Card */}
            <Card className="border-cyan-500/30 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden relative">
              <div className="bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-pink-500/20 p-4 border-b border-border/50 flex items-center justify-between">
            {/* 3D Character Hero Highlight */}
            <div className="flex justify-center my-2">
              <ThreeDCharacter size="md" />
            </div>

            <Card className="border-border/60 bg-card/80 backdrop-blur-lg shadow-2xl overflow-hidden relative">
              <div className="bg-gradient-to-r from-primary/10 to-indigo-500/10 p-4 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-xs font-bold text-foreground ml-2">Agency ROI Simulator</span>
                </div>
                <Users className="w-4 h-4 text-cyan-400" />
              </div>

              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-foreground">Team Size (Agents)</label>
                    <span className="text-sm font-bold text-cyan-400">{agentsCount} agents</span>
                  </div>
                  <Slider
                    value={[agentsCount]}
                    min={1}
                    max={50}
                    step={1}
                    onValueChange={(val) => setAgentsCount(val[0])}
                    className="cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-foreground">Policies Sold / Month</label>
                    <span className="text-sm font-bold text-cyan-400">{avgPolicies} policies</span>
                  </div>
                  <Slider
                    value={[avgPolicies]}
                    min={5}
                    max={200}
                    step={5}
                    onValueChange={(val) => setAvgPolicies(val[0])}
                    className="cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Hours Saved / Mo</p>
                    <p className="text-2xl font-extrabold text-cyan-400 mt-1">{estimatedHoursSaved} hrs</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Est. Revenue Lift</p>
                    <p className="text-2xl font-extrabold text-emerald-400 mt-1">
                      ${estimatedRevenueIncrease.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <Link
                    to="/auth"
                    className="text-xs font-bold text-cyan-400 hover:underline inline-flex items-center gap-1"
                  >
                    Start capturing these gains today
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
