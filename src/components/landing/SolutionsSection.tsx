import React, { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Star, Check, HelpCircle, Building2, UserCheck, Bot } from "lucide-react";

const solutions = [
  {
    title: "Independent Agents & Brokers",
    description: "Consolidate policies, track commission payouts across multiple insurance carriers, and automate client WhatsApp reminders.",
    icon: UserCheck,
    features: ["Commission breakdown", "Instant policy search", "WhatsApp integration"]
  },
  {
    title: "Agency Organizations & MGAs",
    description: "Manage multi-agent hierarchy, assign lead queues, monitor sales activity, and automate commission splits.",
    icon: Building2,
    features: ["Agent hierarchy & permission", "Automated lead distribution", "Team performance analytics"]
  },
  {
    title: "Digital Insurance Marketers",
    description: "Scale lead generation with AI post generators, instant banner designs, and campaign landing pages.",
    icon: Bot,
    features: ["AI content generation", "Social post maker", "Lead hook webhooks"]
  }
];

const testimonials = [
  {
    name: "Rajesh Sharma",
    role: "Managing Director, Zenith Financial",
    quote: "Switching to this platform boosted our policy renewal rate from 72% to 94% within 3 months. The automated WhatsApp reminders do all the heavy lifting.",
    rating: 5,
    metrics: "94% Renewal Retention"
  },
  {
    name: "Ananya Deshmukh",
    role: "Senior Insurance Consultant",
    quote: "The AI Marketing tools have saved me at least 10 hours a week on client presentations and festival campaign banners. Absolutely irreplaceable!",
    rating: 5,
    metrics: "10+ Hours Saved / Week"
  },
  {
    name: "Vikram Mehta",
    role: "Founder, Apex Risk Solutions",
    quote: "Tracking complex commission splits between sub-agents used to be a nightmare in spreadsheets. Now it's 100% automated and error-free.",
    rating: 5,
    metrics: "Zero Commission Errors"
  }
];

const faqs = [
  {
    question: "How does the platform integrate with my current lead sources?",
    answer: "We support webhook endpoints and instant API integrations for Facebook Ads, Google Ads, website forms, and WhatsApp Business, allowing automatic lead capture without manual entry."
  },
  {
    question: "Can I manage multiple insurance carriers and commission structures?",
    answer: "Yes! You can define custom commission tiers, fixed percentages, or flat fees per carrier and insurance type (Health, Life, Motor, Commercial) with automated calculation."
  },
  {
    question: "Is client data stored securely?",
    answer: "We use enterprise-grade end-to-end encryption, strict role-based access controls, and secure database backups to ensure full data privacy and compliance."
  },
  {
    question: "Can I try the platform before committing to a plan?",
    answer: "Absolutely. We offer a full 14-day free trial with full access to all features so you can test all tools with your real workflow."
  }
];

export const SolutionsSection: React.FC = () => {
  const [activeSolution, setActiveSolution] = useState<number>(0);

  return (
    <section id="solutions" className="py-20 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-3 px-3 py-1 border-primary/30 text-primary">
            Solutions Built for All Needs
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Tailored to How You Run Your Insurance Business
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            Whether you are a solo insurance advisor or managing a growing multi-agent team, our platform adapts to your workflow.
          </p>
        </div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {solutions.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = activeSolution === idx;
            return (
              <motion.div
                key={item.title}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                onClick={() => setActiveSolution(idx)}
                className="cursor-pointer"
              >
                <Card className={`h-full border transition-all ${isSelected ? "border-primary ring-2 ring-primary/20 shadow-lg bg-primary/5" : "border-border/60 hover:border-primary/50"}`}>
                  <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{item.description}</p>
                    </div>

                    <div className="space-y-2 border-t border-border/50 pt-4">
                      {item.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2 text-xs font-medium text-foreground">
                          <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Social Proof / Testimonials */}
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
              Trusted by Top-Performing Insurance Advisors
            </h3>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              See how leaders in the insurance industry achieve consistent growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <Card key={idx} className="border-border/60 bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-6 space-y-4 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex gap-1 mb-3">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-foreground italic leading-relaxed">"{t.quote}"</p>
                  </div>

                  <div className="border-t border-border/50 pt-4 flex justify-between items-end">
                    <div>
                      <p className="text-sm font-bold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-semibold text-primary bg-primary/10 border-0">
                      {t.metrics}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground mb-2">
              <HelpCircle className="w-3.5 h-3.5 text-primary" />
              <span>Got Questions?</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
              Frequently Asked Questions
            </h3>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border border-border/60 rounded-xl px-4 bg-card">
                <AccordionTrigger className="text-left font-semibold text-sm sm:text-base hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

      </div>
    </section>
  );
};

export default SolutionsSection;
