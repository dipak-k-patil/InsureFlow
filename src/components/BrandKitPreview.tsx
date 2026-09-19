import { Shield, Phone, Mail, Globe, MapPin, Award } from "lucide-react";
import type { BrandKit } from "@/hooks/useBrandKits";

interface BrandKitPreviewProps {
  brandKit?: Partial<BrandKit> | null;
  className?: string;
  headline?: string;
  subheadline?: string;
}

export function BrandKitPreview({
  brandKit,
  className = "",
  headline = "Protect Your Family's Future with Comprehensive Health Insurance",
  subheadline = "Zero waiting period options · Instant cashless claim approvals · 100% Tax Savings",
}: BrandKitPreviewProps) {
  const primaryColor = brandKit?.primary_color || "#00c6ff";
  const secondaryColor = brandKit?.secondary_color || "#0072ff";
  const accentColor = brandKit?.accent_color || "#a100f2";
  const fontFamily = brandKit?.font_family || "Inter";

  const agencyName = brandKit?.agency_name || "InsureFlow Premier Agency";
  const agentName = brandKit?.agent_name || "Rahul Sharma";
  const designation = brandKit?.designation || "Senior Insurance Advisor";
  const phone = brandKit?.phone || "+91 98765 43210";
  const email = brandKit?.email || "rahul@insureflow.in";
  const website = brandKit?.website || "www.insureflow.in";
  const address = brandKit?.address || "Mumbai, Maharashtra";
  const cta = brandKit?.default_cta || "Get Instant Free Quote Today";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border/50 shadow-xl transition-all ${className}`}
      style={{ fontFamily }}
    >
      {/* Dynamic Brand Background Gradient */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 50%, ${accentColor} 100%)`,
        }}
      />

      {/* Main Container */}
      <div className="relative p-6 space-y-6 bg-card/90 backdrop-blur-sm">
        {/* Header Branding Bar */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            {brandKit?.primary_logo_url ? (
              <img
                src={brandKit.primary_logo_url}
                alt={agencyName}
                className="h-10 w-auto object-contain rounded"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                }}
              >
                <Shield className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <p className="font-bold text-sm text-foreground leading-tight">{agencyName}</p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Award className="w-3 h-3 text-primary inline" /> IRDAI Registered Insurance Broking Partner
              </p>
            </div>
          </div>

          {brandKit?.secondary_logo_url && (
            <img
              src={brandKit.secondary_logo_url}
              alt="Secondary Brand"
              className="h-8 w-auto object-contain"
            />
          )}
        </div>

        {/* Marketing Asset Body */}
        <div className="space-y-3 py-2">
          <div
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm mb-2"
            style={{
              background: `linear-gradient(90deg, ${secondaryColor}, ${accentColor})`,
            }}
          >
            Special Insurance Offer 2026
          </div>
          <h3 className="text-xl font-extrabold text-foreground tracking-tight leading-snug">
            {headline}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{subheadline}</p>
        </div>

        {/* Call To Action Button */}
        <div className="pt-2">
          <div
            className="w-full py-3 px-4 rounded-xl text-center text-xs font-bold text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            }}
          >
            {cta}
          </div>
        </div>

        {/* Footer Agent Branding Bar */}
        <div className="pt-4 border-t border-border/40 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Agent Identity */}
          <div className="flex items-center gap-3">
            {brandKit?.profile_photo_url ? (
              <img
                src={brandKit.profile_photo_url}
                alt={agentName}
                className="w-10 h-10 rounded-full object-cover border-2 border-primary/30"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xs"
                style={{ backgroundColor: secondaryColor }}
              >
                {agentName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold text-foreground text-xs">{agentName}</p>
              <p className="text-[11px] text-muted-foreground">{designation}</p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-1 text-[11px] text-muted-foreground sm:text-right">
            <div className="flex items-center gap-1.5 sm:justify-end">
              <Phone className="w-3 h-3 text-primary shrink-0" />
              <span className="font-mono">{phone}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:justify-end">
              <Mail className="w-3 h-3 text-primary shrink-0" />
              <span>{email}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:justify-end">
              <Globe className="w-3 h-3 text-primary shrink-0" />
              <span>{website}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
