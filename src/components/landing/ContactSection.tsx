import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    inquiryType: "sales",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success("Thank you! Your message has been sent successfully.");
    }, 800);
  };

  return (
    <section id="contact" className="py-20 bg-muted/20 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-xs font-semibold text-primary mb-3">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>We're Here to Help</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Get in Touch with Our Team
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            Have questions about our insurance automation platform or need a custom enterprise plan? Let us know!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto items-start">

          {/* Left Column: Contact Cards & Info */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-border/60 bg-card shadow-sm">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-base">Email Us</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">For general inquiries & support</p>
                  <a href="mailto:support@insurancecrm.com" className="text-sm font-medium text-primary hover:underline mt-2 inline-block">
                    support@insurancecrm.com
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card shadow-sm">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-base">Call or WhatsApp</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Mon - Fri from 9am to 6pm IST</p>
                  <a href="tel:+18005550199" className="text-sm font-medium text-foreground hover:text-primary mt-2 inline-block">
                    +1 (800) 555-0199
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card shadow-sm">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-base">Headquarters</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Financial Tech Tower, Suite 400</p>
                  <p className="text-sm font-medium text-foreground mt-2">
                    San Francisco, CA 94105
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary shrink-0" />
              <span className="text-xs font-medium text-foreground">
                Average response time: <strong>Under 2 hours</strong> during business hours.
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7">
            <Card className="border-border/60 shadow-xl bg-card">
              <CardContent className="p-6 sm:p-8">
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12 space-y-4"
                  >
                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">Message Received!</h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                      Thank you for reaching out, <strong>{formData.name}</strong>. One of our insurance tech specialists will contact you shortly.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({ name: "", email: "", phone: "", inquiryType: "sales", message: "" });
                      }}
                    >
                      Send Another Message
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground">
                          Full Name <span className="text-destructive">*</span>
                        </label>
                        <Input
                          name="name"
                          placeholder="e.g. John Doe"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground">
                          Email Address <span className="text-destructive">*</span>
                        </label>
                        <Input
                          type="email"
                          name="email"
                          placeholder="john@agency.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground">Phone Number</label>
                        <Input
                          name="phone"
                          placeholder="+1 (555) 000-0000"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground">Inquiry Type</label>
                        <Select
                          value={formData.inquiryType}
                          onValueChange={(val) => setFormData((prev) => ({ ...prev, inquiryType: val }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select topic" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sales">Sales & Product Demo</SelectItem>
                            <SelectItem value="support">Technical Support</SelectItem>
                            <SelectItem value="enterprise">Enterprise Custom Plan</SelectItem>
                            <SelectItem value="partner">Partnership Inquiry</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground">
                        Your Message <span className="text-destructive">*</span>
                      </label>
                      <Textarea
                        name="message"
                        rows={4}
                        placeholder="Tell us about your agency size, current setup, or how we can help..."
                        value={formData.message}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 shadow-md"
                    >
                      {isSubmitting ? (
                        <span>Sending...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ContactSection;
