import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Sparkles, Minimize2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  "How does Insureflow work?",
  "Tell me about Pricing & Plans",
  "How do automated renewals work?",
  "Book a live demo"
];

const BOT_RESPONSES: Record<string, string> = {
  "How does Insureflow work?":
    "Insureflow is an all-in-one automation platform for insurance agencies. It syncs with your CRM/lead sources, automates client follow-ups via WhatsApp and SMS, and tracks policy renewals seamlessly.",
  "Tell me about Pricing & Plans":
    "We offer Starter, Professional, and Enterprise plans customized for insurance brokers and agencies. Visit our Pricing section or speak to our team for a tailored quote!",
  "How do automated renewals work?":
    "Insureflow automatically monitors policy expiration dates and sends automated WhatsApp/SMS renewal reminders to policyholders 60, 30, and 7 days before renewal.",
  "Book a live demo":
    "We'd love to show you Insureflow in action! Please fill out our contact form or leave your email here, and our specialist will schedule a personalized walkthrough."
};

const DEFAULT_RESPONSE =
  "Thanks for reaching out! Our AI support assistant is online. You can ask about features, integrations, pricing, or request a live demo.";

export const LiveChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [hasUnread, setHasUnread] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "👋 Hi there! Welcome to Insureflow. How can I help you streamline your insurance operations today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
    }
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage("");

    // Simulate bot response after delay
    setTimeout(() => {
      const responseText = BOT_RESPONSES[text] || DEFAULT_RESPONSE;
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: "bot",
        text: "Chat cleared. Feel free to ask any question about Insureflow!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[360px] sm:w-[400px] h-[500px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-foreground/10 rounded-full">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-sm flex items-center gap-1.5">
                  Insureflow Assistant
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-primary-foreground/30 text-primary-foreground">
                    <Sparkles className="h-2.5 w-2.5 mr-1 inline" /> AI
                  </Badge>
                </h3>
                <p className="text-xs text-primary-foreground/80 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  Online
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 rounded-full"
                onClick={handleClearHistory}
                title="Clear Chat"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 rounded-full"
                onClick={() => setIsOpen(false)}
                title="Minimize"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/20">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm shadow-sm ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-background border border-border text-foreground rounded-bl-none"
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1 text-right ${
                      msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
                {msg.sender === "user" && (
                  <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0 mt-1">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-2 bg-background border-t border-border flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="text-[11px] bg-secondary hover:bg-secondary/80 text-secondary-foreground px-2.5 py-1 rounded-full border border-border transition-colors text-left"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-background border-t border-border flex items-center gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              className="text-xs sm:text-sm focus-visible:ring-primary"
            />
            <Button
              size="icon"
              className="shrink-0 h-9 w-9 rounded-xl"
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <Button
        onClick={() => setIsOpen((prev) => !prev)}
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-transform hover:scale-105 active:scale-95 relative"
        aria-label="Toggle Live Chat"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <MessageSquare className="h-6 w-6" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 border-2 border-background flex items-center justify-center text-[10px] font-bold text-white">
                1
              </span>
            )}
          </>
        )}
      </Button>
    </div>
  );
};

export default LiveChatBot;
