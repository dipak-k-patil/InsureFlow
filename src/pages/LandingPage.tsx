import React, { useState } from "react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import WhatsAppBannerGenerator from "@/components/WhatsAppBannerGenerator";
import SolutionsSection from "@/components/landing/SolutionsSection";
import ContactSection from "@/components/landing/ContactSection";
import LandingFooter from "@/components/landing/LandingFooter";
import AIChatBot from "@/components/landing/AIChatBot";

export const LandingPage: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-cyan-500 selection:text-white relative">
      <LandingNavbar />
      <main className="flex-1 space-y-12">
        <HeroSection onOpenChat={() => setIsChatOpen(true)} />
        <FeaturesSection />

        {/* WhatsApp AI Banner & Template Generator Interactive Showcase */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
              Interactive WhatsApp AI Marketing & Banner Generator
            </h2>
            <p className="mt-2 text-muted-foreground text-sm sm:text-base">
              Give system a prompt (e.g. Diwali discount, policy renewal reminder), customize branding, and trigger automated n8n WhatsApp message dispatch in real-time.
            </p>
          </div>
          <WhatsAppBannerGenerator />
        </section>

        <SolutionsSection />
        <ContactSection />
      </main>
      <LandingFooter />

      {/* Floating AI Chatbot Assistant */}
      <AIChatBot isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />
    </div>
  );
};

export default LandingPage;
