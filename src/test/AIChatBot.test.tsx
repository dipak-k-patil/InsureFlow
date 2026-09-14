import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AIChatBot from "@/components/landing/AIChatBot";
import Avatar3D from "@/components/landing/Avatar3D";

describe("AI Chatbot & 3D Character Avatar Component Tests", () => {
  it("renders 3D Character Avatar with greeting speech bubble", () => {
    render(<Avatar3D />);
    expect(screen.getByText(/AURA AI/i)).toBeInTheDocument();
    expect(screen.getByText(/Chat with Aura/i)).toBeInTheDocument();
  });

  it("triggers callback when clicking Chat with Aura button on 3D Avatar", () => {
    const onOpenChat = vi.fn();
    render(<Avatar3D onOpenChat={onOpenChat} />);

    const chatButton = screen.getByText(/Chat with Aura/i);
    fireEvent.click(chatButton);

    expect(onOpenChat).toHaveBeenCalled();
  });

  it("renders floating AI Chatbot trigger button when closed", () => {
    render(<AIChatBot isOpen={false} />);
    expect(screen.getByText(/Ask Aura AI Anything!/i)).toBeInTheDocument();
  });

  it("renders AI Chatbot overlay and responds to user query when open", async () => {
    render(<AIChatBot isOpen={true} />);

    expect(screen.getByText(/Aura AI Assistant/i)).toBeInTheDocument();
    expect(screen.getByText(/Welcome to InsurFlow.ai!/i)).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/Ask about leads, renewals, commissions/i);
    fireEvent.change(input, { target: { value: "Tell me about WhatsApp renewals" } });

    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(screen.getByText(/Tell me about WhatsApp renewals/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Our automated WhatsApp Renewal module connects directly/i)).toBeInTheDocument();
    }, { timeout: 1500 });
  });
});
