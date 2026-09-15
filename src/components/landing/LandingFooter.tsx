import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Send, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Logo from "@/components/Logo";

export const LandingFooter: React.FC = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Subscribed! Thank you for joining our newsletter.");
    setEmail("");
  };

  return (
    <footer className="bg-muted/80 border-t border-border/60 text-muted-foreground pt-16 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-border/60">

          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="md" />
            <p className="text-sm leading-relaxed max-w-sm pt-2">
              The all-in-one interactive operating system for modern insurance advisors, agencies, and brokerages.
            </p>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <p className="text-xs font-semibold text-foreground mb-2">Subscribe to our newsletter</p>
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background text-sm"
                  required
                />
                <Button type="submit" size="sm" className="shrink-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>

          {/* Links Col 1 */}
          <div className="space-y-3">
            <p className="text-sm font-bold text-foreground uppercase tracking-wider">Product Platform</p>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><a href="/#features" className="hover:text-foreground transition-colors">Lead Management</a></li>
              <li><a href="/#features" className="hover:text-foreground transition-colors">Policy Tracking</a></li>
              <li><a href="/#features" className="hover:text-foreground transition-colors">AI Marketing Suite</a></li>
              <li><a href="/#features" className="hover:text-foreground transition-colors">Commissions & Renewals</a></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div className="space-y-3">
            <p className="text-sm font-bold text-foreground uppercase tracking-wider">Company</p>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link to="/contact" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact Support</Link></li>
              <li><a href="/#solutions" className="hover:text-foreground transition-colors">Customer Stories</a></li>
              <li><Link to="/auth" className="hover:text-foreground transition-colors">Partner Portal</Link></li>
            </ul>
          </div>

          {/* Links Col 3 */}
          <div className="space-y-3">
            <p className="text-sm font-bold text-foreground uppercase tracking-wider">Advisor Hub</p>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link to="/auth" className="hover:text-foreground transition-colors">Agent Login</Link></li>
              <li><Link to="/auth" className="hover:text-foreground transition-colors">Create Account</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Request Demo</Link></li>
              <li><a href="/#solutions" className="hover:text-foreground transition-colors">FAQ & Knowledge Base</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
          <p>© {new Date().getFullYear()} InsurFlow Inc. powered by Kadmak.in. All rights reserved.</p>
          <div className="flex items-center gap-1 text-muted-foreground">
            <span>Built for insurance professionals with</span>
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
