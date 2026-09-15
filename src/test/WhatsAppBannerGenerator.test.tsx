import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import WhatsAppBannerGenerator from "@/components/WhatsAppBannerGenerator";

describe("WhatsApp Banner Generator Component Tests", () => {
  it("renders generator header and campaign prompt label", () => {
    render(<WhatsAppBannerGenerator />);

    expect(screen.getByText(/WhatsApp AI Banner & Template Generator/i)).toBeInTheDocument();
    expect(screen.getByText(/Enter Prompt \/ Campaign Instructions/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Generate WhatsApp Banner & Template/i })).toBeInTheDocument();
  });

  it("updates prompt input and generates new WhatsApp banner", () => {
    render(<WhatsAppBannerGenerator />);

    const textarea = screen.getByPlaceholderText(/Create a 30-day Health Insurance renewal reminder/i);
    fireEvent.change(textarea, { target: { value: "Create a Motor Insurance expiry alert" } });

    const generateBtn = screen.getByRole("button", { name: /Generate WhatsApp Banner & Template/i });
    fireEvent.click(generateBtn);

    expect(screen.getAllByText(/Motor Insurance Expiry Alert/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Drive Safe & Stay Covered!/i)).toBeInTheDocument();
  });

  it("allows setting agency branding name and phone number", () => {
    render(<WhatsAppBannerGenerator />);

    const agencyInput = screen.getByPlaceholderText("Agency Name");
    const phoneInput = screen.getByPlaceholderText("WhatsApp Phone");

    fireEvent.change(agencyInput, { target: { value: "Zenith Risk Corp" } });
    fireEvent.change(phoneInput, { target: { value: "+1 (555) 999-1234" } });

    expect(agencyInput).toHaveValue("Zenith Risk Corp");
    expect(phoneInput).toHaveValue("+1 (555) 999-1234");
  });
});
