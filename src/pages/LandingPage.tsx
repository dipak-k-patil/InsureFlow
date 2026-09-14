import React, { useState } from "react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import SolutionsSection from "@/components/landing/SolutionsSection";
import ContactSection from "@/components/landing/ContactSection";
import LandingFooter from "@/components/landing/LandingFooter";
import AIChatBot from "@/components/landing/AIChatBot";

export const LandingPage: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-cyan-500 selection:text-white relative">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection onOpenChat={() => setIsChatOpen(true)} />
        <FeaturesSection />
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
