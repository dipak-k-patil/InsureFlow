import { motion } from "framer-motion";
import { Check, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    price: "₹999",
    period: "/month",
    desc: "Perfect for individual agents",
    features: ["50 Leads", "25 Policies", "Basic Automation", "Email Support"],
    icon: Zap,
    current: false,
  },
  {
    name: "Professional",
    price: "₹2,499",
    period: "/month",
    desc: "For growing agencies",
    features: ["500 Leads", "250 Policies", "AI Marketing Tools", "WhatsApp Integration", "Priority Support", "Commission Tracking"],
    icon: Crown,
    current: true,
  },
  {
    name: "Enterprise",
    price: "₹4,999",
    period: "/month",
    desc: "For large agencies",
    features: ["Unlimited Leads", "Unlimited Policies", "All AI Tools", "Full Automation Suite", "Dedicated Support", "Custom Integrations", "Multi-Branch"],
    icon: Crown,
    current: false,
  },
];

export default function SubscriptionPage() {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground">Subscription Plans</h1>
        <p className="text-muted-foreground mt-2">Choose the plan that fits your agency</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glow-card hover-lift p-6 flex flex-col ${plan.current ? "border-primary/40 stat-glow-cyan" : ""}`}
          >
            <div className="flex items-center gap-2 mb-4">
              <plan.icon className={`w-5 h-5 ${plan.current ? "text-primary" : "text-muted-foreground"}`} />
              <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
            </div>
            <div className="mb-2">
              <span className="text-3xl font-bold text-foreground">{plan.price}</span>
              <span className="text-sm text-muted-foreground">{plan.period}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">{plan.desc}</p>
            <ul className="space-y-2.5 mb-6 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="w-4 h-4 text-success shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Button variant={plan.current ? "default" : "outline"} className="w-full">
              {plan.current ? "Current Plan" : "Upgrade"}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
