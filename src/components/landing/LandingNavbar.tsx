import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Menu, X, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export const LandingNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border/80 shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/insureflow-logo.png"
              alt="Insureflow Logo"
              className="h-9 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="/#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="/#solutions" className="hover:text-foreground transition-colors">Solutions</a>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            <a href="/#features" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Button onClick={() => navigate("/dashboard")} className="gap-2">
                <User className="w-4 h-4" />
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">Log In</Link>
                </Button>
                <Button size="sm" className="shadow-sm" asChild>
                  <Link to="/auth">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-foreground hover:bg-muted focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 pb-6 border-t border-border/60 bg-background/95 backdrop-blur-lg rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col gap-4 text-sm font-medium">
              <a
                href="/#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-foreground hover:text-primary transition-colors py-1"
              >
                Features
              </a>
              <a
                href="/#solutions"
                onClick={() => setMobileMenuOpen(false)}
                className="text-foreground hover:text-primary transition-colors py-1"
              >
                Solutions
              </a>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-foreground hover:text-primary transition-colors py-1"
              >
                Contact Us
              </Link>
            </div>

            <div className="pt-4 border-t border-border/60 flex flex-col gap-3">
              {user ? (
                <Button onClick={() => { setMobileMenuOpen(false); navigate("/dashboard"); }} className="w-full">
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Get Started Free</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default LandingNavbar;
