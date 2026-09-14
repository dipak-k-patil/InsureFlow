import React from "react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import ContactSection from "@/components/landing/ContactSection";
import LandingFooter from "@/components/landing/LandingFooter";

export const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-16">
      <LandingNavbar />
      <main className="flex-1">
        <ContactSection />
      </main>
      <LandingFooter />
    </div>
  );
};

export default ContactPage;
