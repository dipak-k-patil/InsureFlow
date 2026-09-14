import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  ShieldAlert,
  Calculator,
  Check,
  ChevronRight,
  Maximize2,
  Minimize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  options?: string[];
  actionType?: "quote" | "contact" | "demo";
}

interface AIChatBotProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const suggestedPrompts = [
  "💡 How do automated WhatsApp renewals work?",
  "💰 Calculate my agency commission splits",
  "🛡️ What insurance carriers are supported?",
  "🚀 Book a live 1-on-1 platform demo"
];

const knowledgeBaseResponse = (query: string): { text: string; options?: string[] } => {
  const lower = query.toLowerCase();

  if (lower.includes("whatsapp") || lower.includes("renewal")) {
    return {
      text: "⚡ Our automated WhatsApp Renewal module connects directly to your policy database! It automatically sends policy expiry notices 30, 15, and 3 days before renewal with direct payment links, boosting client retention by up to 94%.",
      options: ["Calculate ROI", "Book Demo", "Ask something else"]
    };
  }

  if (lower.includes("commission") || lower.includes("split") || lower.includes("calculate")) {
    return {
      text: "📊 InsurFlow supports multi-tiered commission rules per carrier and sub-agent! You can set up custom percentage splits (e.g., 70% agent / 30% agency) or flat fees with automated real-time payouts tracking.",
      options: ["See pricing plans", "Try ROI Calculator", "Connect with sales"]
    };
  }

  if (lower.includes("carrier") || lower.includes("supported") || lower.includes("company")) {
    return {
      text: "🏢 We support all major insurance carriers across Motor, Health, Life, Term, and Commercial lines with instant CSV import & direct API integration capability.",
      options: ["Book live demo", "Start 14-day trial"]
    };
  }

  if (lower.includes("demo") || lower.includes("trial") || lower.includes("book")) {
    return {
      text: "🎉 Fantastic! You can start a full 14-day free trial right now without a credit card or schedule a personalized walkthrough with an insurance tech specialist.",
      options: ["Sign Up Free", "Contact Sales"]
    };
  }

  return {
    text: "🤖 I'm Aura, InsurFlow's AI Assistant! I can help you streamline lead capture, automate renewal reminders, calculate agent commissions, or set up AI marketing posts.",
    options: ["How do WhatsApp renewals work?", "Calculate commission splits", "Book live demo"]
  };
};

export const AIChatBot: React.FC<AIChatBotProps> = ({ isOpen: externalIsOpen, onToggle }) => {
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "👋 Welcome to InsurFlow.ai! I'm Aura, your AI assistant. How can I help supercharge your insurance agency today?",
      options: ["WhatsApp Renewals", "Commission Splits", "Book Demo"]
    }
  ]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const toggleOpen = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputValue.trim();
    if (!text) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: text
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const response = knowledgeBaseResponse(text);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: response.text,
        options: response.options
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <>
      {/* Floating Widget Trigger Button */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3"
        >
          {/* Helper Chip Banner */}
          <div className="hidden sm:flex items-center gap-2 bg-card/90 border border-primary/30 backdrop-blur-md px-3.5 py-2 rounded-full shadow-lg text-xs font-semibold text-foreground">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span>Ask Aura AI Anything!</span>
          </div>

          <Button
            onClick={toggleOpen}
            size="lg"
            className="w-14 h-14 rounded-full shadow-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:scale-105 transition-transform relative p-0"
          >
            <Bot className="w-7 h-7 text-white" />
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-background rounded-full" />
          </Button>
        </motion.div>
      )}

      {/* Chat Drawer / Window Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className={`fixed z-50 bg-card border border-border/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl transition-all ${
              isExpanded
                ? "inset-4 sm:inset-10 md:inset-16"
                : "bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px]"
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 p-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm tracking-tight">Aura AI Assistant</h3>
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-emerald-400/20 text-emerald-200 border-0">
                      Online
                    </Badge>
                  </div>
                  <p className="text-[11px] text-white/80">Insurance Automation Specialist</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 text-white hover:bg-white/20 rounded-lg"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 text-white hover:bg-white/20 rounded-lg"
                  onClick={toggleOpen}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Chat Body */}
            <ScrollArea className="flex-1 p-4 space-y-4">
              <div className="space-y-4 pb-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.sender === "bot" && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div className="max-w-[80%] space-y-2">
                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-primary text-primary-foreground rounded-br-none shadow-md"
                            : "bg-muted/80 text-foreground rounded-bl-none border border-border/50"
                        }`}
                      >
                        {msg.text}
                      </div>

                      {/* Interactive Option Chips */}
                      {msg.options && msg.options.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {msg.options.map((opt, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSend(opt)}
                              className="text-[11px] font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1"
                            >
                              <span>{opt}</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {msg.sender === "user" && (
                      <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-3 items-center text-muted-foreground text-xs italic">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Bot className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="bg-muted p-3 rounded-2xl rounded-bl-none flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Quick Prompts Bar */}
            <div className="px-4 py-2 bg-muted/30 border-t border-border/50 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p)}
                  className="text-[11px] text-muted-foreground hover:text-foreground bg-card hover:bg-muted border border-border/60 px-3 py-1 rounded-full transition-colors shrink-0"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Footer Form */}
            <div className="p-3 bg-card border-t border-border/60 flex items-center gap-2">
              <Input
                placeholder="Ask about leads, renewals, commissions..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="text-xs sm:text-sm bg-muted/40 border-border/60 focus-visible:ring-primary"
              />
              <Button
                size="icon"
                onClick={() => handleSend()}
                disabled={!inputValue.trim()}
                className="shrink-0 bg-primary shadow-md"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatBot;
