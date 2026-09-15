import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import LiveChatBot from "@/components/LiveChatBot";

describe("LiveChatBot Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("renders floating chat toggle button and opens dialog upon click", () => {
    render(<LiveChatBot />);

    const toggleBtn = screen.getByRole("button", { name: /Toggle Live Chat/i });
    expect(toggleBtn).toBeDefined();

    // Dialog should not be visible initially
    expect(screen.queryByText("Insureflow Assistant")).toBeNull();

    // Click toggle button
    fireEvent.click(toggleBtn);

    // Dialog header and welcome message should now be visible
    expect(screen.getByText("Insureflow Assistant")).toBeDefined();
    expect(
      screen.getByText(/👋 Hi there! Welcome to Insureflow/i)
    ).toBeDefined();
  });

  it("allows user to click quick prompts and receive an automated bot reply", async () => {
    render(<LiveChatBot />);

    const toggleBtn = screen.getByRole("button", { name: /Toggle Live Chat/i });
    fireEvent.click(toggleBtn);

    // Click quick prompt "How does Insureflow work?" button
    const quickPromptBtn = screen.getByRole("button", { name: "How does Insureflow work?" });
    fireEvent.click(quickPromptBtn);

    // Check that prompt text exists in messages
    expect(screen.getAllByText("How does Insureflow work?").length).toBeGreaterThan(0);

    // Fast-forward timers for simulated bot response
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Bot response should be rendered
    expect(
      screen.getByText(/Insureflow is an all-in-one automation platform for insurance agencies/i)
    ).toBeDefined();
  });

  it("allows user to type a message and send it", () => {
    render(<LiveChatBot />);

    const toggleBtn = screen.getByRole("button", { name: /Toggle Live Chat/i });
    fireEvent.click(toggleBtn);

    const input = screen.getByPlaceholderText("Ask a question...");
    fireEvent.change(input, { target: { value: "Can I integrate WhatsApp?" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(screen.getByText("Can I integrate WhatsApp?")).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(
      screen.getByText(/Thanks for reaching out! Our AI support assistant is online/i)
    ).toBeDefined();
  });
});
