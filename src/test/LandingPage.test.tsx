import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import ContactSection from "@/components/landing/ContactSection";
import LandingNavbar from "@/components/landing/LandingNavbar";

describe("Interactive Landing & Contact Components", () => {
  it("renders LandingNavbar with Kadmak logo image and kadmak.in branding", () => {
    render(
      <BrowserRouter>
        <LandingNavbar />
      </BrowserRouter>
    );

    const logoImg = screen.getByAltText(/Kadmak Logo/i);
    expect(logoImg).toBeInTheDocument();
    expect(logoImg).toHaveAttribute("src", "/insureflow-logo.png");
    expect(screen.getAllByText(/Kadmak/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/kadmak.in/i)).toBeInTheDocument();
  });

  it("renders Hero Section with headline, Kadmak 3D AI Assistant, and ROI calculator", () => {
    render(
      <BrowserRouter>
        <HeroSection />
      </BrowserRouter>
    );

    expect(screen.getByText(/Automate Your Agency With/i)).toBeInTheDocument();
    expect(screen.getByText(/Kadmak 3D AI Assistant/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Assistant Active/i)).toBeInTheDocument();
    expect(screen.getByText(/Interactive Agency ROI Simulator/i)).toBeInTheDocument();
    expect(screen.getByText(/Calculate ROI/i)).toBeInTheDocument();
  });

  it("renders FeaturesSection with default Lead Management tab", () => {
    render(
      <BrowserRouter>
        <FeaturesSection />
      </BrowserRouter>
    );

    expect(screen.getByText(/Capture, Qualify, & Nurture Every Insurance Prospect/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Lead Management/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/AI Marketing Suite/i)).toBeInTheDocument();
  });

  it("renders and validates ContactSection form inputs", () => {
    render(
      <BrowserRouter>
        <ContactSection />
      </BrowserRouter>
    );

    expect(screen.getByText(/Get in Touch with Our Team/i)).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText("e.g. John Doe");
    const emailInput = screen.getByPlaceholderText("john@agency.com");
    const messageInput = screen.getByPlaceholderText(/Tell us about your agency size/i);

    fireEvent.change(nameInput, { target: { value: "Jane Advisor" } });
    fireEvent.change(emailInput, { target: { value: "jane@advisor.com" } });
    fireEvent.change(messageInput, { target: { value: "We want a demo for 15 agents." } });

    expect(nameInput).toHaveValue("Jane Advisor");
    expect(emailInput).toHaveValue("jane@advisor.com");
    expect(messageInput).toHaveValue("We want a demo for 15 agents.");
  });
});
