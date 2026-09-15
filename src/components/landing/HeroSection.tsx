import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ShieldCheck, TrendingUp, Users, Calculator, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ThreeDCharacter } from "@/components/ThreeDCharacter";

export const HeroSection: React.FC = () => {
  const [agentsCount, setAgentsCount] = useState<number>(5);
  const [avgPolicies, setAvgPolicies] = useState<number>(20);

  // Simple calculation formula for demo ROI
  const estimatedHoursSaved = agentsCount * avgPolicies * 1.5;
  const estimatedRevenueIncrease = Math.round(agentsCount * avgPolicies * 450);

  return (
    <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28 bg-gradient-to-b from-background via-muted/30 to-background">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-secondary/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left Column: Headline and Call To Action */}
          <motion.div
            className="lg:col-span-7 text-left space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs sm:text-sm font-medium text-primary">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span>Kadmak (kadmak.in) • Next-Gen AI Insurance Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Automate Your Agency With <br />
              <span className="bg-gradient-to-r from-cyan-400 via-primary to-purple-500 bg-clip-text text-transparent">
                Kadmak 3D AI Assistant
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Manage leads, automate policy renewals, streamline commissions, and unleash AI-driven marketing campaigns—all from one interactive command center.
            </p>

            {/* Quick Feature Badges */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Instant Lead Capture</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Automated WhatsApp Reminders</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Real-time Commission Tracking</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="px-8 text-base shadow-lg hover:shadow-primary/25 transition-all group" asChild>
                <Link to="/auth">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button size="lg" variant="outline" className="px-8 text-base" asChild>
                <a href="#demo-calculator">
                  <Calculator className="mr-2 w-5 h-5 text-primary" />
                  Calculate ROI
                </a>
              </Button>
            </div>

            {/* Social Proof Mini Bar */}
            <div className="pt-6 border-t border-border/50 flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Enterprise Grade Security</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>99.9% Renewal Retention</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: 3D Character & Interactive ROI Preview Widget */}
          <motion.div
            id="demo-calculator"
            className="lg:col-span-5 flex flex-col gap-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
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
                  <span className="text-xs font-semibold text-muted-foreground ml-2">Interactive Agency ROI Simulator</span>
                </div>
                <Users className="w-4 h-4 text-primary" />
              </div>

              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-foreground">Team Size (Agents)</label>
                    <span className="text-sm font-bold text-primary">{agentsCount} agents</span>
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
                    <span className="text-sm font-bold text-primary">{avgPolicies} policies</span>
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
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Hours Saved / Mo</p>
                    <p className="text-2xl font-extrabold text-primary mt-1">{estimatedHoursSaved} hrs</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Est. Extra Revenue</p>
                    <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                      ${estimatedRevenueIncrease.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <Link
                    to="/auth"
                    className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
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
